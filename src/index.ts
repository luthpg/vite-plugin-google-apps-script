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

export const PRESET_REPLACE_MASTER: Array<ReplaceRule> = [
  // for jsDoc comments
  {
    from: /\/\*\*[\n\s\S]+?\*\//g,
    to: '',
  },
  // for scriptlet of apps script
  {
    from: /"(<\?!{0,1}={0,1}.+?\?>)"/g,
    to: "'$1'",
  },
  // for template-literals with return value
  {
    from: /`([\n\s\S]+?)`/gm,
    replacer(match, innerContent) {
      if (!/\n/.test(innerContent)) {
        return match;
      }
      const newInnerContent = innerContent.replace(/\n/g, '\\n');
      return `\`${newInnerContent}\``;
    },
  },
  // for template-literals with urls
  {
    from: /`([\n\s\S]+?)`/gm,
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

export type GasPluginOption =
  | {
      replaceMaster?: Array<ReplaceRule>;
      useDefault?: true;
    }
  | {
      replaceMaster: Array<ReplaceRule>;
      useDefault: false;
    };

export const gas = (options?: GasPluginOption): PluginOption => {
  return {
    name: 'gas-html-service',
    apply: 'build',
    generateBundle(_outputOptions, outputBundle) {
      console.info();
      const chunkNames = Object.keys(outputBundle);
      chunkNames.forEach((chunkName) => {
        const chunk = outputBundle[chunkName] as OutputChunk;
        const configs = [...(options?.replaceMaster ?? [])];
        options?.useDefault !== false && configs.push(...PRESET_REPLACE_MASTER);
        configs.forEach(({ from, to, replacer }) => {
          const isMatch =
            typeof from === 'string'
              ? chunk.code.indexOf(from) !== -1
              : from.test(chunk.code);
          if (isMatch) {
            console.info(
              `[Vue on GoogleAppsScript plugin] match with pattern: ${from.toString()}`,
            );
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
