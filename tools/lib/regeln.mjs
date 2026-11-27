import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { existiertRelativ, relativeLinks, listeMarkdown, loeseRelativ } from './dateien.mjs';
import { parseKopfdaten } from './kopfdaten.mjs';

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

/** Dateien, deren relative Links R4 prüft. */
export function linkDateien(root) {
  const dateien = [...listeMarkdown(root, 'wiki'), ...listeMarkdown(root, 'stufen'), ...listeMarkdown(root, 'nachweise')];
  if (existsSync(join(root, 'README.md'))) dateien.push('README.md');
  return dateien;
}

/** R4: Relative Links zeigen auf vorhandene Dateien oder Ordner. */
export function pruefeR4(root) {
  const befunde = [];
  for (const datei of linkDateien(root)) {
    for (const ziel of relativeLinks(readFileSync(join(root, datei), 'utf8'))) {
      if (!existiertRelativ(root, datei, ziel)) {
        befunde.push(fehler('R4-link', datei, `Link ins Leere „${ziel}“`));
      }
    }
  }
  return befunde;
}

/** R5: index.md nennt genau die vorhandenen Wiki-Seiten. */
export function pruefeR5(root, kontext) {
  const indexPfad = 'wiki/index.md';
  if (!existsSync(join(root, indexPfad))) {
    return [fehler('R5-index', indexPfad, 'wiki/index.md fehlt')];
  }
  const verlinkt = new Set(
    relativeLinks(readFileSync(join(root, indexPfad), 'utf8'))
      .map((ziel) => loeseRelativ(indexPfad, ziel))
      .filter((p) => p.startsWith('wiki/') && p.endsWith('.md')),
  );
  const befunde = [];
  for (const pfad of kontext.seiten.keys()) {
    if (!verlinkt.has(pfad)) befunde.push(fehler('R5-index', pfad, 'fehlt in wiki/index.md'));
  }
  for (const ziel of verlinkt) {
    if (!kontext.seiten.has(ziel) && !existsSync(join(root, ziel))) {
      befunde.push(fehler('R5-index', indexPfad, `nennt nicht vorhandene Seite „${ziel}“`));
    }
  }
  return befunde;
}

export const UEBERGABE_STATUS = ['offen', 'vorbereitet', 'abgeschlossen'];
const STUFENORDNER = /^stufen\/(\d)-[^/]+\/(eingang|uebergabe)\.md$/;

/** Stufendateien des laufenden Durchlaufs (ohne Archiv): Map „n“ → { eingang?, uebergabe? } mit Pfad und Kopfdaten. */
export function stufenDateien(root) {
  const stufen = new Map();
  for (const pfad of listeMarkdown(root, 'stufen')) {
    const t = pfad.match(STUFENORDNER);
    if (!t) continue;
    const n = Number(t[1]);
    if (!stufen.has(n)) stufen.set(n, {});
    stufen.get(n)[t[2]] = { pfad, kopf: parseKopfdaten(readFileSync(join(root, pfad), 'utf8')) };
  }
  return stufen;
}

/** R6: Abgeschlossene Übergaben sind unterschrieben und stützen sich nur auf bestätigte oder geprüfte Seiten. */
export function pruefeR6(root, kontext) {
  const befunde = [];
  for (const { uebergabe } of kontext.stufen.values()) {
    if (!uebergabe) continue;
    const { pfad, kopf } = uebergabe;
    const status = kopf?.daten.status;
    if (!UEBERGABE_STATUS.includes(status)) {
      befunde.push(fehler('R6-uebergabe', pfad, `unbekannter Übergabestatus „${status ?? ''}“`));
      continue;
    }
    if (status !== 'abgeschlossen') continue;
    if (leer(kopf.daten.abgeschlossen_von)) befunde.push(fehler('R6-uebergabe', pfad, '„abgeschlossen_von“ fehlt'));
    if (leer(kopf.daten.abgeschlossen_am)) befunde.push(fehler('R6-uebergabe', pfad, '„abgeschlossen_am“ fehlt'));
    else if (!DATUM.test(kopf.daten.abgeschlossen_am.trim())) {
      befunde.push(fehler('R6-uebergabe', pfad, '„abgeschlossen_am“ nicht im Format TT.MM.JJJJ'));
    }
    for (const ziel of relativeLinks(kopf.rumpf)) {
      const seitenPfad = loeseRelativ(pfad, ziel);
      const seite = kontext.seiten.get(seitenPfad);
      if (seite && !['bestätigt', 'geprüft'].includes(seite.daten.status)) {
        befunde.push(fehler('R6-uebergabe', pfad, `abgeschlossen, stützt sich aber auf ${seitenPfad} mit Status „${seite.daten.status}“`));
      }
    }
  }
  return befunde;
}

/** H1: Seiten mit offenen Änderungsvorschlägen. */
export function pruefeH1(root, kontext) {
  const befunde = [];
  for (const [pfad, seite] of kontext.seiten) {
    if (seite && /^##\s+Änderungsvorschläge\s*$/m.test(seite.rumpf)) {
      befunde.push(hinweis('H1-aenderungsvorschlag', pfad, 'Änderungsvorschläge warten auf menschliche Entscheidung'));
    }
  }
  return befunde;
}

/** H2: Stufe begonnen, obwohl die Vorstufe im laufenden Durchlauf nicht abgeschlossen ist. */
export function pruefeH2(root, kontext) {
  let einstieg = 1;
  const durchlauf = join(root, 'stufen/DURCHLAUF.md');
  if (existsSync(durchlauf)) {
    const wert = Number(parseKopfdaten(readFileSync(durchlauf, 'utf8'))?.daten.einstiegsstufe);
    if (Number.isInteger(wert) && wert >= 1 && wert <= 8) einstieg = wert;
  }
  const befunde = [];
  for (const [n, stufe] of kontext.stufen) {
    if (n <= einstieg || stufe.eingang?.kopf?.daten.status !== 'begonnen') continue;
    const vorher = kontext.stufen.get(n - 1)?.uebergabe?.kopf?.daten.status;
    if (vorher !== 'abgeschlossen') {
      befunde.push(hinweis('H2-vorstufe', stufe.eingang.pfad, `Stufe ${n} begonnen, Übergabe der Stufe ${n - 1} ist nicht abgeschlossen`));
    }
  }
  return befunde;
}
