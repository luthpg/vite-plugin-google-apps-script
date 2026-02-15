import type { PluginOption } from 'vite';
import {
  type Options as EnforceTerserOptions,
  enforceTerser,
} from './modules/enforceTerser';
import { type InlineImagesOptions, inlineImages } from './modules/inlineImages';
import {
  type Options as ReplaceParticularExpressionOptions,
  replaceParticularExpression,
} from './modules/replaceParticularExpression';
import {
  type Options as StripUrlsOptions,
  stripUrlsInTemplates,
} from './modules/stripUrlsInTemplates';

export type Options = {
  minify?: EnforceTerserOptions;
  url?: StripUrlsOptions;
  replace?: ReplaceParticularExpressionOptions;
  images?: InlineImagesOptions;
};

export const gas = ({
  minify,
  url,
  replace,
  images,
}: Options = {}): PluginOption => {
  return [
    enforceTerser(minify),
    stripUrlsInTemplates(url),
    replaceParticularExpression(replace),
    inlineImages(images),
  ];
};
