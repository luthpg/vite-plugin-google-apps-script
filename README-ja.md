# vite-plugin-google-apps-script

[![npm version](https://badge.fury.io/js/vite-plugin-google-apps-script.svg)](https://www.npmjs.com/package/vite-plugin-google-apps-script)
[![License][license-src]][license-href]

GoogleAppsScriptの`HtmlService`向け Viteプラグイン（`@google/clasp`構成用）

## このプラグインができること

本プラグインは、ビルド時に以下の処理を行います:

- **Terserによる圧縮設定**: テンプレートリテラル内の改行を維持するため、`esbuild`ではなく`terser`を使って圧縮
- **GoogleAppsScriptでのデプロイのための最適化**: GoogleAppsScriptへのデプロイ時に影響する可能性のある表現を削除・修正:
  - JSDocコメントの削除
  - 文字列内スクリプトレットのエスケープ（ダブルクォート→シングルクォート）
  - テンプレートリテラル内のURL削除
- **柔軟なオプション設定**: すべての処理はプラグインオプションでカスタマイズ・無効化可能

## インストール

まず、以下の関連パッケージをインストールしてください:

```bash
npm i vite vite-plugin-singlefile @google/clasp @types/google-apps-script --save-dev
```

次に、本プラグインを追加します:

```bash
npm install vite-plugin-google-apps-script --save-dev
```

## 使い方

```ts: vite.config.ts
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { gas } from 'vite-plugin-google-apps-script';

export default defineConfig({
  plugins: [gas(), viteSingleFile()], // `gas()` を `viteSingleFile()` より先に追加すること
  build: {
    outDir: 'dist',
  },
});
```

- オプション設定例

```ts: vite.config.ts
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { gas } from 'vite-plugin-google-apps-script';

export default defineConfig({
  plugins: [
    gas({
      useDefault: false, // デフォルトのreplaceRulesを無効化
      replaceRules: [ // 独自のreplaceRulesを追加可能
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
      useTerserMinify: false, // JavaScriptをminifyしない（他の設定より優先されます）
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
