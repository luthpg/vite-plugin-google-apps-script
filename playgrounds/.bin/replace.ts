import fs from 'node:fs';
import path from 'node:path';

const FILE_EXTENSION = /\.mjs$/;
const TARGET_DIR = './dist/server';
const REPLACE_MASTER: Array<{ from: RegExp | string; to: string }> = [
  {
    from: /\nexport \{.+?\}\;/g,
    to: '',
  },
];

export const walkDir = (
  dir: string,
  callback: (err: NodeJS.ErrnoException | null, result: string[]) => void,
): void => {
  let result: string[] = [];
  fs.readdir(dir, (err, list) => {
    if (err != null) throw err;
    let pending = list.length;
    if (pending === 0) {
      callback(null, result);
      return;
    }
    list.forEach((f) => {
      const joined = path.join(dir, f);
      fs.stat(joined, (err, stats) => {
        if (err != null) throw err;
        if (stats?.isDirectory()) {
          walkDir(joined, (err, res) => {
            if (err != null) throw err;
            result = result.concat(res);
            if (--pending === 0) callback(null, result);
          });
        } else {
          result.push(joined);
          if (--pending === 0) callback(null, result);
        }
      });
    });
  });
};

export const replaceContent = (dir: string): void => {
  walkDir(dir, (_err, path) => {
    const filterItems = path.filter((value) => value.match(FILE_EXTENSION));
    filterItems.forEach((filterItem) => {
      fs.readFile(filterItem, 'utf-8', (err, data) => {
        let newVal: string = data;
        if (err) throw err;
        REPLACE_MASTER.forEach(({ from, to }) => {
          const isMatch =
            typeof from === 'string'
              ? newVal.indexOf(from) !== -1
              : from.test(newVal);
          if (isMatch) {
            console.info(`match with pattern: ${from.toString()}`);
            newVal = newVal.replace(from, to);
          }
        });
        fs.writeFile(filterItem, newVal, (err) => {
          if (err) throw err;
          console.log(`\n${filterItem} has been replaced.`);
        });
      });
    });
  });
};

replaceContent(TARGET_DIR);
