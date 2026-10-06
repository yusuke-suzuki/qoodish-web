import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const ROOT = join(import.meta.dirname, '..');

// Controls that show an icon alone. Each opening tag has to carry a name a
// screen reader can announce and a tooltip a touch device can show, unless
// it renders a visible label of its own.
const ICON_ONLY_CONTROLS = ['IconButton', 'BottomNavigationAction', 'Fab'];

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      return listSourceFiles(path);
    }

    return entry.name.endsWith('.tsx') ? [path] : [];
  });
}

// A `>` inside a brace expression such as an arrow function does not close
// the tag, so the scan walks the text rather than matching a regex.
function openingTags(source: string, component: string): string[] {
  const tags: string[] = [];
  const start = new RegExp(`<${component}\\b`, 'g');

  for (const match of Array.from(source.matchAll(start))) {
    let depth = 0;

    for (let i = match.index; i < source.length; i++) {
      const char = source[i];

      if (char === '{') {
        depth += 1;
      } else if (char === '}') {
        depth -= 1;
      } else if (char === '>' && depth === 0) {
        tags.push(source.slice(match.index, i + 1));
        break;
      }
    }
  }

  return tags;
}

function hasAccessibleName(tag: string): boolean {
  return (
    /\saria-label(ledby)?=/.test(tag) ||
    /\stitle=/.test(tag) ||
    /\slabel=/.test(tag) ||
    /variant="extended"/.test(tag)
  );
}

describe('icon-only controls', () => {
  for (const file of listSourceFiles(ROOT)) {
    const source = readFileSync(file, 'utf8');

    for (const component of ICON_ONLY_CONTROLS) {
      for (const tag of openingTags(source, component)) {
        it(`${file.slice(ROOT.length + 1)}: ${tag.split('\n')[0]}`, () => {
          assert.ok(
            hasAccessibleName(tag),
            `${component} needs aria-label, title or label:\n${tag}`
          );
        });
      }
    }
  }
});
