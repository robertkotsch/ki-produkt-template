# KI-Produkt-Template

Eine Vorlage, mit der ein Entwicklungsagent wie Claude Code oder Codex ein KI-Produkt in acht Stufen entwickelt: vom beobachteten Arbeitsproblem über Daten, Architektur, Sicherheit und Pilot bis zu Betrieb, Änderung und Ausstieg. Der Agent erarbeitet Vorschläge, Menschen bestätigen sie, Nachweise belegen sie. Jede Übergabe ist so festgehalten, dass eine neue Person oder ein neuer Agent ohne den ursprünglichen Gesprächsverlauf weiterarbeiten kann.

Grundlage ist der [Leitfaden](LEITFADEN.md) „KI-Produkte in acht Stufen entwickeln“. Das Wissen des Projekts pflegt der Agent nach dem LLM-Wiki-Prinzip von Andrej Karpathy: unveränderliche Rohquellen, ein vom Agenten gepflegtes Wiki und ein Schema mit den Pflegeregeln.

## Schnellstart

1. Auf GitHub „Use this template“ wählen und ein neues Repository anlegen.
2. Das Repository klonen und den Agenten darin starten. Claude Code liest die Regeln über `CLAUDE.md`, Codex direkt aus `AGENTS.md`.
3. Dem Agenten sagen: „Beginne Stufe 1 für folgende Produktidee: …“

Der Agent hält die Produktidee als erste Quelle fest, führt den Einstiegsauftrag aus und befragt dich nach dem letzten konkreten Vorgang, bei dem das Problem auftrat.

## Aufbau

| Schicht | Ort | Inhalt |
|---|---|---|
| Schema | [AGENTS.md](AGENTS.md) · [LEITFADEN.md](LEITFADEN.md) | Arbeitsregeln für den Agenten und die fachlichen Aufträge je Stufe |
| Quellen | [quellen/](quellen/README.md) | Produktidee, Gesprächsnotizen, Beobachtungen, Auszüge. Unveränderlich. |
| Wiki | [wiki/](wiki/index.md) | der aktuelle Wissensstand, eine Seite je Thema, mit Index und Log |
| Stufen | [stufen/](stufen/DURCHLAUF.md) | je Stufe ein Eingang für die Gegenprobe und eine Übergabe für den Abschluss |
| Nachweise | [nachweise/](nachweise/README.md) | Prüfprotokolle zum benannten Stand |

Produktcode entsteht ab Stufe 4 dort, wo es für das Projekt üblich ist. Die Seite [Architektur](wiki/architektur.md) hält fest, wo.

## Status: vorgeschlagen, bestätigt, geprüft

Jede Wiki-Seite trägt einen Status. Der Agent setzt höchstens `vorgeschlagen`. Auf `bestätigt` setzt nur die zuständige Person, mit Name und Datum. `geprüft` verlangt zusätzlich den geprüften Stand und einen Nachweis. Eine Übergabe kann erst abgeschlossen werden, wenn alle Seiten, auf die sie sich stützt, bestätigt oder geprüft sind.

**Grenze der technischen Absicherung.** Ein Agent schreibt unter der Git-Identität seines Menschen. Ob ein Statuswechsel wirklich von einem Menschen stammt, lässt sich deshalb technisch nicht beweisen. Die Absicherung besteht aus der ausdrücklichen Regel in `AGENTS.md`, den Pflichtfeldern, die der Lint verlangt, und der Nachvollziehbarkeit im Diff. Empfohlen ist, Statuswechsel in eigenen Commits oder über einen Pull Request mit menschlicher Freigabe vorzunehmen.

## Prüfen

```
npm run lint
npm test
```

Der Lint prüft ohne Abhängigkeiten, ob Wiki-Seiten gültige Kopfdaten und Pflichtfelder haben, ob Verweise und Links ihr Ziel finden, ob der Index vollständig ist, ob abgeschlossene Übergaben nur auf bestätigten Seiten beruhen und ob Quellen unverändert geblieben sind. Er läuft auch bei jedem Push in GitHub Actions. Voraussetzung ist Node.js ab Version 20.

## Beispiel

Ein durchgearbeitetes Beispiel mit lauffähigem Code, ein Assistent für Fragen zu Projektakten, folgt in einem eigenen Repository.

## Lizenz und Autor

Robert Kotsch. Der Code unter `tools/` und `.github/` steht unter der [MIT-Lizenz](LICENSE), alle Texte einschließlich Leitfaden, Schema und Vorlagen unter [CC BY 4.0](LICENSE-TEXT.md).
