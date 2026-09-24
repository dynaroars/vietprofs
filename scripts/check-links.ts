#!/usr/bin/env -S npx --no-install tsx

/**
 * Checks URLs and portraits in the roster for reachability, redirects, soft 404s, and content validity.
 *
 * Usage:
 *   npm run check-links                         # Check all URLs across the roster
 *   npm run check-links -- --limit 50           # Check first 50 URLs
 *   npm run check-links -- --field profileUrl   # Check only profile URLs
 *   npm run check-links -- --field portraitSource # Check only portrait sources
 *   npm run check-links -- --portraits          # Check portrait source URLs & local portrait files
 *   npm run check-links -- --verify-content     # Fetch HTML & verify person's name exists (soft 404 check)
 *   npm run check-links -- --id vp-0020         # Check all URLs for a specific person
 */

import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

interface UrlEntry {
  id: string;
  name: string;
  field: string;
  url: string;
}

interface CheckResult extends UrlEntry {
  status: number | 'ERROR';
  ok: boolean;
  redirectUrl?: string;
  warning?: string;
  errorDetail?: string;
}

const rosterFile = resolve('public/data.json');
const roster = JSON.parse(await readFile(rosterFile, 'utf8'));

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
VietProfs Link & Portrait Integrity Checker

Options:
  --limit <N>           Limit checks to first N URLs (e.g. --limit 50)
  --id <id>             Filter by person ID or name substring (e.g. --id vp-0020)
  --field <field>       Filter by field (e.g. profileUrl, websiteUrl, portraitSource)
  --portraits           Audit portrait images (HTTP image MIME type & local file integrity)
  --verify-content      Fetch HTML and verify faculty name appears on the page
  --concurrency <N>     Number of parallel requests (default: 16)
  --timeout <ms>        Request timeout in milliseconds (default: 12000)
`);
  process.exit(0);
}

function getArgValue(flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return undefined;
}

const limitArg = getArgValue('--limit');
const limit = limitArg ? parseInt(limitArg, 10) : undefined;
const targetId = getArgValue('--id')?.toLowerCase();
const targetField = getArgValue('--field');
const concurrencyArg = getArgValue('--concurrency');
const CONCURRENCY = concurrencyArg ? parseInt(concurrencyArg, 10) : 16;
const timeoutArg = getArgValue('--timeout');
const TIMEOUT_MS = timeoutArg ? parseInt(timeoutArg, 10) : 12000;
const verifyContent = args.includes('--verify-content') || args.includes('--verify-identity');
const checkPortraitsOnly = args.includes('--portraits');

// Collect URLs
let entries: UrlEntry[] = [];
for (const person of roster) {
  if (targetId && !person.id.toLowerCase().includes(targetId) && !person.name.toLowerCase().includes(targetId)) {
    continue;
  }

  const fieldsToCheck = checkPortraitsOnly
    ? ['portraitSource']
    : targetField
    ? [targetField]
    : ['profileUrl', 'websiteUrl', 'labUrl', 'scholarUrl', 'linkedinUrl', 'portraitSource'];

  for (const field of fieldsToCheck) {
    if (person[field]) {
      entries.push({ id: person.id, name: person.name, field, url: person[field] });
    }
  }

  if (!checkPortraitsOnly && (!targetField || targetField === 'honors')) {
    for (const honor of person.honors ?? []) {
      if (honor.source) {
        entries.push({ id: person.id, name: person.name, field: `honor "${honor.name}"`, url: honor.source });
      }
    }
  }
}

if (limit && limit > 0) {
  entries = entries.slice(0, limit);
}

// Check local portrait files if portrait auditing requested
if (checkPortraitsOnly || !targetField) {
  for (const person of roster) {
    if (targetId && !person.id.toLowerCase().includes(targetId) && !person.name.toLowerCase().includes(targetId)) {
      continue;
    }
    if (person.portrait) {
      const localPath = resolve('public', person.portrait);
      if (!existsSync(localPath)) {
        console.error(`🚨 [Missing File] ${person.name} (${person.id}): Local portrait not found at public/${person.portrait}`);
      } else {
        const stats = statSync(localPath);
        if (stats.size < 500) {
          console.error(`⚠️  [Suspicious File] ${person.name} (${person.id}): Local portrait file is unusually small (${stats.size} bytes)`);
        }
      }
    }
  }
}

// Node's bundled HTTP client (undici) can throw an internal assertion from a socket event when a
// server closes a connection mid-response. It escapes every promise and would abort the whole
// sweep; the affected request still hits its timeout and is reported as ERROR.
process.on('uncaughtException', (error: NodeJS.ErrnoException) => {
  if (error.code === 'ERR_ASSERTION' && String(error.stack).includes('undici')) {
    console.error(`\n⚠️  Ignored internal HTTP client assertion: ${error.message}`);
    return;
  }
  console.error(error);
  process.exit(1);
});

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const SOFT_404_PATTERNS = [
  /<title>[^<]*(404|not found|page not found|error|access denied|does not exist)[^<]*<\/title>/i,
  /<h1>[^<]*(page not found|404|not found|user not found|profile not found)[^<]*<\/h1>/i,
  /this page could not be found/i,
  /the requested URL was not found/i,
  /profile no longer available/i,
  /employee not found/i,
  /faculty member not found/i,
];

async function checkOne(entry: UrlEntry): Promise<CheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const isGetRequired = verifyContent || entry.field === 'portraitSource';

  try {
    let res: Response;
    let finalUrl: string | undefined;

    try {
      res = await fetch(entry.url, {
        method: isGetRequired ? 'GET' : 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
      });

      if (res.status === 405 || res.status === 403 || res.status === 400) {
        res = await fetch(entry.url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
        });
      }
      finalUrl = res.url;
    } catch {
      res = await fetch(entry.url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
      });
      finalUrl = res.url;
    }

    let warning: string | undefined;
    let errorDetail: string | undefined;

    // LinkedIn returns 999 to automated crawlers
    if (entry.url.includes('linkedin.com') && (res.status === 999 || res.status === 403)) {
      return {
        ...entry,
        status: res.status,
        ok: true,
        warning: `LinkedIn anti-bot protection returned HTTP ${res.status}`,
      };
    }

    // Check Redirects to directory roots
    if (finalUrl && finalUrl !== entry.url) {
      try {
        const origPath = new URL(entry.url).pathname;
        const finalPath = new URL(finalUrl).pathname;
        if (origPath.length > 5 && (finalPath === '/' || finalPath === '/faculty' || finalPath === '/people' || finalPath === '/directory')) {
          warning = `Redirected to generic root directory (${finalUrl}) - likely retired profile`;
        }
      } catch {}
    }

    // Portrait Source MIME Type Validation
    if (entry.field === 'portraitSource' && res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('image/') && !contentType.includes('octet-stream')) {
        warning = `portraitSource returned non-image Content-Type: "${contentType}" (may be a webpage, not direct image)`;
      }
    }

    // Soft 404 and Name Mention Validation
    if (verifyContent && res.ok) {
      try {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          const text = await res.text();

          for (const pattern of SOFT_404_PATTERNS) {
            if (pattern.test(text)) {
              warning = `Soft 404 detected on page content`;
              break;
            }
          }

          if (!warning && entry.field === 'profileUrl') {
            const tokens = entry.name.replace(/\s*-\s*.*$/, '').trim().split(/\s+/);
            const lastName = tokens[tokens.length - 1];
            const firstName = tokens[0];
            const lowerText = text.toLowerCase();

            if (lastName && !lowerText.includes(lastName.toLowerCase()) && !lowerText.includes(firstName.toLowerCase())) {
              warning = `Page does not mention name "${entry.name}" (possible wrong link or generic page)`;
            }
          }
        }
      } catch {}
    }

    return {
      ...entry,
      status: res.status,
      ok: res.ok,
      redirectUrl: finalUrl !== entry.url ? finalUrl : undefined,
      warning,
      errorDetail,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      ...entry,
      status: 'ERROR',
      ok: false,
      errorDetail: errorMsg.includes('aborted') ? 'Request timeout' : errorMsg,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function runPool<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  let done = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
      done++;
      if (done % 50 === 0 || done === items.length) {
        process.stdout.write(`\r  Progress: ${done}/${items.length} checked...`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  console.log('\n');
  return results;
}

console.log(`🔍 Checking ${entries.length} URLs (concurrency ${CONCURRENCY}, timeout ${TIMEOUT_MS}ms)...`);
const results = await runPool(entries, CONCURRENCY, checkOne);

const broken = results.filter((r) => !r.ok);
const warnings = results.filter((r) => r.warning);
const successful = results.filter((r) => r.ok && !r.warning);

console.log(`📊 Link & Content Verification Summary:`);
console.log(`   ✅ Healthy:   ${successful.length}`);
console.log(`   ⚠️  Warnings:  ${warnings.length}`);
console.log(`   🚨 Broken:    ${broken.length}\n`);

if (broken.length > 0) {
  console.log(`🚨 BROKEN LINKS (${broken.length}):`);
  for (const b of broken) {
    console.log(`  - [${b.id}] ${b.name} (${b.field}): Status ${b.status} ${b.errorDetail ? `(${b.errorDetail})` : ''}\n    ${b.url}`);
  }
  console.log();
}

if (warnings.length > 0) {
  console.log(`⚠️  WARNINGS & SOFT 404s (${warnings.length}):`);
  for (const w of warnings) {
    console.log(`  - [${w.id}] ${w.name} (${w.field}): ${w.warning}\n    URL: ${w.url}${w.redirectUrl ? `\n    Redirected To: ${w.redirectUrl}` : ''}`);
  }
  console.log();
}

if (broken.length > 0) {
  process.exitCode = 1;
}
