import { readdirSync, existsSync } from 'node:fs';
import { join, posix, relative, sep } from 'node:path';

/** Projektrelativer Pfad mit `/` als Trenner. */
export function relPfad(root, absolut) {
  return relative(root, absolut).split(sep).join('/');
}

/**
 * Listet alle Markdown-Dateien unter einem Unterordner rekursiv auf.
 * @param {string} root
 * @param {string} unterordner projektrelativ, etwa `wiki`
 * @returns {string[]} projektrelative Pfade mit `/`, sortiert
 */
export function listeMarkdown(root, unterordner) {
  const start = join(root, unterordner);
  if (!existsSync(start)) return [];
  const ergebnis = [];
  const besuche = (ordner) => {
    for (const eintrag of readdirSync(ordner, { withFileTypes: true })) {
      const pfad = join(ordner, eintrag.name);
      if (eintrag.isDirectory()) besuche(pfad);
      else if (eintrag.name.endsWith('.md')) ergebnis.push(relPfad(root, pfad));
    }
  };
  besuche(start);
  return ergebnis.sort();
}

const OHNE_KOPFDATEN = new Set(['wiki/index.md', 'wiki/log.md', 'wiki/entscheidungen/README.md']);

/** Alle Wiki-Seiten, die Kopfdaten tragen müssen. */
export function wikiSeiten(root) {
  return listeMarkdown(root, 'wiki').filter((p) => !OHNE_KOPFDATEN.has(p));
}

/** Löst einen Verweis relativ zu einer projektrelativen Datei auf. */
export function loeseRelativ(vonDatei, ziel) {
  return posix.normalize(posix.join(posix.dirname(vonDatei), ziel));
}

/** Prüft, ob ein relativer Verweis auf eine vorhandene Datei oder einen Ordner im Projekt zeigt. */
export function existiertRelativ(root, vonDatei, ziel) {
  const aufgeloest = loeseRelativ(vonDatei, ziel);
  if (aufgeloest === '..' || aufgeloest.startsWith('../')) return false;
  return existsSync(join(root, aufgeloest));
}

/**
 * Ziele aller relativen Markdown-Links außerhalb von Codeblöcken und Inline-Code.
 * Externe Links und reine Anker entfallen, Anker werden abgeschnitten, %-Kodierung aufgelöst.
 * @param {string} markdown
 * @returns {string[]}
 */
export function relativeLinks(markdown) {
  const ohneCode = markdown
    .replace(/\r\n/g, '\n')
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '')
    .replace(/`[^`\n]*`/g, '');
  const ziele = [];
  for (const treffer of ohneCode.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
    let ziel = treffer[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(ziel) || ziel.startsWith('#')) continue;
    ziel = ziel.split('#')[0];
    try {
      ziel = decodeURIComponent(ziel);
    } catch {
      // ungültige Kodierung: Ziel unverändert prüfen
    }
    if (ziel) ziele.push(ziel);
  }
  return ziele;
}
