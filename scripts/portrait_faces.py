#!/usr/bin/env python3
"""Face check for portrait images: is there exactly one dominant face?

  python3 scripts/portrait_faces.py public/portraits/a.webp public/portraits/b.webp
  python3 scripts/portrait_faces.py --roster          # every stored portrait in public/data.json

Prints one JSON object per image: {"file", "verdict", "faces", "largest", "second"}.
Verdicts:
  ok        one clearly dominant face (a second face under 35% of the largest one's area, such as a
            poster behind the person, is tolerated)
  multiple  two or more comparable faces: a group or lab photo
  none      no face found: building, logo, equipment, scenery, or a face the detector missed
  tiny      the largest face is under 8% of the image height: a person lost in a scene
Only `ok` should be accepted automatically. The other verdicts mean "look at the image".

Needs `pip install opencv-python-headless pillow numpy`. The detector is OpenCV's YuNet
(scripts/models/face_detection_yunet_2023mar.onnx, MIT license, from opencv/opencv_zoo).
"""
import json
import os
import sys

import cv2
import numpy as np
from PIL import Image

MODEL = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'face_detection_yunet_2023mar.onnx')
MAX_SIDE = 960          # downscale large images; faces stay detectable and it is much faster
SCORE_MIN = 0.7
SECOND_FACE_RATIO = 0.35
TINY_FACE_HEIGHT = 0.08


def detect(path, detector):
    image = Image.open(path).convert('RGB')
    width, height = image.size
    scale = min(1.0, MAX_SIDE / max(width, height))
    if scale < 1.0:
        image = image.resize((max(1, round(width * scale)), max(1, round(height * scale))), Image.Resampling.LANCZOS)
    frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    h, w = frame.shape[:2]
    detector.setInputSize((w, h))
    _, found = detector.detect(frame)
    faces = [] if found is None else [row for row in found if row[14] >= SCORE_MIN]
    areas = sorted((float(row[2] * row[3]) for row in faces), reverse=True)
    heights = [float(row[3]) / h for row in faces]
    return len(faces), areas, (max(heights) if heights else 0.0), float(w * h)


def verdict_of(count, areas, tallest):
    if count == 0:
        return 'none'
    if count >= 2 and areas[1] >= SECOND_FACE_RATIO * areas[0]:
        return 'multiple'
    if tallest < TINY_FACE_HEIGHT:
        return 'tiny'
    return 'ok'


def main():
    args = sys.argv[1:]
    if args == ['--roster']:
        with open('public/data.json', encoding='utf-8') as handle:
            args = [os.path.join('public', p['portrait']) for p in json.load(handle) if p.get('portrait')]
    if not args:
        sys.exit(__doc__)
    detector = cv2.FaceDetectorYN.create(MODEL, '', (320, 320), SCORE_MIN, 0.3, 5000)
    for path in args:
        try:
            count, areas, tallest, area = detect(path, detector)
            result = {'file': path, 'verdict': verdict_of(count, areas, tallest), 'faces': count,
                      'largest': round(areas[0] / area, 4) if areas else 0,
                      'second': round(areas[1] / area, 4) if len(areas) > 1 else 0}
        except Exception as error:  # unreadable or unsupported image: never auto-accept
            result = {'file': path, 'verdict': 'error', 'faces': 0, 'largest': 0, 'second': 0, 'error': str(error)}
        print(json.dumps(result), flush=True)


if __name__ == '__main__':
    main()
