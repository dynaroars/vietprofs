#!/usr/bin/env python3

import os
import json
from PIL import Image, ImageStat
import numpy as np

DATA_JSON = 'public/data.json'

with open(DATA_JSON, 'r', encoding='utf-8') as f:
    roster = json.load(f)

print(f"🔬 Fast analyzing image statistics across {len(roster)} roster entries...")

suspicious_portraits = []

for person in roster:
    portrait_rel = person.get('portrait')
    if not portrait_rel:
        continue

    full_path = os.path.join('public', portrait_rel)
    if not os.path.exists(full_path):
        continue

    try:
        raw_im = Image.open(full_path)
        im = raw_im.convert('RGB')
        
        # Resize thumbnail for ultra-fast color analysis
        thumb = im.resize((150, 150), Image.Resampling.BILINEAR)

        # 1. Unique color count in thumbnail (vector logos / flat drawings < 250 colors)
        colors = thumb.getcolors(maxcolors=25000)
        num_colors = len(colors) if colors is not None else 25000

        # 2. Skin tone pixel ratio in YCbCr space
        arr = np.array(thumb)
        r, g, b = arr[:,:,0].astype(float), arr[:,:,1].astype(float), arr[:,:,2].astype(float)
        cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
        cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
        skin_mask = (cb >= 85) & (cb <= 135) & (cr >= 135) & (cr <= 180) & (r > 60)
        skin_ratio = float(np.sum(skin_mask)) / (150.0 * 150.0)

        # 3. Channel standard deviation (flat graphics / silhouettes < 12.0)
        stat = ImageStat.Stat(thumb)
        stddev = float(np.mean(stat.stddev))

        reasons = []
        if skin_ratio < 0.01:
            reasons.append(f"No human skin tone detected ({skin_ratio:.1%})")
        if num_colors < 150:
            reasons.append(f"Extremely low unique color count ({num_colors} colors - flat logo/graphic)")
        if stddev < 10.0:
            reasons.append(f"Low color variance ({stddev:.1f} - flat avatar/drawing)")

        if reasons:
            suspicious_portraits.append({
                'id': person['id'],
                'name': person['name'],
                'university': person['university'],
                'portrait': portrait_rel,
                'portraitSource': person.get('portraitSource'),
                'skinRatio': f"{skin_ratio:.1%}",
                'numColors': num_colors,
                'stddev': round(stddev, 1),
                'reasons': reasons
            })
    except Exception as e:
        suspicious_portraits.append({
            'id': person['id'],
            'name': person['name'],
            'university': person['university'],
            'portrait': portrait_rel,
            'portraitSource': person.get('portraitSource'),
            'reasons': [f"Corrupted image file: {e}"]
        })

print(f"\n📊 FAST ANALYSIS SUMMARY:")
print(f"   Inspected Portraits: {len([p for p in roster if p.get('portrait')])}")
print(f"   Suspicious Candidates Flagged: {len(suspicious_portraits)}\n")

report_path = 'maintenance/suspicious-image-stats.json'
with open(report_path, 'w', encoding='utf-8') as f:
    json.dump(suspicious_portraits, f, indent=2)

print(f"Report saved to {report_path}")

for item in suspicious_portraits:
    print(f"- [{item['id']}] {item['name']} ({item['university']}): {', '.join(item['reasons'])}")
    print(f"    {item['portrait']} | Source: {item.get('portraitSource')}\n")
