# vite-plugin-google-apps-script

[![npm version](https://badge.fury.io/js/vite-plugin-google-apps-script.svg)](https://www.npmjs.com/package/vite-plugin-google-apps-script)
[![License][license-src]][license-href]

A Vite plugin for HtmlService on GoogleAppsScript via @google/clasp.

## What this plugin does

This plugin performs the following operations during the build process:

- **Minification with Terser**: Replaces the default minifier (`esbuild`) with `terser` to preserve newlines in template literals, as `esbuild` uses return values instead of \n.
- **AppsScript Deployment Optimization**: Removes or modifies code patterns that may cause issues when deploying to GoogleAppsScript:
  - Removes JSDoc comments
  - Escapes scriptlets in strings by converting double quotes to single quotes
  - Removes URLs from template literals
- **Configurable Options**: All operations can be customized or disabled via plugin options.

## Installation

First, install the required packages:

```bash
npm i vite vite-plugin-singlefile @google/clasp @types/google-apps-script --save-dev
```

Then, install `vite-plugin-google-apps-script`:

```bash
npm install vite-plugin-google-apps-script --save-dev
```

## Usage

```ts: vite.config.ts
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { gas } from 'vite-plugin-google-apps-script';

export default defineConfig({
  plugins: [gas(), viteSingleFile()], // Make sure to add `gas()` before `viteSingleFile()`
  build: {
    outDir: 'dist',
  },
});
```

...or you can set options:

```ts: vite.config.ts
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { gas } from 'vite-plugin-google-apps-script';

export default defineConfig({
  plugins: [
    gas({
      useDefault: false, // Do not use the package's default replaceRules
      replaceRules: [ // Add your own replaceRules, used in `String.replace(from, replacer ?? to)`
        {
          from: 'https://test.example.com',
          to: '--masked-url--',
        },
        {
          from: /\/\*\*([\s\S]*)\*\//g,
          replacer(match, innerContent) {
            const newInnerContent = innerContent.replace(/\n/g, ' ');
            return `/**${newInnerContent}*/`;
          },
        }
      ],
      useTerserMinify: false, // Do not minify JavaScript code. This option overrides other config settings.
    }),
    viteSingleFile(),
  ],
  build: {
    outDir: 'dist',
  },
});
```

[license-src]: https://img.shields.io/github/license/luthpg/vite-plugin-google-apps-script?style=flat&logoColor=020420&color=00DC82
[license-href]: https://github.com/luthpg/vite-plugin-google-apps-script
