import { execFileSync } from 'node:child_process';
const format = execFileSync('git', ['log','--all','--format=%h%x09%ad%x09%s','--date=short'], {encoding:'utf8'});
const lines = format.trim().split('\n').filter(Boolean);
const categories = { additions:/add|batch|ingest|discovered|new faculty/i, refresh:/refresh|re-verify|maintenance|automated roster/i, corrections:/fix|correct|dedup|duplicate|update|remove|exclude|audit/i, analysis:/fact|interesting|insight|pattern|stat/i };
const result = { commits: lines.length, dateRange: [lines.at(-1)?.split('\t')[1], lines[0]?.split('\t')[1]], categories: Object.fromEntries(Object.entries(categories).map(([k,re])=>[k,lines.filter(l=>re.test(l)).length])), examples: lines.filter(l=>/duplicate|promotion|move|retir|emerit|remove|re-verify|Automated roster maintenance|Country sweep|Clinical|Teaching|Research/i.test(l)).slice(0,60) };
console.log(JSON.stringify(result,null,2));
