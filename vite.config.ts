import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { UserConfig as VitestUserConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  } as VitestUserConfig['test'],
})
