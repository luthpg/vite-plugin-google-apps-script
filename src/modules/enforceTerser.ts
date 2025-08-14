import type { PluginOption } from 'vite';

export type Options = {
  useTerserMinify?: boolean;
};

export function enforceTerser(
  { useTerserMinify }: Options = { useTerserMinify: true },
): PluginOption {
  return {
    name: 'vite:enforce-terser',
    apply: 'build',
    config(config) {
      if (config.build == null) config.build = {};
      if (config.build.minify === 'esbuild') {
        this.warn(
          `[plugin vite:enforce-terser] The plugin will override the "esbuild" minify option to use "terser" or disable minification.`,
        );
      }
      config.build.minify = useTerserMinify ? 'terser' : false;
    },
  };
}
