import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Exclude directories from watching to reduce file descriptors
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.vscode/**',
        '**/.idea/**',
        '**/coverage/**',
        '**/*.log',
        '**/package-lock.json',
      ],
      // Use polling mode to avoid file descriptor limits
      usePolling: true,
      interval: 1000,
    },
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    exclude: [],
  },
})
