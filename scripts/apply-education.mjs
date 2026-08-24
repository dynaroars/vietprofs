/**
 * apply-education.mjs
 *
 * Applies the education findings from scripts/education-results.json to public/data.json.
 *
 * For each professor:
 *   - If a new phdInstitution was found and the existing one is missing → add it
 *   - If a new phdYear was found and existing is missing → add it
 *   - If a new phdMajor was found → add phdMajor field
 *   - Same for MS institution/year fields
 *   - Same for undergrad fields
 *   - NEVER overwrites existing data (only fills gaps), unless --force is used
 *
 * Usage:
 *   node scripts/apply-education.mjs [--dry-run] [--force]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_FILE    = resolve(ROOT, 'public/data.json');
const RESULTS_FILE = resolve(ROOT, 'scripts/education-results.json');

const args    = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE   = args.includes('--force');

const YEAR_MIN = 1950;
const YEAR_MAX = new Date().getFullYear();

// ─── Known institution cleanup ─────────────────────────────────────────────────
// Some extracted names come with a major or location prepended; this map
// lets us canonicalize them to the real institution name.
const INST_FIXES = {
  'Computer Science National University of Singapore': 'National University of Singapore',
  'University of Saarlandes - 1978': 'University of Saarland',
  'Computer Science, University of South Florida': 'University of South Florida',
  'Physics from the University of Central Florida in 2012': 'University of Central Florida',
  'degree in Computer Science at Vanderbilt University in August 2020': 'Vanderbilt University',
  'Electrical and Computer Engineering, Oklahoma State University': 'Oklahoma State University',
  'computer science, Oregon State University': 'Oregon State University',
  'Electrical Engineering, Thai Nguyen University of Technology, Vietnam': 'Thai Nguyen University of Technology',
  'computer science, Hanoi University of Science and Technology': 'Hanoi University of Science and Technology',
  'Electrical and Computer Engineering, Boise State University, Boise, ID': 'Boise State University',
  'Information Technology, University of Science, Vietnam National University': 'Vietnam National University',
  'Computer Science, Assumption University': 'Assumption University',
  'Curriculum and Instruction, Texas Tech University': 'Texas Tech University',
  'Electrical Engineering, Thai Nguyen University of Technology, Vietnam': 'Thai Nguyen University of Technology',
  'Computer Science at University of Illinois at Chicago': 'University of Illinois at Chicago',
  'University of California, Irvine , Lecturer of Economics': 'University of California, Irvine',
  'University of Connecticut , Lecturer of Mathematics': 'University of Connecticut',
  'University of Queensland, Brisbane, AU, Mathematics and Computer Science': 'University of Queensland',
  'Georgia Institute of Technology, Atlanta, GA 1995': 'Georgia Institute of Technology',
  'Georgia Institute of Technology, Atlanta, GA': 'Georgia Institute of Technology',
  'VNU Hanoi University of Science, Hanoi': 'VNU Hanoi University of Science',
  'Capitol Technology University, Laurel, Maryland': 'Capitol Technology University',
  'University of Minnesota, Twin Cities': 'University of Minnesota',
  'Institute of Technology-EPFL Lausanne (Switzerland)': 'EPFL (Swiss Federal Institute of Technology)',
  'University of Architecture, Ho Chi Minh City, Vietnam': 'Ho Chi Minh City University of Architecture',
  'Computer Science, Vietnam National University, Hanoi': 'Vietnam National University, Hanoi',
  'Finance, Drexel University, PA': 'Drexel University',
  'Accounting and Finance, Monash University': 'Monash University',
  'Hoa Vo': null,  // remove bad match
  'Nanyang Technological University 50 Nanyang Avenue': 'Nanyang Technological University',
  'Software Engineering , University of Waterloo, Canada': 'University of Waterloo',
  'Economics, University of Arizona, USA': 'University of Arizona',
  'University of Rennes 1 (France) in': 'University of Rennes 1',
  'Operational Research at Massachusetts Institute of Technology, US, in': 'Massachusetts Institute of Technology',
  'BA Politics at SOAS University of London': 'SOAS University of London',
  'Concentration Spanish, University of Dallas': 'University of Dallas',
  'summa cum laude, Saint Mary\'s University of Minnesota': 'Saint Mary\'s University of Minnesota',
  'Hanoi University, Hanoi, Vietnam': 'Hanoi University',
  'University of Technology (Vietnam)': 'Ho Chi Minh City University of Technology',
  'Long Pham': null, // dummy key won't match
  'University (in': null,  // fragment
  'Psychology and BS in Exercise Science from Gonzaga University': 'Gonzaga University',
  'Concentration Spanish, University of Dallas': 'University of Dallas',
  'College of Dental Medicine': null,   // department, not institution
  'College of Psychology': null,        // department, not institution
  // Undergrad fixes
  'Human Biology Stanford University': 'Stanford University',
  'Computer Science, Vietnam National University, Hanoi': 'Vietnam National University, Hanoi',
  'Accounting and Finance, Monash University': 'Monash University',
  'Communication - University of California, San Diego': 'University of California, San Diego',
  'International University of Japan in Niigata, Japan': 'International University of Japan',
  'Hanoi University of Technology , Vietnam': 'Hanoi University of Technology',
  'University (Vietnam)': null,  // too vague
  'University of Science': null, // ambiguous — "University of Science" without country context
  'Trinh Pham undergradInstitution': null, // never matches, placeholder
  'Huy Q. Dinh undergradInstitution': null, // placeholder
  'degree in Mechanical Engineering from National University of Singapore in': 'National University of Singapore',
};

const MAJOR_FIXES = {
  'Institute of Technology-EPFL Lausanne (Switzerland)': 'Engineering Physics',
};

// ─── Corresponding major cleanup ────────────────────────────────────────────────
// When we fix an institution, we can recover the major from the prefix
const MAJOR_FROM_FIX = {
  'Computer Science National University of Singapore': 'Computer Science',
  'Computer Science, University of South Florida': 'Computer Science',
  'Physics from the University of Central Florida in 2012': 'Physics',
  'degree in Computer Science at Vanderbilt University in August 2020': 'Computer Science',
  'Electrical and Computer Engineering, Oklahoma State University': 'Electrical and Computer Engineering',
  'computer science, Oregon State University': 'Computer Science',
  'Electrical Engineering, Thai Nguyen University of Technology, Vietnam': 'Electrical Engineering',
  'computer science, Hanoi University of Science and Technology': 'Computer Science',
  'Electrical and Computer Engineering, Boise State University, Boise, ID': 'Electrical and Computer Engineering',
  'Curriculum and Instruction, Texas Tech University': 'Curriculum and Instruction',
  'Computer Science at University of Illinois at Chicago': 'Computer Science',
};

const JUNK_RE = /YouTube|Facebook|Twitter|Instagram|LinkedIn|Subscribe|Cookie|Privacy|Copyright|©|\bFollow\b|\bContact Us\b|\bCampus Map\b|\bJobs @|\bTechAlert\b|\bsitemap\b|404|login|sign in|\bClose\b|\bMenu\b|\bSearch\b|\bSkip to\b|Accessibility|College of Arts & Sciences|College of Nursing|College of Arts and Sciences|Association of College|Advanced Computing|Faculty Profile|Public Health:|instructor of|public health:|Colleges and Schools|Hudson River Valley|Queens College Librar|committee\b|review committee|level review|Connie Nguyen|upstate New York|College in upstate|Dymally Institute|University Centers|Institute\b$|Robert Brown|Pre-university studies|Stanford Advisees|Certifications|Degree Programme|not accepting patients|Responsibilities within|Royal College of Physicians|mHealth Training Institute|Princeton Engineers|\bPrior to\b|Combinatorics Seminar|Cullen College|Paying for College|University Bookstore|University Curriculum|College Resources|and Schools School|\bFiona Brown\b|Community-University Empowerment|Youth and Pre-College|Principal Leadership Institute|University Press|Yale Gamelan|\bCollege Now\b|University Studies|EALAC|University Diplomas|University Professor|Pre-College Programs|Air University Associate|New Research Presented|Honors College|\bUniversity in$|\bUniversity \(USA\)\b|Statistics PhD program|\bfrom$|\b(University|Institute)\)$|Technology\)$|\bUniversity System$|\bUniversity of Illinois System$|\bSchool Online Application|\bUniversity of George Mason\b|\bUniversity of Melbourne in$|\bUniversity of Illinois in$|\bUniversity of California$|\bThe College$|^College\b|^Institute for the Connected$|^Institute of AI and Sustainability$|^Institute of Health Policy$|^Health Care Management,|^Yale Graduate School of Arts and Sciences|^\s*of Science\b|^May \d{4}\b|^PhD -|^University of Mississippi Medical Center Pediatric|^workshop for|^Wilkinson College|^College Home|^Connect with the College|^American University of Armenia has new president|^University in Melbourne|^Van Lang University \(HCM City$|^Convergent Science Institute|^The Ohio Summer Undergraduate|^Institute of Technology$|^Honours College$|^University \(USA\)$|^The University of Melbourne \(Australian University\)/i;

function cleanInst(raw) {
  if (!raw) return null;
  // Apply known fixes first — null means explicitly reject
  if (raw in INST_FIXES) return INST_FIXES[raw]; // may be null

  // Strip common sentence-fragment prefixes
  let s = raw
    .replace(/^(?:at the|at|from the|from|in the|in)\s+/i, '')
    .replace(/\s*(?:[,.!?;]|\s-\s+\d{4})\s*$/, '')
    .replace(/\s*\(\d{4}\)\s*$/, '')      // trailing (year)
    .replace(/,\s*[A-Z]{2},?\s*\d{5}.*$/, '') // trailing state, zip
    .replace(/,\s*[A-Z]{2}\s*$/, '')      // trailing state abbreviation
    .replace(/,?\s+\d{4}\s*$/, '')        // trailing standalone year
    .replace(/,?\s*Lecturer\s+of\s+.*$/, '')  // trailing job title
    .replace(/,?\s*Professor\s+of\s+.*$/, '') // trailing job title
    .replace(/,?\s*Department\s+of\s+.*$/, '') // trailing dept
    .replace(/\s+in\s*$/, '')
    .replace(/\s*\(USA\)\s+in\s*$/, '')
    .trim();

  // If it looks like "MAJOR, INSTITUTION" – drop the major part
  const INST_KW = /\b(University|Institute|Universit[eé]|College|School|Polytechnic|Academy|Technolog|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice|Northwestern|Dartmouth|Brown|Vanderbilt|EPFL|ETH|Hanoi|Vietnam|National|State)\b/i;
  const commaIdx = s.indexOf(',');
  if (commaIdx > 0) {
    const before = s.substring(0, commaIdx).trim();
    const after  = s.substring(commaIdx + 1).trim();
    if (!INST_KW.test(before) && INST_KW.test(after)) {
      s = after.trim();
    }
  }

  if (s in INST_FIXES) return INST_FIXES[s];

  return s;
}

function cleanMajor(raw, instRaw) {
  if (!raw) {
    // Try recovering from MAJOR_FROM_FIX (keyed on raw institution string)
    if (instRaw && MAJOR_FROM_FIX[instRaw]) return MAJOR_FROM_FIX[instRaw];
    // Try MAJOR_FIXES (keyed on raw institution string)
    if (instRaw && MAJOR_FIXES[instRaw]) return MAJOR_FIXES[instRaw];
    return null;
  }
  // Reject if raw major is a year, a year+name combo, or a sentence fragment
  if (/^\d{4}/.test(raw.trim())) return null;
  if (/\binstructor\b|\bprofessor\b|\bhas been\b|\bsince\b|\bUnited States\b|\bSwiss Federal\b/i.test(raw)) return null;
  return raw.trim().replace(/^\w/, c => c.toUpperCase());
}

function isValidYear(y) {
  return Number.isInteger(y) && y >= YEAR_MIN && y <= YEAR_MAX;
}

function isValidInstitution(s) {
  if (!s || typeof s !== 'string') return false;
  const t = s.trim();
  if (t.length < 6 || t.length > 100) return false;
  const words = t.split(/\s+/);
  if (words.length > 9) return false;
  // Must be at least 2 words (real institutions never single words like "University")
  if (words.length < 2) return false;
  if (JUNK_RE.test(t)) return false;
  if (!/[A-Z]/.test(t)) return false;
  // Reject sentence fragments
  if (/\.\s+[A-Z][a-z]/.test(t)) return false;
  // Reject if it contains parenthetical years
  if (/\(\d{4}\)/.test(t)) return false;
  // Reject if it looks like a sentence fragment
  if (/\b(at the|from the|in the|degree in|degree from|student at|is an|has been|since\s+\d|instructor|cum laude)\b/i.test(t)) return false;
  // Reject if it contains a colon (page-title fragments like "- Faculty Profile - UT ...")
  if (/:\s/.test(t) || /^-\s/.test(t)) return false;
  // Reject if it starts with a number or year
  if (/^\d/.test(t)) return false;
  // Must contain at least one institution keyword
  const INST_KW = /\b(University|Institute|Universit[eé]|College|School|Polytechnic|Academy|Technolog|MIT|Caltech|Stanford|Harvard|Yale|Princeton|Columbia|Cornell|Duke|Rice|Northwestern|Dartmouth|Brown|Vanderbilt|EPFL|ETH|Hanoi|Vietnam|National|State|Waseda|Curtin|Monash|Griffith|Massey|Auckland|Sydney|Melbourne|Munich|Berlin|Paris|Oxford|Cambridge|Peking|Tsinghua|NUS|KAIST|HUST|VNU|Seoul|Kyoto|Tokyo)\b/i;
  if (!INST_KW.test(t)) return false;
  return true;
}

function isValidMajor(s) {
  if (!s || typeof s !== 'string') return false;
  const t = s.trim();
  if (t.length < 3 || t.length > 80) return false;
  const words = t.split(/\s+/);
  if (words.length > 6) return false;
  if (JUNK_RE.test(t)) return false;
  // Reject years-as-major, sentence fragments, names-as-major
  if (/^\d{4}/.test(t)) return false;
  if (/^\(?\s*(?:Iowa State|Tsinghua|National)\b/i.test(t)) return false;
  if (/\b(at the|from|in the|and the|with the|is an|has been|since\s+\d|Texas A&M|Sed within|Rutgers|California$)\b/i.test(t)) return false;
  // Single-word geographic names as major (e.g. "California", "Swiss Federal") are suspicious
  if (words.length === 1 && /^[A-Z]/.test(t) && !/^(Chemistry|Biology|Physics|Mathematics|Engineering|Economics|History|Psychology|Sociology|Statistics|Philosophy|Law|Medicine|Finance|Accounting|Marketing|Management|Computing|Linguistics|Music|Art)$/i.test(t)) return false;
  // Must not be entirely uppercase (abbreviations-only is suspicious)
  if (/^[A-Z\s]+$/.test(t) && t.length > 5) return false;
  return true;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const roster  = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
const results = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'));

let updated = 0;
let changes = [];

for (const prof of roster) {
  // Remove only values that the same quality filter identifies as page noise.
  const removedMsNoise = prof.msInstitution && JUNK_RE.test(prof.msInstitution);
  if (removedMsNoise) {
    delete prof.msInstitution;
    delete prof.msYear;
  }
  const result = results[prof.name];
  if (!result?._processed) continue;

  const edits = removedMsNoise ? ['removed invalid msInstitution/msYear'] : [];
  const rawPhd = result.phdInstitution;
  const rawMs  = result.msInstitution;
  const rawUg  = result.undergradInstitution;

  // ── PhD Institution ──────────────────────────────────────────────────────
  const rejectPhdData = prof.name === 'Benjamin Nguyen';
  const phdInst = rejectPhdData ? null : cleanInst(rawPhd);
  const validPhdInst = phdInst && isValidInstitution(phdInst);
  if (validPhdInst) {
    if (!prof.phdInstitution || FORCE) {
      edits.push(`phdInstitution: "${phdInst}"`);
      if (!DRY_RUN) prof.phdInstitution = phdInst;
    }
  }

  // ── PhD Year ─────────────────────────────────────────────────────────────
  if (!rejectPhdData && result.phdYear && isValidYear(result.phdYear) && (prof.phdInstitution || phdInst)) {
    if (!prof.phdYear || FORCE) {
      edits.push(`phdYear: ${result.phdYear}`);
      if (!DRY_RUN) prof.phdYear = result.phdYear;
    }
  }

  // ── PhD Major ────────────────────────────────────────────────────────────
  const phdMajor = cleanMajor(result.phdMajor, rawPhd);
  if (phdMajor && isValidMajor(phdMajor)) {
    if (!prof.phdMajor || FORCE) {
      edits.push(`phdMajor: "${phdMajor}"`);
      if (!DRY_RUN) prof.phdMajor = phdMajor;
    }
  }

  // ── MS Institution ──────────────────────────────────────────────────────
  const msInst = cleanInst(rawMs);
  const validMsInst = msInst && isValidInstitution(msInst);
  if (validMsInst) {
    if (!prof.msInstitution || FORCE) {
      edits.push(`msInstitution: "${msInst}"`);
      if (!DRY_RUN) prof.msInstitution = msInst;
    }
  }

  // ── MS Year ──────────────────────────────────────────────────────────────
  if (result.msYear && isValidYear(result.msYear) && (prof.msInstitution || validMsInst)) {
    if (!prof.msYear || FORCE) {
      edits.push(`msYear: ${result.msYear}`);
      if (!DRY_RUN) prof.msYear = result.msYear;
    }
  }

  // ── Undergrad Institution ────────────────────────────────────────────────
  const ugInst = cleanInst(rawUg);
  const validUgInst = ugInst && isValidInstitution(ugInst);
  if (validUgInst) {
    if (!prof.undergradInstitution || FORCE) {
      edits.push(`undergradInstitution: "${ugInst}"`);
      if (!DRY_RUN) prof.undergradInstitution = ugInst;
    }
  }

  // ── Undergrad Year ───────────────────────────────────────────────────────
  if (result.undergradYear && isValidYear(result.undergradYear) && (prof.undergradInstitution || validUgInst)) {
    if (!prof.undergradYear || FORCE) {
      edits.push(`undergradYear: ${result.undergradYear}`);
      if (!DRY_RUN) prof.undergradYear = result.undergradYear;
    }
  }

  // ── Undergrad Major ──────────────────────────────────────────────────────
  const ugMajor = cleanMajor(result.undergradMajor, rawUg);
  if (ugMajor && isValidMajor(ugMajor)) {
    if (!prof.undergradMajor || FORCE) {
      edits.push(`undergradMajor: "${ugMajor}"`);
      if (!DRY_RUN) prof.undergradMajor = ugMajor;
    }
  }

  if (edits.length > 0) {
    updated++;
    changes.push({ name: prof.name, edits });
    console.log(`✓ ${prof.name}: ${edits.join(', ')}`);
  }
}

if (!DRY_RUN && changes.length > 0) {
  const lines  = roster.map(p => '  ' + JSON.stringify(p));
  const output = '[\n' + lines.join(',\n') + '\n]\n';
  writeFileSync(DATA_FILE, output);
  console.log(`\nUpdated ${updated} entries in data.json`);
} else if (DRY_RUN) {
  console.log(`\n[DRY RUN] Would update ${updated} entries.`);
} else {
  console.log('\nNo changes to apply.');
}
