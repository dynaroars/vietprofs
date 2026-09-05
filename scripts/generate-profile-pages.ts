import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  canonicalRank,
  countryFlag,
  displayName,
  displayUniversity,
  fieldOf,
  personPath,
  type Roster,
  type RosterEntry,
  vietnameseName,
} from '../src/data.ts';
import { escapeHtml, formatRosterDate } from '../src/utils.ts';
import { formatEducationDetails } from '../src/render.ts';

const siteUrl = 'https://vietprofs.roars.dev';
const root = resolve(import.meta.dirname, '..');
const development = process.argv.includes('--dev');
const output = resolve(root, development ? 'public' : 'dist');
const peopleDir = resolve(output, 'people');
const commit = process.env.VITE_GIT_COMMIT || (() => {
  try {
    return execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return 'development';
  }
})();

function absoluteUrl(path: string) {
  return `${siteUrl}/${path}`;
}

function locationOf(person: RosterEntry) {
  return [person.city, person.state, person.country && !['United States', 'US', 'USA'].includes(person.country) ? person.country : '']
    .filter(Boolean)
    .join(', ');
}

const TRACK_SECTION: Record<string, number> = {
  'Tenure-line': 1,
  'Teaching': 2,
  'Research': 3,
  'Clinical': 4,
  'Academic staff': 5,
  'Emeritus': 6,
};

function profilePage(person: RosterEntry) {
  const sectionNum = TRACK_SECTION[person.track || ''] || 1;
  const sectionLabel = `VIETPROFS(${sectionNum})`;
  const name = displayName(person.name);
  const nativeName = vietnameseName(person);
  const path = personPath(person.id);
  const canonicalUrl = absoluteUrl(path);
  const title = `${name} — VietProfs`;
  const role = [canonicalRank(person), person.department, person.university].filter(Boolean).join(', ');
  const description = `${name} is listed by VietProfs as ${role}.`;
  const portrait = person.portrait
    ? `<img class="portrait" src="../${escapeHtml(person.portrait)}" alt="Portrait of ${escapeHtml(name)}" width="240" height="240">`
    : `<img class="portrait portrait-placeholder" src="../default-portrait.svg" alt="No portrait on file yet for ${escapeHtml(name)}" width="240" height="240">`;
  const research = person.researchAreas?.length
    ? `<section class="man-section"><h2>RESEARCH</h2><ul>${person.researchAreas.map((area) => `<li>${escapeHtml(area)}</li>`).join('')}</ul></section>`
    : '';
  const education = formatEducationDetails(person, { fullLabels: true });
  const educationSection = education.length
    ? `<section class="man-section"><h2>EDUCATION</h2><ul>${education.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`
    : '';
  const honors = person.honors?.length
    ? `<section class="man-section"><h2>HONORS</h2><ul>${person.honors.map((honor) => `<li>${honor.source ? `<a href="${escapeHtml(honor.source)}" rel="noopener noreferrer">` : ''}${escapeHtml(honor.name)}${honor.year ? ` (${honor.year})` : ''}${honor.source ? '</a>' : ''}</li>`).join('')}</ul></section>`
    : '';
  const links = [
    person.profileUrl && [person.institutionType && person.institutionType !== 'University' ? 'Official institution profile' : 'Official university profile', person.profileUrl],
    person.websiteUrl && ['Personal or lab website', person.websiteUrl],
    person.scholarUrl && ['Google Scholar', person.scholarUrl],
  ].filter(Boolean) as [string, string][];
  const linkSection = links.length
    ? `<section class="man-section"><h2>SOURCES</h2><nav class="links" aria-label="External profiles">${links.map(([label, href]) => `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${escapeHtml(label)}</a>`).join('')}</nav></section>`
    : '';
  const editUrl = `../submit.html?edit=${encodeURIComponent(person.id)}`;
  const rawRecord = escapeHtml(JSON.stringify(person, null, 2));
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: canonicalUrl,
    jobTitle: canonicalRank(person),
    affiliation: { '@type': 'Organization', name: person.university },
    ...(person.researchAreas?.length ? { knowsAbout: person.researchAreas } : {}),
    sameAs: [person.profileUrl, person.websiteUrl, person.scholarUrl].filter(Boolean),
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#15181c" media="(prefers-color-scheme: dark)">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="VietProfs">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${absoluteUrl('vietprofs-bamboo-v-512.png')}">
  <meta property="og:image:alt" content="VietProfs bamboo V logo">
  <link rel="icon" type="image/svg+xml" href="../vietprofs-bamboo-v.svg">
  <link rel="apple-touch-icon" href="../vietprofs-bamboo-v-512.png">
  <title>${escapeHtml(title)}</title>
  <script type="application/ld+json">${jsonLd}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../profile.css">
</head>
<body class="profile-page">
  <div id="app">
    <header><a class="eyebrow" href="../"><img class="brand-logo" src="../vietprofs-bamboo-v.svg" alt="" width="32" height="32">VietProfs</a></header>
    <main>
      <article class="man-page">
        <p class="man-running-head"><span>${sectionLabel}</span><span>VietProfs Profile Manual</span><span>${sectionLabel}</span></p>
        <section class="man-section name-section"><h2>NAME</h2><div class="identity">${portrait}<div class="identity-details"><div class="name-heading"><h1>${escapeHtml(name)} <span class="loc-badge" title="${escapeHtml(person.country || 'United States')}"><span class="country-flag" aria-hidden="true">${countryFlag(person.country)}</span></span></h1><nav class="profile-actions" aria-label="Roster actions"><a class="submission-link" href="${escapeHtml(editUrl)}">Add or update info</a></nav></div><p class="native">${escapeHtml(nativeName)}</p><p class="record-id">${escapeHtml(person.id)}</p></div></div></section>
        <section class="man-section"><h2>SYNOPSIS</h2><p class="synopsis">${escapeHtml(role)}${locationOf(person) ? ` · ${escapeHtml(locationOf(person))}` : ''}</p><div class="tags"><span class="tag">${escapeHtml(fieldOf(person.department, person.university))}</span><span class="tag">${escapeHtml(person.track || '')}</span>${person.institutionType && person.institutionType !== 'University' ? `<span class="tag">${escapeHtml(person.institutionType)}</span>` : ''}</div></section>
        ${research}${educationSection}${honors}${linkSection}
        <section class="man-section"><h2>ROSTER METADATA</h2><dl class="roster-metadata"><div><dt>record</dt><dd>${escapeHtml(person.id)}</dd></div><div><dt>last verified</dt><dd>${escapeHtml(formatRosterDate(person.lastUpdatedAt || ''))}</dd></div><div><dt>build</dt><dd><a href="https://github.com/dynaroars/vietprofs/commit/${escapeHtml(commit)}">${escapeHtml(commit)}</a></dd></div></dl><details class="raw-record"><summary>view raw record</summary><pre><code>${rawRecord}</code></pre></details></section>
        <footer><p>VietProfs is a community-maintained directory. Consult the linked sources for the most current details.</p><p class="man-footer-line">${sectionLabel} · ${escapeHtml(person.id)} · ${sectionLabel}</p></footer>
      </article>
    </main>
  </div>
</body>
</html>`;
}

async function main() {
  const roster = JSON.parse(await readFile(resolve(root, 'public/data.json'), 'utf8')) as Roster;
  const ids = new Set<string>();
  for (const person of roster) {
    if (!person.id || ids.has(person.id)) throw new Error(`Profile ID is missing or duplicated: ${person.name}`);
    ids.add(person.id);
  }

  await rm(peopleDir, { recursive: true, force: true });
  await Promise.all(roster.map(async (person) => {
    const outputFile = resolve(output, personPath(person.id));
    await mkdir(dirname(outputFile), { recursive: true });
    await writeFile(outputFile, profilePage(person));
  }));
  if (!development) {
    const sitemapUrls = roster.map((person) => `  <url>\n    <loc>${absoluteUrl(personPath(person.id))}</loc>\n    <lastmod>${person.lastUpdatedAt?.slice(0, 10) || ''}</lastmod>\n  </url>`);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n  </url>\n  <url>\n    <loc>${siteUrl}/submit.html</loc>\n  </url>\n${sitemapUrls.join('\n')}\n</urlset>\n`;
    await writeFile(resolve(output, 'sitemap.xml'), sitemap);
  }
  console.log(`Generated ${roster.length} profile pages${development ? ' for development.' : ' and sitemap entries.'}`);
}

await main();
