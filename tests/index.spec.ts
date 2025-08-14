import type { Plugin, PluginOption } from 'vite';
import { gas, type Options } from '../src/index';
import { enforceTerser } from '../src/modules/enforceTerser';
import {
  presetReplaceRules,
  replaceParticularExpression,
} from '../src/modules/replaceParticularExpression';
import { stripUrlsInTemplates } from '../src/modules/stripUrlsInTemplates';

describe('gas plugin', () => {
  it('デフォルトオプションでプラグイン配列が生成されること', () => {
    const plugins = gas() as PluginOption[];
    expect(Array.isArray(plugins)).toBe(true);
    expect(plugins).toHaveLength(3);

    // enforceTerserプラグイン
    expect(plugins[0]).toHaveProperty('name', 'vite:enforce-terser');
    expect(plugins[0]).toHaveProperty('apply', 'build');

    // stripUrlsInTemplatesプラグイン
    expect(plugins[1]).toHaveProperty('name', 'vite:strip-urls-in-templates');
    expect(plugins[1]).toHaveProperty('apply', 'build');

    // replaceParticularExpressionプラグイン
    expect(plugins[2]).toHaveProperty(
      'name',
      'vite:replace-particular-expression',
    );
    expect(plugins[2]).toHaveProperty('apply', 'build');
    expect(plugins[2]).toHaveProperty('enforce', 'post');
  });

  it('カスタムオプションでプラグインが生成されること', () => {
    const options: Options = {
      minify: { useTerserMinify: false },
      url: { urlPattern: /custom-pattern/ },
      replace: { useDefault: false, replaceRules: [] },
    };

    const plugins = gas(options) as PluginOption[];
    expect(Array.isArray(plugins)).toBe(true);
    expect(plugins).toHaveLength(3);
  });
});

describe('enforceTerser plugin', () => {
  it('プラグインが正しく生成されること', () => {
    const plugin = enforceTerser() as Plugin;
    expect(plugin.name).toBe('vite:enforce-terser');
    expect(plugin.apply).toBe('build');
    expect(plugin.config).toBeDefined();
  });

  it('オプション付きでプラグインが生成されること', () => {
    const plugin = enforceTerser({ useTerserMinify: false }) as Plugin;
    expect(plugin.name).toBe('vite:enforce-terser');
    expect(plugin.apply).toBe('build');
    expect(plugin.config).toBeDefined();
  });
});

describe('stripUrlsInTemplates plugin', () => {
  it('プラグインが正しく生成されること', () => {
    const plugin = stripUrlsInTemplates() as Plugin;
    expect(plugin.name).toBe('vite:strip-urls-in-templates');
    expect(plugin.apply).toBe('build');
    expect(plugin.transform).toBeDefined();
  });

  it('オプション付きでプラグインが生成されること', () => {
    const plugin = stripUrlsInTemplates({
      urlPattern: /custom-pattern/,
    }) as Plugin;
    expect(plugin.name).toBe('vite:strip-urls-in-templates');
    expect(plugin.apply).toBe('build');
    expect(plugin.transform).toBeDefined();
  });
});

describe('replaceParticularExpression plugin', () => {
  it('プラグインが正しく生成されること', () => {
    const plugin = replaceParticularExpression() as Plugin;
    expect(plugin.name).toBe('vite:replace-particular-expression');
    expect(plugin.apply).toBe('build');
    expect(plugin.enforce).toBe('post');
    expect(plugin.generateBundle).toBeDefined();
  });

  it('オプション付きでプラグインが生成されること', () => {
    const plugin = replaceParticularExpression({
      useDefault: false,
      replaceRules: [],
    }) as Plugin;
    expect(plugin.name).toBe('vite:replace-particular-expression');
    expect(plugin.apply).toBe('build');
    expect(plugin.enforce).toBe('post');
    expect(plugin.generateBundle).toBeDefined();
  });
});

describe('presetReplaceRules', () => {
  it('jsDocコメントが削除されること', () => {
    const code = `
/**
 * jsDoc comment
 */
const a = "test";
`;
    let result = code;
    presetReplaceRules.forEach(({ from, to, replacer }) => {
      if (replacer != null) result = result.replace(from, replacer);
      else if (to != null) result = result.replace(from, to);
    });
    expect(result).toBe('const a = "test";\n');
  });

  it('スクリプトレットの引用符が変更されること', () => {
    const code = 'const a = "<?!= value ?>";';
    let result = code;
    presetReplaceRules.forEach(({ from, to, replacer }) => {
      if (replacer != null) result = result.replace(from, replacer);
      else if (to != null) result = result.replace(from, to);
    });
    expect(result).toBe("const a = '<?!= value ?>';");
  });
});
