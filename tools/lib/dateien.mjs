import { readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

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
