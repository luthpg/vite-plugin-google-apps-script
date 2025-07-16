# vite-plugin-google-apps-script

[![npm version](https://badge.fury.io/js/vite-plugin-google-apps-script.svg)](https://www.npmjs.com/package/vite-plugin-google-apps-script)
[![License][license-src]][license-href]

Vite plugin for HtmlService on GoogleAppsScript via @google/clasp.

## Installation

You'll first need to install packages like this:

```
$ npm i vite vite-plugin-singlefile @google/clasp vue @types/google-apps-script terser --save-dev
```

Next, install `vite-plugin-google-apps-script`:

```
$ npm install vite-plugin-google-apps-script --save-dev
```

## Usage

```ts: vite.config.ts
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { gas } from 'vite-plugin-google-apps-script';

export default defineConfig({
  plugins: [viteSingleFile(), gas()],
  build: {
    outDir: 'dist',
  },
});
```

[license-src]: https://img.shields.io/github/license/luthpg/vite-plugin-google-apps-script?style=flat&logoColor=020420&color=00DC82
[license-href]: https://github.com/luthpg/vite-plugin-google-apps-script