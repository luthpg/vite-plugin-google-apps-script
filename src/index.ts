import type { OutputChunk } from 'rollup';
import type { PluginOption } from 'vite';
interface ReplaceRule {
  from: string | RegExp;
  to: string;
}
const PRESET_REPLACE_MASTER: Array<ReplaceRule> = [
  {
    from: /\=`https:\/\/vuejs\.org\/errors\/#runtime-\$\{(.+?)\}`/g,
    to: '=$1',
  },
  {
    from: /\=`https:\/\/vuejs\.org\/errors{0,1}\-reference\/#runtime-\$\{(.+?)\}`/g,
    to: '=$1',
  },
  // for scriptlet of apps script
  {
    from: /"(\<\?\!{0,1}\={0,1}.+?\?\>)"/g,
    to: "'$1'",
  },
];

const vueOnGasPlugin = (
  replaceMaster: Array<ReplaceRule> = PRESET_REPLACE_MASTER,
): PluginOption => {
  return {
    name: 'vue-on-gas',
    apply: 'build',
    generateBundle(_outputOptions, outputBundle) {
      console.info();
      const chunkNames = Object.keys(outputBundle);
      chunkNames.forEach((chunkName) => {
        const chunk = outputBundle[chunkName] as OutputChunk;
        replaceMaster.forEach(({ from, to }) => {
          const isMatch =
            typeof from === 'string'
              ? chunk.code.indexOf(from) !== -1
              : from.test(chunk.code);
          if (isMatch) {
            console.info(
              `[Vue on GoogleAppsScript plugin] match with pattern: ${from.toString()}`,
            );
            chunk.code = chunk.code.replace(from, to);
          }
        });
        outputBundle[chunkName] = chunk;
      });
    },
  };
};

export default vueOnGasPlugin;
