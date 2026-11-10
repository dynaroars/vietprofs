import type { Roster } from './data.ts';

export const RELATIONSHIP_TYPES = [
  'doctoral-advisor',
  'masters-advisor',
  'undergraduate-advisor',
  'postdoctoral-mentor',
  'coauthor',
  'grant-collaborator',
  'patent-coinventor',
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

// Symmetric types carry a `works` array of shared evidence items (papers, NSF awards, patents)
// and are stored with sourceId/targetId in ascending lexical order. Each has its own minimum
// item count reflecting how strong a single shared item is as collaboration evidence: a paper
// can have many near-independent coauthors, so coauthor requires 2+, while a shared NSF award
// or patent already names a small, deliberate set of collaborators, so 1 suffices.
const SYMMETRIC_TYPE_MIN_WORKS: Partial<Record<RelationshipType, number>> = {
  coauthor: 2,
  'grant-collaborator': 1,
  'patent-coinventor': 1,
};

export interface RelationshipWork {
  identifier: string;
  title: string;
  date: string;
  url: string;
}

export interface AcademicRelationship {
  id: string;
  type: RelationshipType;
  sourceId: string;
  targetId: string;
  sources: string[];
  evidence: string;
  works: RelationshipWork[];
  verifiedAt: string;
  direct: boolean;
  notes: string;
}

// A sourced connection between a roster member and someone who is not on the roster (a PhD
// advisor, an advisee, a collaborator). `role` is the other person's role: `mentor` (they
// advised the roster member), `mentee` (the roster member advised them), or `peer` for the
// symmetric types. There is no stored id, so retire-profile-id can rename `personId` safely;
// (personId, type, role, name) is unique instead. When the other person joins the roster, the
// record becomes an ordinary roster-internal relationship.
export const EXTERNAL_ROLES = ['mentor', 'mentee', 'peer'] as const;
export type ExternalRole = (typeof EXTERNAL_ROLES)[number];

export interface ExternalConnection {
  type: RelationshipType;
  personId: string;
  role: ExternalRole;
  name: string;
  affiliation: string;
  url: string;
  sources: string[];
  evidence: string;
  works: RelationshipWork[];
  verifiedAt: string;
  notes: string;
}

export interface RelationshipDatabase {
  version: 1;
  updatedAt: string;
  relationships: AcademicRelationship[];
  external?: ExternalConnection[];
}

export interface PersonConnection {
  relationship: AcademicRelationship;
  otherId: string;
  label: string;
}

const UTC_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const DATE_PATTERN = /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/;
const RELATIONSHIP_KEYS = new Set([
  'id',
  'type',
  'sourceId',
  'targetId',
  'sources',
  'evidence',
  'works',
  'verifiedAt',
  'direct',
  'notes',
]);
const WORK_KEYS = new Set(['identifier', 'title', 'date', 'url']);
const DATABASE_KEYS = new Set(['version', 'updatedAt', 'relationships', 'external']);
const EXTERNAL_KEYS = new Set([
  'type',
  'personId',
  'role',
  'name',
  'affiliation',
  'url',
  'sources',
  'evidence',
  'works',
  'verifiedAt',
  'notes',
]);

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.startsWith('https://')) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function isCanonicalTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !UTC_TIMESTAMP_PATTERN.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

export function relationshipId(type: RelationshipType, sourceId: string, targetId: string): string {
  return `rel-${type}-${sourceId}-${targetId}`;
}

export function validateRelationshipDatabase(
  value: unknown,
  roster: Pick<Roster[number], 'id'>[],
  now = Date.now(),
): string[] {
  const errors: string[] = [];
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return ['database must be an object'];
  const database = value as Partial<RelationshipDatabase>;
  for (const key of Object.keys(value)) {
    if (!DATABASE_KEYS.has(key)) errors.push(`database has unsupported field ${key}`);
  }
  if (database.version !== 1) errors.push('version must be 1');
  if (!isCanonicalTimestamp(database.updatedAt))
    errors.push('updatedAt must be a canonical UTC ISO timestamp');
  else if (new Date(database.updatedAt).valueOf() > now)
    errors.push('updatedAt must not be in the future');
  if (!Array.isArray(database.relationships)) return [...errors, 'relationships must be an array'];

  const rosterIds = new Set(roster.map((person) => person.id));
  const recordIds = new Set<string>();
  const edgeKeys = new Set<string>();
  for (const [index, raw] of database.relationships.entries()) {
    const label = `relationship ${index + 1}`;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    const relationship = raw as Partial<AcademicRelationship>;
    for (const key of Object.keys(raw)) {
      if (!RELATIONSHIP_KEYS.has(key)) errors.push(`${label} has unsupported field ${key}`);
    }
    if (!RELATIONSHIP_TYPES.includes(relationship.type as RelationshipType)) {
      errors.push(`${label} has invalid type`);
      continue;
    }
    const type = relationship.type as RelationshipType;
    if (!rosterIds.has(relationship.sourceId ?? ''))
      errors.push(`${label} has unknown sourceId ${relationship.sourceId}`);
    if (!rosterIds.has(relationship.targetId ?? ''))
      errors.push(`${label} has unknown targetId ${relationship.targetId}`);
    if (relationship.sourceId === relationship.targetId)
      errors.push(`${label} must connect two different people`);
    if (
      type in SYMMETRIC_TYPE_MIN_WORKS &&
      String(relationship.sourceId).localeCompare(String(relationship.targetId)) >= 0
    ) {
      errors.push(`${label} ${type} IDs must be in ascending lexical order`);
    }
    const expectedId = relationshipId(
      type,
      relationship.sourceId ?? '',
      relationship.targetId ?? '',
    );
    if (relationship.id !== expectedId) errors.push(`${label} id must be ${expectedId}`);
    if (typeof relationship.id === 'string') {
      if (recordIds.has(relationship.id)) errors.push(`${label} duplicates id ${relationship.id}`);
      recordIds.add(relationship.id);
    }
    const edgeKey = `${type}|${relationship.sourceId}|${relationship.targetId}`;
    if (edgeKeys.has(edgeKey)) errors.push(`${label} duplicates an existing edge`);
    edgeKeys.add(edgeKey);

    if (
      !Array.isArray(relationship.sources) ||
      relationship.sources.length === 0 ||
      relationship.sources.some((source) => !isHttpsUrl(source))
    ) {
      errors.push(`${label} sources must contain at least one HTTPS URL`);
    } else if (new Set(relationship.sources).size !== relationship.sources.length) {
      errors.push(`${label} sources must not contain duplicates`);
    }
    if (typeof relationship.evidence !== 'string' || !relationship.evidence.trim())
      errors.push(`${label} must include evidence`);
    if (!isCanonicalTimestamp(relationship.verifiedAt))
      errors.push(`${label} verifiedAt must be a canonical UTC ISO timestamp`);
    else if (new Date(relationship.verifiedAt).valueOf() > now)
      errors.push(`${label} verifiedAt must not be in the future`);
    if (typeof relationship.direct !== 'boolean') errors.push(`${label} direct must be a boolean`);
    if (typeof relationship.notes !== 'string') errors.push(`${label} notes must be a string`);

    if (!Array.isArray(relationship.works)) {
      errors.push(`${label} works must be an array`);
      continue;
    }
    const minWorks = SYMMETRIC_TYPE_MIN_WORKS[type];
    if (minWorks !== undefined && relationship.works.length < minWorks) {
      errors.push(
        `${label} ${type} records require at least ${minWorks} work${minWorks === 1 ? '' : 's'}`,
      );
    }
    if (minWorks === undefined && relationship.works.length !== 0)
      errors.push(`${label} mentorship records must have an empty works array`);
    const workIdentifiers = new Set<string>();
    for (const [workIndex, rawWork] of relationship.works.entries()) {
      const workLabel = `${label} work ${workIndex + 1}`;
      if (!rawWork || typeof rawWork !== 'object' || Array.isArray(rawWork)) {
        errors.push(`${workLabel} must be an object`);
        continue;
      }
      for (const key of Object.keys(rawWork)) {
        if (!WORK_KEYS.has(key)) errors.push(`${workLabel} has unsupported field ${key}`);
      }
      const work = rawWork as Partial<RelationshipWork>;
      if (typeof work.identifier !== 'string' || !work.identifier.trim())
        errors.push(`${workLabel} must include an identifier`);
      else if (workIdentifiers.has(work.identifier))
        errors.push(`${workLabel} duplicates identifier ${work.identifier}`);
      else workIdentifiers.add(work.identifier);
      if (typeof work.title !== 'string' || !work.title.trim())
        errors.push(`${workLabel} must include a title`);
      if (typeof work.date !== 'string' || !DATE_PATTERN.test(work.date))
        errors.push(`${workLabel} date must be YYYY, YYYY-MM, or YYYY-MM-DD`);
      if (!isHttpsUrl(work.url)) errors.push(`${workLabel} url must use HTTPS`);
    }
  }
  if (database.external !== undefined) {
    if (!Array.isArray(database.external)) errors.push('external must be an array');
    else errors.push(...validateExternalConnections(database.external, rosterIds, now));
  }
  if (isCanonicalTimestamp(database.updatedAt)) {
    const updatedAt = new Date(database.updatedAt).valueOf();
    const newestVerification = [
      ...database.relationships,
      ...(Array.isArray(database.external) ? database.external : []),
    ].reduce((newest, relationship) => {
      if (!isCanonicalTimestamp(relationship?.verifiedAt)) return newest;
      return Math.max(newest, new Date(relationship.verifiedAt).valueOf());
    }, 0);
    if (updatedAt < newestVerification)
      errors.push('updatedAt must not precede the newest relationship verification');
  }
  return errors;
}

function validateWorks(works: unknown[], label: string): string[] {
  const errors: string[] = [];
  const identifiers = new Set<string>();
  for (const [index, rawWork] of works.entries()) {
    const workLabel = `${label} work ${index + 1}`;
    if (!rawWork || typeof rawWork !== 'object' || Array.isArray(rawWork)) {
      errors.push(`${workLabel} must be an object`);
      continue;
    }
    for (const key of Object.keys(rawWork)) {
      if (!WORK_KEYS.has(key)) errors.push(`${workLabel} has unsupported field ${key}`);
    }
    const work = rawWork as Partial<RelationshipWork>;
    if (typeof work.identifier !== 'string' || !work.identifier.trim())
      errors.push(`${workLabel} must include an identifier`);
    else if (identifiers.has(work.identifier))
      errors.push(`${workLabel} duplicates identifier ${work.identifier}`);
    else identifiers.add(work.identifier);
    if (typeof work.title !== 'string' || !work.title.trim())
      errors.push(`${workLabel} must include a title`);
    if (typeof work.date !== 'string' || !DATE_PATTERN.test(work.date))
      errors.push(`${workLabel} date must be YYYY, YYYY-MM, or YYYY-MM-DD`);
    if (!isHttpsUrl(work.url)) errors.push(`${workLabel} url must use HTTPS`);
  }
  return errors;
}

function validateExternalConnections(
  connections: unknown[],
  rosterIds: Set<string>,
  now: number,
): string[] {
  const errors: string[] = [];
  const keys = new Set<string>();
  for (const [index, raw] of connections.entries()) {
    const label = `external connection ${index + 1}`;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    for (const key of Object.keys(raw)) {
      if (!EXTERNAL_KEYS.has(key)) errors.push(`${label} has unsupported field ${key}`);
    }
    const connection = raw as Partial<ExternalConnection>;
    if (!RELATIONSHIP_TYPES.includes(connection.type as RelationshipType)) {
      errors.push(`${label} has invalid type`);
      continue;
    }
    const type = connection.type as RelationshipType;
    const symmetric = type in SYMMETRIC_TYPE_MIN_WORKS;
    if (!rosterIds.has(connection.personId ?? ''))
      errors.push(`${label} has unknown personId ${connection.personId}`);
    if (!EXTERNAL_ROLES.includes(connection.role as ExternalRole))
      errors.push(`${label} role must be mentor, mentee, or peer`);
    else if (symmetric !== (connection.role === 'peer'))
      errors.push(`${label} role must be ${symmetric ? 'peer' : 'mentor or mentee'} for ${type}`);
    if (typeof connection.name !== 'string' || !connection.name.trim())
      errors.push(`${label} must include a name`);
    if (typeof connection.affiliation !== 'string')
      errors.push(`${label} affiliation must be a string`);
    if (connection.url !== '' && !isHttpsUrl(connection.url))
      errors.push(`${label} url must be empty or HTTPS`);
    const key = `${connection.personId}|${type}|${connection.role}|${String(connection.name).trim().toLowerCase()}`;
    if (keys.has(key)) errors.push(`${label} duplicates an existing external connection`);
    keys.add(key);
    if (
      !Array.isArray(connection.sources) ||
      connection.sources.length === 0 ||
      connection.sources.some((source) => !isHttpsUrl(source))
    ) {
      errors.push(`${label} sources must contain at least one HTTPS URL`);
    } else if (new Set(connection.sources).size !== connection.sources.length) {
      errors.push(`${label} sources must not contain duplicates`);
    }
    if (typeof connection.evidence !== 'string' || !connection.evidence.trim())
      errors.push(`${label} must include evidence`);
    if (!isCanonicalTimestamp(connection.verifiedAt))
      errors.push(`${label} verifiedAt must be a canonical UTC ISO timestamp`);
    else if (new Date(connection.verifiedAt).valueOf() > now)
      errors.push(`${label} verifiedAt must not be in the future`);
    if (typeof connection.notes !== 'string') errors.push(`${label} notes must be a string`);
    if (!Array.isArray(connection.works)) {
      errors.push(`${label} works must be an array`);
      continue;
    }
    const minWorks = SYMMETRIC_TYPE_MIN_WORKS[type];
    if (minWorks !== undefined && connection.works.length < minWorks)
      errors.push(
        `${label} ${type} records require at least ${minWorks} work${minWorks === 1 ? '' : 's'}`,
      );
    if (minWorks === undefined && connection.works.length !== 0)
      errors.push(`${label} mentorship records must have an empty works array`);
    errors.push(...validateWorks(connection.works, label));
  }
  return errors;
}

// The label describes the *other* person's role relative to the roster member.
export function connectionLabel(
  type: RelationshipType,
  otherRole: ExternalRole,
  workCount: number,
): string {
  const mentor = otherRole === 'mentor';
  switch (type) {
    case 'doctoral-advisor':
      return mentor ? 'Doctoral advisor' : 'Doctoral advisee';
    case 'masters-advisor':
      return mentor ? "Master's advisor" : "Master's advisee";
    case 'undergraduate-advisor':
      return mentor ? 'Undergraduate thesis advisor' : 'Undergraduate advisee';
    case 'postdoctoral-mentor':
      return mentor ? 'Postdoctoral mentor' : 'Postdoctoral mentee';
    case 'grant-collaborator':
      return `Grant collaborator · ${workCount} shared award${workCount === 1 ? '' : 's'}`;
    case 'patent-coinventor':
      return `Patent co-inventor · ${workCount} shared patent${workCount === 1 ? '' : 's'}`;
    default:
      return `Coauthor · ${workCount} shared works`;
  }
}

export interface ExternalPersonConnection {
  connection: ExternalConnection;
  label: string;
}

export function externalConnectionsFor(
  personId: string,
  database: RelationshipDatabase,
): ExternalPersonConnection[] {
  return (database.external ?? [])
    .filter((connection) => connection.personId === personId)
    .map((connection) => ({
      connection,
      label: connectionLabel(connection.type, connection.role, connection.works.length),
    }));
}

export function connectionsFor(
  personId: string,
  database: RelationshipDatabase,
): PersonConnection[] {
  return database.relationships.flatMap((relationship) => {
    if (relationship.sourceId !== personId && relationship.targetId !== personId) return [];
    const isSource = relationship.sourceId === personId;
    const symmetric = relationship.type in SYMMETRIC_TYPE_MIN_WORKS;
    // sourceId is the mentor in directional types, so the other person is the mentee.
    const label = connectionLabel(
      relationship.type,
      symmetric ? 'peer' : isSource ? 'mentee' : 'mentor',
      relationship.works.length,
    );
    return [
      {
        relationship,
        otherId: isSource ? relationship.targetId : relationship.sourceId,
        label,
      },
    ];
  });
}
