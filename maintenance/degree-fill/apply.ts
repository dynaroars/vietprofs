// Apply degree-fill results (maintenance/degree-fill/runs/*.json) to public/data.json.
// Only empty fields are filled; a result that contradicts a stored value, lacks a source and
// quote, names a professional doctorate, or breaks the year rules is held for review instead.
//
//   node maintenance/degree-fill/apply.ts [--dry]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { canonicalAlmaMater } from '../../src/alma-mater.ts';

const dry = process.argv.includes('--dry');
const dir = 'maintenance/degree-fill/runs';
const roster = JSON.parse(readFileSync('public/data.json', 'utf8'));
const byId = new Map(roster.map((p: any) => [p.id, p]));
const FIELDS = [
  'phdInstitution',
  'phdYear',
  'undergradInstitution',
  'undergradYear',
  'msInstitution',
  'mdInstitution',
  'postdocInstitution',
] as const;
// Research doctorates under their many names (Doctor of Engineering, doctorat, Doktor, 박사,
// Candidate of Sciences, Dottorato di ricerca...). An empty type is accepted when the quote names a
// dissertation or doctorate; professional doctorates are not.
const RESEARCH =
  /(ph\.?\s?d|philosophiae|d\.?\s?phil|sc\.?\s?d|d\.?\s?sc|ed\.?\s?d|dr\.?\s?p\.?\s?h|\bdph\b|d\.?\s?b\.?\s?a|d\.?\s?eng|\bdr\b|doctor of (philosophy|science|engineering|agricultur|education|public health|business)|doctora|doktor|dottor|candidate of|\bcsc\b|dissertation|thesis|habilitation|博士|박사)/i;
const PROFESSIONAL =
  /\b(md|do|dds|dmd|pharm\.?\s?d|jd|dnp|dpt|otd|aud|psy\.?\s?d|mfa|dpm|dvm|dma|d\.?\s?mgt)\b|musical arts|management|nursing practice|juris/i;
const reviewed: Record<string, { override?: string[]; drop?: string[]; set?: Record<string, string>; rejectPhd?: boolean; acceptPhd?: boolean }> =
  JSON.parse(readFileSync('maintenance/degree-fill/reviewed.json', 'utf8'));
const DEGREE_WORDS = /\b(ph\.?d|m\.?s\.?c?|b\.?s|b\.?a|m\.?a|master|bachelor|doctor|degree)\b/i;

const held: string[] = [];
const applied: string[] = [];
let filled = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  const text = readFileSync(`${dir}/${file}`, 'utf8');
  let results: any[];
  try {
    results = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)).results;
  } catch {
    held.push(`${file}: unparseable output`);
    continue;
  }
  for (const r of results ?? []) {
    const p: any = byId.get(r.id);
    if (!p || !r.found) continue;
    const hold = (why: string) => held.push(`${r.id} ${p.name}: ${why} | ${r.source ?? ''}`);
    if (!r.source || !r.quote) {
      hold('no source or quote');
      continue;
    }
    const rule = reviewed[r.id] ?? {};
    Object.assign(r, rule.set ?? {});
    for (const f of rule.drop ?? []) if (!rule.set?.[f]) delete p[f];
    if (r.phdInstitution) {
      const kind = String(r.doctorate || r.quote);
      if (rule.rejectPhd || (!rule.acceptPhd && !RESEARCH.test(kind) || PROFESSIONAL.test(String(r.doctorate ?? '')))) {
        hold(`doctorate type "${kind}"`);
        delete r.phdInstitution;
        delete r.phdYear;
      }
    }
    const changes: Record<string, string | number> = {};
    let conflict = false;
    for (const f of FIELDS) {
      let v = r[f];
      if (v === undefined || v === null || v === '') continue;
      v = String(v).trim();
      if (f.endsWith('Year')) {
        if (!/^(19[4-9]\d|20[0-2]\d)$/.test(v)) {
          hold(`${f} "${v}"`);
          continue;
        }
      } else {
        if (DEGREE_WORDS.test(v.split(',')[0]) && !/university|college|institut|school/i.test(v)) {
          hold(`${f} "${v}" looks like a degree, not an institution`);
          continue;
        }
        v = canonicalAlmaMater(v);
      }
      const stored = rule.override?.includes(f) || rule.set?.[f] ? undefined : p[f];
      if (stored !== undefined) {
        if (String(stored).toLowerCase() !== v.toLowerCase() && canonicalAlmaMater(String(stored)) !== v)
          (conflict = true), hold(`${f} stored "${stored}" vs found "${v}"`);
        continue;
      }
      changes[f] = f.endsWith("Year") ? Number(v) : v;
    }
    // A year needs its institution (stored or found).
    for (const [y, inst] of [
      ['phdYear', 'phdInstitution'],
      ['undergradYear', 'undergradInstitution'],
    ] as const)
      if (changes[y] && !changes[inst] && !p[inst]) delete changes[y];
    const ug = Number(changes.undergradYear ?? p.undergradYear);
    const phd = Number(changes.phdYear ?? p.phdYear);
    if (ug && phd && phd - ug < 2) {
      hold(`undergradYear ${ug} vs phdYear ${phd}`);
      continue;
    }
    if (conflict && Object.keys(changes).length === 0) continue;
    if (!Object.keys(changes).length) continue;
    Object.assign(p, changes);
    filled += Object.keys(changes).length;
    applied.push(`${r.id} ${p.name}: ${Object.entries(changes).map(([k, v]) => `${k}=${v}`).join('; ')}`);
  }
}
console.log(applied.join('\n'));
console.log(`\nHELD (${held.length}):\n${held.join('\n')}`);
console.log(`\n${applied.length} entries, ${filled} fields${dry ? ' (dry run)' : ''}.`);
if (!dry) writeFileSync('public/data.json', `${JSON.stringify(roster, null, 2)}\n`);
