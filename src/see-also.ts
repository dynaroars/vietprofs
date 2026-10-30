// The SEE ALSO section that closes every standalone page (stats, connections, submit, and the
// generated profile pages), so they all link the same destinations. `base` is the path to the site
// root from the page ("/" for the app pages, "../" for generated profiles); `current` drops the
// page's own link. Links are icon-only; the label is the accessible name and the hover tooltip.

type Destination = 'directory' | 'health' | 'insights' | 'connections' | 'submit' | 'github';

// Also used by the directory's header links, so the same destination always has the same icon.
export const ICONS: Record<Destination, string> = {
  directory: 'm12 3-9 8h3v10h5v-6h2v6h5V11h3l-9-8Z',
  health: 'M3 12h4l2-6 4 12 2-6h6v2h-4l-4 8-4-11-1 3H3v-2Z',
  insights: 'M4 19V9h3v10H4Zm6 0V4h3v15h-3Zm6 0v-7h3v7h-3Z',
  connections:
    'M6 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm12 12a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM18 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM8.6 7.2l6.8 9.6-1.6 1.2L7 8.4l1.6-1.2ZM9 5h6v2H9V5Z',
  submit: 'M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z',
  github:
    'M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.39.97.1-.75.4-1.27.74-1.56-2.57-.29-5.28-1.29-5.28-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z',
};

const LINKS: Array<[Destination, string, string]> = [
  ['directory', 'index.html', 'Back to Directory'],
  ['health', 'index.html?view=health', 'Data Health & Completeness'],
  ['insights', 'index.html?view=insights', 'Diaspora Insights & Pathways'],
  ['connections', 'connections.html', 'Academic Connections'],
  ['submit', 'submit.html', 'Submit / Update'],
  ['github', 'https://github.com/dynaroars/vietprofs', 'GitHub'],
];

export function renderSeeAlso(base: string, current?: Destination): string {
  const links = LINKS.filter(([key]) => key !== current).map(([key, href, label]) => {
    const external = href.startsWith('https://');
    const attrs = external ? ` target="_blank" rel="noopener noreferrer"` : '';
    const name = label.replace(/&/g, '&amp;');
    return `<a class="see-also-link" href="${external ? href : `${base}${href}`}"${attrs} aria-label="${name}" title="${name}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[key]}"/></svg></a>`;
  });
  return `<section class="man-section see-also">
          <h2>SEE ALSO</h2>
          <nav class="links" aria-label="Other VietProfs destinations">
            ${links.join('\n            ')}
          </nav>
        </section>`;
}
