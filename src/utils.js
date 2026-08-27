export function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
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

export function formatRosterDate(timestamp) {
  const date = new Date(timestamp);
  return Number.isNaN(date.valueOf()) ? '' : rosterDateFormatter.format(date);
}

export function formatRosterShortDate(timestamp) {
  const date = new Date(timestamp);
  return Number.isNaN(date.valueOf()) ? '' : rosterShortDateFormatter.format(date);
}
