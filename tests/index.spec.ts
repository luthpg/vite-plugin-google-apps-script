import type { Plugin } from 'vite';
import { vuOnGas } from './../src/index';

describe('create plugin', () => {
  it('正常にプラグインが生成されること', () => {
    const plugin = vuOnGas() as Plugin;
    expect(plugin.name).toBe('vue-on-gas');
    expect(plugin.generateBundle).not.toBeUndefined();
    expect(plugin.generateBundle).toBeTypeOf('function');
    expect(plugin.apply).toBe('build');
  });
});
