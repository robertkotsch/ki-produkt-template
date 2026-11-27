import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relativeLinks } from './lib/dateien.mjs';

test('extrahiert relative Links', () => {
  const md = '[a](x.md) [b](https://e.de) [c](#k) [d](y.md#abs) [e](mit%20leer.md) [f](mailto:a@b.de)';
  assert.deepEqual(relativeLinks(md), ['x.md', 'y.md', 'mit leer.md']);
});

test('ignoriert Codeblöcke und Inline-Code', () => {
  const md = '```\n[a](z.md)\n```\nText `[b](w.md)` Ende\n~~~\n[c](v.md)\n~~~\n';
  assert.deepEqual(relativeLinks(md), []);
});

test('Bildlinks und Links mit Titel', () => {
  assert.deepEqual(relativeLinks('![bild](bild.png) [t](a.md "Titel")'), ['bild.png', 'a.md']);
});
