// Write batches of roster entries that have no phdInstitution, 25 per file, for the degree-fill run.
import { readFileSync, writeFileSync } from 'node:fs';
const d = JSON.parse(readFileSync('public/data.json', 'utf8'));
const keep = ['id','name','university','department','rank','track','city','country','profileUrl','websiteUrl','scholarUrl','linkedinUrl','undergradInstitution','undergradYear','msInstitution','mdInstitution','postdocInstitution','phdYear'];
const todo = d.filter((p: any) => !p.phdInstitution).map((p: any) => Object.fromEntries(keep.filter((k) => p[k] !== undefined).map((k) => [k, p[k]])));
const size = 25;
let n = 0;
for (let i = 0; i < todo.length; i += size) {
  n += 1;
  writeFileSync(`maintenance/degree-fill/batches/b${String(n).padStart(3, '0')}.json`, `${JSON.stringify(todo.slice(i, i + size), null, 1)}\n`);
}
console.log(todo.length, 'entries in', n, 'batches');
