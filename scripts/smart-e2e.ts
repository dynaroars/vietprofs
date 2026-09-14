#!/usr/bin/env -S npx --no-install tsx

/**
 * Smart E2E Test Runner
 *
 * Runs browser smoke tests with Playwright only when UI, frontend, template,
 * or build scripts are modified. When only data/roster/maintenance files are
 * changed, it runs the static build to verify HTML generation but skips the
 * heavy Playwright browser test suite.
 *
 * Usage:
 *   npm run test:e2e             # Smart mode (detects if UI files changed)
 *   npm run test:e2e -- --force   # Force full browser smoke tests
 *   VIETPROFS_FORCE_E2E=1 npm run test:e2e
 */

import { execSync, spawnSync } from 'node:child_process';
import process from 'node:process';

const UI_CHANGE_PATTERNS = [
  /^src\/(?!data\.ts$|roster-constants\.ts$)/,
  /\.html$/,
  /\.css$/,
  /^test\/browser-smoke\.test\.ts$/,
  /^test\/ui\.test\.ts$/,
  /^vite\.config\./,
  /^biome\.json$/,
  /^tsconfig\.json$/,
  /^scripts\/generate-profile-pages\.ts$/,
  /^scripts\/build-search-kit\.ts$/,
  /^scripts\/sync-profile-css\.ts$/,
  /^scripts\/smart-e2e\.ts$/,
];

function isUiFile(filePath: string): boolean {
  return UI_CHANGE_PATTERNS.some((pattern) => pattern.test(filePath.trim()));
}

function getChangedFiles(): string[] {
  const changed = new Set<string>();

  try {
    // 1. Unstaged and staged working tree changes
    const workingDiff = execSync('git diff --name-only HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    for (const file of workingDiff.split('\n')) {
      if (file.trim()) changed.add(file.trim());
    }

    // 2. Untracked files
    const status = execSync('git status --porcelain', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    for (const line of status.split('\n')) {
      if (line.startsWith('?? ')) {
        const file = line.slice(3).trim();
        if (file) changed.add(file);
      }
    }

    // 3. If working tree is clean, inspect the latest commit (or PR base in CI)
    if (changed.size === 0) {
      if (process.env.GITHUB_BASE_REF) {
        // GitHub Actions PR
        const prDiff = execSync(`git diff --name-only origin/${process.env.GITHUB_BASE_REF}...HEAD`, {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        });
        for (const file of prDiff.split('\n')) {
          if (file.trim()) changed.add(file.trim());
        }
      } else {
        // Last commit
        const lastCommitDiff = execSync('git diff --name-only HEAD~1 HEAD', {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        });
        for (const file of lastCommitDiff.split('\n')) {
          if (file.trim()) changed.add(file.trim());
        }
      }
    }
  } catch {
    // If git commands fail (e.g. shallow clone without HEAD~1 or non-git environment),
    // return null to trigger safe fallback to full run.
    return [];
  }

  return Array.from(changed);
}

const args = process.argv.slice(2);
const forceRun = args.includes('--force') || args.includes('-f') || process.env.VIETPROFS_FORCE_E2E === '1';

// Always execute `npm run build` first to ensure the static site compiles properly.
console.log('📦 Running build...');
const buildResult = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' });
if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

if (forceRun) {
  console.log('🚀 Running full Playwright browser smoke tests (--force requested)...');
  const testResult = spawnSync('npx', ['tsx', '--test', 'test/browser-smoke.test.ts'], { stdio: 'inherit' });
  process.exit(testResult.status ?? 0);
}

const changedFiles = getChangedFiles();
const uiFilesModified = changedFiles.filter(isUiFile);

if (changedFiles.length > 0 && uiFilesModified.length === 0) {
  console.log('\n⚡ [test:e2e] Data-only changes detected (no UI/frontend files modified):');
  for (const f of changedFiles.slice(0, 10)) {
    console.log(`   - ${f}`);
  }
  if (changedFiles.length > 10) {
    console.log(`   ... and ${changedFiles.length - 10} more files`);
  }
  console.log('✔ Skipped Playwright browser smoke tests (build succeeded, UI untouched).');
  console.log('  Tip: Pass --force or set VIETPROFS_FORCE_E2E=1 to run Playwright unconditionally.\n');
  process.exit(0);
}

if (uiFilesModified.length > 0) {
  console.log('\n🎨 [test:e2e] UI/frontend modification detected:');
  for (const f of uiFilesModified.slice(0, 5)) {
    console.log(`   - ${f}`);
  }
  if (uiFilesModified.length > 5) {
    console.log(`   ... and ${uiFilesModified.length - 5} more files`);
  }
}

console.log('🚀 Running Playwright browser smoke tests...');
const testResult = spawnSync('npx', ['tsx', '--test', 'test/browser-smoke.test.ts'], { stdio: 'inherit' });
process.exit(testResult.status ?? 0);
