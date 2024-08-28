# vite-plugin-vue-googleappsscript

Vite plugin for Vue on GoogleAppsScript via @google/clasp.

## Installation

You'll first need to install packages like this:

```
$ npm i vite vite-plugin-singlefile @google/clasp vue @types/google-apps-script @vitejs/plugin-vue --save-dev
```

Next, install `vite-plugin-vue-googleappsscript`:

```
$ npm install vite-plugin-vue-googleappsscript --save-dev
```

## Usage

```ts: vite.config.ts
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import viteVueOnGas from 'vite-plugin-vue-googleappsscript';

export default defineConfig({
  plugins: [vue(), viteSingleFile(), viteVueOnGas()],
  build: {
    outDir: 'dist',
  },
});
```
