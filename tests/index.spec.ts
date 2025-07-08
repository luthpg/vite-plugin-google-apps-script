import type { Plugin } from 'vite';
import { gas, PRESET_REPLACE_MASTER } from './../src/index';

describe('create plugin', () => {
  it('正常にプラグインが生成されること', () => {
    const plugin = gas() as Plugin;
    expect(plugin.name).toBe('gas-html-service');
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
const b = \`line1
line2\`;
const b_plus = "\\\`not target\\\`";
const c = \`visit http://example.com for info\`;
`;
    const afterHtml = `

const a = '<?!= value ?>';
const b = \`line1\\nline2\`;
const b_plus = "\\\`not target\\\`";
const c = \`visit  for info\`;
`;
    let result = beforeHtml;
    PRESET_REPLACE_MASTER.forEach(({ from, to, replacer }) => {
      if (replacer != null) result = result.replace(from, replacer);
      else if (to != null) result = result.replace(from, to);
    });
    expect(result).toBe(afterHtml);
  });
});
