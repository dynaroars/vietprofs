import { build } from 'esbuild';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

// Bundled standalone (no imports) so it can be fetched at runtime as a plain ES module
// from https://vietprofs.roars.dev/search-kit.js — same sharing pattern as profile.css.
await build({
  entryPoints: [resolve(root, 'src/search-kit.ts')],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  outfile: resolve(root, 'public/search-kit.js'),
});
