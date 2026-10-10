import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Codebase, CodebaseLanguage, GitHubActivity, GitHubItem, GitInfo } from '../src/data.ts';

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

const REPO = 'dynaroars/vietprofs';

// Tracked text files grouped by language. Portraits, the roster data, and other binaries aren't
// code, so the line count covers source, styles, markup, tests, scripts, and docs only.
const LANGUAGES: Array<[string, RegExp]> = [
  ['TypeScript', /\.ts$/],
  ['CSS', /\.css$/],
  ['HTML', /\.html$/],
  ['Python', /\.py$/],
  ['YAML', /\.ya?ml$/],
  ['Markdown', /\.md$/],
  ['LaTeX', /\.(tex|bib|tikz)$/],
];
const CODE_LANGUAGES = new Set(['TypeScript', 'CSS', 'HTML', 'Python', 'YAML']);

async function getCodebase(): Promise<Codebase | undefined> {
  try {
    const files = git(['ls-files']).split('\n').filter(Boolean);
    const languages: CodebaseLanguage[] = [];
    for (const [language, pattern] of LANGUAGES) {
      const matches = files.filter((file) => pattern.test(file));
      let lines = 0;
      for (const file of matches) {
        // A tracked file deleted in the working tree has nothing to count.
        lines += await readFile(resolve(root, file), 'utf8').then(countLines, () => 0);
      }
      if (matches.length) languages.push({ language, files: matches.length, lines });
    }
    const code = languages.filter((entry) => CODE_LANGUAGES.has(entry.language));
    const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return {
      trackedFiles: files.length,
      codeFiles: code.reduce((sum, entry) => sum + entry.files, 0),
      codeLines: code.reduce((sum, entry) => sum + entry.lines, 0),
      languages,
      testFiles: files.filter((file) => /^test\/.*\.test\.ts$/.test(file)).length,
      npmScripts: Object.keys(pkg.scripts ?? {}).length,
      devDependencies: Object.keys(pkg.devDependencies ?? {}).length,
      workflows: files.filter((file) => /^\.github\/workflows\/.*\.ya?ml$/.test(file)).length,
    };
  } catch {
    return undefined;
  }
}

function githubToken(): string | undefined {
  if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) return process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || undefined;
  } catch {
    return undefined;
  }
}

interface SearchResult {
  total_count: number;
  items: Array<{ number: number; title: string; html_url: string; state: string; created_at: string; pull_request?: { merged_at: string | null } }>;
}

// Counts come from the search API (one request per number). Unauthenticated search allows 10
// requests a minute, so a token from GITHUB_TOKEN/GH_TOKEN or `gh auth token` is used when present.
async function getGitHubActivity(token: string | undefined): Promise<GitHubActivity> {
  const search = async (query: string): Promise<SearchResult> => {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${REPO} ${query}`)}&sort=created&order=desc&per_page=1`;
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`GitHub search "${query}" returned ${res.status}`);
    return (await res.json()) as SearchResult;
  };
  const latest = (result: SearchResult): GitHubItem | null => {
    const item = result.items[0];
    if (!item) return null;
    const state = item.pull_request?.merged_at ? 'merged' : item.state;
    return { number: item.number, title: item.title, url: item.html_url, state, createdAt: item.created_at };
  };
  const [pulls, openPulls, mergedPulls, issues, openIssues] = await Promise.all(
    ['is:pr', 'is:pr is:open', 'is:pr is:merged', 'is:issue', 'is:issue is:open'].map(search),
  );
  return {
    pulls: {
      open: openPulls.total_count,
      closed: pulls.total_count - openPulls.total_count,
      merged: mergedPulls.total_count,
      latest: latest(pulls),
    },
    issues: {
      open: openIssues.total_count,
      closed: issues.total_count - openIssues.total_count,
      latest: latest(issues),
    },
    fetchedAt: new Date().toISOString(),
  };
}

// A failed or offline fetch keeps the last activity written to git-info.json rather than
// dropping the section.
async function previousGitHubActivity(): Promise<GitHubActivity | null> {
  try {
    const previous = JSON.parse(await readFile(resolve(root, 'public/git-info.json'), 'utf8')) as GitInfo;
    return previous.github ?? null;
  } catch {
    return null;
  }
}

async function getGitInfo(): Promise<GitInfo> {
  let github: GitHubActivity | null;
  try {
    github = await getGitHubActivity(githubToken());
  } catch (err) {
    console.warn(`build-stats-history: GitHub activity unavailable (${(err as Error).message}); keeping the previous snapshot.`);
    github = await previousGitHubActivity();
  }
  const codebase = await getCodebase();
  try {
    const totalCommits = Number(git(['rev-list', '--count', 'HEAD']).trim()) || 0;
    const latestHash = git(['rev-parse', '--short', 'HEAD']).trim();
    const latestDate = git(['log', '-1', '--format=%aI']).trim();
    const latestMessage = git(['log', '-1', '--format=%s']).trim();
    const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).trim();
    const contributors = new Set(git(['log', '--format=%aE']).split('\n').filter(Boolean)).size;
    const firstCommitDate = git(['log', '--reverse', '--format=%aI']).split('\n')[0]?.trim();
    return {
      totalCommits,
      latestHash,
      latestDate,
      latestMessage,
      branch,
      repoUrl: `https://github.com/${REPO}`,
      contributors,
      firstCommitDate,
      codebase,
      github,
    };
  } catch {
    return {
      totalCommits: 1100,
      latestHash: 'main',
      latestDate: new Date().toISOString(),
      latestMessage: 'Automated roster maintenance and build',
      branch: 'main',
      repoUrl: `https://github.com/${REPO}`,
      codebase,
      github,
    };
  }
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

  const gitInfo = await getGitInfo();
  await writeFile(resolve(root, 'public/git-info.json'), `${JSON.stringify(gitInfo, null, 2)}\n`);
  console.log(`build-stats-history: wrote git info (${gitInfo.totalCommits} commits, hash ${gitInfo.latestHash}) to public/git-info.json`);
}

await main();
