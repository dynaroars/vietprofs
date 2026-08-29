const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: unknown): string {
  if (value == null) return '';
  return String(value).replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
}

const rosterDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

const rosterShortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
  year: '2-digit',
  timeZone: 'UTC',
});

type DateInput = string | number | Date;

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatRosterDate(timestamp: DateInput): string {
  const date = toDate(timestamp);
  return Number.isNaN(date.valueOf()) ? '' : rosterDateFormatter.format(date);
}

export function formatRosterShortDate(timestamp: DateInput): string {
  const date = toDate(timestamp);
  return Number.isNaN(date.valueOf()) ? '' : rosterShortDateFormatter.format(date);
}
