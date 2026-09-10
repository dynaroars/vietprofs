import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Generates public/stats-history.json, a daily time series of roster and codebase metrics,
// by walking git history for public/data.json and src/. It's a build-time artifact,
// regenerated on build/dev/test from whatever git history is available.

const root = resolve(import.meta.dirname, '..');

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1024 * 1024 * 128 });
}

interface RosterEntrySnapshot {
  university?: string;
  country?: string;
  portrait?: string;
  portraitSource?: string;
  honors?: unknown[];
}

export interface StatsPoint {
  date: string;
  count: number;
  institutions: number;
  countries: number;
  portraits: number;
  honors: number;
  codeLines: number;
}

// One `git cat-file --batch` per commit instead of one `git cat-file -p` per file per commit.
// This runs for every dated commit in the roster's history on predev/prebuild/pretest, so the
// per-file spawn cost grew with the age of the project (~20 extra processes per day of history).
function countSrcLinesAtCommit(treeRef: string): number {
  try {
    const blobs = git(['ls-tree', '-r', treeRef, 'src/'])
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split(/\s+/)[2])
      .filter(Boolean);
    if (blobs.length === 0) return 0;
    // `--batch` streams `<sha> <type> <size>\n<contents>\n` per requested object.
    // No `encoding` option: execFileSync then returns a Buffer, which is what the byte offsets
    // below index into (git reports each object's size in bytes, not characters).
    const batch = execFileSync('git', ['cat-file', '--batch'], {
      cwd: root,
      input: `${blobs.join('\n')}\n`,
      maxBuffer: 1024 * 1024 * 256,
    });
    let total = 0;
    let offset = 0;
    for (let i = 0; i < blobs.length; i += 1) {
      const headerEnd = batch.indexOf(0x0a, offset);
      if (headerEnd === -1) break;
      const header = batch.toString('utf8', offset, headerEnd);
      const size = Number(header.split(' ')[2]);
      if (!Number.isFinite(size)) break;
      const start = headerEnd + 1;
      total += countLines(batch.toString('utf8', start, start + size));
      offset = start + size + 1; // trailing newline git appends after each object
    }
    return total;
  } catch {
    return 0;
  }
}

// Matches the previous implementation's `content.split('\n').length`.
function countLines(content: string): number {
  return content.split('\n').length;
}

async function currentMetrics(): Promise<Omit<StatsPoint, 'date'>> {
  const content = await readFile(resolve(root, 'public/data.json'), 'utf8');
  const roster = JSON.parse(content) as RosterEntrySnapshot[];
  const count = roster.length;
  const institutions = new Set(roster.map((p) => p.university).filter(Boolean)).size;
  const countries = new Set(roster.map((p) => p.country || 'United States').filter(Boolean)).size;
  const portraits = roster.filter((p) => p.portrait || p.portraitSource).length;
  const honors = roster.reduce((acc, p) => acc + (p.honors ? p.honors.length : 0), 0);
  const codeLines = countSrcLinesAtCommit('HEAD');
  return { count, institutions, countries, portraits, honors, codeLines };
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
        return { hash, date: new Date(iso).toISOString().slice(0, 10) };
      })
      .reverse();

    const byDay = new Map<string, string>();
    for (const { hash, date } of commits) byDay.set(date, hash);

    for (const [date, hash] of byDay) {
      try {
        const content = git(['show', `${hash}:public/data.json`]);
        const roster = JSON.parse(content) as RosterEntrySnapshot[];
        const count = roster.length;
        const institutions = new Set(roster.map((p) => p.university).filter(Boolean)).size;
        const countries = new Set(roster.map((p) => p.country || 'United States').filter(Boolean)).size;
        const portraits = roster.filter((p) => p.portrait || p.portraitSource).length;
        const honors = roster.reduce((acc, p) => acc + (p.honors ? p.honors.length : 0), 0);
        const codeLines = countSrcLinesAtCommit(hash);
        points.push({ date, count, institutions, countries, portraits, honors, codeLines });
      } catch (err) {
        console.warn(`build-stats-history: error parsing snapshot at ${date} (${hash}): ${(err as Error).message}`);
      }
    }
  } catch (err) {
    console.warn(`build-stats-history: git history unavailable (${(err as Error).message}); falling back to current snapshot.`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const latest = await currentMetrics();
  if (points.length === 0 || points[points.length - 1].date !== today) {
    points.push({ date: today, ...latest });
  } else {
    Object.assign(points[points.length - 1], latest);
  }

  await writeFile(resolve(root, 'public/stats-history.json'), `${JSON.stringify(points, null, 2)}\n`);
  console.log(`build-stats-history: wrote ${points.length} snapshot(s) to public/stats-history.json`);
}

await main();
