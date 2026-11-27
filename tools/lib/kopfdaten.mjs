/**
 * Liest flache YAML-Kopfdaten am Anfang einer Markdown-Datei.
 * Unterstützt `schlüssel: wert`, Listen als `[a, b]` oder eingerückte `- a`-Zeilen
 * und Kommentare ab ` #`.
 * @param {string} text
 * @returns {{ daten: Record<string, string|string[]>, rumpf: string } | null}
 */
export function parseKopfdaten(text) {
  const t = text.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  if (!t.startsWith('---\n')) return null;
  const ende = t.indexOf('\n---', 3);
  if (ende === -1) return null;
  const kopf = t.slice(4, ende);
  let rumpf = t.slice(ende + 4);
  if (rumpf.startsWith('\n')) rumpf = rumpf.slice(1);

  const daten = {};
  let aktuelleListe = null;
  for (const roh of kopf.split('\n')) {
    const zeile = ohneKommentar(roh);
    if (zeile.trim() === '') continue;
    const listenpunkt = zeile.match(/^\s+-\s*(.*)$/);
    if (listenpunkt && aktuelleListe) {
      if (!Array.isArray(daten[aktuelleListe])) daten[aktuelleListe] = [];
      daten[aktuelleListe].push(ohneAnfuehrung(listenpunkt[1]));
      continue;
    }
    const feld = zeile.match(/^([^:\s][^:]*):\s*(.*)$/);
    if (!feld) continue;
    const schluessel = feld[1].trim();
    const wert = feld[2].trim();
    aktuelleListe = null;
    if (wert.startsWith('[') && wert.endsWith(']')) {
      const innen = wert.slice(1, -1).trim();
      daten[schluessel] = innen === '' ? [] : innen.split(',').map(ohneAnfuehrung).filter(Boolean);
    } else if (wert === '') {
      daten[schluessel] = '';
      aktuelleListe = schluessel;
    } else {
      daten[schluessel] = ohneAnfuehrung(wert);
    }
  }
  return { daten, rumpf };
}

/** Entfernt ein Paar gleicher Anführungszeichen um einen Wert und trimmt. */
function ohneAnfuehrung(wert) {
  const w = wert.trim();
  const m = w.match(/^(["'])(.*)\1$/);
  return m ? m[2].trim() : w;
}

function ohneKommentar(zeile) {
  const i = zeile.search(/\s#/);
  return i === -1 ? zeile : zeile.slice(0, i);
}
