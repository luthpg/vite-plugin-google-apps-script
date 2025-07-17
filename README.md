# vite-plugin-google-apps-script

[![npm version](https://badge.fury.io/js/vite-plugin-google-apps-script.svg)](https://www.npmjs.com/package/vite-plugin-google-apps-script)
[![License][license-src]][license-href]

Vite plugin for HtmlService on GoogleAppsScript via @google/clasp.

## What this plugin does

This plugin performs the following operations during the build process:

- **Minification with Terser**: Overrides the build minification to use `terser` instead of `esbuild` (because `esbuild` use return-value instead of `\n` in template literals)
- **AppsScript Deployment Optimization**: Removes or modifies expressions that may affect GoogleAppsScript deployment:
  - Removes JSDoc comments
  - Escapes scriptlets in strings by converting double quotes to single quotes
  - Removes URLs from template literals
- **Configurable Options**: All operations can be customized or disabled through plugin options

## Installation

You'll first need to install packages like this:

```bash
npm i vite vite-plugin-singlefile @google/clasp vue @types/google-apps-script terser --save-dev
```

Next, install `vite-plugin-google-apps-script`:

```bash
npm install vite-plugin-google-apps-script --save-dev
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
