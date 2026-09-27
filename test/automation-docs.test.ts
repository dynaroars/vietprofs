import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

// Guards the maintenance docs against drift: routines read these files as instructions, so a
// stale path, npm script, or schedule claim silently breaks a scheduled run.

const automation = readFileSync('docs/AUTOMATION.md', 'utf8');
const instructionDocs = ['AGENTS.md', 'README.md', 'ROSTER_MAINTENANCE.md', 'docs/AUTOMATION.md', ...readdirSync('TASKS').map((file) => `TASKS/${file}`)];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Row = { key: string; cron: string; et: string; minute: number; hour: number; weekdays: number[] | null };
const rows: Row[] = [...automation.matchAll(/^\| `([a-z-]+)` \| `trig_\w+` \| [^|]+ \| `([^`]+)` \| ([^|]+) \|/gm)].map(([, key, cron, et]) => {
  const [minute, hour, , , dow] = cron.split(' ');
  return { key, cron, et: et.trim(), minute: Number(minute), hour: Number(hour), weekdays: dow === '*' ? null : dow.split(',').map(Number) };
});
const audit = rows.find((row) => row.key === 'audit');

test('instruction docs only reference files and npm scripts that exist', () => {
  const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts as Record<string, string>;
  const missing: string[] = [];
  for (const doc of instructionDocs) {
    const text = readFileSync(doc, 'utf8');
    for (const [, name] of text.matchAll(/npm run ([a-z0-9:_-]+)/g)) if (!scripts[name]) missing.push(`${doc}: npm run ${name}`);
    for (const [, path] of text.matchAll(/(?<![\w/.-])((?:scripts|maintenance|TASKS|docs|test|src|\.github\/workflows)\/[\w./-]+?\.(?:json|ts|js|py|sh|md|yml))(?!\w)/g)) {
      if (!existsSync(path)) missing.push(`${doc}: ${path}`);
    }
  }
  assert.deepEqual([...new Set(missing)], []);
});

test('the AUTOMATION.md schedule keeps every audit ahead of the producers', () => {
  assert.ok(audit, 'Schedule table has an audit row');
  assert.ok(rows.length > 1, 'Schedule table has producer rows');
  assert.ok(audit.hour * 60 + audit.minute < 5 * 60, 'the audit runs before 05:00 UTC');
  for (const row of rows.filter((candidate) => candidate !== audit)) {
    const start = row.hour * 60 + row.minute;
    assert.ok(start >= 5 * 60 && start <= 6 * 60 + 30, `${row.key} starts between 05:00 and 06:30 UTC (${row.cron})`);
  }
});

test('each schedule row states its ET time and weekdays to match the UTC cron', () => {
  for (const row of rows) {
    const etHour = (row.hour + 20) % 24; // EDT = UTC-4
    const time = `${etHour % 12 || 12}${row.minute ? `:${String(row.minute).padStart(2, '0')}` : ''} ${etHour < 12 ? 'AM' : 'PM'}`;
    assert.ok(row.et.includes(time), `${row.key}: ET column "${row.et}" should say ${time}`);
    if (row.weekdays) {
      const shift = row.hour < 4 ? 6 : 0; // before 04:00 UTC it is still the previous day in ET
      for (const day of row.weekdays) assert.ok(row.et.includes(DAYS[(day + shift) % 7]), `${row.key}: ET column "${row.et}" should name ${DAYS[(day + shift) % 7]}`);
    }
  }
});

test('the auditor health check runs on a day the audit is scheduled', () => {
  assert.ok(audit, 'Schedule table has an audit row');
  const auditDays = audit.weekdays ?? [0, 1, 2, 3, 4, 5, 6];
  for (const [, day] of automation.matchAll(/\((\w+day) runs only/g)) {
    assert.ok(auditDays.includes(DAY_NAMES.indexOf(day)), `"${day} runs only" must be an audit day (UTC cron ${audit.cron})`);
  }
});

test('every scheduled routine has a section and every section a schedule row', () => {
  const sections = [...automation.matchAll(/^### .+ \(`([a-z-]+)`\)$/gm)].map(([, key]) => key).sort();
  assert.deepEqual(sections, rows.map((row) => row.key).sort());
});

test('every non-deploy GitHub workflow is documented in AUTOMATION.md', () => {
  for (const file of readdirSync('.github/workflows').filter((name) => name !== 'deploy.yml')) {
    assert.ok(automation.includes(`.github/workflows/${file}`), `${file} is listed in docs/AUTOMATION.md`);
  }
});
