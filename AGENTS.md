# Arbeitsregeln für den Entwicklungsagenten

Diese Datei ist das Schema des Projekts. Sie legt fest, wie du als Entwicklungsagent das Wissen des Projekts pflegst. Was in jeder Stufe fachlich zu tun ist, steht im [Leitfaden](LEITFADEN.md). Die Arbeitsaufträge dort führst du aus, ohne sie hier zu wiederholen.

## 1. Grundsatz: vorschlagen, nicht bestätigen

Du bereitest Fragen vor, wertest Unterlagen aus, schreibst Code und führst Tests aus. Entscheidungen trifft ein Mensch. Alles, was du erarbeitest, ist zunächst ein Vorschlag. Erst die zuständige Person macht daraus einen bestätigten Stand, erst ein Nachweis macht daraus einen geprüften.

Fehlt dir eine Angabe, die für den Auftrag nötig ist, fragst du nach, statt sie selbst zu ergänzen. Widersprechen sich Angaben, benennst du den Widerspruch, bevor du die betroffene Entscheidung umsetzt.

## 2. Die drei Schichten

| Schicht | Ort | Was du darfst |
|---|---|---|
| Quellen | [quellen/](quellen/README.md) | lesen und neue Dateien anlegen, nie eine vorhandene Datei ändern oder löschen |
| Wiki | [wiki/](wiki/index.md) | Seiten anlegen und pflegen nach den Statusregeln unten |
| Schema | diese Datei und der Leitfaden | lesen, Änderungen nur auf ausdrückliche Anweisung eines Menschen |

Das Wiki ist der einzige Ort für den aktuellen Wissensstand. Ein Sachverhalt steht dort genau einmal. Stufendateien, Nachweise und Antworten verweisen auf Wiki-Seiten, statt deren Inhalt zu wiederholen.

Hinzu kommen [stufen/](stufen/DURCHLAUF.md) mit je einem Eingang und einer Übergabe pro Stufe sowie [nachweise/](nachweise/README.md) für Prüfprotokolle und [wiki/entscheidungen/](wiki/entscheidungen/README.md) für folgenreiche Entscheidungen.

**Gesprächsbeiträge sind Quellen.** Die Produktidee und jede Antwort eines Menschen im Dialog, etwa im Interview der Stufe 1 oder bei der Beobachtung der Stufe 2, hältst du als neue Quelldatei fest. Diese Datei erteilt dir dafür die Anweisung. Die Produktidee legst du im Wortlaut ab, ohne weitere Bestätigung. Fasst du dagegen ein Gespräch zusammen, zeigst du die Zusammenfassung vor dem Ablegen und lässt sie bestätigen. Ist niemand erreichbar, legst du nichts ab, sondern hältst die offene Bestätigung in [offene Punkte](wiki/offene-punkte.md) fest. Die Form steht in [quellen/README.md](quellen/README.md).

**Nur Wirkliches ist eine Quelle.** Eigene Annahmen, Beispiele und simulierte Antworten legst du nie als Quelle ab, denn Quellen sind unveränderlich und würden später als echte Grundlage gelesen. Solche Inhalte gehören als gekennzeichnete Annahme auf die passende Wiki-Seite.

**Vertrauliches bleibt draußen.** Vertrauliche Originaldaten und Zugangsdaten gehören weder in Quellen noch ins Wiki. Übertrage keine Projektinhalte an Dienste außerhalb des Repositorys, solange die Datenregeln der Stufe 3 das nicht ausdrücklich erlauben.

## 3. Statusregeln

Jede Wiki-Seite und jede Entscheidung trägt Kopfdaten mit einem Status.

| Status | Bedeutung | Wer setzt ihn |
|---|---|---|
| `offen` | noch kein Inhalt | Vorlage |
| `vorgeschlagen` | Annahme oder Entwurf | du |
| `bestätigt` | von der zuständigen Person entschieden | nur ein Mensch, mit `bestätigt_von` und `bestätigt_am` |
| `geprüft` | am benannten Stand beobachtet | nur ein Mensch, zusätzlich mit `geprüft_am_stand` und `nachweis` |

Daraus folgt für dich:

- Du setzt den Status höchstens von `offen` auf `vorgeschlagen`.
- Du setzt nie `bestätigt` oder `geprüft` und füllst nie `bestätigt_von`, `bestätigt_am`, `abgeschlossen_von` oder `abgeschlossen_am`.
- Willst du eine Seite mit Status `bestätigt` oder `geprüft` inhaltlich ändern, lässt du den bestätigten Text unverändert. Du ergänzt am Seitenende einen Abschnitt `## Änderungsvorschläge` mit Begründung und Quelle. Ein Mensch übernimmt den Vorschlag und passt den Status an.
- Jede Aussage, die weder aus einer Quelle noch aus einer bestätigten Seite folgt, kennzeichnest du im Text als Annahme.
- Trage jede genutzte Quelle in das Feld `quellen` der Seite ein.

Für Eingang und Übergabe einer Stufe gilt dasselbe. Der Eingang kennt die Status `offen` und `begonnen`, die Übergabe `offen`, `vorbereitet` und `abgeschlossen`. Den Eingang setzt du auf `begonnen`, die Übergabe höchstens auf `vorbereitet`. `vorbereitet` heißt: Jede Übergabebedingung hat einen Beleg oder eine kurze Begründung, warum sie noch offen ist. Auf `abgeschlossen` setzt sie die bestätigende Person.

## 4. Vorgänge

**Stufe beginnen.** Führe `node tools/lint.mjs` aus. Führe dann den Einstiegsauftrag aus dem Leitfaden aus und halte das Ergebnis in der Datei `eingang.md` der Stufe fest, mit Verweisen auf die Wiki-Seiten. Setze ihren Status auf `begonnen`. Führe danach den Arbeitsauftrag der Stufe aus dem Leitfaden aus.

In Stufe 1 des ersten Durchlaufs gibt es noch keine Übergabe. Lege dann zuerst die Produktidee als Quelle ab. Die Gegenprobe stützt sich auf diese Quelle, und Felder ohne Grundlage vermerkst du als „noch keine“.

**Quelle aufnehmen.** Lies die neue Quelle. Aktualisiere die betroffenen Wiki-Seiten oder lege neue an. Widerspricht die Quelle einer bestätigten Seite, lege den Widerspruch als Änderungsvorschlag ab. Schreibe [wiki/index.md](wiki/index.md) und [wiki/log.md](wiki/log.md) fort.

**Frage beantworten.** Antworte aus dem Wiki und verweise auf die tragenden Seiten. Lohnt sich die Antwort dauerhaft, lege sie als neue Seite mit Status `vorgeschlagen` an.

**Prüfen.** Führe `node tools/lint.mjs` aus und behebe Fehler, soweit sie in deiner Zuständigkeit liegen. Prüfe das Wiki zusätzlich inhaltlich auf Widersprüche, veraltete Aussagen und unbestätigte Annahmen. Halte das Ergebnis im Log fest.

**Stufe abschließen.** Führe den Abschlussauftrag aus dem Leitfaden aus. Belege in `uebergabe.md` jede Übergabebedingung mit einem Verweis auf eine Wiki-Seite oder einen Nachweis, nenne Abweichungen, ausstehende Prüfungen und die nächste menschliche Entscheidung. Setze den Status auf `vorbereitet`.

**Neuen Durchlauf beginnen.** Nur auf Anweisung eines Menschen, der Anlass und Einstiegsstufe nennt. Verschiebe die Stufenordner ab der Einstiegsstufe nach `stufen/archiv/durchlauf-<n>/`, lege sie aus `tools/vorlagen/stufen/` neu an und schreibe [stufen/DURCHLAUF.md](stufen/DURCHLAUF.md) fort.

## 5. Log

Jeder Vorgang erhält am Ende von [wiki/log.md](wiki/log.md) einen Eintrag mit einer Überschrift nach dem Muster `## [TT.MM.JJJJ] <vorgang> · <kurztitel>`. Darunter stehen die berührten Seiten und die offenen Punkte. Das Log wird nur fortgeschrieben. Dein erster Eintrag hält die Anlage des Projekts mit Datum fest.

## 6. Entscheidungen

Eine eigene Datei unter [wiki/entscheidungen/](wiki/entscheidungen/README.md) erhält eine Entscheidung, wenn sie zwischen echten Alternativen wählt und eine spätere Änderung erneut geprüft werden müsste, etwa die Wahl zwischen einer Lösung mit und ohne Modell. Das Ergebnis selbst steht weiter auf der fachlichen Wiki-Seite, die Entscheidungsdatei hält Alternativen, Begründung und Auslöser fest und verweist auf diese Seite.

## 7. Nachweise

Jede Prüfung des Produkts, etwa ein Test, eine Evaluation oder ein Pilotdurchlauf, hältst du als Datei unter [nachweise/](nachweise/README.md) fest. Lint-Läufe sind keine Nachweise, sie stehen nur im Eingang und im Log. Ein Nachweis enthält Version, Voraussetzungen, Eingabe, Befehl oder Bedienfolge sowie erwartetem und beobachtetem Ergebnis. Bei Modelltests gehören Modellkennung, Einstellungen, Prompt- und Datenstand sowie das Bewertungsverfahren dazu.

## 8. Sicherheit begleitet alle Stufen

Datenschutz, Sicherheit und Governance sind in jeder Stufe Teil deiner Arbeit, nicht erst in Stufe 5. Der Leitfaden beschreibt im Abschnitt [Sicherheit begleitet alle Stufen](LEITFADEN.md#sicherheit-begleitet-alle-stufen), was jede Stufe dazu beiträgt.
