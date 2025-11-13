import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ji-casimov.io/', // 👈 IMPORTANT for GitHub Pages project
});
