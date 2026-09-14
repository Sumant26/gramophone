import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      // jsmediatags ships a React Native file reader that statically
      // imports react-native-fs; we only ever use its browser reader, so
      // point that import at an empty stub instead of adding the (large,
      // unused) RN dependency.
      'react-native-fs': path.resolve(dirname, './src/shims/empty.js'),
    },
  },
  build: {
    rolldownOptions: {
      external: ['fs', 'buffer'],
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('jsmediatags')) return 'tags'
          if (id.includes('react-dom') || id.includes('/react/')) return 'vendor'
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'e2e/**',
        'src/test/**',
        '**/*.config.js',
        'src/main.jsx',
        'node_modules/**',
      ],
    },
  },
})
