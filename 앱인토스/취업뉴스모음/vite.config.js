import { defineConfig } from 'vite';
import { cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Keep classic scripts so the prototype also works by opening index.html directly.
export default defineConfig({
  base: './',
  plugins: [{
    name: 'copy-local-preview-scripts',
    closeBundle() {
      cpSync(fileURLToPath(new URL('./src', import.meta.url)), fileURLToPath(new URL('./dist/src', import.meta.url)), { recursive: true });
    },
  }],
});
