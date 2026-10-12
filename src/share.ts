// The Share menu on the directory, profile pages, and hub pages. The markup is a plain <details>, so
// the links work without JavaScript on the static pages; public/share.js adds "Copy link", the
// phone share sheet, and, on the directory, links that follow the current search.

import { escapeHtml } from './utils.ts';

const SHARE_ICON = 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92Z';

// `{url}` and `{title}` are filled with URI-encoded values.
const TARGETS: ReadonlyArray<{ label: string; template: string }> = [
  { label: 'Facebook', template: 'https://www.facebook.com/sharer/sharer.php?u={url}' },
  { label: 'LinkedIn', template: 'https://www.linkedin.com/sharing/share-offsite/?url={url}' },
  { label: 'Threads', template: 'https://www.threads.net/intent/post?text={title}%20{url}' },
  { label: 'Email', template: 'mailto:?subject={title}&body={url}' },
];

function fill(template: string, url: string, title: string): string {
  return template.replace('{url}', encodeURIComponent(url)).replace('{title}', encodeURIComponent(title));
}

// Pass `url` for a page with a fixed address; omit it on the directory, where the shared address
// is whatever search the visitor has open when they click Share.
export function renderShareMenu(options: { title: string; url?: string }): string {
  const { title, url } = options;
  const links = TARGETS.map(({ label, template }) => {
    const external = !template.startsWith('mailto:');
    return `<a class="share-item" href="${url ? escapeHtml(fill(template, url, title)) : '#'}" data-share-template="${escapeHtml(template)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
  }).join('');
  return `<details class="share-menu" data-share-title="${escapeHtml(title)}"${url ? ` data-share-url="${escapeHtml(url)}"` : ''}><summary class="share-toggle" aria-label="Share" title="Share this page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${SHARE_ICON}"/></svg><span>Share</span></summary><div class="share-popover"><button type="button" class="share-item" data-share-copy>Copy link</button>${links}</div></details>`;
}
