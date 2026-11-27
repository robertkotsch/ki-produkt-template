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

// ---------- R4 und R5 ----------

test('R4 toter Link in wiki, stufen, nachweise, README.md und stufen/archiv', async () => {
  const root = erzeugeProjekt({
    'README.md': '[x](fehlt.md)\n',
    'wiki/index.md': '[x](fehlt.md)\n',
    'stufen/1-ziel/eingang.md': '[x](fehlt.md)\n',
    'stufen/archiv/durchlauf-1/1-ziel/uebergabe.md': '[x](fehlt.md)\n',
    'nachweise/a.md': '[x](fehlt.md)\n',
  });
  const dateien = nur(await lint(root), 'R4-link').map((b) => b.datei).sort();
  assert.deepEqual(dateien, [
    'README.md', 'nachweise/a.md', 'stufen/1-ziel/eingang.md',
    'stufen/archiv/durchlauf-1/1-ziel/uebergabe.md', 'wiki/index.md',
  ]);
});

test('R4 gültiger Link auf Ordner oder Datei', async () => {
  const root = erzeugeProjekt({
    'README.md': '[w](wiki/) [i](wiki/index.md) [q](quellen)\n',
    'wiki/index.md': '# Index\n',
    'quellen/README.md': '# Quellen\n',
  });
  assert.deepEqual(nur(await lint(root), 'R4-link'), []);
});

test('R5 Seite fehlt im Index', async () => {
  const root = erzeugeProjekt({ 'wiki/index.md': '# Index\n', 'wiki/a.md': seite({ status: 'offen' }) });
  const b = nur(await lint(root), 'R5-index');
  assert.equal(b.length, 1);
  assert.equal(b[0].datei, 'wiki/a.md');
});

test('R5 Index nennt fehlende Seite', async () => {
  const root = erzeugeProjekt({ 'wiki/index.md': '[a](a.md)\n' });
  const b = nur(await lint(root), 'R5-index');
  assert.equal(b.length, 1);
  assert.equal(b[0].datei, 'wiki/index.md');
});

// ---------- R6, H1, H2 ----------

const uebergabe = (felder, rumpf = '# Übergabe\n') => seite(felder, rumpf);

test('R6 abgeschlossen ohne abgeschlossen_von und _am', async () => {
  const root = erzeugeProjekt({
    'wiki/index.md': '',
    'stufen/1-ziel/uebergabe.md': uebergabe({ status: 'abgeschlossen' }),
  });
  assert.equal(nur(await lint(root), 'R6-uebergabe').length, 2);
});

test('R6 abgeschlossen verweist auf vorgeschlagene Wiki-Seite', async () => {
  const root = erzeugeProjekt({
    'wiki/index.md': '[a](a.md)\n',
    'wiki/a.md': seite({ status: 'vorgeschlagen' }),
    'stufen/1-ziel/uebergabe.md': uebergabe(
      { status: 'abgeschlossen', abgeschlossen_von: 'Erika Muster', abgeschlossen_am: '27.11.2026' },
      'Beleg: [Anwendungsfall](../../wiki/a.md)\n',
    ),
  });
  const b = nur(await lint(root), 'R6-uebergabe');
  assert.equal(b.length, 1);
  assert.match(b[0].grund, /wiki\/a\.md/);
});

test('R6 abgeschlossen verweist auf bestätigte Seite', async () => {
  const root = erzeugeProjekt({
    'wiki/index.md': '[a](a.md)\n',
    'wiki/a.md': seite({ status: 'bestätigt', 'bestätigt_von': 'E', 'bestätigt_am': '27.11.2026' }),
    'stufen/1-ziel/uebergabe.md': uebergabe(
      { status: 'abgeschlossen', abgeschlossen_von: 'Erika Muster', abgeschlossen_am: '27.11.2026' },
      'Beleg: [Anwendungsfall](../../wiki/a.md)\n',
    ),
  });
  assert.deepEqual(nur(await lint(root), 'R6-uebergabe'), []);
});

test('R6 vorbereitet verweist auf vorgeschlagene Seite', async () => {
  const root = erzeugeProjekt({
    'wiki/index.md': '[a](a.md)\n',
    'wiki/a.md': seite({ status: 'vorgeschlagen' }),
    'stufen/1-ziel/uebergabe.md': uebergabe({ status: 'vorbereitet' }, '[a](../../wiki/a.md)\n'),
  });
  assert.deepEqual(nur(await lint(root), 'R6-uebergabe'), []);
});

test('R6 unbekannter Übergabestatus', async () => {
  const root = erzeugeProjekt({ 'wiki/index.md': '', 'stufen/1-ziel/uebergabe.md': uebergabe({ status: 'fertig' }) });
  assert.equal(nur(await lint(root), 'R6-uebergabe').length, 1);
});

test('H1 Seite mit Änderungsvorschlägen', async () => {
  const root = erzeugeProjekt({
    'wiki/index.md': '[a](a.md)\n',
    'wiki/a.md': seite({ status: 'vorgeschlagen' }, '# A\n\n## Änderungsvorschläge\n\nNeu.\n'),
  });
  const b = nur(await lint(root), 'H1-aenderungsvorschlag');
  assert.equal(b.length, 1);
  assert.equal(b[0].stufe, 'HINWEIS');
});

test('H2 Stufe 3 begonnen, Übergabe 2 nicht abgeschlossen', async () => {
  const root = erzeugeProjekt({
    'wiki/index.md': '',
    'stufen/DURCHLAUF.md': seite({ durchlauf: '1', anlass: 'Erstentwicklung', einstiegsstufe: '1' }),
    'stufen/2-prozess/uebergabe.md': uebergabe({ status: 'vorbereitet' }),
    'stufen/3-daten/eingang.md': seite({ status: 'begonnen' }),
  });
  const b = nur(await lint(root), 'H2-vorstufe');
  assert.equal(b.length, 1);
  assert.equal(b[0].datei, 'stufen/3-daten/eingang.md');
});

test('H2 nicht bei Einstiegsstufe des Durchlaufs', async () => {
  const root = erzeugeProjekt({
    'wiki/index.md': '',
    'stufen/DURCHLAUF.md': seite({ durchlauf: '2', anlass: 'neue Datenquelle', einstiegsstufe: '3' }),
    'stufen/2-prozess/uebergabe.md': uebergabe({ status: 'offen' }),
    'stufen/3-daten/eingang.md': seite({ status: 'begonnen' }),
  });
  assert.deepEqual(nur(await lint(root), 'H2-vorstufe'), []);
});
