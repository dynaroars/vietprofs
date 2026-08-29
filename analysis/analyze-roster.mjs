import fs from 'node:fs';

const roster = JSON.parse(fs.readFileSync(new URL('../public/data.json', import.meta.url)));
const FIELDS = [
  ['Computer & Information Sciences', /computer science|computing|informati|information science|information studies|information systems|information technology|cybersecurity|machine learning|artificial intelligence|natural language processing|multimedia/i],
  ['Engineering', /engineering|materials|aeronautic|astronautic|aerospace|mechatronic|nanotechnology/i],
  ['Mathematics', /mathematic|mathématiq|géométrie/i],
  ['Statistics & Data Science', /statistics|biostatistics|operations research|decision sciences|data science/i],
  ['Physics & Astronomy', /physics|astronomy/i], ['Chemistry', /chemistry|chimie/i],
  ['Biological & Biomedical Sciences', /biology|biologie|biological sciences|neuroscience|genetics|genomic|oncology|microbiology|immunology|molecular|cell biology|ecology|physiolog/i],
  ['Agricultural & Natural Resource Sciences', /agricultur|agronomy|food science|natural resources|plant science|horticulture|animal science|soil science|forestry|wildlife|fisheries/i],
  ['Earth & Environmental Sciences', /environmental|earth|geology|geoscience|geography|oceanography|atmospheric/i],
  ['Health Sciences', /health|medicine|surgery|nursing|public health|epidemiology|pharma|psychiatry|pathology|dermatology|biomedical sciences|cardiovascular|pediatric|neurology|ophthalmology|family practice|physician assistant|kinesiology|exercise science|sport science|veterinary|nutrition|dietetics|audiology|speech-language pathology|dentistry|dental|radiology|optometry|vision science/i],
  ['Business & Economics', /business|economic|finance|accounting|marketing|management|entrepreneurship|insurance|real estate|human resource|industrial relations|organization|supply chain|logistics/i],
  ['Education', /education|curriculum|teaching and learning/i], ['Law & Public Affairs', /\blaw\b|legal studies|public policy|public affairs|public administration|criminal justice|criminology|planning/i],
  ['Social & Behavioral Sciences', /sociology|psycholog|anthropology|political science|politics|social work|communication|international relations|ethnic studies|american studies|asian studies|gender|women|journalism|human development|family studies|media|southeast asia/i],
  ['Humanities', /history|philosophy|english|literature|linguistics|languages|letters|classics|great books|religio|theolog|divinity/i], ['Arts & Design', /\barts?\b|design|music|theat|dance|film|cinema|photograph|architecture/i],
];
function field(p) { return FIELDS.find(([, re]) => re.test(p.department ?? ''))?.[0] ?? 'Others'; }
function count(values) { const m = new Map(); for (const v of values) m.set(v, (m.get(v) ?? 0) + 1); return [...m].sort((a,b)=>b[1]-a[1] || String(a[0]).localeCompare(String(b[0]))); }
function pct(n,d) { return `${n} (${Math.round(100*n/d)}%)`; }
const us = roster.filter(p => (p.country ?? 'United States') === 'United States');
const intl = roster.filter(p => (p.country ?? 'United States') !== 'United States');
const universities = count(roster.map(p=>p.university));
const countries = count(roster.map(p=>p.country ?? 'United States'));
const fields = count(roster.map(field));
const tracks = count(roster.map(p=>p.track ?? 'missing'));
const states = count(us.map(p=>p.state ?? 'missing'));
const phd = roster.filter(p=>p.phdYear).map(p=>p.phdYear);
const deptSpread = [...new Map(roster.map(p=>[p.university, new Set(roster.filter(q=>q.university===p.university && q.department).map(q=>q.department)).size])).entries()].sort((a,b)=>b[1]-a[1]);
const sameField = count(roster.filter(p=>p.department).map(p=>`${p.university}\t${field(p)}`));
const honors = roster.filter(p=>(p.honors??[]).length>0).length;
const urls = { profile: roster.filter(p=>p.profileUrl).length, scholar: roster.filter(p=>p.scholarUrl).length, website: roster.filter(p=>p.websiteUrl).length, phd: roster.filter(p=>p.phdInstitution).length, phdYear: roster.filter(p=>p.phdYear).length };
const output = { generatedAt: new Date().toISOString(), records: roster.length, universities: universities.length, countries: countries.length, usRecords: us.length, internationalRecords: intl.length, fields: fields.length, tracks, urls, phdYearRange: phd.length ? [Math.min(...phd), Math.max(...phd)] : [], topUniversities: universities.slice(0,20), topCountries: countries, fields, states: states.slice(0,20), departmentSpread: deptSpread.slice(0,20), sameInstitutionFieldClusters: sameField.filter(([,n])=>n>=3).slice(0,20), honorsRecords: honors, usFieldShares: count(us.map(field)).map(([k,n])=>[k,n,Math.round(100*n/us.length)]), internationalFieldShares: count(intl.map(field)).map(([k,n])=>[k,n,Math.round(100*n/intl.length)]) };
console.log(JSON.stringify(output, null, 2));
