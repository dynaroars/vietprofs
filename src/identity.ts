// Person-identity helpers shared by the roster validator and the dedup tool
// (scripts/find-roster-matches.ts). They decide when two records are probably the same person.

export function nameTokens(name: string): string[] {
  const tokens = name.split(' - ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase()
    .split(/[^a-z]+/).filter((token) => token.length > 1);
  return [...new Set(tokens)];
}

export function identityKey(url: string): string {
  const scholar = url.match(/scholar\.google\.[^/]+\/citations\?(?:.*&)?user=([\w-]+)/i);
  if (scholar) return `scholar:${scholar[1]}`;
  const linkedin = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  if (linkedin) return `linkedin:${decodeURIComponent(linkedin[1]).toLowerCase()}`;
  const [path, query = ''] = url.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/#.*$/, '').split('?');
  const base = path.replace(/\/(index\.html?|home)?$/, '').replace(/\/+$/, '');
  return query ? `${base}?${query}` : base;
}

// Same person unless ruled out: identical token sets, or one name's tokens contain the other's
// surname plus at least one given-name token ("Tin Nguyen" vs "Tin Chi Nguyen").
export function namesMatch(a: string[], b: string[]): boolean {
  if (!a.length || !b.length) return false;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return short.length >= 2 && short.every((token) => long.includes(token));
}
