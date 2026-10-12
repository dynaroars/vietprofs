import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const root = fileURLToPath(new URL('.', import.meta.url))
const commit = process.env.VITE_GIT_COMMIT || (() => {
  try {
    return execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  } catch {
    return 'development'
  }
})()
const buildTimestamp = process.env.VITE_BUILD_TIME || new Date().toISOString()
const buildLabel = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/New_York',
}).format(new Date(buildTimestamp)) + ' ET'

// public/share.js keeps a fixed name and the host caches it for hours; a content hash in the query
// makes a changed file load fresh (scripts/generate-profile-pages.ts does the same for its pages).
const shareVersion = createHash('sha256').update(readFileSync(resolve(root, 'public/share.js'))).digest('hex').slice(0, 10)

export default defineConfig({
  // Relative base so the build works under a GitHub Pages project path
  // (https://dynaroars.github.io/vietprofs/) as well as at a root domain.
  base: './',
  define: {
    __BUILD_COMMIT__: JSON.stringify(commit),
    __BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
    __BUILD_LABEL__: JSON.stringify(buildLabel),
  },
  plugins: [{
    name: 'version-share-script',
    transformIndexHtml: (html) => html.replace('src="./share.js"', `src="./share.js?v=${shareVersion}"`),
  }],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        submit: resolve(root, 'submit.html'),
        stats: resolve(root, 'stats.html'),
        connections: resolve(root, 'connections.html'),
      },
    },
  },
})
