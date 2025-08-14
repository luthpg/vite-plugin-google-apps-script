# vite-plugin-google-apps-script

[![npm version](https://badge.fury.io/js/vite-plugin-google-apps-script.svg)](https://www.npmjs.com/package/vite-plugin-google-apps-script)
[![License][license-src]][license-href]

A Vite plugin for HtmlService on GoogleAppsScript via @google/clasp.

## What this plugin does

This plugin performs the following operations during the build process:

- **Minification with Terser**: Replaces the default minifier (`esbuild`) with `terser` to preserve newlines in template literals, as `esbuild` uses return values instead of \n.
- **URL Stripping in Templates**: Removes URLs from template literals to prevent issues with GoogleAppsScript deployment.
- **Code Pattern Replacement**: Removes or modifies code patterns that may cause issues when deploying to GoogleAppsScript:
  - Removes JSDoc comments
  - Escapes scriptlets in strings by converting double quotes to single quotes
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

### Configuration Options

The plugin accepts the following options:

```ts: vite.config.ts
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { gas } from 'vite-plugin-google-apps-script';

export default defineConfig({
  plugins: [
    gas({
      // Terser minification options
      minify: {
        useTerserMinify: true, // Default: true
      },
      
      // URL stripping options
      url: {
        includes: [/\.([cm]?js|[cm]?ts|jsx|tsx)$/], // Default: JS/TS files
        excludes: [], // Files to exclude
        urlPattern: /\b(?:https?:\/\/|ftp:\/\/|blob:|data:[^'")\s]+|\/\/)[\w/:%#$&?()~.=+\-{}]+/gi, // Default URL regex
        parserPlugins: ['jsx', 'typescript'], // Babel parser plugins
      },
      
      // Code replacement options
      replace: {
        useDefault: true, // Use default replacement rules
        replaceRules: [ // Custom replacement rules
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
      },
    }),
    viteSingleFile(),
  ],
  build: {
    outDir: 'dist',
  },
});
```

### Default Replacement Rules

The plugin includes default replacement rules that handle common GoogleAppsScript deployment issues:

- **JSDoc Comments**: Removes JSDoc comments (`/** ... */`)
- **Scriptlet Escaping**: Escapes scriptlets in strings by converting double quotes to single quotes

You can disable these defaults by setting `replace.useDefault: false` and providing your own `replaceRules`.

[license-src]: https://img.shields.io/github/license/luthpg/vite-plugin-google-apps-script?style=flat&logoColor=020420&color=00DC82
[license-href]: https://github.com/luthpg/vite-plugin-google-apps-script
