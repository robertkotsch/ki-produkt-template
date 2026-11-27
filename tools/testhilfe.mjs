import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

/**
 * Legt ein temporäres Projekt mit den angegebenen Dateien an.
 * @param {Record<string, string>} dateien projektrelativer Pfad → Inhalt
 * @returns {string} Pfad des Projektordners
 */
export function erzeugeProjekt(dateien) {
  const root = mkdtempSync(join(tmpdir(), 'ki-template-test-'));
  for (const [pfad, inhalt] of Object.entries(dateien)) {
    const ziel = join(root, pfad);
    mkdirSync(dirname(ziel), { recursive: true });
    writeFileSync(ziel, inhalt, 'utf8');
  }
  return root;
}

/** Wiki-Seite mit Kopfdaten erzeugen. */
export function seite(felder, rumpf = '# Seite\n') {
  const zeilen = Object.entries(felder).map(([k, v]) => `${k}: ${v}`);
  return `---\n${zeilen.join('\n')}\n---\n${rumpf}`;
}
