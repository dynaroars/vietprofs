import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  canonicalRank,
  displayName,
  displayUniversity,
  fieldOf,
  legacyPersonPath,
  personPath,
  type Roster,
  type RosterEntry,
  vietnameseName,
} from '../src/data.ts';
import { escapeHtml, formatRosterDate } from '../src/utils.ts';

const siteUrl = 'https://vietprofs.roars.dev';
const root = resolve(import.meta.dirname, '..');
const development = process.argv.includes('--dev');
const output = resolve(root, development ? 'public' : 'dist');
const peopleDir = resolve(output, 'people');

type ProfileRedirect = {
  redirectTo: string | null;
  reason: 'legacy' | 'merged' | 'removed';
};

type ProfileRedirects = Record<string, ProfileRedirect>;

function absoluteUrl(path: string) {
  return `${siteUrl}/${path}`;
}

function locationOf(person: RosterEntry) {
  return [person.city, person.state, person.country && !['United States', 'US', 'USA'].includes(person.country) ? person.country : '']
    .filter(Boolean)
    .join(', ');
}

function profilePage(person: RosterEntry) {
  const name = displayName(person.name);
  const nativeName = vietnameseName(person);
  const path = personPath(person.id);
  const canonicalUrl = absoluteUrl(path);
  const title = `${name} — VietProfs`;
  const role = [canonicalRank(person), person.department, person.university].filter(Boolean).join(', ');
  const description = `${name} is listed by VietProfs as ${role}.`;
  const portrait = person.portrait
    ? `<img class="portrait" src="../${escapeHtml(person.portrait)}" alt="Portrait of ${escapeHtml(name)}" width="240" height="240">`
    : '';
  const research = person.researchAreas?.length
    ? `<section><h2>Research areas</h2><ul>${person.researchAreas.map((area) => `<li>${escapeHtml(area)}</li>`).join('')}</ul></section>`
    : '';
  const education = [
    person.postdocInstitution && `Postdoctoral training: ${[displayUniversity(person.postdocInstitution), person.postdocYear].filter(Boolean).join(', ')}`,
    person.phdInstitution && `PhD: ${[displayUniversity(person.phdInstitution), person.phdYear].filter(Boolean).join(', ')}`,
    person.msInstitution && `MS: ${[displayUniversity(person.msInstitution), person.msYear].filter(Boolean).join(', ')}`,
    person.mdInstitution && `MD: ${[displayUniversity(person.mdInstitution), person.mdYear].filter(Boolean).join(', ')}`,
    person.undergradInstitution && `Undergraduate: ${[displayUniversity(person.undergradInstitution), person.undergradYear].filter(Boolean).join(', ')}`,
    ...(person.otherDegrees ?? []).map((degree) => `${degree.degree}: ${[displayUniversity(degree.institution), degree.year].filter(Boolean).join(', ')}`),
  ].filter(Boolean);
  const educationSection = education.length
    ? `<section><h2>Education and training</h2><ul>${education.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`
    : '';
  const honors = person.honors?.length
    ? `<section><h2>Selected honors</h2><ul>${person.honors.map((honor) => `<li><a href="${escapeHtml(honor.source || '#')}">${escapeHtml(honor.name)}${honor.year ? ` (${honor.year})` : ''}</a></li>`).join('')}</ul></section>`
    : '';
  const links = [
    person.profileUrl && ['Official university profile', person.profileUrl],
    person.websiteUrl && ['Personal or lab website', person.websiteUrl],
    person.scholarUrl && ['Google Scholar', person.scholarUrl],
  ].filter(Boolean) as [string, string][];
  const linkSection = links.length
    ? `<nav class="links" aria-label="External profiles">${links.map(([label, href]) => `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${escapeHtml(label)}</a>`).join('')}</nav>`
    : '';
  const editUrl = `../submit.html?edit=${encodeURIComponent(person.id)}`;
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
  <title>${escapeHtml(title)}</title>
  <script type="application/ld+json">${jsonLd}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../profile.css">
</head>
<body class="profile-page">
  <header><a class="eyebrow" href="../">VietProfs</a></header>
  <main>
    <article>
      <div class="identity">${portrait}<div><h1>${escapeHtml(name)}</h1><p class="native">${escapeHtml(nativeName)}</p><p class="meta">${escapeHtml(role)}${locationOf(person) ? ` · ${escapeHtml(locationOf(person))}` : ''}</p><div class="tags"><span class="tag">${escapeHtml(fieldOf(person.department, person.university))}</span><span class="tag">${escapeHtml(person.track || '')}</span></div></div></div>
      ${linkSection}<p><a class="submission-link" href="${escapeHtml(editUrl)}">Add or update info</a></p>${research}${educationSection}${honors}
      <footer><p class="updated">Roster information last updated ${escapeHtml(formatRosterDate(person.lastUpdatedAt || ''))}.</p><p>VietProfs is a community-maintained directory. See the linked university and personal sources for the most current details.</p></footer>
    </article>
  </main>
</body>
</html>`;
}

function redirectPage(redirect: ProfileRedirect) {
  const targetPath = redirect.redirectTo ? personPath(redirect.redirectTo) : '';
  const targetUrl = targetPath ? absoluteUrl(targetPath) : `${siteUrl}/`;
  const title = redirect.redirectTo ? 'Profile moved — VietProfs' : 'Profile no longer listed — VietProfs';
  const message = redirect.reason === 'legacy'
    ? 'This profile now uses a permanent VietProfs URL.'
    : redirect.redirectTo
      ? 'This profile has been consolidated into another VietProfs entry.'
      : 'This profile is no longer listed in VietProfs.';
  const action = redirect.redirectTo
    ? `<p><a href="../${escapeHtml(targetPath)}">Continue to the current profile</a>.</p>`
    : '<p><a href="../">Return to the VietProfs directory</a>.</p>';
  const refresh = redirect.redirectTo ? `<meta http-equiv="refresh" content="0; url=../${escapeHtml(targetPath)}">` : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, follow">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#15181c" media="(prefers-color-scheme: dark)">
  <link rel="canonical" href="${targetUrl}">
  <link rel="stylesheet" href="../profile.css">
  ${refresh}
  <title>${title}</title>
</head>
<body class="profile-page"><header><a class="eyebrow" href="../">VietProfs</a></header><main><h1>${title}</h1><p>${message}</p>${action}</main></body>
</html>`;
}

async function main() {
  const roster = JSON.parse(await readFile(resolve(root, 'public/data.json'), 'utf8')) as Roster;
  const redirects = JSON.parse(await readFile(resolve(root, 'maintenance/profile-redirects.json'), 'utf8')) as ProfileRedirects;
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
  await Promise.all(roster.map(async (person) => {
    const outputFile = resolve(output, legacyPersonPath(person.name));
    await mkdir(dirname(outputFile), { recursive: true });
    await writeFile(outputFile, redirectPage({ redirectTo: person.id, reason: 'legacy' }));
  }));
  await Promise.all(Object.entries(redirects).map(async ([id, redirect]) => {
    const outputFile = resolve(output, personPath(id));
    await mkdir(dirname(outputFile), { recursive: true });
    await writeFile(outputFile, redirectPage(redirect));
  }));

  if (!development) {
    const sitemapUrls = roster.map((person) => `  <url>\n    <loc>${absoluteUrl(personPath(person.id))}</loc>\n    <lastmod>${person.lastUpdatedAt?.slice(0, 10) || ''}</lastmod>\n  </url>`);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n  </url>\n  <url>\n    <loc>${siteUrl}/submit.html</loc>\n  </url>\n${sitemapUrls.join('\n')}\n</urlset>\n`;
    await writeFile(resolve(output, 'sitemap.xml'), sitemap);
  }
  console.log(`Generated ${roster.length} profile pages${development ? ' for development.' : ' and sitemap entries.'}`);
}

await main();
