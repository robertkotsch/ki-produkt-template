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
