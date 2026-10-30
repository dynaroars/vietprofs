import type { Roster } from './data.ts';
export interface CompletenessMetric {
  key: string;
  label: string;
  count: number;
  total: number;
  percentage: number;
  description: string;
}

export interface DerivedRosterStats {
  total: number;
  completeness: CompletenessMetric[];
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
      count: roster.filter((p) => Array.isArray(p.researchAreas) && p.researchAreas.length > 0)
        .length,
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
  ];

  return metrics.map((m) => ({
    ...m,
    total,
    percentage: Math.round((m.count / total) * 1000) / 10,
  }));
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
    if (Number.isNaN(updateMs)) continue;
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
    recentUpdatesCount: computeRecentUpdates(roster),
  };
}
