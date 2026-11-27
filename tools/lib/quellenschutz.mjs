import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fehler, hinweis } from './regeln.mjs';

const AUSGENOMMEN = new Set(['quellen/README.md', 'quellen/KORREKTUREN.md']);

function git(root, args) {
  return execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
}

function istRepoWurzel(root) {
  try {
    const wurzel = git(root, ['rev-parse', '--show-toplevel']).trim();
    return realpathSync(resolve(wurzel)).toLowerCase() === realpathSync(resolve(root)).toLowerCase();
  } catch {
    return false;
  }
}

/** Prüft, ob sich eine Basis zu einem Commit auflösen lässt. */
export function basisGueltig(root, basis) {
  try {
    git(root, ['rev-parse', '--verify', '--quiet', `${basis}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

function leseNameStatus(ausgabe) {
  const ergebnis = [];
  for (const zeile of ausgabe.split('\n')) {
    if (!zeile.trim()) continue;
    const teile = zeile.split('\t');
    const art = teile[0][0];
    if (art !== 'M' && art !== 'D' && art !== 'R') continue;
    const datei = teile[1];
    if (!AUSGENOMMEN.has(datei)) ergebnis.push({ art, datei });
  }
  return ergebnis;
}

/**
 * Veränderte, gelöschte oder umbenannte Quelldateien.
 * Ohne Basis: Index und Arbeitsverzeichnis gegenüber HEAD. Mit Basis zusätzlich Basis..HEAD.
 * Die Basis muss vorher mit basisGueltig geprüft sein.
 * @param {string} root
 * @param {string|null} basis
 * @returns {Array<{art: 'M'|'D'|'R', datei: string}> | null} null, wenn kein Git-Repository mit Commit
 */
export function geaenderteQuellen(root, basis) {
  if (!istRepoWurzel(root)) return null;
  const optionen = ['-c', 'core.quotePath=false', 'diff', '--name-status', '--no-renames'];
  let treffer;
  try {
    treffer = leseNameStatus(git(root, [...optionen, 'HEAD', '--', 'quellen/']));
  } catch {
    return null;
  }
  if (basis) treffer.push(...leseNameStatus(git(root, [...optionen, basis, 'HEAD', '--', 'quellen/'])));
  const gesehen = new Set();
  return treffer.filter((t) => !gesehen.has(t.datei) && gesehen.add(t.datei));
}

/** R7: Quellen bleiben unverändert, außer die Korrektur ist in quellen/KORREKTUREN.md verzeichnet. */
export function pruefeR7(root, basis) {
  const befunde = [];
  if (basis && istRepoWurzel(root) && !basisGueltig(root, basis)) {
    befunde.push(fehler('R7-quellen', 'quellen/', `Basis „${basis}“ nicht gefunden, Vergleich mit der Basis nicht möglich`));
    basis = null;
  }
  const treffer = geaenderteQuellen(root, basis);
  if (treffer === null) {
    befunde.push(hinweis('R7-quellen', 'quellen/', 'Quellenschutz nicht geprüft, kein Git-Repository mit Commit oder Git nicht verfügbar'));
    return befunde;
  }
  const korrekturPfad = join(root, 'quellen/KORREKTUREN.md');
  const korrekturen = existsSync(korrekturPfad) ? readFileSync(korrekturPfad, 'utf8') : '';
  for (const { art, datei } of treffer) {
    const was = art === 'D' ? 'gelöscht' : 'verändert';
    befunde.push(korrekturen.includes(datei)
      ? hinweis('R7-quellen', datei, `Quelle ${was}, Korrektur ist in quellen/KORREKTUREN.md verzeichnet`)
      : fehler('R7-quellen', datei, `Quelle ${was}, Quellen sind unveränderlich (Korrektur in quellen/KORREKTUREN.md eintragen)`));
  }
  return befunde;
}
