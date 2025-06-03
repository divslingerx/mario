import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 5174,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@js2d/engine': resolve(__dirname, '../engine/src'),
      '@js2d/traits-ai': resolve(__dirname, '../traits-ai/src'),
      '@js2d/traits-emergent': resolve(__dirname, '../traits-emergent/src')
    }
  },
  optimizeDeps: {
    include: ['bitecs']
  }
})