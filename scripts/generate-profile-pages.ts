import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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
  sectorOf,
  personPath,
  ROSTER_CONTINENTS,
  regionPath,
  type Roster,
  type RosterEntry,
  type RosterUpdates,
  universityPath,
  vietnameseName,
  withUpdates,
} from '../src/data.ts';
import { almaMaterInfo, almaMaterPath, canonicalAlmaMater } from '../src/alma-mater.ts';
import { missingFields, REQUESTABLE_FIELDS } from '../src/missing-fields.ts';
import { isVietnameseInstitution } from '../src/pathways.ts';
import { renderSeeAlso } from '../src/see-also.ts';
import { renderAddFab } from '../src/add-fab.ts';
import { renderShareMenu } from '../src/share.ts';
import { escapeHtml, formatRosterDate } from '../src/utils.ts';
import {
  connectionLabelVi,
  educationVi,
  fieldVi,
  institutionTypeVi,
  type Lang,
  placeVi,
  rankVi,
  REQUESTABLE_FIELDS_VI,
  trackVi,
} from '../src/i18n-vi.ts';
import {
  connectionsFor,
  externalConnectionsFor,
  validateRelationshipDatabase,
  type RelationshipDatabase,
} from '../src/relationships.ts';
import {
  formatEducationDetails,
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
const universitiesDir = resolve(output, 'universities');
const alumniDir = resolve(output, 'alumni');
const viDir = resolve(output, 'vi');
const commit =
  process.env.VITE_GIT_COMMIT ||
  (() => {
    try {
      return execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], {
        cwd: root,
        encoding: 'utf8',
      }).trim();
    } catch {
      return 'development';
    }
  })();

// profile.css and share.js have fixed names and the host caches them for hours, longer than the
// pages that use them. A content hash in the query makes a changed file load fresh with the page.
const assetVersion: Record<'css' | 'share', string> = { css: '', share: '' };

async function loadAssetVersions() {
  const hash = async (file: string) =>
    createHash('sha256')
      .update(await readFile(resolve(root, 'public', file)))
      .digest('hex')
      .slice(0, 10);
  assetVersion.css = await hash('profile.css');
  assetVersion.share = await hash('share.js');
}

function absoluteUrl(path: string) {
  return `${siteUrl}/${path}`;
}

// Every generated page exists in English at `path` and in Vietnamese at `vi/path`. Both carry
// the same alternates so search engines pair them; English is the default.
function langPath(path: string, lang: Lang) {
  return lang === 'vi' ? `vi/${path}` : path;
}

function alternateLinks(path: string) {
  return [
    `<link rel="alternate" hreflang="en" href="${absoluteUrl(path)}">`,
    `<link rel="alternate" hreflang="vi" href="${absoluteUrl(langPath(path, 'vi'))}">`,
    `<link rel="alternate" hreflang="x-default" href="${absoluteUrl(path)}">`,
  ].join('\n  ');
}

const rankLabel = (person: RosterEntry, lang: Lang) =>
  lang === 'vi' ? rankVi(person) : canonicalRank(person);

// A retired id's old profile page forwards to the entry that absorbed it, so shared links survive
// a duplicate merge.
function redirectPage(from: string, to: RosterEntry) {
  const target = `${personPath(to.id).split('/').pop()}`;
  const canonical = absoluteUrl(personPath(to.id));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(displayName(to.name))} | VietProfs</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${canonical}">
<meta http-equiv="refresh" content="0; url=${target}">
</head>
<body><p>This profile moved to <a href="${target}">${escapeHtml(displayName(to.name))}</a> (${escapeHtml(from)} is now ${escapeHtml(to.id)}).</p></body>
</html>`;
}

function locationOf(person: RosterEntry) {
  return [
    person.city,
    person.state,
    person.country && !['United States', 'US', 'USA'].includes(person.country)
      ? person.country
      : '',
  ]
    .filter(Boolean)
    .join(', ');
}

// Profile pages list a few people from the same university and the same field. Ties are broken by
// a hash of the id pair, not by name, so each page links a different slice of a large field.
const RELATED_LIMIT = 6;

interface RelatedContext {
  byUniversity: ReadonlyMap<string, RosterEntry[]>;
  byField: ReadonlyMap<string, RosterEntry[]>;
  universityHubs: ReadonlySet<string>;
  fieldHubs: ReadonlySet<string>;
  /** Vietnamese alma mater (canonical name) -> its alumni hub path. */
  alumniHubs: ReadonlyMap<string, string>;
}

function pairHash(a: string, b: string) {
  let hash = 2166136261;
  for (const char of `${a}|${b}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function sharedAreaCount(a: RosterEntry, b: RosterEntry) {
  const areas = new Set((a.researchAreas ?? []).map((area) => area.toLowerCase()));
  return (b.researchAreas ?? []).filter((area) => areas.has(area.toLowerCase())).length;
}

function pickRelated(
  person: RosterEntry,
  candidates: RosterEntry[],
  extraScore: (other: RosterEntry) => number,
) {
  return candidates
    .filter((other) => other.id !== person.id)
    .map((other) => ({
      other,
      score: extraScore(other) * 100 + sharedAreaCount(person, other),
      tie: pairHash(person.id, other.id),
    }))
    .sort((a, b) => b.score - a.score || a.tie - b.tie)
    .slice(0, RELATED_LIMIT)
    .map(({ other }) => other);
}

// Plain bullets, like EDUCATION and HONORS: "Name (rank, department)".
function relatedList(people: RosterEntry[], detail: (other: RosterEntry) => string) {
  return `<ul>${people
    .map((other) => {
      const text = detail(other);
      return `<li><a href="../${personPath(other.id)}">${escapeHtml(displayName(other.name))}</a>${text ? ` (${escapeHtml(text)})` : ''}</li>`;
    })
    .join('')}</ul>`;
}

function relatedSections(
  person: RosterEntry,
  field: string,
  context: RelatedContext,
  lang: Lang = 'en',
) {
  const vi = lang === 'vi';
  const universityPeople = context.byUniversity.get(person.university) ?? [];
  const sameUniversity = pickRelated(person, universityPeople, (other) =>
    Number(Boolean(person.department) && other.department === person.department),
  );
  const universityLink = context.universityHubs.has(person.university)
    ? `<p class="section-note"><a href="../${universityPath(person.university)}">${vi ? `Tất cả ${universityPeople.length} người tại` : `All ${universityPeople.length} at`} ${escapeHtml(person.university)}</a></p>`
    : '';
  const fieldPeople = (context.byField.get(field) ?? []).filter(
    (other) => other.university !== person.university,
  );
  const sameField = pickRelated(person, fieldPeople, (other) =>
    Number((other.country || 'United States') === (person.country || 'United States')),
  );
  const fieldLink = context.fieldHubs.has(field)
    ? `<p class="section-note"><a href="../${fieldPath(field)}">${vi ? `Tất cả ${(context.byField.get(field) ?? []).length} người ngành ${escapeHtml(fieldVi(field))}` : `All ${(context.byField.get(field) ?? []).length} in ${escapeHtml(field)}`}</a></p>`
    : '';
  return [
    sameUniversity.length
      ? `<section class="man-section related-section"><h2>${vi ? (sectorOf(person) === 'academia' ? 'CÙNG TRƯỜNG' : 'CÙNG TỔ CHỨC') : sectorOf(person) === 'academia' ? 'SAME UNIVERSITY' : 'SAME ORGANIZATION'}</h2>${relatedList(sameUniversity, (other) => [rankLabel(other, lang), other.department].filter(Boolean).join(', '))}${universityLink}</section>`
      : '',
    sameField.length
      ? `<section class="man-section related-section"><h2>${vi ? 'CÙNG LĨNH VỰC' : 'SAME FIELD'}</h2>${relatedList(sameField, (other) => [rankLabel(other, lang), other.university].filter(Boolean).join(', '))}${fieldLink}</section>`
      : '',
  ].join('');
}

const TRACK_SECTION: Record<string, number> = {
  'Tenure-line': 1,
  Teaching: 2,
  Research: 3,
  Clinical: 4,
  'Admin and Staff': 5,
  Emeritus: 6,
  Deceased: 7,
  'Industry Research': 8,
  'Policy & Think Tank': 9,
  'Government & Defense': 10,
};

function profilePage(
  person: RosterEntry,
  availableCountryHubs: ReadonlySet<string>,
  relationships: RelationshipDatabase,
  rosterById: ReadonlyMap<string, RosterEntry>,
  related: RelatedContext,
  lang: Lang = 'en',
) {
  // English pages sit one level below the site root (people/); Vietnamese ones two (vi/people/).
  // `site` reaches shared assets and the interactive directory; `../` stays inside the language.
  const vi = lang === 'vi';
  const site = vi ? '../../' : '../';
  // Gov & Labs and Industry entries link back to their sector on the single directory page and
  // skip country hubs, which cover Academia only.
  const sector = sectorOf(person);
  const isIndustry = sector !== 'academia';
  const directoryPage = 'index.html';
  const sectorParam = sector === 'academia' ? '' : `sector=${sector}&`;
  const sectionNum = TRACK_SECTION[person.track || ''] || 1;
  const sectionLabel = `PROFILE(${sectionNum})`;
  const name = displayName(person.name);
  const nativeName = vietnameseName(person);
  const basePath = personPath(person.id);
  const path = langPath(basePath, lang);
  const canonicalUrl = absoluteUrl(path);
  const shownName = vi && nativeName && nativeName !== name ? `${nativeName} (${name})` : name;
  const title = `${shownName} — VietProfs`;
  const ogImage = person.portrait
    ? absoluteUrl(person.portrait)
    : absoluteUrl(vi ? 'vietprofs-og-vi.png' : 'vietprofs-og.png');
  const ogImageAlt = person.portrait
    ? vi
      ? `Ảnh chân dung ${name}`
      : `Portrait of ${name}`
    : vi
      ? 'VietProfs — Danh bạ nhà nghiên cứu và nhà khoa học người Việt'
      : 'VietProfs — Global Directory of Vietnamese Researchers & Scientists';
  const ogImageDims = person.portrait
    ? ''
    : '\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">';
  const twitterCard = person.portrait ? 'summary' : 'summary_large_image';
  const role = [rankLabel(person, lang), person.department, person.university]
    .filter(Boolean)
    .join(', ');
  const place = vi
    ? [person.city, placeVi(person.country || 'United States')].filter(Boolean).join(', ')
    : '';
  const description = vi
    ? `${shownName}: ${role}${place ? `, ${place}` : ''}. Hồ sơ trên VietProfs, danh bạ giáo sư và nhà khoa học người Việt trên thế giới.`
    : `${name} is listed by VietProfs as ${role}.`;
  const portrait = person.portrait
    ? `<img class="portrait" src="${site}${escapeHtml(person.portrait)}" alt="${vi ? 'Ảnh chân dung' : 'Portrait of'} ${escapeHtml(name)}" width="240" height="300">`
    : `<img class="portrait portrait-placeholder" src="${site}default-portrait.svg" alt="${vi ? 'Chưa có ảnh của' : 'No portrait on file yet for'} ${escapeHtml(name)}" width="240" height="300">`;
  const personField = fieldOf(person.department, person.university, person.researchAreas);
  const research = person.researchAreas?.length
    ? `<section class="man-section"><h2>${vi ? 'NGHIÊN CỨU' : 'RESEARCH'}</h2><ul>${person.researchAreas.map((area) => `<li><a href="${site}${directoryPage}?${sectorParam}q=${encodeURIComponent(area)}" class="research-area-link">${escapeHtml(area)}</a></li>`).join('')}</ul></section>`
    : '';
  const education = vi ? educationVi(person) : formatEducationDetails(person, { fullLabels: true });
  const alumniLinks = [
    ...new Set(
      [
        person.undergradInstitution,
        person.msInstitution,
        person.phdInstitution,
        person.postdocInstitution,
      ].map((school) => canonicalAlmaMater(school)),
    ),
  ]
    .filter((school): school is string => Boolean(school && related.alumniHubs.has(school)))
    .map((school) => {
      const info = almaMaterInfo(school);
      const label = info?.short ?? (vi ? (info?.vi ?? school) : school);
      return `<a href="../${related.alumniHubs.get(school)}" title="${escapeHtml([school, info?.vi].filter(Boolean).join(' · '))}">${vi ? `Cựu sinh viên ${escapeHtml(label)}` : `${escapeHtml(label)} alumni`}</a>`;
    });
  const educationSection = education.length
    ? `<section class="man-section"><h2>${vi ? 'HỌC VẤN' : 'EDUCATION'}</h2><ul>${education.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>${alumniLinks.length ? `<p class="section-note">${alumniLinks.join(' · ')}</p>` : ''}</section>`
    : '';
  const honors = person.honors?.length
    ? `<section class="man-section"><h2>${vi ? 'GIẢI THƯỞNG & DANH HIỆU' : 'HONORS'}</h2><ul>${person.honors.map((honor) => `<li>${honor.source ? `<a href="${escapeHtml(honor.source)}" rel="noopener noreferrer">` : ''}${escapeHtml(honor.name)}${honor.year ? ` (${honor.year})` : ''}${honor.source ? '</a>' : ''}</li>`).join('')}</ul></section>`
    : '';
  const links = [
    person.profileUrl && {
      label:
        person.confirmed === false
          ? vi
            ? 'Nguồn xác minh'
            : 'Verification source'
          : person.institutionType && person.institutionType !== 'University'
            ? vi
              ? 'Trang chính thức của tổ chức'
              : 'Official institution profile'
            : vi
              ? 'Trang chính thức của trường'
              : 'Official university profile',
      href: person.profileUrl,
      icon: PROFILE_ICON,
    },
    person.websiteUrl && {
      label: vi ? 'Trang web' : 'Website',
      href: person.websiteUrl,
      icon: PERSONAL_SITE_ICON,
    },
    person.scholarUrl && { label: 'Google Scholar', href: person.scholarUrl, icon: SCHOLAR_ICON },
    person.linkedinUrl && { label: 'LinkedIn', href: person.linkedinUrl, icon: LINKEDIN_ICON },
  ].filter(Boolean) as { label: string; href: string; icon: string }[];
  const linkSection = links.length
    ? `<section class="man-section"><h2>${vi ? 'NGUỒN' : 'SOURCES'}</h2><nav class="links" aria-label="External profiles">${links.map(({ label, href, icon }) => `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>${escapeHtml(label)}</a>`).join('')}</nav></section>`
    : '';
  const evidenceLinks = (sources: string[]) =>
    `<span class="connection-sources">${sources.map((source, index) => `<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">${sources.length === 1 ? (vi ? 'nguồn' : 'evidence') : `${vi ? 'nguồn' : 'evidence'} ${index + 1}`}</a>`).join(', ')}</span>`;
  // Advisors first, then advisees, then collaborators; alphabetical within each group.
  // Doctoral advisors, then other advisors and mentors, advisees, and collaborators.
  const roleRank = (label: string) =>
    /^Doctoral advisor/.test(label)
      ? 0
      : /advisor|mentor\b/i.test(label)
        ? 1
        : /advisee|mentee/i.test(label)
          ? 2
          : 3;
  type ConnectionItem = {
    key: string;
    name: string;
    rank: number;
    person: string;
    relations: string[];
  };
  const items = new Map<string, ConnectionItem>();
  const addItem = (key: string, name: string, person: string, label: string, sources: string[]) => {
    const item = items.get(key) ?? { key, name, rank: 3, person, relations: [] };
    item.rank = Math.min(item.rank, roleRank(label));
    // Same bullet format as the other sections: "Name (relationship: evidence; relationship: evidence)".
    item.relations.push(
      `<span class="connection-kind">${escapeHtml(vi ? connectionLabelVi(label) : label)}</span>: ${evidenceLinks(sources)}`,
    );
    items.set(key, item);
  };
  for (const { relationship, otherId, label } of connectionsFor(person.id, relationships)) {
    const other = rosterById.get(otherId);
    if (!other) continue;
    addItem(
      otherId,
      displayName(other.name),
      `<a class="connection-person" href="../${personPath(other.id)}">${escapeHtml(displayName(other.name))}</a>`,
      label,
      relationship.sources,
    );
  }
  for (const { connection, label } of externalConnectionsFor(person.id, relationships)) {
    const name = escapeHtml(connection.name);
    const nameHtml = connection.url
      ? `<a class="connection-person connection-external" href="${escapeHtml(connection.url)}" target="_blank" rel="noopener noreferrer">${name}</a>`
      : `<span class="connection-person connection-external">${name}</span>`;
    const affiliation = connection.affiliation
      ? ` <span class="connection-affiliation">· ${escapeHtml(connection.affiliation)}</span>`
      : '';
    addItem(
      `external:${connection.name.trim().toLowerCase()}`,
      connection.name,
      nameHtml + affiliation,
      label,
      connection.sources,
    );
  }
  const connectionItems = [...items.values()].sort(
    (a, b) => a.rank - b.rank || a.name.localeCompare(b.name),
  );
  const connectionSection = connectionItems.length
    ? `<section class="man-section"><h2>${vi ? 'KẾT NỐI' : 'CONNECTIONS'}</h2><ul class="connection-list">${connectionItems
        .map(
          ({ person: who, relations }) =>
            `<li class="connection-item">${who} (${relations.join('; ')})</li>`,
        )
        .join('')}</ul></section>`
    : '';
  const rawRecord = escapeHtml(JSON.stringify(person, null, 2));
  const editUrl = `${site}submit.html?edit=${encodeURIComponent(person.id)}`;
  const selfUrl = `${editUrl}&self=1`;
  const missing = missingFields(person);
  const missingSection = missing.length
    ? vi
      ? `<section class="man-section missing-section"><h2>CÒN THIẾU</h2><p>Chưa có thông tin: ${missing.map((field) => escapeHtml(REQUESTABLE_FIELDS_VI[field] ?? REQUESTABLE_FIELDS[field])).join(', ')}. <a href="${escapeHtml(`${editUrl}&missing=${missing.join(',')}`)}">Bạn biết? Bổ sung tại đây</a></p></section>`
      : `<section class="man-section missing-section"><h2>MISSING</h2><p>Not on record yet: ${missing.map((field) => escapeHtml(REQUESTABLE_FIELDS[field])).join(', ')}. <a href="${escapeHtml(`${editUrl}&missing=${missing.join(',')}`)}">Know ${missing.length === 1 ? 'it' : 'any of them'}? Add ${missing.length === 1 ? 'it' : 'them'}</a></p></section>`
    : '';
  const favoriteLabel = vi ? 'Thêm vào mục yêu thích' : 'Add to favorites';
  const favoriteToggle = `<button type="button" class="favorite-toggle profile-favorite-toggle" data-id="${escapeHtml(person.id)}" data-name="${escapeHtml(name)}" aria-pressed="false" aria-label="${favoriteLabel}" title="${favoriteLabel}"><svg viewBox="0 0 24 24" aria-hidden="true">${STAR_ICON}</svg></button>`;
  const profileScript = `<script type="module">
const KEY = 'vietprofs:favorites', RECENT_KEY = 'vietprofs:recent-profiles', id = ${JSON.stringify(person.id)};
const valid = (value) => typeof value === 'string' && /^vp-\\d{4}$/.test(value);
const load = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter(valid) : [];
  } catch { return []; }
};
try {
  localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...load(RECENT_KEY).filter((value) => value !== id)].slice(0, 8)));
} catch { /* Recent history is optional when browser storage is unavailable. */ }
const button = document.querySelector('.favorite-toggle[data-id]');
if (button) {
  const status = document.getElementById('profile-save-status');
  const apply = (favorited) => {
    button.classList.toggle('is-favorite', favorited);
    button.setAttribute('aria-pressed', String(favorited));
    const label = favorited ? ${JSON.stringify(vi ? 'Bỏ khỏi mục yêu thích' : 'Remove from favorites')} : ${JSON.stringify(favoriteLabel)};
    button.setAttribute('aria-label', label);
    button.title = label;
  };
  apply(load(KEY).includes(id));
  button.addEventListener('click', () => {
    const current = load(KEY);
    const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      apply(next.includes(id));
      status.textContent = '';
      status.hidden = true;
    } catch {
      status.hidden = false;
      status.textContent = ${JSON.stringify(vi ? 'Không lưu được mục yêu thích. Hãy cho phép trình duyệt lưu trữ rồi thử lại.' : 'Favorites could not be saved. Allow browser storage and try again.')};
    }
  });
}
</script>`;
  const sameAs = [
    person.profileUrl,
    person.websiteUrl,
    person.scholarUrl,
    person.linkedinUrl,
  ].filter(Boolean) as string[];

  const alumniOf = [
    person.phdInstitution && { '@type': 'EducationalOrganization', name: person.phdInstitution },
    person.undergradInstitution && {
      '@type': 'EducationalOrganization',
      name: person.undergradInstitution,
    },
    person.msInstitution && { '@type': 'EducationalOrganization', name: person.msInstitution },
  ].filter(Boolean);

  // Only universities are educational organizations; companies are plain Organizations and
  // government or defense labs GovernmentOrganizations.
  const employerType =
    sector === 'academia'
      ? 'EducationalOrganization'
      : person.track === 'Government & Defense' ||
          person.institutionType === 'Government & defense' ||
          person.institutionType === 'National laboratory'
        ? 'GovernmentOrganization'
        : 'Organization';
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        name,
        ...(nativeName && nativeName !== name ? { alternateName: nativeName } : {}),
        description,
        ...(person.portrait ? { image: ogImage } : {}),
        jobTitle: rankLabel(person, lang) || undefined,
        worksFor: {
          '@type': employerType,
          name: person.university,
          ...(person.department
            ? { department: { '@type': 'Organization', name: person.department } }
            : {}),
        },
        affiliation: {
          '@type': employerType,
          name: person.university,
          ...(person.department
            ? { department: { '@type': 'Organization', name: person.department } }
            : {}),
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
            name: vi ? fieldVi(personField) : personField,
            item: absoluteUrl(langPath(fieldPath(personField), lang)),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: shownName,
            item: canonicalUrl,
          },
        ],
      },
    ],
  });

  const countryTarget =
    person.country && !['United States', 'US', 'USA'].includes(person.country)
      ? person.country
      : 'United States';
  const countryTargetUrl =
    !isIndustry && availableCountryHubs.has(countryTarget)
      ? `../${regionPath(countryTarget)}`
      : `${site}${directoryPage}?${sectorParam}loc=${encodeURIComponent(countryTarget === 'United States' ? 'US' : countryTarget)}`;

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#15181c" media="(prefers-color-scheme: dark)">
  <link rel="canonical" href="${canonicalUrl}">
  ${alternateLinks(basePath)}
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="VietProfs">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">${ogImageDims}
  <meta property="og:image:alt" content="${escapeHtml(ogImageAlt)}">
  <meta name="twitter:card" content="${twitterCard}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">
  <meta name="twitter:image:alt" content="${escapeHtml(ogImageAlt)}">
  <link rel="icon" type="image/svg+xml" href="${site}vietprofs-bamboo-v.svg">
  <link rel="apple-touch-icon" href="${site}vietprofs-bamboo-v-512.png">
  <link rel="manifest" href="${site}manifest.webmanifest">
  <title>${escapeHtml(title)}</title>
  <script type="application/ld+json">${jsonLd.replace(/</g, '\\u003c')}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${site}profile.css?v=${assetVersion.css}">
</head>
<body class="subpage">
  <div id="app">
    <main>
      <article class="man-page">
        <p class="man-running-head"><span>${sectionLabel}</span><span class="man-running-title"><a class="man-running-brand" href="${vi ? '../index.html' : `../${directoryPage}${sectorParam ? `?${sectorParam.slice(0, -1)}` : ''}`}" aria-label="${vi ? 'Trang chủ VietProfs tiếng Việt' : 'VietProfs directory'}"><img class="brand-logo" src="${site}vietprofs-bamboo-v.svg" alt="" width="20" height="20"><span class="man-running-label">${vi ? 'Hồ sơ' : 'Profile Manual'}</span></a></span><span>${sectionLabel}</span></p>
        <section class="man-section name-section"><h2>${vi ? 'TÊN' : 'NAME'}</h2><div class="identity profile-identity">${portrait}<div class="identity-details"><div class="name-heading"><div class="name-title"><h1>${escapeHtml(vi ? nativeName || name : name)}</h1>${favoriteToggle}</div><div class="profile-actions" aria-label="${vi ? 'Thao tác' : 'Roster actions'}"><a class="self-claim-link" href="${escapeHtml(selfUrl)}">${vi ? 'Đây là bạn?' : 'Is this you?'}</a><a class="self-claim-link lang-switch" href="${site}${vi ? basePath : langPath(basePath, 'vi')}" hreflang="${vi ? 'en' : 'vi'}" lang="${vi ? 'en' : 'vi'}">${vi ? 'English' : 'Tiếng Việt'}</a></div></div><p id="profile-save-status" role="status" hidden></p><p class="native">${escapeHtml(vi ? name : nativeName)} <a class="loc-badge-link" href="${countryTargetUrl}" title="${vi ? `Xem những người ở ${escapeHtml(placeVi(person.country || 'United States'))}` : `Filter people in ${escapeHtml(person.country || 'United States')}`}"><span class="loc-badge" title="${escapeHtml(vi ? placeVi(person.country || 'United States') : person.country || 'United States')}"><span class="country-flag" aria-hidden="true">${countryFlag(person.country)}</span></span></a></p><p class="record-id">${escapeHtml(person.id)}</p></div></div></section>
        <section class="man-section"><h2>${vi ? 'TÓM TẮT' : 'SYNOPSIS'}</h2><p class="synopsis">${escapeHtml(role)}${vi ? (place ? ` · ${escapeHtml(place)}` : '') : locationOf(person) ? ` · ${escapeHtml(locationOf(person))}` : ''}</p><div class="tags"><a href="../${fieldPath(personField)}" class="tag" title="${vi ? `Xem ngành ${escapeHtml(fieldVi(personField))} trên VietProfs` : `Explore ${escapeHtml(personField)} on VietProfs`}">${escapeHtml(vi ? fieldVi(personField) : personField)}</a>${person.track ? `<a href="${site}${directoryPage}?${sectorParam}track=${encodeURIComponent(person.track)}" class="tag${person.track === 'Emeritus' ? ' tag-emeritus' : person.track === 'Deceased' ? ' tag-deceased' : ''}" title="${vi ? 'Lọc theo' : 'Filter by'} ${escapeHtml(vi ? trackVi(person.track) : person.track)}">${person.track === 'Emeritus' ? `🎓 ${vi ? 'Danh dự' : 'Emeritus'}` : person.track === 'Deceased' ? `🏛️ ${vi ? 'Đã mất' : 'Deceased'}` : escapeHtml(vi ? trackVi(person.track) : person.track)}</a>` : ''}${person.institutionType && person.institutionType !== 'University' ? `<a href="${site}${directoryPage}?${sectorParam}institutionType=${encodeURIComponent(person.institutionType)}" class="tag" title="${vi ? 'Lọc theo' : 'Filter by'} ${escapeHtml(vi ? institutionTypeVi(person.institutionType) : person.institutionType)}">${escapeHtml(vi ? institutionTypeVi(person.institutionType) : person.institutionType)}</a>` : ''}${person.confirmed === false ? `<span class="tag tag-unconfirmed">${vi ? 'Chưa xác nhận' : 'Unconfirmed'}</span>` : ''}</div></section>
        ${research}${educationSection}${honors}${connectionSection}${relatedSections(person, personField, related, lang)}${linkSection}${missingSection}
        <section class="man-section"><h2>${vi ? 'THÔNG TIN HỒ SƠ' : 'ROSTER METADATA'}</h2><dl class="roster-metadata"><div><dt>${vi ? 'mã hồ sơ' : 'record'}</dt><dd>${escapeHtml(person.id)}</dd></div><div><dt>${vi ? 'xác nhận' : 'confirmation'}</dt><dd>${person.confirmed === false ? (vi ? 'Chưa xác nhận — có nguồn đáng tin cậy nhưng không chính thức' : 'Unconfirmed — reliable non-official evidence') : vi ? 'Đã xác nhận' : 'Confirmed'}</dd></div><div><dt>${vi ? 'kiểm tra lần cuối' : 'last verified'}</dt><dd>${escapeHtml(formatRosterDate(person.lastUpdatedAt || ''))}</dd></div><div><dt>build</dt><dd>${escapeHtml(commit)}</dd></div></dl><details class="raw-record"><summary>${vi ? 'xem dữ liệu gốc' : 'view raw record'}</summary><pre><code>${rawRecord}</code></pre></details></section>
        ${renderSeeAlso(site)}
      </article>
    </main>
    ${renderAddFab(editUrl)}
    ${profileScript}
  </div>
</body>
</html>`;
}

interface HubConfig {
  categoryType: 'Discipline' | 'Region' | 'Discipline × Region' | 'Institution' | 'Alma Mater';
  categoryName: string;
  categoryTitle: string;
  categorySubtitle: string;
  description: string;
  people: RosterEntry[];
  canonicalPath: string;
  interactiveUrl: string;
  otherCategories: { label: string; viLabel: string; path: string }[];
  /** Extra text after a roster row's role, e.g. the degree an alumnus earned there. */
  noteFor?: (person: RosterEntry, lang: Lang) => string;
  field?: string;
  region?: string;
  lang?: Lang;
}

const CATEGORY_TYPE_VI: Record<HubConfig['categoryType'], string> = {
  Discipline: 'Lĩnh vực',
  Region: 'Khu vực',
  'Discipline × Region': 'Lĩnh vực × Khu vực',
  Institution: 'Tổ chức',
  'Alma Mater': 'Trường đã học',
};

// The Vietnamese twin of an English hub: same people, Vietnamese wording, paths under vi/.
function vietnameseHub(hub: HubConfig): HubConfig {
  const n = hub.people.length;
  const people = `${n} giáo sư, nhà nghiên cứu và nhà khoa học người Việt và gốc Việt`;
  const text = (() => {
    switch (hub.categoryType) {
      case 'Discipline': {
        const field = fieldVi(hub.categoryName);
        return {
          name: field,
          title: `Giáo sư & nhà khoa học người Việt ngành ${field}`,
          subtitle: `Nhà nghiên cứu và học giả gốc Việt trong lĩnh vực ${field}`,
          description: `Danh sách ${people} ngành ${field} tại các trường đại học, viện nghiên cứu và doanh nghiệp trên thế giới.`,
        };
      }
      case 'Region': {
        const place = placeVi(hub.categoryName);
        return {
          name: place,
          title: `Giáo sư & nhà khoa học người Việt tại ${place}`,
          subtitle: `Cộng đồng học thuật người Việt tại ${place}`,
          description: `Danh sách ${people} tại ${place}.`,
        };
      }
      case 'Discipline × Region': {
        const field = fieldVi(hub.field ?? '');
        const place = placeVi(hub.region ?? '');
        return {
          name: `${field} tại ${place}`,
          title: `Giáo sư & nhà khoa học người Việt ngành ${field} tại ${place}`,
          subtitle: `Nhà nghiên cứu gốc Việt ngành ${field} tại ${place}`,
          description: `Danh sách ${people} ngành ${field} tại các trường đại học, viện nghiên cứu và doanh nghiệp ở ${place}.`,
        };
      }
      case 'Alma Mater': {
        const school = almaMaterInfo(hub.categoryName)?.vi ?? hub.categoryName;
        return {
          name: school,
          title: `Cựu sinh viên ${school} trên VietProfs`,
          subtitle: hub.categoryName,
          description: `Danh sách ${n} giảng viên, nhà nghiên cứu và nhà khoa học người Việt ở nước ngoài từng học tại ${school}, cùng con đường học tập và nơi làm việc hiện nay.`,
        };
      }
      case 'Institution':
        return {
          name: hub.categoryName,
          title: `Giáo sư & nhà nghiên cứu người Việt tại ${hub.categoryName}`,
          subtitle: `Người gốc Việt tại ${hub.categoryName}`,
          description: `Danh sách ${n} người gốc Việt tại ${hub.categoryName}.`,
        };
    }
  })();
  return {
    ...hub,
    categoryName: text.name,
    categoryTitle: text.title,
    categorySubtitle: text.subtitle,
    description: text.description,
    canonicalPath: langPath(hub.canonicalPath, 'vi'),
    otherCategories: hub.otherCategories.map((c) => ({ ...c, path: langPath(c.path, 'vi') })),
    lang: 'vi',
  };
}

const COUNTRIES_WITH_ARTICLE = new Set([
  'United States',
  'United Kingdom',
  'Netherlands',
  'Philippines',
  'Czech Republic',
  'United Arab Emirates',
]);

function withArticle(region: string) {
  return COUNTRIES_WITH_ARTICLE.has(region) ? `the ${region}` : region;
}

function categoryHubPage(config: HubConfig) {
  const lang = config.lang ?? 'en';
  const vi = lang === 'vi';
  const basePath = vi ? config.canonicalPath.replace(/^vi\//, '') : config.canonicalPath;
  const canonicalUrl = absoluteUrl(config.canonicalPath);
  const title = `${config.categoryTitle} (${config.people.length}) — VietProfs`;
  const ogImage = absoluteUrl(vi ? 'vietprofs-og-vi.png' : 'vietprofs-og.png');
  const ogImageAlt = vi
    ? 'VietProfs — Danh bạ giáo sư và nhà khoa học người Việt trên thế giới'
    : 'VietProfs — Global Directory of Vietnamese Professors, Researchers & Scientists';
  const sectionLabel = 'HUB(7)';
  const rootPrefix = '../'.repeat(config.canonicalPath.split('/').length - 1);

  const sortedPeople = [...config.people].sort((a, b) =>
    displayName(a.name).localeCompare(displayName(b.name)),
  );
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
            item: vi ? absoluteUrl('vi/') : `${siteUrl}/`,
          },
          // Intersection hubs sit under their discipline hub; other hubs have no intermediate
          // page, so they hang directly off the home page.
          ...(config.field
            ? [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: vi ? fieldVi(config.field) : config.field,
                  item: absoluteUrl(langPath(fieldPath(config.field), lang)),
                },
              ]
            : []),
          {
            '@type': 'ListItem',
            position: config.field ? 3 : 2,
            name: config.categoryName,
            item: canonicalUrl,
          },
        ],
      },
    ],
  });

  // When everyone on the roster shares one country, show its flag once in the
  // heading instead of repeating it on every roster row.
  const rosterCountries = new Set(sortedPeople.map((person) => person.country || ''));
  const sharedCountry =
    rosterCountries.size === 1 ? [...rosterCountries][0] || undefined : undefined;
  const headingFlag = sharedCountry
    ? ` <span class="country-flag" title="${escapeHtml(vi ? placeVi(sharedCountry) : sharedCountry)}">${countryFlag(sharedCountry)}</span>`
    : '';
  const rosterItems = sortedPeople
    .map((person) => {
      const name = displayName(person.name);
      const native = vietnameseName(person);
      const role = [
        rankLabel(person, lang),
        person.department,
        config.categoryType === 'Institution' ? '' : person.university,
      ]
        .filter(Boolean)
        .join(', ');
      const note = config.noteFor?.(person, lang);
      const flag =
        person.country && !sharedCountry
          ? `<span class="country-flag" title="${escapeHtml(vi ? placeVi(person.country) : person.country)}">${countryFlag(person.country)}</span>`
          : '';
      const [shown, other] = vi && native ? [native, name] : [name, native];
      return `<li class="hub-roster-item"><a class="hub-person-name" href="${rootPrefix}${langPath(personPath(person.id), lang)}">${escapeHtml(shown)}</a>${other && other !== shown ? ` <span class="hub-person-native">(${escapeHtml(other)})</span>` : ''} <span class="hub-person-role">${escapeHtml(role)}</span>${note ? ` <span class="hub-person-note">${escapeHtml(note)}</span>` : ''}${flag ? ` ${flag}` : ''}</li>`;
    })
    .join('\n            ');

  const crossLinks = config.otherCategories
    .map(
      (c) =>
        `<a class="hub-crosslink" href="${rootPrefix}${c.path}">${escapeHtml(vi ? c.viLabel : c.label)}</a>`,
    )
    .join('\n            ');

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(config.description)}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#15181c" media="(prefers-color-scheme: dark)">
  <link rel="canonical" href="${canonicalUrl}">
  ${alternateLinks(basePath)}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="VietProfs">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(config.description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(ogImageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(config.description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">
  <meta name="twitter:image:alt" content="${escapeHtml(ogImageAlt)}">
  <link rel="icon" type="image/svg+xml" href="${rootPrefix}vietprofs-bamboo-v.svg">
  <link rel="apple-touch-icon" href="${rootPrefix}vietprofs-bamboo-v-512.png">
  <link rel="manifest" href="${rootPrefix}manifest.webmanifest">
  <title>${escapeHtml(title)}</title>
  <script type="application/ld+json">${jsonLd.replace(/</g, '\\u003c')}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${rootPrefix}profile.css?v=${assetVersion.css}">
</head>
<body class="subpage hub-page">
  <div id="app">
    <main>
      <article class="man-page">
        <p class="man-running-head"><span>${sectionLabel}</span><span class="man-running-title"><a class="man-running-brand" href="${rootPrefix}${vi ? 'vi/' : 'index.html'}" aria-label="${vi ? 'Trang chủ VietProfs tiếng Việt' : 'VietProfs directory'}"><img class="brand-logo" src="${rootPrefix}vietprofs-bamboo-v.svg" alt="" width="20" height="20"><span class="man-running-label">${vi ? 'Danh mục' : 'Directory Hub'}</span></a></span><span>${sectionLabel}</span></p>
        <section class="man-section name-section">
          <h2>${vi ? 'DANH MỤC' : 'CATEGORY'}</h2>
          <div class="name-heading">
            <div class="name-title"><h1>${escapeHtml(config.categoryTitle)}${headingFlag}</h1></div>
            <div class="profile-actions">${renderShareMenu({ title: `${config.categoryTitle} — VietProfs`, url: canonicalUrl })}<a class="submission-link" href="${escapeHtml(`${rootPrefix}${config.interactiveUrl}`)}">${vi ? 'Mở trong danh bạ tương tác (tiếng Anh)' : 'Open in Interactive Directory'}</a><a class="submission-link lang-switch" href="${rootPrefix}${vi ? basePath : langPath(basePath, 'vi')}" hreflang="${vi ? 'en' : 'vi'}" lang="${vi ? 'en' : 'vi'}">${vi ? 'English' : 'Tiếng Việt'}</a></div>
          </div>
          <p class="native">${escapeHtml(config.categorySubtitle)}</p>
        </section>
        <section class="man-section">
          <h2>${vi ? 'TÓM TẮT' : 'SYNOPSIS'}</h2>
          <p class="synopsis">${escapeHtml(config.description)}</p>
          <div class="tags">
            <span class="tag">${config.people.length} ${vi ? 'người' : config.people.length === 1 ? 'Person' : 'People'}</span>
            ${config.categoryType === 'Institution' ? '' : `<span class="tag">${uniqueUniversities.size} ${vi ? 'tổ chức' : uniqueUniversities.size === 1 ? 'Organization' : 'Organizations'}</span>`}
          </div>
        </section>
        <section class="man-section">
          <h2>${vi ? 'DANH SÁCH' : 'ROSTER'} (${sortedPeople.length})</h2>
          <ul class="hub-roster-list">
            ${rosterItems}
          </ul>
        </section>
        <section class="man-section">
          <h2>${vi ? 'XEM THÊM' : 'SEE ALSO'}</h2>
          <nav class="hub-crosslinks" aria-label="${vi ? 'Danh mục khác' : 'Other categories'}">
            ${crossLinks}
          </nav>
        </section>
        <section class="man-section">
          <h2>${vi ? 'THÔNG TIN DANH MỤC' : 'ROSTER METADATA'}</h2>
          <dl class="roster-metadata">
            <div><dt>${vi ? 'danh mục' : 'category'}</dt><dd>${escapeHtml(vi ? CATEGORY_TYPE_VI[config.categoryType] : config.categoryType)} · ${escapeHtml(config.categoryName)}</dd></div>
            <div><dt>${vi ? 'số người' : 'people count'}</dt><dd>${sortedPeople.length}</dd></div>
            <div><dt>build</dt><dd>${escapeHtml(commit)}</dd></div>
          </dl>
        </section>
      </article>
    </main>
    ${renderAddFab(`${rootPrefix}submit.html`)}
    <script src="${rootPrefix}share.js?v=${assetVersion.share}" defer></script>
  </div>
</body>
</html>`;
}

// The Vietnamese home page at /vi/: what VietProfs is, plus links into every Vietnamese hub.
// The interactive directory itself stays English, so this page is the Vietnamese entry point.
function vietnameseHomePage(
  roster: RosterEntry[],
  fieldHubs: HubConfig[],
  regionHubs: HubConfig[],
  alumniHubs: HubConfig[],
  universityHubs: HubConfig[],
  countryCount: number,
) {
  const canonicalUrl = absoluteUrl('vi/');
  const title = 'VietProfs — Danh bạ giáo sư & nhà khoa học người Việt trên thế giới';
  const description = `Danh bạ ${roster.length} giáo sư, nhà nghiên cứu và nhà khoa học người Việt và gốc Việt tại ${countryCount} quốc gia, trong các trường đại học, viện nghiên cứu, cơ quan chính phủ và doanh nghiệp.`;
  const ogImage = absoluteUrl('vietprofs-og-vi.png');
  const ogImageAlt = 'VietProfs — Danh bạ giáo sư và nhà khoa học người Việt trên thế giới';
  const hubLinks = (hubs: HubConfig[], limit?: number) =>
    [...hubs]
      .sort((a, b) => b.people.length - a.people.length)
      .slice(0, limit ?? hubs.length)
      .map(
        (hub) =>
          `<a class="hub-crosslink" href="../${hub.canonicalPath}">${escapeHtml(hub.categoryName)} (${hub.people.length})</a>`,
      )
      .join('\n            ');
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VietProfs',
    inLanguage: 'vi',
    url: canonicalUrl,
    description,
  });
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#15181c" media="(prefers-color-scheme: dark)">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" hreflang="en" href="${siteUrl}/">
  <link rel="alternate" hreflang="vi" href="${canonicalUrl}">
  <link rel="alternate" hreflang="x-default" href="${siteUrl}/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="VietProfs">
  <meta property="og:locale" content="vi_VN">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(ogImageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="twitter:image:alt" content="${escapeHtml(ogImageAlt)}">
  <link rel="icon" type="image/svg+xml" href="../vietprofs-bamboo-v.svg">
  <link rel="apple-touch-icon" href="../vietprofs-bamboo-v-512.png">
  <link rel="manifest" href="../manifest.webmanifest">
  <title>${escapeHtml(title)}</title>
  <script type="application/ld+json">${jsonLd.replace(/</g, '\\u003c')}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../profile.css?v=${assetVersion.css}">
</head>
<body class="subpage hub-page">
  <div id="app">
    <main>
      <article class="man-page">
        <p class="man-running-head"><span>VIETPROFS</span><span class="man-running-title"><a class="man-running-brand" href="../index.html" aria-label="Danh bạ VietProfs"><img class="brand-logo" src="../vietprofs-bamboo-v.svg" alt="" width="20" height="20"><span class="man-running-label">Tiếng Việt</span></a></span><span>VIETPROFS</span></p>
        <section class="man-section name-section">
          <h2>VIETPROFS</h2>
          <div class="name-heading">
            <div class="name-title"><h1>Giáo sư & nhà khoa học người Việt trên thế giới</h1></div>
            <div class="profile-actions">${renderShareMenu({ title, url: canonicalUrl })}<a class="submission-link" href="../index.html">Mở danh bạ tương tác (tiếng Anh)</a><a class="submission-link lang-switch" href="../index.html" hreflang="en" lang="en">English</a></div>
          </div>
          <p class="native">Danh bạ cộng đồng học thuật và khoa học người Việt ở nước ngoài</p>
        </section>
        <section class="man-section">
          <h2>GIỚI THIỆU</h2>
          <p class="synopsis">${escapeHtml(description)}</p>
          <p>VietProfs ghi nhận những người đang giữ vị trí chính thức (giảng viên, giáo sư, nhà nghiên cứu, nhà khoa học) bên ngoài Việt Nam. Mỗi hồ sơ dẫn về trang chính thức của trường hoặc tổ chức, và được kiểm tra lại định kỳ.</p>
          <p>Bạn có thể tìm người hướng dẫn nghiên cứu, đồng nghiệp hoặc chuyên gia theo lĩnh vực, quốc gia hay trường đại học bên dưới. Nếu thấy thiếu ai đó hoặc thông tin chưa đúng, hãy <a href="../submit.html">đề xuất hoặc cập nhật</a>.</p>
          <div class="tags">
            <span class="tag">${roster.length} người</span>
            <span class="tag">${countryCount} quốc gia</span>
          </div>
        </section>
        <section class="man-section">
          <h2>THEO LĨNH VỰC</h2>
          <nav class="hub-crosslinks" aria-label="Lĩnh vực">
            ${hubLinks(fieldHubs)}
          </nav>
        </section>
        <section class="man-section">
          <h2>THEO KHU VỰC</h2>
          <nav class="hub-crosslinks" aria-label="Khu vực">
            ${hubLinks(regionHubs)}
          </nav>
        </section>
        <section class="man-section">
          <h2>CỰU SINH VIÊN TIÊU BIỂU</h2>
          <nav class="hub-crosslinks" aria-label="Cựu sinh viên">
            ${hubLinks(alumniHubs, 24)}
          </nav>
        </section>
        <section class="man-section">
          <h2>TRƯỜNG &amp; VIỆN TIÊU BIỂU</h2>
          <nav class="hub-crosslinks" aria-label="Trường và viện nghiên cứu">
            ${hubLinks(universityHubs, 24)}
          </nav>
        </section>
        ${renderSeeAlso('../')}
      </article>
    </main>
    ${renderAddFab('../submit.html', 'Đề xuất hoặc cập nhật thông tin')}
    <script src="../share.js?v=${assetVersion.share}" defer></script>
  </div>
</body>
</html>`;
}

// Static crawlable fallback injected into dist/index.html inside <div id="app"> so search
// engines and non-JS clients see live counts and links to every top hub right at "/".
// Browsers replace #app immediately on startup via renderShell() in src/main.ts.
function renderIndexFallback(
  roster: RosterEntry[],
  fieldHubs: HubConfig[],
  regionHubs: HubConfig[],
  alumniHubs: HubConfig[],
  universityHubs: HubConfig[],
  countryCount: number,
  organizationCount: number,
): string {
  const hubItems = (hubs: HubConfig[], limit?: number) =>
    [...hubs]
      .sort((a, b) => b.people.length - a.people.length)
      .slice(0, limit ?? hubs.length)
      .map(
        (hub) =>
          `<li><a href="./${hub.canonicalPath}">${escapeHtml(hub.categoryName)} (${hub.people.length})</a></li>`,
      )
      .join('');
  return `<main class="prerendered-directory">
      <h1>VietProfs — Directory of Vietnamese Professors, Researchers, and Scientists</h1>
      <p>Searchable directory of ${roster.length.toLocaleString('en-US')} Vietnamese and Vietnamese-diaspora professors, researchers, and scientists across ${countryCount} countries and ${organizationCount.toLocaleString('en-US')} universities, government and nonprofit laboratories, and corporate research labs worldwide.</p>
      <nav aria-label="Primary sections">
        <ul>
          <li><a href="./?sector=academia">Academia</a></li>
          <li><a href="./?sector=labs">Government, Defense &amp; Nonprofit Labs</a></li>
          <li><a href="./?sector=industry">Industry Research</a></li>
          <li><a href="./vi/" hreflang="vi" lang="vi">Tiếng Việt (Vietnamese Directory)</a></li>
          <li><a href="./connections.html">Research Connections</a></li>
          <li><a href="./submit.html">Submit or Update an Entry</a></li>
          <li><a href="./vietprofs.pdf">Read the Paper (PDF)</a></li>
        </ul>
      </nav>
      <section>
        <h2>Browse by Discipline</h2>
        <nav aria-label="Browse by discipline"><ul>${hubItems(fieldHubs)}</ul></nav>
      </section>
      <section>
        <h2>Browse by Region</h2>
        <nav aria-label="Browse by region"><ul>${hubItems(regionHubs)}</ul></nav>
      </section>
      <section>
        <h2>Browse by Alma Mater</h2>
        <nav aria-label="Browse by alma mater"><ul>${hubItems(alumniHubs, 24)}</ul></nav>
      </section>
      <section>
        <h2>Top Universities &amp; Institutions</h2>
        <nav aria-label="Top universities and institutions"><ul>${hubItems(universityHubs, 24)}</ul></nav>
      </section>
    </main>`;
}

async function main() {
  await loadAssetVersions();
  const [roster, relationships, retiredIds] = await Promise.all([
    Promise.all([
      readFile(resolve(root, 'public/data.json'), 'utf8'),
      readFile(resolve(root, 'public/updates.json'), 'utf8'),
    ]).then(([data, updates]) =>
      withUpdates(JSON.parse(data) as Roster, JSON.parse(updates) as RosterUpdates),
    ),
    readFile(resolve(root, 'public/relationships.json'), 'utf8').then(
      (value) => JSON.parse(value) as RelationshipDatabase,
    ),
    readFile(resolve(root, 'maintenance/retired-ids.json'), 'utf8').then(
      (value) => JSON.parse(value) as Record<string, { replacedBy: string | null }>,
    ),
  ]);
  const ids = new Set<string>();
  const allEntries = roster;
  for (const person of allEntries) {
    if (!person.id || ids.has(person.id))
      throw new Error(`Profile ID is missing or duplicated: ${person.name}`);
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
  const availableCountryHubs = new Set(
    Object.entries(countryCounts)
      .filter(([, count]) => hasEnoughPeopleForRosterHub(count))
      .map(([country]) => country),
  );
  const rosterById = new Map(allEntries.map((person) => [person.id, person]));

  await Promise.all([
    rm(peopleDir, { recursive: true, force: true }),
    rm(fieldsDir, { recursive: true, force: true }),
    rm(regionsDir, { recursive: true, force: true }),
    rm(universitiesDir, { recursive: true, force: true }),
    rm(alumniDir, { recursive: true, force: true }),
    rm(viDir, { recursive: true, force: true }),
  ]);

  const byUniversity = new Map<string, RosterEntry[]>();
  const byField = new Map<string, RosterEntry[]>();
  for (const person of roster) {
    if (person.university)
      byUniversity.set(person.university, [...(byUniversity.get(person.university) ?? []), person]);
    const field = fieldOf(person.department, person.university, person.researchAreas);
    byField.set(field, [...(byField.get(field) ?? []), person]);
  }
  const universityHubNames = [...byUniversity.keys()]
    .filter((university) => hasEnoughPeopleForRosterHub(byUniversity.get(university)!.length))
    .sort((a, b) => a.localeCompare(b));
  const universitySlugs = new Map<string, string>();
  for (const university of universityHubNames) {
    const path = universityPath(university);
    const clash = universitySlugs.get(path);
    if (clash)
      throw new Error(
        `University hub path collision: "${university}" and "${clash}" both map to ${path}`,
      );
    universitySlugs.set(path, university);
  }
  // Alumni hubs: everyone who studied at a Vietnamese school, at any degree stage.
  const DEGREE_STAGES = [
    ['undergradInstitution', 'undergradYear', 'Undergrad', 'Đại học'],
    ['msInstitution', undefined, 'MS', 'Thạc sĩ'],
    ['phdInstitution', 'phdYear', 'PhD', 'Tiến sĩ'],
    ['postdocInstitution', undefined, 'Postdoc', 'Sau tiến sĩ'],
  ] as const;
  const byAlmaMater = new Map<string, RosterEntry[]>();
  for (const person of roster) {
    const schools = new Set(
      DEGREE_STAGES.map(([field]) => canonicalAlmaMater(person[field])).filter(
        (school): school is string => Boolean(school) && isVietnameseInstitution(school),
      ),
    );
    for (const school of schools)
      byAlmaMater.set(school, [...(byAlmaMater.get(school) ?? []), person]);
  }
  const alumniHubPaths = new Map(
    [...byAlmaMater]
      .filter(([, people]) => hasEnoughPeopleForRosterHub(people.length))
      .map(([school]) => [school, almaMaterPath(school)] as const),
  );
  const related: RelatedContext = {
    alumniHubs: alumniHubPaths,
    byUniversity,
    byField,
    universityHubs: new Set(universityHubNames),
    fieldHubs: new Set(
      FIELDS.filter((field) => hasEnoughPeopleForRosterHub(byField.get(field)?.length ?? 0)),
    ),
  };

  // 1. Generate individual profile pages, in English and Vietnamese
  await Promise.all(
    allEntries.flatMap((person) =>
      (['en', 'vi'] as const).map(async (lang) => {
        const outputFile = resolve(output, langPath(personPath(person.id), lang));
        await mkdir(dirname(outputFile), { recursive: true });
        await writeFile(
          outputFile,
          profilePage(person, availableCountryHubs, relationships, rosterById, related, lang),
        );
      }),
    ),
  );
  await Promise.all(
    Object.entries(retiredIds).map(async ([id, { replacedBy }]) => {
      const target = replacedBy && rosterById.get(replacedBy);
      if (target) await writeFile(resolve(output, personPath(id)), redirectPage(id, target));
    }),
  );

  // 2. Generate Discipline Hub pages
  const fieldHubs: HubConfig[] = FIELDS.map((field) => {
    const people = roster.filter(
      (p) => fieldOf(p.department, p.university, p.researchAreas) === field,
    );
    return {
      categoryType: 'Discipline' as const,
      categoryName: field,
      categoryTitle: `Vietnamese ${field} Researchers & Scholars`,
      categorySubtitle: `Vietnamese Researchers & Scholars in ${field}`,
      description: `Directory of ${people.length} Vietnamese and Vietnamese-diaspora professors, researchers, and scientists in ${field} across universities, labs, and industry worldwide.`,
      people,
      canonicalPath: fieldPath(field),
      interactiveUrl: `index.html?field=${encodeURIComponent(field)}`,
      otherCategories: [],
    };
  }).filter((hub) => hasEnoughPeopleForRosterHub(hub.people.length));

  for (const fieldHub of fieldHubs) {
    fieldHub.otherCategories = fieldHubs
      .filter((hub) => hub !== fieldHub)
      .map((hub) => ({
        label: hub.categoryName,
        viLabel: fieldVi(hub.categoryName),
        path: hub.canonicalPath,
      }));
  }

  // 3. Generate Region Hub pages
  const continents = [...ROSTER_CONTINENTS];
  const continentHubs: HubConfig[] = continents
    .map((continent) => {
      const people = roster.filter((p) => continentOf(p.country) === continent);
      return {
        categoryType: 'Region' as const,
        categoryName: continent,
        categoryTitle: `Vietnamese Researchers & Scholars in ${continent}`,
        categorySubtitle: `Vietnamese Diaspora in ${continent}`,
        description: `Directory of ${people.length} Vietnamese and Vietnamese-diaspora professors, researchers, and scientists across ${continent}.`,
        people,
        canonicalPath: regionPath(continent),
        interactiveUrl: `index.html?loc=${encodeURIComponent(continent)}`,
        otherCategories: [],
      };
    })
    .filter((hub) => hasEnoughPeopleForRosterHub(hub.people.length));

  for (const continentHub of continentHubs) {
    continentHub.otherCategories = continentHubs
      .filter((hub) => hub !== continentHub)
      .map((hub) => ({
        label: hub.categoryName,
        viLabel: placeVi(hub.categoryName),
        path: hub.canonicalPath,
      }));
  }

  const allCountries = Object.keys(countryCounts).sort(
    (a, b) => countryCounts[b] - countryCounts[a] || a.localeCompare(b),
  );
  const countryHubs: HubConfig[] = allCountries
    .map((country) => {
      const people = roster.filter((p) => personCountry(p) === country);
      return {
        categoryType: 'Region' as const,
        categoryName: country,
        categoryTitle: `Vietnamese Researchers & Scholars in ${withArticle(country)}`,
        categorySubtitle: `Vietnamese Diaspora in ${withArticle(country)}`,
        description: `Directory of ${people.length} Vietnamese and Vietnamese-diaspora professors, researchers, and scientists in ${withArticle(country)}.`,
        people,
        canonicalPath: regionPath(country),
        interactiveUrl: `index.html?loc=${encodeURIComponent(country === 'United States' ? 'US' : country)}`,
        otherCategories: [],
      };
    })
    .filter((hub) => hasEnoughPeopleForRosterHub(hub.people.length));

  for (const countryHub of countryHubs) {
    countryHub.otherCategories = countryHubs
      .filter((hub) => hub !== countryHub)
      .slice(0, 10)
      .map((hub) => ({
        label: hub.categoryName,
        viLabel: placeVi(hub.categoryName),
        path: hub.canonicalPath,
      }));
  }

  function personCountry(person: RosterEntry): string {
    return person.country || 'United States';
  }

  // Generate only useful intersections. Empty and singleton combinations are omitted so the
  // site does not publish a large grid of thin pages that add little beyond a person profile.
  const intersectionHubs: HubConfig[] = [...continentHubs, ...countryHubs].flatMap((regionHub) =>
    fieldHubs.flatMap((fieldHub) => {
      const people = roster.filter(
        (person) =>
          fieldOf(person.department, person.university, person.researchAreas) ===
            fieldHub.categoryName &&
          (regionHub.categoryName === personCountry(person) ||
            continentOf(person.country) === regionHub.categoryName),
      );
      if (!hasEnoughPeopleForRosterHub(people.length)) return [];
      const field = fieldHub.categoryName;
      const region = regionHub.categoryName;
      return [
        {
          categoryType: 'Discipline × Region' as const,
          categoryName: `${field} in ${region}`,
          categoryTitle: `Vietnamese ${field} Researchers & Scholars in ${withArticle(region)}`,
          categorySubtitle: `Vietnamese Researchers & Scholars in ${field} in ${withArticle(region)}`,
          description: `Directory of ${people.length} Vietnamese and Vietnamese-diaspora professors, researchers, and scientists in ${field} at universities, labs, and companies in ${withArticle(region)}.`,
          people,
          canonicalPath: fieldRegionPath(field, region),
          interactiveUrl: `index.html?field=${encodeURIComponent(field)}&loc=${encodeURIComponent(region === 'United States' ? 'US' : region)}`,
          otherCategories: [
            {
              label: `Everyone in ${field}`,
              viLabel: `Tất cả ngành ${fieldVi(field)}`,
              path: fieldPath(field),
            },
            {
              label: `Everyone in ${region}`,
              viLabel: `Tất cả tại ${placeVi(region)}`,
              path: regionPath(region),
            },
          ],
          field,
          region,
        },
      ];
    }),
  );

  // Make every intersection discoverable through both of its parent category pages.
  for (const fieldHub of fieldHubs) {
    fieldHub.otherCategories.push(
      ...intersectionHubs
        .filter((hub) => hub.field === fieldHub.categoryName)
        .map((hub) => ({
          label: `${fieldHub.categoryName} in ${hub.region}`,
          viLabel: `${fieldVi(fieldHub.categoryName)} tại ${placeVi(hub.region ?? '')}`,
          path: hub.canonicalPath,
        })),
    );
  }
  for (const regionHub of [...continentHubs, ...countryHubs]) {
    regionHub.otherCategories.push(
      ...intersectionHubs
        .filter((hub) => hub.region === regionHub.categoryName)
        .map((hub) => ({
          label: `${hub.field} in ${regionHub.categoryName}`,
          viLabel: `${fieldVi(hub.field ?? '')} tại ${placeVi(regionHub.categoryName)}`,
          path: hub.canonicalPath,
        })),
    );
  }

  // University hubs link to the field and country hubs their people belong to.
  const universityHubs: HubConfig[] = universityHubNames.map((university) => {
    const people = byUniversity.get(university)!;
    const fieldLinks = [
      ...new Set(
        people.map((person) => fieldOf(person.department, person.university, person.researchAreas)),
      ),
    ]
      .filter((field) => related.fieldHubs.has(field))
      .sort((a, b) => a.localeCompare(b))
      .map((field) => ({ label: field, viLabel: fieldVi(field), path: fieldPath(field) }));
    const countryLinks = [...new Set(people.map(personCountry))]
      .filter((country) => availableCountryHubs.has(country))
      .map((country) => ({
        label: `Everyone in ${country}`,
        viLabel: `Tất cả tại ${placeVi(country)}`,
        path: regionPath(country),
      }));
    return {
      categoryType: 'Institution' as const,
      categoryName: university,
      categoryTitle: `Vietnamese Researchers & Scholars at ${university}`,
      categorySubtitle: `Vietnamese-Diaspora People at ${university}`,
      description: `Directory of ${people.length} Vietnamese-diaspora people at ${university}.`,
      people,
      canonicalPath: universityPath(university),
      interactiveUrl: `index.html?q=${encodeURIComponent(university)}`,
      otherCategories: [...fieldLinks, ...countryLinks],
    };
  });

  const alumniHubs: HubConfig[] = [...byAlmaMater]
    .filter(([, people]) => hasEnoughPeopleForRosterHub(people.length))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([school, people]) => {
      const info = almaMaterInfo(school);
      const label = info?.short ? `${school} (${info.short})` : school;
      return {
        categoryType: 'Alma Mater' as const,
        categoryName: school,
        categoryTitle: `${info?.short ?? school} Alumni on VietProfs`,
        categorySubtitle: [label, info?.vi].filter(Boolean).join(' · '),
        description: `Directory of ${people.length} Vietnamese-diaspora faculty, researchers and scientists who studied at ${label}, with their degree paths and where they work today.`,
        people,
        canonicalPath: almaMaterPath(school),
        interactiveUrl: `index.html?q=${encodeURIComponent(`Trained: ${info?.short ?? school}`)}`,
        otherCategories: [],
        noteFor: (person: RosterEntry, lang: Lang) =>
          `· ${DEGREE_STAGES.filter(([field]) => canonicalAlmaMater(person[field]) === school)
            .map(([, yearField, en, viLabel]) => {
              const year = yearField ? person[yearField] : undefined;
              return `${lang === 'vi' ? viLabel : en}${year ? ` ${year}` : ''}`;
            })
            .join(', ')}`,
      };
    });
  const alumniPaths = new Set<string>();
  for (const hub of alumniHubs) {
    if (alumniPaths.has(hub.canonicalPath))
      throw new Error(`Alumni hub path collision at ${hub.canonicalPath}`);
    alumniPaths.add(hub.canonicalPath);
  }
  for (const hub of alumniHubs)
    hub.otherCategories = [...alumniHubs]
      .sort((a, b) => b.people.length - a.people.length)
      .filter((other) => other !== hub)
      .slice(0, 24)
      .map((other) => {
        const info = almaMaterInfo(other.categoryName);
        return {
          label: `${info?.short ?? other.categoryName} alumni`,
          viLabel: `Cựu sinh viên ${info?.short ?? info?.vi ?? other.categoryName}`,
          path: other.canonicalPath,
        };
      });

  const englishHubs = [
    ...fieldHubs,
    ...continentHubs,
    ...countryHubs,
    ...intersectionHubs,
    ...universityHubs,
    ...alumniHubs,
  ];
  const vietnameseHubs = englishHubs.map(vietnameseHub);
  await Promise.all(
    [...englishHubs, ...vietnameseHubs].map(async (hub) => {
      const outputFile = resolve(output, hub.canonicalPath);
      await mkdir(dirname(outputFile), { recursive: true });
      await writeFile(outputFile, categoryHubPage(hub));
    }),
  );
  const countryCount = Object.keys(countryCounts).length;
  const organizationCount = byUniversity.size;
  await writeFile(
    resolve(viDir, 'index.html'),
    vietnameseHomePage(
      roster,
      fieldHubs.map(vietnameseHub),
      [...continentHubs, ...countryHubs].map(vietnameseHub),
      alumniHubs.map(vietnameseHub),
      universityHubs.map(vietnameseHub),
      countryCount,
    ),
  );

  if (!development) {
    const indexPath = resolve(output, 'index.html');
    const builtIndex = await readFile(indexPath, 'utf8');
    const liveDescription = `Searchable directory of ${roster.length.toLocaleString('en-US')} Vietnamese professors, researchers, and scientists across ${countryCount} countries in academia, government and nonprofit labs, and industry worldwide.`;
    const enrichedIndex = builtIndex
      .replace(
        /<meta name="description" content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(liveDescription)}" />`,
      )
      .replace(
        /<meta property="og:description" content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${escapeHtml(liveDescription)}" />`,
      )
      .replace(
        /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${escapeHtml(liveDescription)}" />`,
      )
      .replace(
        '<div id="app"></div>',
        `<div id="app">\n    ${renderIndexFallback(
          roster,
          fieldHubs,
          [...continentHubs, ...countryHubs],
          alumniHubs,
          universityHubs,
          countryCount,
          organizationCount,
        )}\n  </div>`,
      );
    await writeFile(indexPath, enrichedIndex);

    const hubUrls = [...englishHubs, ...vietnameseHubs].map(
      (hub) =>
        `  <url>\n    <loc>${absoluteUrl(hub.canonicalPath)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${hub.categoryType === 'Discipline × Region' || hub.categoryType === 'Institution' || hub.categoryType === 'Alma Mater' ? '0.7' : '0.8'}</priority>\n  </url>`,
    );
    const profileUrls = allEntries.flatMap((person) =>
      (['en', 'vi'] as const).map(
        (lang) =>
          `  <url>\n    <loc>${absoluteUrl(langPath(personPath(person.id), lang))}</loc>${person.lastUpdatedAt ? `\n    <lastmod>${person.lastUpdatedAt.slice(0, 10)}</lastmod>` : ''}\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
      ),
    );
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>${siteUrl}/vi/</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n  <url>\n    <loc>${siteUrl}/connections.html</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>${siteUrl}/submit.html</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n${hubUrls.join('\n')}\n${profileUrls.join('\n')}\n</urlset>\n`;
    await writeFile(resolve(output, 'sitemap.xml'), sitemap);
  }
  console.log(
    `Generated ${allEntries.length} profile pages, ${fieldHubs.length} field hubs, ${continentHubs.length + countryHubs.length} region hubs, ${intersectionHubs.length} field-region hubs, ${universityHubs.length} university hubs, and ${alumniHubs.length} alumni hubs, each in English and Vietnamese${development ? ', for development.' : ', and sitemap entries.'}`,
  );
}

await main();
