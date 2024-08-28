import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import viteVueOnGas from '..';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), viteSingleFile(), viteVueOnGas()],
  build: {
    outDir: 'dist',
  },
});
