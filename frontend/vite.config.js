import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow ngrok and other tunneling services
    allowedHosts: [
      'localhost',
      '.ngrok.io',
      '.ngrok-free.app',
      '.ngrok-free.dev',
      '.loca.lt',
      'all' // Allow all hosts (use with caution)
    ],
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
