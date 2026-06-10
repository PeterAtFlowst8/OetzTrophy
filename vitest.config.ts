import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      // Mirror tsconfig's "@/*" -> "./src/*" so tests can import app modules.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
  },
});
