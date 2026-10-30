import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

// Profiles and hubs load the shared baseline only; app entrypoints import their own page CSS.
const IMPORT_LINE = "@import './roars-ui.css';\n";
const shared = await readFile(resolve(root, 'src/roars-ui.css'), 'utf8');
const style = await readFile(resolve(root, 'src/style.css'), 'utf8');
await writeFile(
  resolve(root, 'public/profile.css'),
  `${shared}\n${style.replace(IMPORT_LINE, '')}`,
);
