import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    pool: 'threads',
    minWorkers: 1,
    maxWorkers: 1,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
