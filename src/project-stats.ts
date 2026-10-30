export interface CodebaseLanguage {
  language: string;
  files: number;
  lines: number;
}

export interface Codebase {
  trackedFiles: number;
  codeFiles: number;
  codeLines: number;
  languages: CodebaseLanguage[];
  testFiles: number;
  npmScripts: number;
  devDependencies: number;
  workflows: number;
}

export interface GitHubItem {
  number: number;
  title: string;
  url: string;
  state: string;
  createdAt: string;
}

export interface GitHubCounts {
  open: number;
  closed: number;
  merged?: number;
  latest: GitHubItem | null;
}

export interface GitHubActivity {
  pulls: GitHubCounts;
  issues: GitHubCounts;
  fetchedAt: string;
}

export interface GitInfo {
  totalCommits?: number;
  repoUrl: string;
  contributors?: number;
  firstCommitDate?: string;
  codebase?: Codebase;
  github?: GitHubActivity | null;
}

export async function loadProjectStats(): Promise<GitInfo | null> {
  try {
    const cacheBuster = typeof __BUILD_COMMIT__ !== 'undefined' && __BUILD_COMMIT__ ? `?v=${__BUILD_COMMIT__}` : '';
    const res = await fetch(`${import.meta.env.BASE_URL}project-stats.json${cacheBuster}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
