import type { OutputChunk } from 'rollup';
import type { PluginOption } from 'vite';

export type ReplaceRule =
  | {
      from: string | RegExp;
      to?: string;
      replacer?: (substring: string, ...args: any[]) => string;
    }
  | {
      from: string | RegExp;
      to: string;
      replacer?: never;
    }
  | {
      from: string | RegExp;
      to?: never;
      replacer: (substring: string, ...args: any[]) => string;
    };

export const presetReplaceRules: Array<ReplaceRule> = [
  // for jsDoc comments
  {
    from: /\n*\/\*\*[\n\s\S]*?\*\/\n*/g,
    to: '',
  },
  // for scriptlet of apps script
  {
    from: /"(<\?!{0,1}={0,1}.+?\?>)"/g,
    to: "'$1'",
  },
  // for template-literals with urls
  {
    from: /(?<!\\)`([\n\s\S]+?)(?<!\\)`/gm,
    replacer(match, innerContent) {
      if (!/http.+/.test(innerContent)) {
        return match;
      }
      const newInnerContent = innerContent
        .replace(/https*:\/\/\S+?$/g, '')
        .replace(/https*:\/\/\S+?(\s+[\s\S]*)$/g, '$1');
      return `\`${newInnerContent}\``;
    },
  },
];

export type Options =
  | {
      replaceRules?: Array<ReplaceRule>;
      useDefault?: true;
      useTerserMinify?: boolean;
    }
  | {
      replaceRules: Array<ReplaceRule>;
      useDefault: false;
      useTerserMinify?: boolean;
    };

const defaultOptions: Required<Options> = {
  useDefault: true,
  useTerserMinify: true,
  replaceRules: [],
};

const pluginName = 'vite:google-apps-script';

export const gas = (options?: Options): PluginOption => {
  const mergedOptions: Required<Options> = { ...defaultOptions, ...options };
  return {
    name: pluginName,
    apply: 'build',
    enforce: 'post',
    config(config) {
      if (config.build == null) config.build = {};
      if (config.build.minify === 'esbuild') {
        this.warn(
          `[plugin ${pluginName}] The plugin will override the "esbuild" minify option to use "terser" or disable minification.`,
        );
      }
      config.build.minify = mergedOptions.useTerserMinify ? 'terser' : false;
    },
    generateBundle(_outputOptions, outputBundle) {
      const chunkNames = Object.keys(outputBundle);
      chunkNames.forEach((chunkName) => {
        const chunk = outputBundle[chunkName] as OutputChunk;
        const configs = [...mergedOptions.replaceRules];
        mergedOptions.useDefault !== false &&
          configs.push(...presetReplaceRules);
        configs.forEach(({ from, to, replacer }) => {
          const isMatch =
            typeof from === 'string'
              ? chunk.code.indexOf(from) !== -1
              : from.test(chunk.code);
          if (isMatch) {
            if (replacer != null)
              chunk.code = chunk.code.replace(from, replacer);
            else if (to != null) chunk.code = chunk.code.replace(from, to);
          }
        });
        outputBundle[chunkName] = chunk;
      });
    },
  };
};
