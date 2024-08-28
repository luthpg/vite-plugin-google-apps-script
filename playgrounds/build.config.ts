import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['server/index.ts'],
  outDir: 'dist',
  clean: false,
});
