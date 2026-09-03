import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Generates public/stats-history.json, a daily time series of total roster size, by walking
// git history for public/data.json. It's a build-time artifact (like the other generated
// public/ files listed in .gitignore), not committed source: each build/dev/test run
// regenerates it from whatever git history is actually available in that checkout.
//
// A shallow clone (common for CI or sandboxed agent checkouts) yields a short or single-point
// history rather than a failure — the growth chart just starts thin and fills in as commits
// accumulate, since nothing else in the site depends on this file being non-trivial.

const root = resolve(import.meta.dirname, '..');

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1024 * 1024 * 128 });
}

interface StatsPoint {
  date: string;
  count: number;
}

async function currentCount(): Promise<number> {
  const content = await readFile(resolve(root, 'public/data.json'), 'utf8');
  return (JSON.parse(content) as unknown[]).length;
}

async function main() {
  const points: StatsPoint[] = [];

  try {
    const log = git(['log', '--format=%H %aI', '--follow', '--', 'public/data.json']).trim();
    const commits = log
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [hash, iso] = line.split(' ');
        return { hash, date: iso.slice(0, 10) };
      })
      .reverse(); // oldest first

    // Keep only the last commit seen for each UTC calendar day; Map preserves the key's
    // first-insertion order even as later same-day commits overwrite its value, so the
    // final iteration order stays chronological.
    const byDay = new Map<string, string>();
    for (const { hash, date } of commits) byDay.set(date, hash);

    for (const [date, hash] of byDay) {
      const content = git(['show', `${hash}:public/data.json`]);
      const roster = JSON.parse(content) as unknown[];
      points.push({ date, count: roster.length });
    }
  } catch (err) {
    console.warn(`build-stats-history: git history unavailable (${(err as Error).message}); falling back to a single current-count point.`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const latestCount = await currentCount();
  if (points.length === 0 || points[points.length - 1].date !== today) {
    points.push({ date: today, count: latestCount });
  } else {
    points[points.length - 1].count = latestCount;
  }

  await writeFile(resolve(root, 'public/stats-history.json'), `${JSON.stringify(points, null, 2)}\n`);
  console.log(`build-stats-history: wrote ${points.length} snapshot(s) to public/stats-history.json`);
}

await main();
