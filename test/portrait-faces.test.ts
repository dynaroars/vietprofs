import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const python = process.env.PORTRAIT_PYTHON ?? 'python3';
const dir = 'test/fixtures/portrait-faces';

function hasOpenCv(): boolean {
  try { execFileSync(python, ['-c', 'import cv2, numpy, PIL'], { stdio: 'ignore' }); return true; } catch { return false; }
}

function verdicts(files: string[]): Record<string, string> {
  const out = execFileSync(python, ['scripts/portrait_faces.py', ...files.map((file) => `${dir}/${file}`)], { encoding: 'utf8' });
  return Object.fromEntries(out.trim().split('\n').map((line) => { const row = JSON.parse(line); return [row.file.replace(`${dir}/`, ''), row.verdict]; }));
}

// CI has no OpenCV (the roster tests need only Node), so this skips there; run it locally and in
// the portraits routine with `pip install opencv-python-headless pillow numpy`.
test('face check accepts single-person headshots and rejects groups, icons, and buildings', { skip: !hasOpenCv() && 'opencv not installed' }, () => {
  const result = verdicts(['good-1.webp', 'good-2.webp', 'good-3.webp', 'bad-group.webp', 'bad-icon.webp', 'bad-building.webp']);
  for (const good of ['good-1.webp', 'good-2.webp', 'good-3.webp']) assert.equal(result[good], 'ok', good);
  assert.equal(result['bad-group.webp'], 'multiple');
  assert.equal(result['bad-icon.webp'], 'none');
  assert.equal(result['bad-building.webp'], 'none');
});
