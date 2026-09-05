import { defineConfig } from 'vite'
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
        profile: resolve(root, 'src/profile.ts'),
      },
      output: {
        entryFileNames: (chunk) => (chunk.name === 'profile' ? 'profile.js' : 'assets/[name]-[hash].js'),
      },
    },
  },
})
