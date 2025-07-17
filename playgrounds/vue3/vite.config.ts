import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { gas } from 'vite-plugin-google-apps-script';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), gas(), viteSingleFile()],
  build: {
    outDir: 'dist',
  }
})
