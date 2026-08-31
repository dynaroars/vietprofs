import { defineConfig } from 'vite'
// Vite configuration is TypeScript; application migration is tracked by tsconfig.
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // Relative base so the build works under a GitHub Pages project path
  // (https://dynaroars.github.io/vietprofs/) as well as at a root domain.
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        submit: resolve(root, 'submit.html'),
      },
    },
  },
})
