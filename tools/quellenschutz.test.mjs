import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { lint } from './lint.mjs';
import { erzeugeProjekt } from './testhilfe.mjs';

const git = (root, ...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' }).toString();

function repoMitQuelle() {
  const root = erzeugeProjekt({
    'wiki/index.md': '# Index\n',
    'quellen/README.md': '# Quellen\n',
    'quellen/KORREKTUREN.md': '# Korrekturen\n',
    'quellen/2026-11-27-gespraech-start.md': 'Ursprünglich\n',
  });
  git(root, 'init', '-q', '-b', 'main');
  git(root, '-c', 'user.name=T', '-c', 'user.email=t@example.org', 'add', '-A');
  git(root, '-c', 'user.name=T', '-c', 'user.email=t@example.org', 'commit', '-qm', 'start');
  return root;
}

const r7 = async (root, optionen) => (await lint(root, optionen)).filter((b) => b.regel === 'R7-quellen');
const QUELLE = 'quellen/2026-11-27-gespraech-start.md';

test('geänderte Quelle im Arbeitsverzeichnis', async () => {
  const root = repoMitQuelle();
  writeFileSync(join(root, QUELLE), 'Verändert\n');
  const b = await r7(root);
  assert.equal(b.length, 1);
  assert.equal(b[0].stufe, 'FEHLER');
  assert.equal(b[0].datei, QUELLE);
});

test('gelöschte Quelle', async () => {
  const root = repoMitQuelle();
  rmSync(join(root, QUELLE));
  const b = await r7(root);
  assert.equal(b.length, 1);
  assert.equal(b[0].stufe, 'FEHLER');
});

test('neue Quelle', async () => {
  const root = repoMitQuelle();
  writeFileSync(join(root, 'quellen/2026-11-28-neu.md'), 'Neu\n');
  git(root, 'add', '-A');
  assert.deepEqual(await r7(root), []);
});

test('README und KORREKTUREN dürfen sich ändern', async () => {
  const root = repoMitQuelle();
  writeFileSync(join(root, 'quellen/README.md'), '# Quellen neu\n');
  writeFileSync(join(root, 'quellen/KORREKTUREN.md'), '# Korrekturen neu\n');
  assert.deepEqual(await r7(root), []);
});

test('mit basis: Änderung in Folgecommit', async () => {
  const root = repoMitQuelle();
  const basis = git(root, 'rev-parse', 'HEAD').trim();
  writeFileSync(join(root, QUELLE), 'Verändert\n');
  git(root, '-c', 'user.name=T', '-c', 'user.email=t@example.org', 'commit', '-qam', 'ändern');
  assert.deepEqual(await r7(root), []);
  const b = await r7(root, { basis });
  assert.equal(b.length, 1);
  assert.equal(b[0].stufe, 'FEHLER');
});

test('in KORREKTUREN.md verzeichnet', async () => {
  const root = repoMitQuelle();
  writeFileSync(join(root, QUELLE), 'Geschwärzt\n');
  writeFileSync(
    join(root, 'quellen/KORREKTUREN.md'),
    `# Korrekturen\n\n| Datum | Datei | Grund | Verantwortlich |\n|---|---|---|---|\n| 27.11.2026 | ${QUELLE} | vertrauliche Angabe geschwärzt | Erika Muster |\n`,
  );
  const b = await r7(root);
  assert.equal(b.length, 1);
  assert.equal(b[0].stufe, 'HINWEIS');
});

test('kein Git-Repo', async () => {
  const root = erzeugeProjekt({ 'wiki/index.md': '# Index\n' });
  const b = await r7(root);
  assert.equal(b.length, 1);
  assert.equal(b[0].stufe, 'HINWEIS');
});

test('unbekannte Basis ist ein Fehler und schaltet die lokale Prüfung nicht ab', async () => {
  const root = repoMitQuelle();
  writeFileSync(join(root, QUELLE), 'Verändert\n');
  const b = await r7(root, { basis: 'gibtsnicht' });
  assert.ok(b.some((x) => x.stufe === 'FEHLER' && /Basis/.test(x.grund)));
  assert.ok(b.some((x) => x.stufe === 'FEHLER' && x.datei === QUELLE));
});
