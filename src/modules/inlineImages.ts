import fs from 'node:fs/promises';
import sharp from 'sharp';
import type { PluginOption } from 'vite';

export type InlineImagesOptions = {
  enable?: boolean;
  include?: RegExp[];
  /** 最大幅 (これを超える画像は自動リサイズ) */
  maxWidth?: number;
  /** 圧縮品質 (1-100) */
  quality?: number;
};

export function inlineImages(options: InlineImagesOptions = {}): PluginOption {
  const {
    enable = true,
    include = [/\.(png|jpe?g|webp)$/i],
    maxWidth = 1920,
    quality = 80,
  } = options;

  if (!enable) return null;

  return {
    name: 'vite:gas-inline-images',
    apply: 'build',
    async transform(_code, id) {
      if (!include.some((regexp) => regexp.test(id))) return null;

      try {
        const buffer = await fs.readFile(id);
        let pipeline = sharp(buffer);
        const metadata = await pipeline.metadata();

        // 1. 自動リサイズ (maxWidthを超える場合のみ)
        if (metadata.width && metadata.width > maxWidth) {
          pipeline = pipeline.resize({
            width: maxWidth,
            withoutEnlargement: true,
          });
        }

        // 2. WebPに変換して圧縮 (GASで扱うならWebPが最も効率的)
        // もし古いブラウザ対応を重視するなら、元のフォーマットを維持して圧縮
        const { data, info } = await pipeline
          .webp({ quality })
          .toBuffer({ resolveWithObject: true });

        const base64 = data.toString('base64');
        const dataUri = `data:image/webp;base64,${base64}`;

        // 3. SVGラップ (Tailwind等のレスポンシブ指定を安定させるためのviewBox)
        const svg = [
          `<svg`,
          ` xmlns="http://www.w3.org/2000/svg"`,
          ` viewBox="0 0 ${info.width} ${info.height}"`,
          ` width="${info.width}"`,
          ` height="${info.height}"`,
          ` style="max-width: 100%; height: auto; display: block;"`, // Tailwind等のクラスと競合しない基本スタイル
          `>`,
          `<title>${id}</title>`,
          `<image width="100%" height="100%" href="${dataUri}" />`,
          `</svg>`,
        ].join(' ');

        return {
          code: `export default ${JSON.stringify(svg)};`,
          map: null,
        };
      } catch (error) {
        console.warn(error instanceof Error ? error.message : error);
        this.error(`Optimization failed: ${id}`);
      }
    },
  };
}
