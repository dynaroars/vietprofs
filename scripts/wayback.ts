/**
 * Internet Archive (Wayback Machine) lookups for stored URLs that are down, under maintenance,
 * timing out, or refusing automated clients.
 *
 * An archived copy is evidence that a page existed and what it showed on the snapshot date. It is
 * never proof of a *current* appointment: use it to find where a person moved, to recover a
 * portrait URL for review, or to show a dead link really held the person's profile. Lookups go
 * through the public availability API (https://archive.org/help/wayback_api.php), which is meant
 * for exactly this use, with a self-identifying User-Agent.
 */

export type Snapshot = {
  /** The URL that was looked up. */
  url: string;
  /** Human-viewable snapshot page (with the Wayback toolbar). */
  viewUrl: string;
  /** The archived response as originally served, without Wayback's link rewriting. */
  rawUrl: string;
  /** Wayback timestamp, `YYYYMMDDhhmmss`. */
  timestamp: string;
  /** Snapshot date, `YYYY-MM-DD`. */
  date: string;
};

export const WAYBACK_USER_AGENT = 'VietProfs link maintenance (https://vietprofs.roars.dev)';

// Sites whose terms forbid automated collection; an archived copy of them isn't something we use.
const SKIPPED_HOSTS = /(^|\.)(linkedin\.com|scholar\.google\.[a-z.]+)$/i;

export function waybackEligible(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return /^https?:$/.test(protocol) && !SKIPPED_HOSTS.test(hostname);
  } catch {
    return false;
  }
}

/** Builds a snapshot from an availability-API response body, or null when none is usable. */
export function parseAvailability(url: string, body: unknown): Snapshot | null {
  const closest = (body as { archived_snapshots?: { closest?: Record<string, unknown> } })
    ?.archived_snapshots?.closest;
  if (!closest || closest.available !== true || closest.status !== '200') return null;
  const timestamp = String(closest.timestamp ?? '');
  if (!/^\d{14}$/.test(timestamp)) return null;
  return {
    url,
    viewUrl: `https://web.archive.org/web/${timestamp}/${url}`,
    rawUrl: `https://web.archive.org/web/${timestamp}id_/${url}`,
    timestamp,
    date: `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`,
  };
}

/** Finds the most recent successful (HTTP 200) snapshot of `url`, or null. Never throws. */
export async function findSnapshot(
  url: string,
  { timeoutMs = 15_000 }: { timeoutMs?: number } = {},
): Promise<Snapshot | null> {
  if (!waybackEligible(url)) return null;
  const api = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
  try {
    const res = await fetch(api, {
      headers: { 'User-Agent': WAYBACK_USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return parseAvailability(url, await res.json());
  } catch {
    return null;
  }
}
