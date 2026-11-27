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

// ---------- R2 und R3 ----------

const mitIndex = (seiten) => ({
  'wiki/index.md': Object.keys(seiten).map((p) => `[x](${p.replace('wiki/', '')})`).join('\n'),
  ...seiten,
});

test('R2 bestätigt ohne bestätigt_von', async () => {
  const root = erzeugeProjekt(mitIndex({ 'wiki/a.md': seite({ status: 'bestätigt', 'bestätigt_am': '27.11.2026' }) }));
  assert.equal(nur(await lint(root), 'R2-pflichtfelder').length, 1);
});

test('R2 bestätigt_von nur Leerzeichen gilt als fehlend', async () => {
  const root = erzeugeProjekt(mitIndex({
    'wiki/a.md': seite({ status: 'bestätigt', 'bestätigt_von': '  ', 'bestätigt_am': '27.11.2026' }),
  }));
  assert.equal(nur(await lint(root), 'R2-pflichtfelder').length, 1);
});

test('R2 bestätigt vollständig', async () => {
  const root = erzeugeProjekt(mitIndex({
    'wiki/a.md': seite({ status: 'bestätigt', 'bestätigt_von': 'Erika Muster · Fachbereich', 'bestätigt_am': '27.11.2026' }),
  }));
  assert.deepEqual(nur(await lint(root), 'R2-pflichtfelder'), []);
});

test('R2 bestätigt_am falsches Format', async () => {
  const root = erzeugeProjekt(mitIndex({
    'wiki/a.md': seite({ status: 'bestätigt', 'bestätigt_von': 'Erika Muster', 'bestätigt_am': '2026-11-27' }),
  }));
  assert.equal(nur(await lint(root), 'R2-pflichtfelder').length, 1);
});

test('R2 geprüft ohne geprüft_am_stand und nachweis', async () => {
  const root = erzeugeProjekt(mitIndex({
    'wiki/a.md': seite({ status: 'geprüft', 'bestätigt_von': 'Erika Muster', 'bestätigt_am': '27.11.2026' }),
  }));
  assert.equal(nur(await lint(root), 'R2-pflichtfelder').length, 2);
});

test('R3 nachweis zeigt ins Leere', async () => {
  const root = erzeugeProjekt(mitIndex({
    'wiki/a.md': seite({
      status: 'geprüft', 'bestätigt_von': 'E', 'bestätigt_am': '27.11.2026',
      'geprüft_am_stand': 'abc123', nachweis: '../nachweise/fehlt.md',
    }),
  }));
  assert.equal(nur(await lint(root), 'R3-verweis').length, 1);
});

test('R3 vorhandener nachweis', async () => {
  const root = erzeugeProjekt({
    ...mitIndex({
      'wiki/a.md': seite({
        status: 'geprüft', 'bestätigt_von': 'E', 'bestätigt_am': '27.11.2026',
        'geprüft_am_stand': 'abc123', nachweis: '../nachweise/2026-11-27-test.md',
      }),
    }),
    'nachweise/2026-11-27-test.md': '# Test\n',
  });
  assert.deepEqual(nur(await lint(root), 'R3-verweis'), []);
});

test('R3 quellen-Eintrag fehlt', async () => {
  const root = erzeugeProjekt({
    ...mitIndex({ 'wiki/a.md': seite({ status: 'vorgeschlagen', quellen: '[../quellen/da.md, ../quellen/fehlt.md]' }) }),
    'quellen/da.md': '# da\n',
  });
  const b = nur(await lint(root), 'R3-verweis');
  assert.equal(b.length, 1);
  assert.match(b[0].grund, /fehlt\.md/);
});
