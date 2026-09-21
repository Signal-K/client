import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      // Longest prefix first so "@/src/x" is not rewritten to "src/src/x".
      '@/src': path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
})
