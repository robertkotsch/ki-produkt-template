import { existsSync } from 'node:fs';
import { join, posix } from 'node:path';

/** Löst einen Verweis relativ zu einer projektrelativen Datei auf. */
export function loeseRelativ(vonDatei, ziel) {
  return posix.normalize(posix.join(posix.dirname(vonDatei), ziel));
}

/** Prüft, ob ein relativer Verweis auf eine vorhandene Datei oder einen Ordner zeigt. */
export function existiertRelativ(root, vonDatei, ziel) {
  const aufgeloest = loeseRelativ(vonDatei, ziel);
  if (aufgeloest.startsWith('..')) return false;
  return existsSync(join(root, aufgeloest));
}

/** @typedef {{ stufe: 'FEHLER'|'HINWEIS', regel: string, datei: string, grund: string }} Befund */

export const WIKI_STATUS = ['offen', 'vorgeschlagen', 'bestätigt', 'geprüft'];

export const fehler = (regel, datei, grund) => ({ stufe: 'FEHLER', regel, datei, grund });
export const hinweis = (regel, datei, grund) => ({ stufe: 'HINWEIS', regel, datei, grund });

/** R1: Jede Wiki-Seite hat Kopfdaten mit gültigem Status. */
export function pruefeR1(root, kontext) {
  const befunde = [];
  for (const [pfad, seite] of kontext.seiten) {
    if (!seite) {
      befunde.push(fehler('R1-kopfdaten', pfad, 'keine Kopfdaten'));
    } else if (!WIKI_STATUS.includes(seite.daten.status)) {
      befunde.push(fehler('R1-kopfdaten', pfad, `unbekannter Status „${seite.daten.status ?? ''}“`));
    }
  }
  return befunde;
}

const DATUM = /^\d{2}\.\d{2}\.\d{4}$/;
const leer = (wert) => typeof wert !== 'string' || wert.trim() === '';

/** R2: Pflichtfelder für „bestätigt“ und „geprüft“. */
export function pruefeR2(root, kontext) {
  const befunde = [];
  for (const [pfad, seite] of kontext.seiten) {
    if (!seite) continue;
    const d = seite.daten;
    if (d.status !== 'bestätigt' && d.status !== 'geprüft') continue;
    if (leer(d['bestätigt_von'])) befunde.push(fehler('R2-pflichtfelder', pfad, '„bestätigt_von“ fehlt'));
    if (leer(d['bestätigt_am'])) befunde.push(fehler('R2-pflichtfelder', pfad, '„bestätigt_am“ fehlt'));
    else if (!DATUM.test(d['bestätigt_am'].trim())) {
      befunde.push(fehler('R2-pflichtfelder', pfad, '„bestätigt_am“ nicht im Format TT.MM.JJJJ'));
    }
    if (d.status === 'geprüft') {
      if (leer(d['geprüft_am_stand'])) befunde.push(fehler('R2-pflichtfelder', pfad, '„geprüft_am_stand“ fehlt'));
      if (leer(d.nachweis)) befunde.push(fehler('R2-pflichtfelder', pfad, '„nachweis“ fehlt'));
    }
  }
  return befunde;
}

/** R3: `nachweis` und `quellen` verweisen auf vorhandene Dateien. */
export function pruefeR3(root, kontext) {
  const befunde = [];
  for (const [pfad, seite] of kontext.seiten) {
    if (!seite) continue;
    const ziele = [];
    if (!leer(seite.daten.nachweis)) ziele.push(seite.daten.nachweis.trim());
    const quellen = seite.daten.quellen;
    if (Array.isArray(quellen)) ziele.push(...quellen);
    else if (!leer(quellen)) ziele.push(quellen.trim());
    for (const ziel of ziele) {
      if (!existiertRelativ(root, pfad, ziel)) {
        befunde.push(fehler('R3-verweis', pfad, `Verweis auf nicht vorhandene Datei „${ziel}“`));
      }
    }
  }
  return befunde;
}
