import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { gas } from 'vite-plugin-google-apps-script';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    gas() as Plugin,
    viteSingleFile(),
    react(),
  ],
  build: {
    outDir: 'dist',
    minify: undefined,
  },
});
