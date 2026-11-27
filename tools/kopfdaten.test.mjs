import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseKopfdaten } from './lib/kopfdaten.mjs';

test('liest flache Felder', () => {
  const r = parseKopfdaten('---\nstatus: vorgeschlagen\nstufe: 1\n---\n# T');
  assert.equal(r.daten.status, 'vorgeschlagen');
  assert.equal(r.daten.stufe, '1');
  assert.equal(r.rumpf, '# T');
});

test('liest CRLF', () => {
  const r = parseKopfdaten('---\r\nstatus: vorgeschlagen\r\nstufe: 1\r\n---\r\n# T');
  assert.equal(r.daten.status, 'vorgeschlagen');
  assert.equal(r.daten.stufe, '1');
  assert.equal(r.rumpf, '# T');
});

test('liest Umlautschlüssel und leere Werte', () => {
  const r = parseKopfdaten('---\nbestätigt_von:\nstatus: offen\n---\n');
  assert.equal(r.daten['bestätigt_von'], '');
  assert.equal(r.daten.status, 'offen');
});

test('liest Listen in beiden Formen', () => {
  const a = parseKopfdaten('---\nquellen: [../quellen/a.md, ../quellen/b.md]\n---\n');
  assert.deepEqual(a.daten.quellen, ['../quellen/a.md', '../quellen/b.md']);
  const b = parseKopfdaten('---\nquellen:\n  - ../quellen/a.md\n  - ../quellen/b.md\n---\n');
  assert.deepEqual(b.daten.quellen, ['../quellen/a.md', '../quellen/b.md']);
  const c = parseKopfdaten('---\nquellen: []\n---\n');
  assert.deepEqual(c.daten.quellen, []);
});

test('entfernt Kommentare', () => {
  const r = parseKopfdaten('---\nstufe: 1            # Hinweis\n---\n');
  assert.equal(r.daten.stufe, '1');
});

test('ohne Kopfdaten', () => {
  assert.equal(parseKopfdaten('# Titel'), null);
});

test('entfernt Anführungszeichen um Werte und Listeneinträge', () => {
  const r = parseKopfdaten(`---\nstatus: "vorgeschlagen"\nbestätigt_am: '27.11.2026'\nleer: ""\nblank: "  "\nquellen: ["../quellen/a.md", '../quellen/b.md']\n---\n`);
  assert.equal(r.daten.status, 'vorgeschlagen');
  assert.equal(r.daten['bestätigt_am'], '27.11.2026');
  assert.equal(r.daten.leer, '');
  assert.equal(r.daten.blank, '');
  assert.deepEqual(r.daten.quellen, ['../quellen/a.md', '../quellen/b.md']);
});
