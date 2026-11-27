import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lint } from './lint.mjs';
import { listeMarkdown } from './lib/dateien.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const STUFEN = [
  '1-ziel-nutzen-verantwortung',
  '2-prozess-nutzer-organisation',
  '3-daten-datenschutz-governance',
  '4-architektur-modell-tools',
  '5-security-resilienz-kontrollen',
  '6-mvp-evaluation-pilot',
  '7-rollout-befaehigung-betrieb',
  '8-lifecycle-skalierung-ausstieg',
];

function alleMarkdown() {
  const dateien = [];
  const besuche = (rel) => {
    for (const e of readdirSync(join(root, rel), { withFileTypes: true })) {
      if (['.git', 'node_modules', '.superpowers'].includes(e.name)) continue;
      const p = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) besuche(p);
      else if (e.name.endsWith('.md')) dateien.push(p);
    }
  };
  besuche('');
  return dateien;
}

const ohneCode = (md) => md
  .replace(/\r\n/g, '\n')
  .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '')
  .replace(/`[^`\n]*`/g, '');

test('frisches Template besteht den Lint', async () => {
  const fehler = (await lint(root)).filter((b) => b.stufe === 'FEHLER');
  assert.deepEqual(fehler, []);
});

test('acht Stufenordner mit eingang und uebergabe', () => {
  for (const s of STUFEN) {
    assert.ok(existsSync(join(root, 'stufen', s, 'eingang.md')), `${s}/eingang.md`);
    assert.ok(existsSync(join(root, 'stufen', s, 'uebergabe.md')), `${s}/uebergabe.md`);
  }
  assert.ok(existsSync(join(root, 'stufen/DURCHLAUF.md')));
});

test('Stufendateien gleichen den Vorlagen', () => {
  const vorlagen = listeMarkdown(root, 'tools/vorlagen/stufen');
  assert.equal(vorlagen.length, 16);
  for (const v of vorlagen) {
    const stufe = v.replace('tools/vorlagen/', '');
    assert.equal(readFileSync(join(root, stufe), 'utf8'), readFileSync(join(root, v), 'utf8'), stufe);
  }
});

test('Stilregel: kein Semikolon und kein Gedankenstrich', () => {
  const verstoesse = [];
  for (const datei of alleMarkdown()) {
    const text = ohneCode(readFileSync(join(root, datei), 'utf8'));
    text.split('\n').forEach((zeile, i) => {
      if (/[;–—]/.test(zeile)) verstoesse.push(`${datei}:${i + 1}: ${zeile.trim()}`);
    });
  }
  assert.deepEqual(verstoesse, []);
});

test('keine privaten Verweise', () => {
  const verboten = /profile_de|interview-coach|chemmedia|Bewerbungen/i;
  const treffer = alleMarkdown().filter((d) => verboten.test(readFileSync(join(root, d), 'utf8')));
  assert.deepEqual(treffer, []);
});

test('CLAUDE.md bindet nur AGENTS.md ein', () => {
  assert.equal(readFileSync(join(root, 'CLAUDE.md'), 'utf8').trim(), '@AGENTS.md');
});

test('Links in Wurzeldateien sind gültig', async () => {
  const { relativeLinks, existiertRelativ } = await import('./lib/dateien.mjs');
  const tot = [];
  for (const datei of ['README.md', 'AGENTS.md', 'LEITFADEN.md', 'LICENSE-TEXT.md']) {
    assert.ok(existsSync(join(root, datei)), `${datei} fehlt`);
    for (const ziel of relativeLinks(readFileSync(join(root, datei), 'utf8'))) {
      if (!existiertRelativ(root, datei, ziel)) tot.push(`${datei} → ${ziel}`);
    }
  }
  assert.deepEqual(tot, []);
});

test('Lizenzdateien vorhanden', () => {
  assert.match(readFileSync(join(root, 'LICENSE'), 'utf8'), /MIT License/);
  assert.match(readFileSync(join(root, 'LICENSE-TEXT.md'), 'utf8'), /CC BY 4\.0/);
});
