import type { Plugin } from 'vite';
import { vueOnGas } from './../src/index';

describe('create plugin', () => {
  it('正常にプラグインが生成されること', () => {
    const plugin = vueOnGas() as Plugin;
    expect(plugin.name).toBe('vue-on-gas');
    expect(plugin.generateBundle).not.toBeUndefined();
    expect(plugin.generateBundle).toBeTypeOf('function');
    expect(plugin.apply).toBe('build');
  });
});
