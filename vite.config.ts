import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

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

export default defineConfig({
  // Relative base so the build works under a GitHub Pages project path
  // (https://dynaroars.github.io/vietprofs/) as well as at a root domain.
  base: './',
  define: {
    __BUILD_COMMIT__: JSON.stringify(commit),
    __BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
    __BUILD_LABEL__: JSON.stringify(buildLabel),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        submit: resolve(root, 'submit.html'),
      },
    },
  },
})
