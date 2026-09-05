import {
  canonicalRank,
  countryFlag,
  displayName,
  displayUniversity,
  fieldOf,
  healthSubfieldOf,
  personPath,
  type RosterEntry,
  vietnameseName,
} from './data.ts';
import { isFavorite } from './favorites-store.ts';
import { STAR_ICON } from './favorites-ui.ts';
import { escapeHtml, formatRosterDate, formatRosterShortDate } from './utils.ts';

const SCHOLAR_ICON = '<path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Z"/><path d="M5 12.18V16c0 1.66 3.13 3 7 3s7-1.34 7-3v-3.82l-7 3.82-7-3.82Z"/>';
const PROFILE_ICON = '<path d="M12 3 3 9v2h18V9L12 3Zm-7 10v6h2v-6H5Zm6 0v6h2v-6h-2Zm6 0v6h2v-6h-2ZM3 21h18v-2H3v2Z"/>';
const PERSONAL_SITE_ICON = '<path d="m12 3-9 8h3v10h5v-6h2v6h5V11h3l-9-8Z"/>';

export function fieldDropdownLabel(field = '') {
  return field.replace(/\bSciences\b/g, '').replace(/\s+/g, ' ').trim();
}

export function formatLocation(person: RosterEntry) {
  const parts = [];
  if (person.city) parts.push(person.city);
  if (person.state && person.state !== person.city) parts.push(person.state);
  if (person.country && !['United States', 'US', 'USA', person.city].includes(person.country)) {
    parts.push(person.country);
  }
  return parts.join(', ');
}

interface EntryIconLinkOptions {
  className: string;
  href: string;
  label: string;
  title: string;
  icon: string;
}

function entryIconLink({ className, href, label, title, icon }: EntryIconLinkOptions) {
  return ` <a class="${className}" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}" title="${escapeHtml(title)}"><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg></a>`;
}

export function renderRosterEntry(person: RosterEntry, baseUrl = '/') {
  const visibleName = displayName(person.name);
  const nativeName = vietnameseName(person);
  const entryMeta = [canonicalRank(person), person.department, displayUniversity(person.university), formatLocation(person)].filter(Boolean).join(' · ');
  const personField = fieldOf(person.department, person.university);
  const healthSubfield = healthSubfieldOf(person);
  const fieldLabel = `${fieldDropdownLabel(personField)}${healthSubfield ? ` (${healthSubfield})` : ''}`;
  const fieldTag = `<span class="tag tag-field">${escapeHtml(fieldLabel)}</span>`;
  const trackTag = `<span class="tag tag-track">${escapeHtml(person.track)}</span>`;
  const topicTags = (person.researchAreas ?? [])
    .map((area) => `<span class="tag tag-topic">${escapeHtml(area)}</span>`)
    .join('');
  const honors = (person.honors ?? [])
    .map((honor) => `<a class="honor-link" href="${escapeHtml(honor.source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(honor.name)}${honor.year ? ` (${escapeHtml(String(honor.year))})` : ''}</a>`)
    .join(' · ');
  const updatedTime = `<time class="entry-updated" datetime="${escapeHtml(person.lastUpdatedAt)}" title="Roster information last updated ${escapeHtml(formatRosterDate(person.lastUpdatedAt))}"><span>Updated</span> <span>${escapeHtml(formatRosterShortDate(person.lastUpdatedAt))}</span></time>`;
  const portrait = person.portrait
    ? `<img class="entry-portrait" src="${escapeHtml(`${baseUrl}${person.portrait}`)}" alt="" width="64" height="64" loading="lazy" decoding="async">`
    : `<img class="entry-portrait entry-portrait-placeholder" src="${escapeHtml(`${baseUrl}default-portrait.svg`)}" alt="" width="64" height="64" loading="lazy" decoding="async">`;
  const educationDetails = [
    person.postdocInstitution && `Postdoc: ${[displayUniversity(person.postdocInstitution), person.postdocYear].filter(Boolean).join(', ')}`,
    person.phdInstitution && `PhD: ${[displayUniversity(person.phdInstitution), person.phdYear, person.phdMajor].filter(Boolean).join(', ')}`,
    person.msInstitution && `MS: ${[displayUniversity(person.msInstitution), person.msYear, person.msMajor].filter(Boolean).join(', ')}`,
    person.undergradInstitution && `Undergrad: ${[displayUniversity(person.undergradInstitution), person.undergradYear, person.undergradMajor].filter(Boolean).join(', ')}`,
    (person.mdYear || person.mdInstitution) && `MD: ${[displayUniversity(person.mdInstitution), person.mdYear].filter(Boolean).join(', ')}`,
    ...(person.otherDegrees ?? []).map((degree) => `${degree.degree}: ${[displayUniversity(degree.institution), degree.year, degree.major].filter(Boolean).join(', ')}`),
  ].filter(Boolean);
  const profileIcon = entryIconLink({ className: 'profile-link', href: person.profileUrl, label: `${visibleName} official university profile`, title: 'Official university profile', icon: PROFILE_ICON });
  const personalSiteIcon = person.websiteUrl
    ? entryIconLink({ className: 'personal-site-link', href: person.websiteUrl, label: `${visibleName} personal or lab website`, title: 'Personal or lab website', icon: PERSONAL_SITE_ICON })
    : '';
  const scholarIcon = person.scholarUrl
    ? entryIconLink({ className: 'scholar-link', href: person.scholarUrl, label: `${visibleName} on Google Scholar`, title: 'Google Scholar', icon: SCHOLAR_ICON })
    : '';
  const favorited = isFavorite(person.id);
  const favoriteLabel = favorited ? 'Remove from favorites' : 'Add to favorites';
  const favoriteToggle = `<button type="button" class="favorite-toggle${favorited ? ' is-favorite' : ''}" data-id="${escapeHtml(person.id)}" aria-pressed="${favorited ? 'true' : 'false'}" aria-label="${favoriteLabel}" title="${favoriteLabel}"><svg viewBox="0 0 24 24" aria-hidden="true">${STAR_ICON}</svg></button>`;

  return `
    <div class="entry entry-with-portrait">
      ${portrait}
      ${favoriteToggle}
      <div class="entry-content">
        <div class="entry-name-row">
          <a class="entry-name" href="${escapeHtml(`${baseUrl}${personPath(person.id)}`)}">${escapeHtml(visibleName)}</a>
          <span class="entry-vietnamese-name">(${escapeHtml(nativeName)})</span>${profileIcon}${personalSiteIcon}${scholarIcon}${updatedTime}
        </div>
        <div class="entry-meta">${escapeHtml(entryMeta)} <span class="loc-badge" title="${escapeHtml(person.country || 'United States')}"><span class="country-flag" aria-hidden="true">${countryFlag(person.country)}</span></span></div>
        ${educationDetails.length ? `<div class="entry-details">${educationDetails.map((value) => escapeHtml(value)).join('; ')}</div>` : ''}
        ${honors ? `<div class="entry-honors"><span class="honors-label">Honors:</span> ${honors}</div>` : ''}
        <div class="tags">${fieldTag}${trackTag}${topicTags}</div>
      </div>
    </div>
  `;
}
