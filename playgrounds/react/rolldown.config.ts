import { defineConfig } from "rolldown";
import { removeExportPlugin } from 'rolldown-plugin-remove-export';

export default defineConfig({
  plugins: [removeExportPlugin("index.js")],
  output: {
    file: "dist/index.js",
    format: "esm",
  },
  input: 'server/index.ts',
});