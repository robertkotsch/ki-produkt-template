import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lint } from './lint.mjs';
import { erzeugeProjekt, seite } from './testhilfe.mjs';

const ohneR7 = (befunde) => befunde.filter((b) => b.regel !== 'R7-quellen');
const nur = (befunde, regel) => befunde.filter((b) => b.regel === regel);

test('R1 meldet Seite ohne Kopfdaten', async () => {
  const root = erzeugeProjekt({ 'wiki/index.md': '[a](a.md)\n', 'wiki/a.md': '# A' });
  const b = nur(await lint(root), 'R1-kopfdaten');
  assert.equal(b.length, 1);
  assert.equal(b[0].stufe, 'FEHLER');
  assert.equal(b[0].datei, 'wiki/a.md');
});

test('R1 meldet unbekannten Status', async () => {
  const root = erzeugeProjekt({ 'wiki/index.md': '[a](a.md)\n', 'wiki/a.md': seite({ status: 'fertig' }) });
  assert.equal(nur(await lint(root), 'R1-kopfdaten').length, 1);
});

test('R1 ignoriert index, log, entscheidungen/README', async () => {
  const root = erzeugeProjekt({
    'wiki/index.md': '# Index\n',
    'wiki/log.md': '# Log\n',
    'wiki/entscheidungen/README.md': '# Format\n',
  });
  assert.deepEqual(ohneR7(await lint(root)), []);
});

test('Pfade mit Schrägstrich', async () => {
  const root = erzeugeProjekt({
    'wiki/index.md': '[x](entscheidungen/001-x.md)\n',
    'wiki/entscheidungen/001-x.md': '# ohne Kopfdaten',
  });
  const b = nur(await lint(root), 'R1-kopfdaten');
  assert.equal(b.length, 1);
  assert.equal(b[0].datei, 'wiki/entscheidungen/001-x.md');
  assert.ok(!b[0].datei.includes('\\'));
});
