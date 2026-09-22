import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  canonicalRank,
  continentOf,
  countryFlag,
  displayName,
  fieldOf,
  fieldPath,
  fieldRegionPath,
  FIELDS,
  hasEnoughPeopleForRosterHub,
  personPath,
  ROSTER_CONTINENTS,
  regionPath,
  type Roster,
  type RosterEntry,
  vietnameseName,
} from '../src/data.ts';
import { escapeHtml, formatRosterDate } from '../src/utils.ts';
import {
  connectionsFor,
  validateRelationshipDatabase,
  type RelationshipDatabase,
} from '../src/relationships.ts';
import {
  formatEducationDetails,
  LAB_SITE_ICON,
  LINKEDIN_ICON,
  PERSONAL_SITE_ICON,
  PROFILE_ICON,
  SCHOLAR_ICON,
  STAR_ICON,
} from '../src/render.ts';

const siteUrl = 'https://vietprofs.roars.dev';
const root = resolve(import.meta.dirname, '..');
const development = process.argv.includes('--dev');
const output = resolve(root, development ? 'public' : 'dist');
const peopleDir = resolve(output, 'people');
const fieldsDir = resolve(output, 'fields');
const regionsDir = resolve(output, 'regions');
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
  'Deceased': 7,
};

function renderMarkdownLinks(text: string): string {
  const parts: string[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    }
    const label = escapeHtml(match[1]);
    const href = escapeHtml(match[2]);
    parts.push(`<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)));
  }
  return parts.join('');
}

function profilePage(
  person: RosterEntry,
  availableCountryHubs: ReadonlySet<string>,
  relationships: RelationshipDatabase,
  rosterById: ReadonlyMap<string, RosterEntry>,
) {
  const sectionNum = TRACK_SECTION[person.track || ''] || 1;
  const sectionLabel = `VIETPROFS(${sectionNum})`;
  const name = displayName(person.name);
  const nativeName = vietnameseName(person);
  const path = personPath(person.id);
  const canonicalUrl = absoluteUrl(path);
  const title = `${name} — VietProfs`;
  const ogImage = person.portrait ? absoluteUrl(person.portrait) : absoluteUrl('vietprofs-bamboo-v-512.png');
  const ogImageAlt = person.portrait ? `Portrait of ${name}` : 'VietProfs bamboo V logo';
  const role = [canonicalRank(person), person.department, person.university].filter(Boolean).join(', ');
  const description = `${name} is listed by VietProfs as ${role}.`;
  const portrait = person.portrait
    ? `<img class="portrait" src="../${escapeHtml(person.portrait)}" alt="Portrait of ${escapeHtml(name)}" width="240" height="240">`
    : `<img class="portrait portrait-placeholder" src="../default-portrait.svg" alt="No portrait on file yet for ${escapeHtml(name)}" width="240" height="240">`;
  const personField = fieldOf(person.department, person.university);
  const research = person.researchAreas?.length
    ? `<section class="man-section"><h2>RESEARCH</h2><ul>${person.researchAreas.map((area) => `<li><a href="../index.html?q=${encodeURIComponent(area)}" class="research-area-link">${escapeHtml(area)}</a></li>`).join('')}</ul></section>`
    : '';
  const researchOverview = person.researchOverview
    ? `<section class="man-section"><h2>ABOUT</h2><p>${renderMarkdownLinks(person.researchOverview.text)}</p><p class="section-note research-overview-note">Automatically summarized; checked ${escapeHtml(formatRosterDate(person.researchOverview.verifiedAt))} (${person.researchOverview.sources.map((s, i) => `<a href="${escapeHtml(s)}" target="_blank" rel="noopener noreferrer">${person.researchOverview?.sources.length === 1 ? 'source' : `source ${i + 1}`}</a>`).join(', ')}).</p></section>`
    : '';
  const education = formatEducationDetails(person, { fullLabels: true });
  const educationSection = education.length
    ? `<section class="man-section"><h2>EDUCATION</h2><ul>${education.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`
    : '';
  const honors = person.honors?.length
    ? `<section class="man-section"><h2>HONORS</h2><ul>${person.honors.map((honor) => `<li>${honor.source ? `<a href="${escapeHtml(honor.source)}" rel="noopener noreferrer">` : ''}${escapeHtml(honor.name)}${honor.year ? ` (${honor.year})` : ''}${honor.source ? '</a>' : ''}</li>`).join('')}</ul></section>`
    : '';
  const links = [
    person.profileUrl && { label: person.confirmed === false ? 'Verification source' : person.institutionType && person.institutionType !== 'University' ? 'Official institution profile' : 'Official university profile', href: person.profileUrl, icon: PROFILE_ICON },
    person.websiteUrl && { label: 'Personal website', href: person.websiteUrl, icon: PERSONAL_SITE_ICON },
    person.labUrl && { label: 'Lab website', href: person.labUrl, icon: LAB_SITE_ICON },
    person.scholarUrl && { label: 'Google Scholar', href: person.scholarUrl, icon: SCHOLAR_ICON },
    person.linkedinUrl && { label: 'LinkedIn', href: person.linkedinUrl, icon: LINKEDIN_ICON },
  ].filter(Boolean) as { label: string; href: string; icon: string }[];
  const linkSection = links.length
    ? `<section class="man-section"><h2>SOURCES</h2><nav class="links" aria-label="External profiles">${links.map(({ label, href, icon }) => `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>${escapeHtml(label)}</a>`).join('')}</nav></section>`
    : '';
  const connections = connectionsFor(person.id, relationships)
    .map((connection) => ({ ...connection, other: rosterById.get(connection.otherId) }))
    .filter((connection): connection is typeof connection & { other: RosterEntry } => Boolean(connection.other))
    .sort((a, b) => a.label.localeCompare(b.label) || displayName(a.other.name).localeCompare(displayName(b.other.name)));
  const connectionSection = connections.length
    ? `<section class="man-section"><h2>CONNECTIONS</h2><ul class="connection-list">${connections.map(({ relationship, other, label }) => `<li class="connection-item"><div><a class="connection-person" href="../${personPath(other.id)}">${escapeHtml(displayName(other.name))}</a><span class="connection-kind">${escapeHtml(label)}</span></div><div class="connection-sources">${relationship.sources.map((source, index) => `<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">${relationship.sources.length === 1 ? 'Evidence' : `Evidence ${index + 1}`}</a>`).join(' · ')}</div>${relationship.type === 'coauthor' ? `<details class="connection-works"><summary>View shared works</summary><ul>${relationship.works.map((work) => `<li><a href="${escapeHtml(work.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(work.title)}</a> <span>(${escapeHtml(work.date.slice(0, 4))})</span></li>`).join('')}</ul></details>` : ''}</li>`).join('')}</ul><p class="section-note">Only source-verified connections between people in the VietProfs roster are shown.</p></section>`
    : '';
  const rawRecord = escapeHtml(JSON.stringify(person, null, 2));
  const editUrl = `../submit.html?edit=${encodeURIComponent(person.id)}`;
  const favoriteLabel = 'Add to favorites';
  const favoriteToggle = `<button type="button" class="favorite-toggle profile-favorite-toggle" data-id="${escapeHtml(person.id)}" data-name="${escapeHtml(name)}" aria-pressed="false" aria-label="${favoriteLabel}" title="${favoriteLabel}"><svg viewBox="0 0 24 24" aria-hidden="true">${STAR_ICON}</svg></button>`;
  const profileScript = `<script type="module">const KEY='vietprofs:favorites',RECENT_KEY='vietprofs:recent-profiles',id=${JSON.stringify(person.id)},valid=(value)=>typeof value==='string'&&/^vp-\\d{4}$/.test(value),load=(key)=>{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(valid):[]}catch{return[]}};localStorage.setItem(RECENT_KEY,JSON.stringify([id,...load(RECENT_KEY).filter((value)=>value!==id)].slice(0,8)));const button=document.querySelector('.favorite-toggle[data-id]');if(button){const save=(values)=>localStorage.setItem(KEY,JSON.stringify(values));const apply=(favorited)=>{button.classList.toggle('is-favorite',favorited);button.setAttribute('aria-pressed',favorited?'true':'false');const label=favorited?'Remove from favorites':'Add to favorites';button.setAttribute('aria-label',label);button.title=label;};apply(load(KEY).includes(id));button.addEventListener('click',()=>{const current=load(KEY);const next=current.includes(id)?current.filter((value)=>value!==id):[...current,id];save(next);apply(next.includes(id));});}</script>`;
  const sameAs = [
    person.profileUrl,
    person.websiteUrl,
    person.scholarUrl,
    person.linkedinUrl,
    person.labUrl,
  ].filter(Boolean) as string[];

  const alumniOf = [
    person.phdInstitution && { '@type': 'EducationalOrganization', name: person.phdInstitution },
    person.undergradInstitution && { '@type': 'EducationalOrganization', name: person.undergradInstitution },
    person.msInstitution && { '@type': 'EducationalOrganization', name: person.msInstitution },
  ].filter(Boolean);

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        name,
        ...(nativeName && nativeName !== name ? { alternateName: nativeName } : {}),
        description,
        ...(person.portrait ? { image: ogImage } : {}),
        jobTitle: canonicalRank(person) || undefined,
        worksFor: {
          '@type': 'EducationalOrganization',
          name: person.university,
          ...(person.department ? { department: { '@type': 'Organization', name: person.department } } : {}),
        },
        affiliation: {
          '@type': 'EducationalOrganization',
          name: person.university,
          ...(person.department ? { department: { '@type': 'Organization', name: person.department } } : {}),
        },
        ...(person.researchAreas?.length ? { knowsAbout: person.researchAreas } : {}),
        ...(person.honors?.length ? { award: person.honors.map((h) => h.name) } : {}),
        ...(alumniOf.length ? { alumniOf } : {}),
        ...(sameAs.length ? { sameAs } : {}),
        url: canonicalUrl,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'VietProfs',
            item: `${siteUrl}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: personField,
            item: `${siteUrl}/${fieldPath(personField)}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name,
            item: canonicalUrl,
          },
        ],
      },
    ],
  });

  const countryTarget = person.country && !['United States', 'US', 'USA'].includes(person.country) ? person.country : 'United States';
  const countryTargetUrl = availableCountryHubs.has(countryTarget)
    ? `../${regionPath(countryTarget)}`
    : `../index.html?loc=${encodeURIComponent(countryTarget === 'United States' ? 'US' : countryTarget)}`;

  return `<!doctype html>
<!--
          _/\\
         /  \\      VietProfs
        /_/\\_\\     ${escapeHtml(name)} (${escapeHtml(person.id)})
          ||
     view source encouraged · https://github.com/dynaroars/vietprofs
-->
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
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:image:alt" content="${escapeHtml(ogImageAlt)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">
  <meta name="twitter:image:alt" content="${escapeHtml(ogImageAlt)}">
  <link rel="icon" type="image/svg+xml" href="../vietprofs-bamboo-v.svg">
  <link rel="apple-touch-icon" href="../vietprofs-bamboo-v-512.png">
  <link rel="manifest" href="../manifest.webmanifest">
  <title>${escapeHtml(title)}</title>
  <script type="application/ld+json">${jsonLd}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../profile.css">
</head>
<body class="subpage">
  <div id="app">
    <main>
      <article class="man-page">
        <p class="man-running-head"><span>${sectionLabel}</span><span class="man-running-title"><a class="man-running-brand" href="../index.html" aria-label="VietProfs directory"><img class="brand-logo" src="../vietprofs-bamboo-v.svg" alt="" width="20" height="20"><span class="man-running-label">VietProfs Profile Manual</span></a></span><span>${sectionLabel}</span></p>
        <section class="man-section name-section"><h2>NAME</h2><div class="identity">${portrait}<div class="identity-details"><div class="name-heading"><div class="name-title"><h1>${escapeHtml(name)}</h1>${favoriteToggle}</div><div class="profile-actions" aria-label="Roster actions"><a class="submission-link" href="${escapeHtml(editUrl)}">Add or update info</a></div></div><p class="native">${escapeHtml(nativeName)} <a class="loc-badge-link" href="${countryTargetUrl}" title="Filter faculty in ${escapeHtml(person.country || 'United States')}"><span class="loc-badge" title="${escapeHtml(person.country || 'United States')}"><span class="country-flag" aria-hidden="true">${countryFlag(person.country)}</span></span></a></p><p class="record-id">${escapeHtml(person.id)}</p></div></div></section>
        <section class="man-section"><h2>SYNOPSIS</h2><p class="synopsis">${escapeHtml(role)}${locationOf(person) ? ` · ${escapeHtml(locationOf(person))}` : ''}</p><div class="tags"><a href="../${fieldPath(personField)}" class="tag" title="Explore ${escapeHtml(personField)} faculty on VietProfs">${escapeHtml(personField)}</a>${person.track ? `<a href="../index.html?track=${encodeURIComponent(person.track)}" class="tag${person.track === 'Emeritus' ? ' tag-emeritus' : person.track === 'Deceased' ? ' tag-deceased' : ''}" title="Filter by ${escapeHtml(person.track)}">${person.track === 'Emeritus' ? '🎓 Emeritus' : person.track === 'Deceased' ? '🏛️ Deceased' : escapeHtml(person.track)}</a>` : ''}${person.institutionType && person.institutionType !== 'University' ? `<a href="../index.html?institutionType=${encodeURIComponent(person.institutionType)}" class="tag" title="Filter by ${escapeHtml(person.institutionType)}">${escapeHtml(person.institutionType)}</a>` : ''}${person.confirmed === false ? '<span class="tag tag-unconfirmed">Unconfirmed</span>' : ''}</div></section>
        ${research}${researchOverview}${educationSection}${honors}${connectionSection}${linkSection}
        <section class="man-section"><h2>ROSTER METADATA</h2><dl class="roster-metadata"><div><dt>record</dt><dd>${escapeHtml(person.id)}</dd></div><div><dt>confirmation</dt><dd>${person.confirmed === false ? 'Unconfirmed — reliable non-official evidence' : 'Confirmed'}</dd></div><div><dt>last verified</dt><dd>${escapeHtml(formatRosterDate(person.lastUpdatedAt || ''))}</dd></div><div><dt>build</dt><dd><a href="https://github.com/dynaroars/vietprofs/commit/${escapeHtml(commit)}">${escapeHtml(commit)}</a></dd></div></dl><details class="raw-record"><summary>view raw record</summary><pre><code>${rawRecord}</code></pre></details></section>
        <section class="man-section">
          <h2>SEE ALSO</h2>
          <nav class="links" aria-label="Other VietProfs destinations">
            <a href="../index.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3-9 8h3v10h5v-6h2v6h5V11h3l-9-8Z"/></svg>Back to Directory</a>
            <a href="../index.html?view=health"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4l2-6 4 12 2-6h6v2h-4l-4 8-4-11-1 3H3v-2Z"/></svg>Data Health &amp; Completeness</a>
            <a href="../index.html?view=insights"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9h3v10H4Zm6 0V4h3v15h-3Zm6 0v-7h3v7h-3Z"/></svg>Diaspora Insights &amp; Pathways</a>
            <a href="../stats.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z"/></svg>Visitor Statistics</a>
            <a href="../submit.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z"/></svg>Submit / Update</a>
            <a href="https://github.com/dynaroars/vietprofs" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.39.97.1-.75.4-1.27.74-1.56-2.57-.29-5.28-1.29-5.28-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z"/></svg>GitHub</a>
          </nav>
        </section>
      </article>
    </main>
    ${profileScript}
  </div>
</body>
</html>`;
}

interface HubConfig {
  categoryType: 'Discipline' | 'Region' | 'Discipline × Region';
  categoryName: string;
  categoryTitle: string;
  categorySubtitle: string;
  description: string;
  people: RosterEntry[];
  canonicalPath: string;
  interactiveUrl: string;
  otherCategories: { label: string; path: string }[];
  field?: string;
  region?: string;
}

function categoryHubPage(config: HubConfig) {
  const canonicalUrl = absoluteUrl(config.canonicalPath);
  const title = `${config.categoryTitle} — VietProfs`;
  const ogImage = absoluteUrl('vietprofs-bamboo-v-512.png');
  const ogImageAlt = 'VietProfs bamboo V logo';
  const sectionLabel = 'VIETPROFS(HUB)';
  const rootPrefix = '../'.repeat(config.canonicalPath.split('/').length - 1);

  const sortedPeople = [...config.people].sort((a, b) => displayName(a.name).localeCompare(displayName(b.name)));
  const uniqueUniversities = new Set(config.people.map((p) => p.university).filter(Boolean));

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: title,
        description: config.description,
        url: canonicalUrl,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: sortedPeople.length,
          itemListElement: sortedPeople.slice(0, 50).map((person, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: displayName(person.name),
            url: absoluteUrl(personPath(person.id)),
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'VietProfs',
            item: `${siteUrl}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: config.categoryType === 'Discipline' ? 'Disciplines' : 'Regions',
            item: `${siteUrl}/`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: config.categoryName,
            item: canonicalUrl,
          },
        ],
      },
    ],
  });

  const rosterItems = sortedPeople.map((person) => {
    const name = displayName(person.name);
    const native = vietnameseName(person);
    const role = [canonicalRank(person), person.department, person.university].filter(Boolean).join(', ');
    const flag = person.country ? `<span class="country-flag" title="${escapeHtml(person.country)}">${countryFlag(person.country)}</span>` : '';
    return `<li class="hub-roster-item"><a class="hub-person-name" href="${rootPrefix}${personPath(person.id)}">${escapeHtml(name)}</a>${native && native !== name ? ` <span class="hub-person-native">(${escapeHtml(native)})</span>` : ''} <span class="hub-person-role">${escapeHtml(role)}</span> ${flag}</li>`;
  }).join('\n            ');

  const crossLinks = config.otherCategories.map((c) => `<a class="hub-crosslink" href="${rootPrefix}${c.path}">${escapeHtml(c.label)}</a>`).join('\n            ');

  return `<!doctype html>
<!--
          _/\\
         /  \\      VietProfs Hub
        /_/\\_\\     ${escapeHtml(config.categoryName)}
          ||
     view source encouraged · https://github.com/dynaroars/vietprofs
-->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(config.description)}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#15181c" media="(prefers-color-scheme: dark)">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="VietProfs">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(config.description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:image:alt" content="${escapeHtml(ogImageAlt)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(config.description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">
  <meta name="twitter:image:alt" content="${escapeHtml(ogImageAlt)}">
  <link rel="icon" type="image/svg+xml" href="${rootPrefix}vietprofs-bamboo-v.svg">
  <link rel="apple-touch-icon" href="${rootPrefix}vietprofs-bamboo-v-512.png">
  <link rel="manifest" href="${rootPrefix}manifest.webmanifest">
  <title>${escapeHtml(title)}</title>
  <script type="application/ld+json">${jsonLd}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${rootPrefix}profile.css">
</head>
<body class="subpage hub-page">
  <div id="app">
    <main>
      <article class="man-page">
        <p class="man-running-head"><span>${sectionLabel}</span><span class="man-running-title"><a class="man-running-brand" href="${rootPrefix}index.html" aria-label="VietProfs directory"><img class="brand-logo" src="${rootPrefix}vietprofs-bamboo-v.svg" alt="" width="20" height="20"><span class="man-running-label">VietProfs Directory Hub</span></a></span><span>${sectionLabel}</span></p>
        <section class="man-section name-section">
          <h2>CATEGORY</h2>
          <div class="name-heading">
            <div class="name-title"><h1>${escapeHtml(config.categoryTitle)}</h1></div>
            <div class="profile-actions"><a class="submission-link" href="${escapeHtml(`${rootPrefix}${config.interactiveUrl}`)}">Open in Interactive Directory</a></div>
          </div>
          <p class="native">${escapeHtml(config.categorySubtitle)}</p>
        </section>
        <section class="man-section">
          <h2>SYNOPSIS</h2>
          <p class="synopsis">${escapeHtml(config.description)}</p>
          <div class="tags">
            <span class="tag">${config.people.length} Faculty Members</span>
            <span class="tag">${uniqueUniversities.size} Institutions</span>
          </div>
        </section>
        <section class="man-section">
          <h2>ROSTER (${sortedPeople.length})</h2>
          <ul class="hub-roster-list">
            ${rosterItems}
          </ul>
        </section>
        <section class="man-section">
          <h2>SEE ALSO</h2>
          <nav class="hub-crosslinks" aria-label="Other categories">
            ${crossLinks}
          </nav>
        </section>
        <section class="man-section">
          <h2>ROSTER METADATA</h2>
          <dl class="roster-metadata">
            <div><dt>category</dt><dd>${escapeHtml(config.categoryType)} · ${escapeHtml(config.categoryName)}</dd></div>
            <div><dt>faculty count</dt><dd>${sortedPeople.length}</dd></div>
            <div><dt>build</dt><dd><a href="https://github.com/dynaroars/vietprofs/commit/${escapeHtml(commit)}">${escapeHtml(commit)}</a></dd></div>
          </dl>
        </section>
      </article>
    </main>
  </div>
</body>
</html>`;
}

async function main() {
  const [roster, relationships] = await Promise.all([
    readFile(resolve(root, 'public/data.json'), 'utf8').then((value) => JSON.parse(value) as Roster),
    readFile(resolve(root, 'public/relationships.json'), 'utf8').then((value) => JSON.parse(value) as RelationshipDatabase),
  ]);
  const ids = new Set<string>();
  for (const person of roster) {
    if (!person.id || ids.has(person.id)) throw new Error(`Profile ID is missing or duplicated: ${person.name}`);
    ids.add(person.id);
  }
  const relationshipErrors = validateRelationshipDatabase(relationships, roster);
  if (relationshipErrors.length) {
    throw new Error(`Invalid public/relationships.json: ${relationshipErrors.join('; ')}`);
  }

  const countryCounts: Record<string, number> = {};
  for (const person of roster) {
    const country = person.country || 'United States';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  }
  const availableCountryHubs = new Set(Object.entries(countryCounts)
    .filter(([, count]) => hasEnoughPeopleForRosterHub(count))
    .map(([country]) => country));
  const rosterById = new Map(roster.map((person) => [person.id, person]));

  await Promise.all([
    rm(peopleDir, { recursive: true, force: true }),
    rm(fieldsDir, { recursive: true, force: true }),
    rm(regionsDir, { recursive: true, force: true }),
  ]);

  // 1. Generate individual profile pages
  await Promise.all(roster.map(async (person) => {
    const outputFile = resolve(output, personPath(person.id));
    await mkdir(dirname(outputFile), { recursive: true });
    await writeFile(outputFile, profilePage(person, availableCountryHubs, relationships, rosterById));
  }));

  // 2. Generate Discipline Hub pages
  const fieldHubs: HubConfig[] = FIELDS.map((field) => {
    const people = roster.filter((p) => fieldOf(p.department, p.university) === field);
    return {
      categoryType: 'Discipline' as const,
      categoryName: field,
      categoryTitle: `${field} Faculty`,
      categorySubtitle: `Vietnamese Professors & Scholars in ${field}`,
      description: `Directory of ${people.length} Vietnamese and Vietnamese-diaspora professors in ${field} across universities worldwide.`,
      people,
      canonicalPath: fieldPath(field),
      interactiveUrl: `index.html?field=${encodeURIComponent(field)}`,
      otherCategories: [],
    };
  }).filter((hub) => hasEnoughPeopleForRosterHub(hub.people.length));

  for (const fieldHub of fieldHubs) {
    fieldHub.otherCategories = fieldHubs
      .filter((hub) => hub !== fieldHub)
      .map((hub) => ({ label: hub.categoryName, path: hub.canonicalPath }));
  }

  // 3. Generate Region Hub pages
  const continents = [...ROSTER_CONTINENTS];
  const continentHubs: HubConfig[] = continents.map((continent) => {
    const people = roster.filter((p) => continentOf(p.country) === continent);
    return {
      categoryType: 'Region' as const,
      categoryName: continent,
      categoryTitle: `Faculty in ${continent}`,
      categorySubtitle: `Vietnamese Academic Diaspora in ${continent}`,
      description: `Directory of ${people.length} Vietnamese and Vietnamese-diaspora professors teaching and researching across ${continent}.`,
      people,
      canonicalPath: regionPath(continent),
      interactiveUrl: `index.html?loc=${encodeURIComponent(continent)}`,
      otherCategories: [],
    };
  }).filter((hub) => hasEnoughPeopleForRosterHub(hub.people.length));

  for (const continentHub of continentHubs) {
    continentHub.otherCategories = continentHubs
      .filter((hub) => hub !== continentHub)
      .map((hub) => ({ label: hub.categoryName, path: hub.canonicalPath }));
  }

  const allCountries = Object.keys(countryCounts).sort((a, b) => countryCounts[b] - countryCounts[a] || a.localeCompare(b));
  const countryHubs: HubConfig[] = allCountries.map((country) => {
    const people = roster.filter((p) => (personCountry(p) === country));
    return {
      categoryType: 'Region' as const,
      categoryName: country,
      categoryTitle: `Faculty in ${country}`,
      categorySubtitle: `Vietnamese Academic Diaspora in ${country}`,
      description: `Directory of ${people.length} Vietnamese and Vietnamese-diaspora professors at universities in ${country}.`,
      people,
      canonicalPath: regionPath(country),
      interactiveUrl: `index.html?loc=${encodeURIComponent(country === 'United States' ? 'US' : country)}`,
      otherCategories: [],
    };
  }).filter((hub) => hasEnoughPeopleForRosterHub(hub.people.length));

  for (const countryHub of countryHubs) {
    countryHub.otherCategories = countryHubs
      .filter((hub) => hub !== countryHub)
      .slice(0, 10)
      .map((hub) => ({ label: hub.categoryName, path: hub.canonicalPath }));
  }

  function personCountry(person: RosterEntry): string {
    return person.country || 'United States';
  }

  // Generate only useful intersections. Empty and singleton combinations are omitted so the
  // site does not publish a large grid of thin pages that add little beyond a person profile.
  const intersectionHubs: HubConfig[] = [...continentHubs, ...countryHubs].flatMap((regionHub) =>
    fieldHubs.flatMap((fieldHub) => {
      const people = roster.filter((person) =>
        fieldOf(person.department, person.university) === fieldHub.categoryName
        && (regionHub.categoryName === personCountry(person) || continentOf(person.country) === regionHub.categoryName));
      if (!hasEnoughPeopleForRosterHub(people.length)) return [];
      const field = fieldHub.categoryName;
      const region = regionHub.categoryName;
      return [{
        categoryType: 'Discipline × Region' as const,
        categoryName: `${field} in ${region}`,
        categoryTitle: `${field} Faculty in ${region}`,
        categorySubtitle: `Vietnamese Professors & Scholars in ${field} in ${region}`,
        description: `Directory of ${people.length} Vietnamese and Vietnamese-diaspora professors in ${field} at universities and eligible research institutions in ${region}.`,
        people,
        canonicalPath: fieldRegionPath(field, region),
        interactiveUrl: `index.html?field=${encodeURIComponent(field)}&loc=${encodeURIComponent(region === 'United States' ? 'US' : region)}`,
        otherCategories: [
          { label: `All ${field} faculty`, path: fieldPath(field) },
          { label: `All faculty in ${region}`, path: regionPath(region) },
        ],
        field,
        region,
      }];
    }));

  // Make every intersection discoverable through both of its parent category pages.
  for (const fieldHub of fieldHubs) {
    fieldHub.otherCategories.push(...intersectionHubs
      .filter((hub) => hub.field === fieldHub.categoryName)
      .map((hub) => ({ label: `${fieldHub.categoryName} in ${hub.region}`, path: hub.canonicalPath })));
  }
  for (const regionHub of [...continentHubs, ...countryHubs]) {
    regionHub.otherCategories.push(...intersectionHubs
      .filter((hub) => hub.region === regionHub.categoryName)
      .map((hub) => ({ label: `${hub.field} in ${regionHub.categoryName}`, path: hub.canonicalPath })));
  }

  await Promise.all([...fieldHubs, ...continentHubs, ...countryHubs, ...intersectionHubs].map(async (hub) => {
    const outputFile = resolve(output, hub.canonicalPath);
    await mkdir(dirname(outputFile), { recursive: true });
    await writeFile(outputFile, categoryHubPage(hub));
  }));

  if (!development) {
    const hubUrls = [...fieldHubs, ...continentHubs, ...countryHubs, ...intersectionHubs].map((hub) => `  <url>\n    <loc>${absoluteUrl(hub.canonicalPath)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${hub.categoryType === 'Discipline × Region' ? '0.7' : '0.8'}</priority>\n  </url>`);
    const profileUrls = roster.map((person) => `  <url>\n    <loc>${absoluteUrl(personPath(person.id))}</loc>${person.lastUpdatedAt ? `\n    <lastmod>${person.lastUpdatedAt.slice(0, 10)}</lastmod>` : ''}\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>${siteUrl}/stats.html</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n  <url>\n    <loc>${siteUrl}/submit.html</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n${hubUrls.join('\n')}\n${profileUrls.join('\n')}\n</urlset>\n`;
    await writeFile(resolve(output, 'sitemap.xml'), sitemap);
  }
  console.log(`Generated ${roster.length} profile pages, ${fieldHubs.length} field hubs, ${continentHubs.length + countryHubs.length} region hubs, and ${intersectionHubs.length} field-region hubs${development ? ' for development.' : ' and sitemap entries.'}`);
}

await main();
