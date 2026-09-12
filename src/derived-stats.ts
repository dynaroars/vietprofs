import {
  COUNTRY_TO_CONTINENT,
  fieldOf,
  type Roster,
  type RosterEntry,
} from './data.ts';

export interface CompletenessMetric {
  key: string;
  label: string;
  count: number;
  total: number;
  percentage: number;
  description: string;
}

export interface RankedCount {
  name: string;
  count: number;
  percentage: number;
  queryParam: string;
}

export interface GenerationStat {
  decade: string;
  count: number;
  percentage: number;
  range: string;
}

export interface RegionFieldStat {
  region: string;
  total: number;
  topFields: { field: string; count: number }[];
}

export interface DerivedRosterStats {
  total: number;
  completeness: CompletenessMetric[];
  topPhdInstitutions: RankedCount[];
  topUndergradInstitutions: RankedCount[];
  academicGenerations: GenerationStat[];
  regionFieldDistribution: RegionFieldStat[];
  recentUpdatesCount: {
    last7Days: number;
    last30Days: number;
    last90Days: number;
  };
}

export function computeCompleteness(roster: Roster): CompletenessMetric[] {
  const total = roster.length;
  if (total === 0) return [];

  const metrics = [
    {
      key: 'profileUrl',
      label: 'Official Profile Links',
      count: roster.filter((p) => Boolean(p.profileUrl)).length,
      description: 'Faculty members with an official university or institute directory page.',
    },
    {
      key: 'portrait',
      label: 'Portraits & Headshots',
      count: roster.filter((p) => Boolean(p.portrait)).length,
      description: 'Profiles with verified, locally archived WebP portraits.',
    },
    {
      key: 'phdInstitution',
      label: 'Doctoral (PhD) Institutions',
      count: roster.filter((p) => Boolean(p.phdInstitution)).length,
      description: 'Entries with verified doctoral alma mater information.',
    },
    {
      key: 'undergradInstitution',
      label: 'Undergraduate Institutions',
      count: roster.filter((p) => Boolean(p.undergradInstitution)).length,
      description: 'Entries with verified bachelor/undergraduate degree origins.',
    },
    {
      key: 'vietnameseName',
      label: 'Vietnamese Native Names',
      count: roster.filter((p) => Boolean(p.vietnameseName)).length,
      description: 'Records with authoritative Vietnamese diacritics and naming.',
    },
    {
      key: 'researchAreas',
      label: 'Research Areas & Keywords',
      count: roster.filter((p) => Array.isArray(p.researchAreas) && p.researchAreas.length > 0).length,
      description: 'Faculty with indexed research tags and topic areas.',
    },
    {
      key: 'scholarUrl',
      label: 'Google Scholar Citations',
      count: roster.filter((p) => Boolean(p.scholarUrl)).length,
      description: 'Validated Google Scholar citation profiles.',
    },
    {
      key: 'linkedinUrl',
      label: 'LinkedIn Profiles',
      count: roster.filter((p) => Boolean(p.linkedinUrl)).length,
      description: 'Validated professional LinkedIn profiles.',
    },
    {
      key: 'researchOverview',
      label: 'Research Summaries & Bios',
      count: roster.filter((p) => Boolean(p.researchOverview?.text)).length,
      description: 'Evidence-backed narrative summaries of scholarly contributions.',
    },
  ];

  return metrics.map((m) => ({
    ...m,
    total,
    percentage: Math.round((m.count / total) * 1000) / 10,
  }));
}

export function computeTopPhdOrigins(roster: Roster, limit = 12): RankedCount[] {
  const counts = new Map<string, number>();
  let totalWithPhd = 0;

  for (const person of roster) {
    if (!person.phdInstitution) continue;
    totalWithPhd += 1;
    const inst = person.phdInstitution.trim();
    counts.set(inst, (counts.get(inst) ?? 0) + 1);
  }

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);

  return sorted.map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / Math.max(1, totalWithPhd)) * 1000) / 10,
    queryParam: `phd:${name.includes(' ') ? `"${name}"` : name}`,
  }));
}

export function computeTopUndergradFeeders(roster: Roster, limit = 12): RankedCount[] {
  const counts = new Map<string, number>();
  let totalWithUndergrad = 0;

  for (const person of roster) {
    if (!person.undergradInstitution) continue;
    totalWithUndergrad += 1;
    const inst = person.undergradInstitution.trim();
    counts.set(inst, (counts.get(inst) ?? 0) + 1);
  }

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);

  return sorted.map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / Math.max(1, totalWithUndergrad)) * 1000) / 10,
    queryParam: `undergrad:${name.includes(' ') ? `"${name}"` : name}`,
  }));
}

export function computeAcademicGenerations(roster: Roster): GenerationStat[] {
  const buckets = new Map<string, { count: number; range: string }>([
    ['2020s', { count: 0, range: '2020–present' }],
    ['2010s', { count: 0, range: '2010–2019' }],
    ['2000s', { count: 0, range: '2000–2009' }],
    ['1990s', { count: 0, range: '1990–1999' }],
    ['1980s', { count: 0, range: '1980–1989' }],
    ['Pre-1980s', { count: 0, range: 'Before 1980' }],
  ]);

  let totalWithYear = 0;

  for (const person of roster) {
    const year = person.phdYear || person.mdYear;
    if (!year || typeof year !== 'number' || isNaN(year)) continue;
    totalWithYear += 1;

    if (year >= 2020) buckets.get('2020s')!.count += 1;
    else if (year >= 2010) buckets.get('2010s')!.count += 1;
    else if (year >= 2000) buckets.get('2000s')!.count += 1;
    else if (year >= 1990) buckets.get('1990s')!.count += 1;
    else if (year >= 1980) buckets.get('1980s')!.count += 1;
    else buckets.get('Pre-1980s')!.count += 1;
  }

  return [...buckets.entries()].map(([decade, { count, range }]) => ({
    decade,
    count,
    range,
    percentage: Math.round((count / Math.max(1, totalWithYear)) * 1000) / 10,
  }));
}

export function computeRegionFieldDistribution(roster: Roster): RegionFieldStat[] {
  const regionMap = new Map<string, { total: number; fields: Map<string, number> }>();

  for (const person of roster) {
    const country = person.country || 'United States';
    const continent = COUNTRY_TO_CONTINENT[country] || 'Other';
    if (!regionMap.has(continent)) {
      regionMap.set(continent, { total: 0, fields: new Map() });
    }
    const region = regionMap.get(continent)!;
    region.total += 1;

    const field = fieldOf(person.department, person.university);
    region.fields.set(field, (region.fields.get(field) ?? 0) + 1);
  }

  return [...regionMap.entries()]
    .filter(([_, data]) => data.total >= 10)
    .map(([region, data]) => {
      const topFields = [...data.fields.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([field, count]) => ({ field, count }));
      return { region, total: data.total, topFields };
    })
    .sort((a, b) => b.total - a.total);
}

export function computeRecentUpdates(roster: Roster, now = new Date()) {
  const nowMs = now.getTime();
  const day7Ms = 7 * 24 * 60 * 60 * 1000;
  const day30Ms = 30 * 24 * 60 * 60 * 1000;
  const day90Ms = 90 * 24 * 60 * 60 * 1000;

  let last7Days = 0;
  let last30Days = 0;
  let last90Days = 0;

  for (const person of roster) {
    if (!person.lastUpdatedAt) continue;
    const updateMs = new Date(person.lastUpdatedAt).getTime();
    if (isNaN(updateMs)) continue;
    const diff = nowMs - updateMs;
    if (diff <= day7Ms) last7Days += 1;
    if (diff <= day30Ms) last30Days += 1;
    if (diff <= day90Ms) last90Days += 1;
  }

  return { last7Days, last30Days, last90Days };
}

export function deriveRosterStats(roster: Roster): DerivedRosterStats {
  return {
    total: roster.length,
    completeness: computeCompleteness(roster),
    topPhdInstitutions: computeTopPhdOrigins(roster),
    topUndergradInstitutions: computeTopUndergradFeeders(roster),
    academicGenerations: computeAcademicGenerations(roster),
    regionFieldDistribution: computeRegionFieldDistribution(roster),
    recentUpdatesCount: computeRecentUpdates(roster),
  };
}
