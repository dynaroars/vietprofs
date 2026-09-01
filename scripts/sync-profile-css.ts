import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

await copyFile(resolve(root, 'src/style.css'), resolve(root, 'public/profile.css'));
await Promise.all([
  'vietprofs-bamboo-v.svg',
  'vietprofs-bamboo-v-512.png',
  'vietprofs-bamboo-v-2048.png',
  'default-portrait.svg',
].map((asset) => copyFile(resolve(root, asset), resolve(root, 'public', asset))));
