import {
  type Options as EnforceTerserOptions,
  enforceTerser,
} from './modules/enforceTerser';
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
};

export const gas = ({ minify, url, replace }: Options = {}): PluginOption => {
  return [
    enforceTerser(minify),
    stripUrlsInTemplates(url),
    replaceParticularExpression(replace),
  ];
};
