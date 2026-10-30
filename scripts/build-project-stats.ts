// Current repository snapshot only. Runs on dev/build, never during unit tests.
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Codebase, CodebaseLanguage, GitHubActivity, GitHubItem, GitInfo } from '../src/project-stats.ts';

const root = resolve(import.meta.dirname, '..');
const git = (args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
const countLines = (content: string) => content ? content.split('\n').length - Number(content.endsWith('\n')) : 0;

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
      testFiles: files.filter((file) => /^test\/.*\.(test|e2e)\.ts$/.test(file)).length,
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

// A failed or offline fetch keeps the last activity written to project-stats.json rather than
// dropping the section.
async function previousGitHubActivity(): Promise<GitHubActivity | null> {
  try {
    const previous = JSON.parse(await readFile(resolve(root, 'public/project-stats.json'), 'utf8')) as GitInfo;
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
    console.warn(`build-project-stats: GitHub activity unavailable (${(err as Error).message}); keeping the previous snapshot.`);
    github = await previousGitHubActivity();
  }
  const codebase = await getCodebase();
  try {
    const totalCommits = Number(git(['rev-list', '--count', 'HEAD']).trim()) || 0;
    const contributors = new Set(git(['log', '--format=%aE']).split('\n').filter(Boolean)).size;
    const firstCommitDate = git(['log', '--reverse', '--format=%aI']).split('\n')[0]?.trim();
    return {
      totalCommits,
      repoUrl: `https://github.com/${REPO}`,
      contributors,
      firstCommitDate,
      codebase,
      github,
    };
  } catch {
    return { repoUrl: `https://github.com/${REPO}`, codebase, github };
  }
}

await writeFile(resolve(root, 'public/project-stats.json'), `${JSON.stringify(await getGitInfo(), null, 2)}\n`);
