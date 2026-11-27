#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseKopfdaten } from './lib/kopfdaten.mjs';
import { wikiSeiten } from './lib/dateien.mjs';
import { pruefeR1, pruefeR2, pruefeR3, pruefeR4, pruefeR5 } from './lib/regeln.mjs';

/**
 * Prüft ein Projekt und liefert alle Befunde.
 * @param {string} root
 * @param {{ basis?: string|null }} [optionen]
 * @returns {Promise<import('./lib/regeln.mjs').Befund[]>}
 */
export async function lint(root, optionen = {}) {
  const seiten = new Map();
  for (const pfad of wikiSeiten(root)) {
    seiten.set(pfad, parseKopfdaten(readFileSync(join(root, pfad), 'utf8')));
  }
  const kontext = { seiten };
  return [...pruefeR1(root, kontext), ...pruefeR2(root, kontext), ...pruefeR3(root, kontext), ...pruefeR4(root), ...pruefeR5(root, kontext)];
}

function leseArgumente(argv) {
  let pfad = '.';
  let basis = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--basis') basis = argv[++i] ?? null;
    else pfad = argv[i];
  }
  return { pfad: resolve(pfad), basis };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { pfad, basis } = leseArgumente(process.argv.slice(2));
  const befunde = await lint(pfad, { basis });
  for (const b of befunde) console.log(`${b.stufe} ${b.regel} ${b.datei}: ${b.grund}`);
  const anzahlFehler = befunde.filter((b) => b.stufe === 'FEHLER').length;
  console.log(`${anzahlFehler} Fehler, ${befunde.length - anzahlFehler} Hinweise`);
  process.exit(anzahlFehler > 0 ? 1 : 0);
}
