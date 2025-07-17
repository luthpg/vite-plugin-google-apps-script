import type {
  NormalizedOutputOptions,
  OutputBundle,
  OutputChunk,
} from 'rollup';
import type { Plugin } from 'vite';
import { gas, presetReplaceRules } from './../src/index';

describe('create plugin', () => {
  it('正常にプラグインが生成されること', () => {
    const plugin = gas() as Plugin;
    expect(plugin.name).toBe('vite:google-apps-script');
    expect(plugin.generateBundle).not.toBeUndefined();
    expect(plugin.generateBundle).toBeTypeOf('function');
    expect(plugin.apply).toBe('build');
  });
});

describe('default rules', () => {
  it('正常に置換処理がされること', () => {
    const beforeHtml = `
/**
 * jsDoc comment
 */
const a = "<?!= value ?>";
const b = \`visit http://example.com for info\`;
`;
    const afterHtml = `const a = '<?!= value ?>';
const b = \`visit  for info\`;
`;
    let result = beforeHtml;
    presetReplaceRules.forEach(({ from, to, replacer }) => {
      if (replacer != null) result = result.replace(from, replacer);
      else if (to != null) result = result.replace(from, to);
    });
    expect(result).toBe(afterHtml);
  });

  it('generateBundleメソッドが正しく動作すること', () => {
    const plugin = gas() as Plugin;
    const mockOutputBundle = {
      'chunk1.js': { code: 'const a = "value";' },
    } as unknown as OutputBundle;
    const mockOutputOptions = {} as NormalizedOutputOptions;

    plugin.generateBundle != null &&
      typeof plugin.generateBundle === 'function' &&
      plugin.generateBundle.call(
        plugin as any,
        mockOutputOptions,
        mockOutputBundle,
        true,
      );

    expect((mockOutputBundle['chunk1.js'] as OutputChunk).code).toBe(
      'const a = "value";',
    );
  });

  it('generateBundleメソッドが置換ルールを適用すること', () => {
    const plugin = gas() as Plugin;
    const mockOutputBundle = {
      'chunk1.js': { code: 'const a = "<?!= value ?>";' },
    } as unknown as OutputBundle;
    const mockOutputOptions = {} as NormalizedOutputOptions;

    plugin.generateBundle != null &&
      typeof plugin.generateBundle === 'function' &&
      plugin.generateBundle.call(
        plugin as any,
        mockOutputOptions,
        mockOutputBundle,
        true,
      );

    expect((mockOutputBundle['chunk1.js'] as OutputChunk).code).toBe(
      "const a = '<?!= value ?>';",
    );
  });
});
