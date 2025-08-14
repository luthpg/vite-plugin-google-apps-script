# vite-plugin-google-apps-script

[![npm version](https://badge.fury.io/js/vite-plugin-google-apps-script.svg)](https://www.npmjs.com/package/vite-plugin-google-apps-script)
[![License][license-src]][license-href]

GoogleAppsScriptの`HtmlService`向け Viteプラグイン（`@google/clasp`構成用）

## このプラグインができること

本プラグインは、ビルド時に以下の処理を行います:

- **Terserによる圧縮設定**: テンプレートリテラル内の改行を維持するため、`esbuild`ではなく`terser`を使って圧縮
- **テンプレートリテラル内のURL削除**: GoogleAppsScriptへのデプロイ時に問題を引き起こす可能性のあるURLを削除
- **コードパターンの置換**: GoogleAppsScriptへのデプロイ時に影響する可能性のある表現を削除・修正:
  - JSDocコメントの削除
  - 文字列内スクリプトレットのエスケープ（ダブルクォート→シングルクォート）
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

### 設定オプション

プラグインは以下のオプションを受け付けます:

```ts: vite.config.ts
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { gas } from 'vite-plugin-google-apps-script';

export default defineConfig({
  plugins: [
    gas({
      // Terser圧縮オプション
      minify: {
        useTerserMinify: true, // デフォルト: true
      },
      
      // URL削除オプション
      url: {
        includes: [/\.([cm]?js|[cm]?ts|jsx|tsx)$/], // デフォルト: JS/TSファイル
        excludes: [], // 除外するファイル
        urlPattern: /\b(?:https?:\/\/|ftp:\/\/|blob:|data:[^'")\s]+|\/\/)[\w/:%#$&?()~.=+\-{}]+/gi, // デフォルトのURL正規表現
        parserPlugins: ['jsx', 'typescript'], // Babelパーサープラグイン
      },
      
      // コード置換オプション
      replace: {
        useDefault: true, // デフォルトの置換ルールを使用
        replaceRules: [ // カスタム置換ルール
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

### デフォルトの置換ルール

プラグインには、GoogleAppsScriptデプロイ時の一般的な問題を処理するデフォルトの置換ルールが含まれています:

- **JSDocコメント**: JSDocコメント（`/** ... */`）を削除
- **スクリプトレットのエスケープ**: 文字列内のスクリプトレットをダブルクォートからシングルクォートに変換

これらのデフォルトは `replace.useDefault: false` を設定し、独自の `replaceRules` を提供することで無効化できます。

[license-src]: https://img.shields.io/github/license/luthpg/vite-plugin-google-apps-script?style=flat&logoColor=020420&color=00DC82
[license-href]: https://github.com/luthpg/vite-plugin-google-apps-script
