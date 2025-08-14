import { generate } from '@babel/generator';
import { type ParseResult, type ParserPlugin, parse } from '@babel/parser';
import { default as _traverse, type NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import type { Plugin } from 'vite';
import { createFilter } from 'vite';

// @ts-expect-error `@babel/traverse` is CJS script
const traverse = _traverse.default;

type UrlPattern = RegExp | ((s: string) => string);

export type Options = {
  includes?: Array<string | RegExp> | string | RegExp;
  excludes?: Array<string | RegExp> | string | RegExp;
  /**
   * Replace URL-like substrings with empty string.
   * - if RegExp: all matches are replaced with ''.
   * - If function: receives the original string and returns the sanitized string.
   */
  urlPattern?: UrlPattern;
  /** Parser options for Babel */
  parserPlugins?: ParserPlugin[];
};

const DEFAULT_URL_REGEX =
  /\b(?:https?:\/\/|ftp:\/\/|blob:|data:[^'")\s]+|\/\/)[\w/:%#$&?()~.=+\-{}]+/gi;

function sanitizeString(input: string, pattern?: UrlPattern): string {
  if (!pattern) return input.replace(DEFAULT_URL_REGEX, '');
  if (pattern instanceof RegExp) return input.replace(pattern, '');
  return pattern(input);
}

function toTemplateRaw(cooked: string): string {
  return cooked
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

export function stripUrlsInTemplates(options: Options = {}): Plugin {
  const {
    includes = [/\.([cm]?js|[cm]?ts|jsx|tsx)$/],
    excludes,
    urlPattern,
    parserPlugins = ['jsx', 'typescript'],
  } = options;

  const filter = createFilter(includes, excludes);

  return {
    name: 'vite:strip-urls-in-templates',
    apply: 'build',
    transform(code, id, _options) {
      if (!filter(id)) return null;

      let ast: ParseResult<t.File>;
      try {
        ast = parse(code, {
          sourceType: 'module',
          plugins: parserPlugins,
          allowReturnOutsideFunction: true,
          allowAwaitOutsideFunction: true,
        });
      } catch {
        return null;
      }

      let templateDepth = 0;
      let mutated = false;

      const enterTemplate = () => {
        templateDepth += 1;
      };
      const exitTemplate = () => {
        templateDepth -= 1;
      };
      traverse(ast, {
        TemplateLiteral: {
          enter(path: NodePath<t.TemplateLiteral>) {
            enterTemplate();

            for (const elem of path.node.quasis) {
              const cooked = elem.value.cooked ?? elem.value.raw;
              const sanitized = sanitizeString(String(cooked), urlPattern);
              if (sanitized !== cooked) {
                mutated = true;
                elem.value.cooked = sanitized;
                elem.value.raw = toTemplateRaw(sanitized);
              }
            }
          },
          exit() {
            exitTemplate();
          },
        },

        StringLiteral(path: NodePath<t.StringLiteral>) {
          if (templateDepth <= 0) return;
          const original = path.node.value;
          const sanitized = sanitizeString(original, urlPattern);
          if (sanitized !== original) {
            mutated = true;
            path.node.value = sanitized;
            if (path.node.extra) {
              path.node.extra.raw = JSON.stringify(sanitized);
              path.node.extra.rawValue = sanitized;
            }
          }
        },
      });

      if (!mutated) return null;

      const out = generate(ast, { sourceMaps: true, sourceFileName: id }, code);
      return {
        code: out.code,
        map: out.map || null,
      };
    },
  };
}
