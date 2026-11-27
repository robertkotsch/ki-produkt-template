# KI-Produkte in acht Stufen entwickeln

Dieser Leitfaden führt von einem beobachteten Arbeitsproblem zu einem Produkt, das Menschen benutzen, prüfen, betreiben und weiterentwickeln können. Er beschreibt das Vorgehensmodell von Robert Kotsch für die Einführung von KI in acht Stufen.

Für jede Stufe gibt es einen kopierbaren Arbeitsauftrag an einen **Entwicklungsagenten**. Er kann Fragen vorbereiten, vorhandene Unterlagen auswerten, implementieren und Tests ausführen. Ein **Laufzeitprompt** entsteht dort, wo das fertige Produkt tatsächlich ein Modell aufruft. Welche Teile des Ablaufs mit gewöhnlicher Software auskommen, ist eine Entwurfsentscheidung in Stufe 4.

Die Arbeitsaufträge sind aus Sicht der Person formuliert, die das Vorhaben steuert und den Agenten beauftragt. Wo ein Auftrag „mich“ nennt, ist diese Person gemeint. Fachliche Bestätigungen holt sie bei den in der jeweiligen Übergabe genannten Verantwortlichen ein.

## Zusammenspiel mit diesem Repository

Das Repository macht den Leitfaden ausführbar. Das Wissen des Projekts steht genau einmal im [Wiki](wiki/index.md), gestützt auf unveränderliche [Quellen](quellen/README.md). Jede Stufe hat unter [stufen](stufen/DURCHLAUF.md) einen Eingang für die Gegenprobe und eine Übergabe für den Abschluss, beide verweisen nur auf Wiki-Seiten und [Nachweise](nachweise/README.md). Die Arbeitsregeln für den Agenten stehen in [AGENTS.md](AGENTS.md). Der Befehl `node tools/lint.mjs` prüft Status, Verweise, Übergaben und die Unveränderlichkeit der Quellen.

## Die Stufen im Überblick

| Stufe | Leitfrage | Übergabe bestätigt durch |
|---|---|---|
| 1 · Ziel, Nutzen & Verantwortlichkeit | Welches Problem lohnt sich zuerst, und woran messen wir den Erfolg? | fachlich verantwortliche Person |
| 2 · Prozessreife, Nutzer & Organisation | Wie läuft die Arbeit heute tatsächlich ab? | spätere Nutzer |
| 3 · Daten, Datenschutz & Governance | Welche Daten dürfen wofür und von wem verwendet werden? | Datenverantwortliche |
| 4 · Architektur, Modell & Tool-Auswahl | Welche einfachste Lösung trägt den Anwendungsfall? | technische Verantwortung |
| 5 · Security, Resilienz & Kontrollmechanismen | Wo kann Schaden entstehen, und welche Kontrolle greift dort? | technische Verantwortung |
| 6 · MVP, Evaluation & Pilotierung | Besteht das Produkt den vereinbarten Vergleich? | fachlich verantwortliche Person |
| 7 · Rollout, Befähigung & Betrieb | Können Nutzer und Betrieb das Produkt eigenständig tragen? | Nutzer der ersten Gruppe, Betriebsverantwortung |
| 8 · Lifecycle, Skalierung & Ausstieg | Bleibt jede Änderung beherrschbar und umkehrbar? | verantwortliche Person |

Der Umfang jeder Stufe richtet sich nach dem Vorhaben. In einem kleinen Projekt genügt statt einer Beobachtung ein kurzes Gespräch am Arbeitsplatz und statt eines Prüfberichts eine Notiz im Issue. Die Übergaben selbst entfallen jedoch nicht, denn auch ein kleines Produkt braucht bestätigte Kriterien, einen geklärten Datenweg und für jede zwingende Kontrolle einen Prüffall.

## Sicherheit begleitet alle Stufen

Datenschutz, Sicherheit und Governance bilden keinen Abschnitt, der erst nach der Entwicklung beginnt. Bereits in Stufe 1 bestimmt die mögliche Schadenshöhe, wie streng die späteren Kontrollen ausfallen müssen. Stufe 2 zeigt, an welchen Stellen des Ablaufs vertrauliche Informationen auftauchen, Stufe 3 legt die verbindlichen Datenregeln fest, und Stufe 4 setzt Zugriffsrechte bereits beim Abruf um. Stufe 5 vertieft diese Vorarbeit vor dem Pilot zu einer geschlossenen Prüfung an allen Vertrauensgrenzen. Pilot, Betrieb und jede spätere Änderung prüfen die Kontrollen erneut. Das Beispiel am Ende dieses Leitfadens verfolgt ein solches Kriterium durch alle acht Stufen.

## Was eine Übergabe belastbar macht

Führe den fachlich bestätigten Stand, Entscheidungen, Code und Tests versioniert zusammen. In einem kleinen Projekt können ein kurzer Projektüberblick im Repository, die vorhandenen Issues und ausführbare Tests dafür genügen. Sensible Originaldaten und Zugangsdaten bleiben in den dafür freigegebenen Systemen. Der Agent erhält für seinen Auftrag die relevanten Ausschnitte, ihre Herkunft und den gültigen Stand. Ein neuer Chat kann so aus dem Projekt heraus weiterarbeiten.

Unterscheide **vorgeschlagen** (Annahme oder Entwurf), **bestätigt** (durch die zuständige Person entschieden) und **geprüft** (am benannten Stand beobachtet). Ein Agent kann etwa einen erwarteten Zeitgewinn vorschlagen. Den Ausgangswert liefert die heutige Arbeit, den Vergleich der spätere Pilot. Halte bei einer folgenreichen Entscheidung fest, wer sie getroffen hat, warum sie gilt und welche Änderung eine erneute Prüfung auslösen würde.

Die Qualitätszusage bezieht sich auf eine konkrete Version. Für deren Freigabe müssen der vereinbarte Nutzerablauf, die relevanten Sicherheitskontrollen und die Übernahme durch den Betrieb belegt sein. Unentdeckte Fehler bleiben möglich. Für eine bekannte technische Schuld gehören Auswirkung, verantwortliche Person und Anlass zur Behebung in ein nachvollziehbares Issue. Ein verletztes zwingendes Freigabekriterium führt zur Nachbesserung oder zu einer ausdrücklich neu entschiedenen Einschränkung des Funktionsumfangs.

## 1. Ziel, Nutzen & Verantwortlichkeit

**Eingang.** Eine Produktidee und Zugang zu einer Person, die das Arbeitsproblem aus eigener Praxis kennt.

> Frage mich nach dem letzten konkreten Vorgang, bei dem das Problem auftrat. Wer wollte welches Ergebnis erreichen, wie wurde die Aufgabe erledigt, und woran war der Aufwand oder Fehler erkennbar? Bitte die Beteiligten um weitere beobachtete Fälle, in denen das Problem in ähnlicher Form auftritt. Halte je Fall fest, worauf die Angaben zu Häufigkeit und Aufwand beruhen, und kennzeichne Schätzungen. Ordne die Fälle nach Häufigkeit, Aufwand, Fehlerfolgen und Verfügbarkeit der benötigten Informationen. Schlage daraus einen ersten nutzbaren Anwendungsfall vor und begründe, warum die übrigen zurückgestellt werden. Beschreibe auch die einfachste Verbesserung ohne KI. Schätze ab, welcher Schaden durch ein falsches oder unberechtigt erzeugtes Ergebnis entstünde. Schlage eine Ausgangsmessung, fachliche Abnahmekriterien und Gründe für Abbruch oder Nachbesserung vor. Markiere fehlende Messwerte und noch offene Entscheidungen.

**Übergabe an Stufe 2.** Die fachlich verantwortliche Person bestätigt die Priorisierung, den ersten Anwendungsfall, die Erfolgskriterien, die Einschätzung möglicher Fehlerfolgen und wer über Pilot und Freigabe entscheidet. Die Ausgangsmessung ist erhoben oder mit Methode, Zeitpunkt und Verantwortung vereinbart. So steht vor der Entwicklung fest, welchen Vergleich das Produkt bestehen soll.

## 2. Prozessreife, Nutzer & Organisation

**Eingang.** Der bestätigte Anwendungsfall und die Kriterien aus Stufe 1 sowie Zugang zu späteren Nutzern.

> Bereite eine Beobachtung des heutigen Ablaufs vor. Bitte die ausführende Person, einen gewöhnlichen Fall und eine schwierige Ausnahme vom Eingang bis zur Übergabe zu zeigen. Frage an Entscheidungspunkten, welche Regel gilt, welches Erfahrungswissen gebraucht wird und wie ein Fehler auffällt. Notiere, an welchen Stellen vertrauliche oder personenbezogene Informationen auftauchen und wer sie heute sehen darf. Leite aus dem beobachteten Ablauf realistische Nutzungsszenarien mit Eingabe, erwartetem Ergebnis und Korrekturweg ab. Kennzeichne Unterschiede zwischen dokumentiertem und gelebtem Ablauf.

**Übergabe an Stufe 3.** Ein späterer Nutzer geht die Szenarien durch und korrigiert Missverständnisse. Festgehalten sind die tatsächlich benötigten Informationen und die Stellen, an denen ein Mensch eingreift. Ein Ergebnis gilt erst als nutzbar, wenn die Person es im Arbeitsablauf prüfen, korrigieren und übernehmen kann.

## 3. Daten, Datenschutz & Governance

**Eingang.** Bestätigte Szenarien, Rollen und Informationsbedarf aus Stufe 2.

> Prüfe zuerst, ob der Anwendungsfall jedes vorgesehene Datum tatsächlich braucht, und streiche oder vergröbere Angaben, die für das Ergebnis entbehrlich sind. Verfolge für jedes verbleibende Datum den Weg von der maßgeblichen Quelle bis zur Verwendung. Berücksichtige Modellanbieter, Suchindex, Zwischenspeicher, Protokolle und gespeicherte Zusammenfassungen, soweit sie vorgesehen sind. Kläre Herkunft, Qualität, erlaubten Zweck, Leserechte, Aufbewahrung und Löschung. Zeige, was bei Rechteentzug oder einer korrigierten Quelle geschehen muss. Leite synthetische Entwicklungsdaten für einen erlaubten Zugriff, einen verweigerten Zugriff und fehlende Informationen ab.

**Übergabe an Stufe 4.** Datenverantwortliche bestätigen zulässige Quellen, Zwecke und Grenzen. Offene Freigaben bleiben sichtbar. Mit synthetischen Daten kann die Entwicklung weitergehen. Für jede geplante Übertragung echter Daten muss der konkrete Verarbeitungsweg geklärt sein.

## 4. Architektur, Modell & Tool-Auswahl

**Eingang.** Abnahmekriterien, Nutzungsszenarien, bestätigte Datenregeln und vorhandene Codebasis.

> Untersuche zuerst den bestehenden Ablauf im Code und seine Schnittstellen. Zeige, was wir wiederverwenden können. Vergleiche für den kleinsten vollständigen Anwendungsfall eine Lösung ohne Modell mit einer modellgestützten Variante nach Eignung, Aufwand und laufenden Kosten. Begründe, welche Aufgabe Code, Modell und Mensch jeweils übernehmen. Implementiere die gewählte Variante mit synthetischen Daten vom Nutzereinstieg bis zum sichtbaren Ergebnis. Berücksichtige die bestätigten Zugriffsregeln bereits beim Abruf. Zeige, wie ich den Ablauf starte, und kennzeichne simulierte Dienste.

**Falls ein Modell gebraucht wird:** Der versionierte Laufzeitprompt beschreibt Aufgabe, erwartetes Ergebnis und Verhalten bei fehlender Evidenz. Die Anwendung wählt Quellen nach Zweck, Aktualität und Nutzerrechten aus. Dokumenttext und Werkzeugausgaben bleiben als externe Inhalte erkennbar. Die Anwendung prüft Ausgabeformat, Geschäftsregeln und Berechtigungen für nachfolgende Aktionen. Umfang und Auswahl des Kontexts werden mit Beispielen überprüft. [Anthropic zu Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) · [Microsoft zur Rechteprüfung beim Dokumentabruf](https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview)

**Übergabe an Stufe 5.** Die technische Verantwortung prüft den Diff auf duplizierte Fachlogik, unnötige Abhängigkeiten und Auswirkungen auf bestehende Aufrufer. Der Nutzerfall lässt sich am angegebenen Stand ausführen. Die wesentliche Architekturentscheidung und bewusst eingegangene Vereinfachungen sind dokumentiert.

## 5. Security, Resilienz & Kontrollmechanismen

**Eingang.** Der ausführbare Stand aus Stufe 4, sein tatsächlicher Datenfluss und die Schutzanforderungen aus Stufe 3.

> Gehe den implementierten Ablauf an seinen Vertrauensgrenzen durch. Welcher Schaden könnte durch falsche Daten, unberechtigten Zugriff, eine fehlerhafte Modellantwort oder einen Dienstausfall entstehen? Ordne jedem relevanten Risiko eine Kontrolle im zuständigen System und einen beobachtbaren Prüffall zu. Prüfe mit synthetischen Daten auch Rechteentzug, ungültige Ausgaben und wiederholte schreibende Aktionen, sofern der Ablauf diese Fälle kennt. Erprobe Kostenbegrenzung und manuellen Rückfallweg dort, wo eine Überschreitung oder Unterbrechung Folgen hätte.

**Übergabe an Stufe 6.** Die technische Verantwortung kann zeigen, wo jede wesentliche Kontrolle greift. Bei einem gesperrten Dokument ist beispielsweise bereits vor dem Modellaufruf prüfbar, dass sein Inhalt fehlt. Bei einem freigabepflichtigen Vorgang wird die Aktion ohne gültige Freigabe technisch unterbunden. Der Prüfbericht nennt Ergebnisse, offene Risiken und deren Bedeutung für den Pilotumfang. [OWASP zu Prompt Injection](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) · [OWASP zur Sicherheit des Dokumentabrufs](https://cheatsheetseries.owasp.org/cheatsheets/RAG_Security_Cheat_Sheet.html)

## 6. MVP, Evaluation & Pilotierung

**Eingang.** Ein für den Pilotumfang geprüfter Produktstand, die Ausgangsmessung und fachlich bestätigte Szenarien.

> Führe die Abnahmefälle über den normalen Produkteinstieg aus. Verwende für die Modellevaluation zusätzlich fachlich bewertete Fälle, die bei der Promptentwicklung ungenutzt blieben. Prüfe getrennt, ob die passende Quelle abgerufen wurde, ob sie die Antwort trägt und ob die Anwendung das Ergebnis korrekt verarbeitet. Wiederhole variable Modellschritte, wenn deren Schwankung die Entscheidung beeinflusst. Bereite einen Pilotdurchlauf mit späteren Nutzern vor. Erfasse neben der Ergebnisqualität auch Suchzeit, Korrekturaufwand und Übergabe an den nächsten Arbeitsschritt.

**Übergabe an Stufe 7.** Die fachlich verantwortliche Person vergleicht die beobachteten Pilotergebnisse mit den Kriterien aus Stufe 1 und entscheidet über Freigabe, Nachbesserung oder Stopp. Fehler erhalten einen reproduzierbaren Fall oder ein geeignetes Evaluationsbeispiel. Wenn eine fachliche Erwartung geändert werden soll, wird diese Änderung separat begründet und bestätigt. Dadurch behält ein bestandener Test seine Aussagekraft. [Anthropic zur Evaluation von KI-Anwendungen](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

## 7. Rollout, Befähigung & Betrieb

**Eingang.** Fachlich freigegebener Pilotstand, zulässiger Einsatzumfang und benannte Betriebsverantwortung.

> Bereite die gestufte Einführung vor. Halte Release-Kennung, Abhängigkeiten, erforderliche Konfiguration und genaue Build-, Test- und Startbefehle fest. Stelle eine synthetische Probeaufgabe mit erwartetem Ergebnis bereit. Erprobe in der vorgesehenen Testumgebung Installation sowie Wiederherstellung oder Rückkehr zum vorherigen Stand. Richte die für Qualität, Fehler und Kosten nötige Überwachung ein. Entwickle die Befähigung aus den bestätigten Szenarien der Stufe 2: Erstelle für jede Nutzergruppe eine realistische Übungsaufgabe, an der sie ein Ergebnis prüft, korrigiert, an der Grenze des Produkts auf den manuellen Weg wechselt und ein Problem meldet. Lege fest, wo Nutzer im Arbeitsablauf Hilfe finden und wer in der ersten Zeit Rückfragen beantwortet. Plane, wie Rückmeldungen aus Schulung und Support als Prüffälle oder Verbesserungen in das Projekt zurückfließen.

**Befähigung ist Teil des Produkts.** Ein Ergebnis nützt nur, wenn Nutzer die Grenzen des Produkts kennen und eine fehlerhafte Antwort erkennen. Die Schulung übt deshalb genau diese Prüfschritte am eigenen Arbeitsablauf, statt Funktionen vorzuführen. Unterschiedliche Nutzungsniveaus brauchen unterschiedliche Einstiege. Gelegentliche Nutzer benötigen eine kurze Hilfe direkt an der Stelle im Ablauf, an der sie entscheiden, intensive Nutzer ein vertieftes Verständnis typischer Fehlerbilder. Fragen und Meldungen aus den ersten Wochen zeigen, wo Oberfläche, Hilfe oder Prozess nachgebessert werden müssen.

**Übergabe an Stufe 8.** Eine zweite Person startet die freigegebene Version aus einem frischen Checkout und bearbeitet die Probeaufgabe ohne den ursprünglichen Entwicklungsdialog. Nutzer der ersten Gruppe bearbeiten ohne Begleitung einen vorbereiteten Übungsfall mit einer plausiblen, fachlich falschen Beispielantwort. Sie erkennen den Fehler anhand der Quelle und führen die vorgesehene Korrektur aus. Der Betrieb kennt Alarmwege, Zuständigkeiten und Rückfallverfahren. Die zuständige Person entscheidet anhand der Beobachtungen, wann der Nutzerkreis erweitert wird.

## 8. Lifecycle, Skalierung & Ausstieg

**Eingang.** Ein identifizierbarer Release, Betriebsbeobachtungen, bekannte Einschränkungen und der bisherige Prüfsatz.

> Spiele eine typische Änderung durch, etwa eine neue Datenquelle, eine geänderte Fachregel oder einen Modellwechsel. Verfolge von der betroffenen Entscheidung aus, welche Berechtigungen, Codepfade, Prompts und Tests erneut zu prüfen sind. Vergleiche die bisherige und die neue Version mit denselben freigegebenen Fällen und Kriterien. Prüfe Auswirkungen auf Nutzer, Betrieb und Gesamtkosten. Beschreibe und erprobe im angemessenen Umfang, wie sich Daten exportieren, ein Anbieter ersetzen und gespeicherte sowie abgeleitete Daten bei Abschaltung bereinigen lassen.

**Übergabe an die nächste Änderung.** Die verantwortliche Person kann anhand des Vergleichs freigeben, zurückstellen oder zurückkehren. Bei einer neuen Nutzergruppe beginnt die Prüfung wieder beim Anwendungsfall, bei einer neuen Datenquelle beim Datenfluss. Ein beobachteter Fehler ergänzt den Prüfsatz. So bleibt der Aufwand für eine kleine Änderung begrenzt und ihre Auswirkung nachvollziehbar.

## Ein Kriterium über den gesamten Lebenszyklus verfolgen

Angenommen, das Produkt beantwortet Fragen zu Projektakten. **Nur wer ein Projekt lesen darf, darf dessen Dokumente für eine Antwort verwenden.** So wird aus diesem Satz ein dauerhaft prüfbares Produktverhalten:

1. Der Fachbereich bestätigt die Anforderung als Freigabekriterium. Gelangt der Inhalt einer Projektakte ohne gültige Leseberechtigung in den Modellkontext, ist das Freigabekriterium verletzt.
2. Zwei Personen stellen dieselbe Frage. Für die berechtigte Person ist eine belegte Antwort das erwartete Ergebnis. Die andere erhält einen Hinweis ohne vertrauliche Projektdetails.
3. Die datenverantwortliche Person benennt das maßgebliche Rechtesystem und klärt, wann ein Rechteentzug wirksam sein muss.
4. Die Anwendung prüft beim Abruf die aktuelle Berechtigung. Die Fundstelle gelangt nur für die berechtigte Person in den Modellkontext.
5. Ein automatisierter Test beobachtet die tatsächlich übergebenen Dokumentreferenzen mit synthetischen Akten, auch nach einem Rechteentzug.
6. Der Pilot prüft beide Nutzerabläufe über die Oberfläche, einschließlich Verständlichkeit des Hinweises und fachlicher Richtigkeit der belegten Antwort.
7. Die Betriebsverantwortung kann den synthetischen Test nach einer Bereitstellung wiederholen, ohne vertrauliche Textinhalte protokollieren zu müssen.
8. Später soll ein Cache die Antwortzeit verkürzen. Vor der Freigabe wird derselbe Berechtigungsfall auch bei gefülltem Cache geprüft. Ein schnellerer Abruf darf die Prüfung der aktuellen Leseberechtigung nicht umgehen.

## Übergabe zwischen zwei Aufträgen

Eine Übergabe ist erst gelungen, wenn auch die übernehmende Seite den gültigen Stand findet und darauf arbeiten kann. Deshalb beginnt jeder Folgeauftrag mit einer Gegenprobe und endet mit einem Abschluss.

**Einstiegsauftrag für jeden Folgeauftrag**

> Lies die verlinkte Übergabe und die für deinen Auftrag maßgeblichen Projektdateien. Benenne das bestätigte Ziel, die weiterhin geltenden Entscheidungen und die offenen Annahmen, die deine Arbeit beeinflussen. Prüfe den letzten relevanten Nachweis, soweit er dir zugänglich ist. Wenn Angaben einander widersprechen, benenne den Widerspruch, bevor du die betroffene Entscheidung umsetzt. Fehlt eine für den Auftrag nötige Angabe, frage nach, statt sie selbst zu ergänzen.

**Abschlussauftrag für jede Übergabe**

> Vergleiche den aktuellen Stand mit den bestätigten Kriterien dieser Stufe. Aktualisiere die maßgebliche Stelle im Projekt und verweise auf Entscheidung, Implementierung und Prüffall, soweit vorhanden. Gib für ausgeführte Prüfungen Version, Voraussetzungen, Eingabe, Befehl oder Bedienfolge sowie erwartetes und beobachtetes Ergebnis an. Bei Modelltests gehören Modellkennung, Einstellungen, Prompt- und Datenstand sowie das Bewertungsverfahren dazu. Kennzeichne Abweichungen, ausstehende Prüfungen und die nächste menschliche Entscheidung. Stelle für den Folgeauftrag nur den dafür erforderlichen und freigegebenen Kontext zusammen.

Wiederholbarkeit ist erreicht, wenn eine andere Person denselben Stand unter benannten Bedingungen prüfen und das Ergebnis nach denselben Kriterien beurteilen kann. Bei Modellausgaben kann der Wortlaut variieren. Quellenbezug, fachliche Eignung, eingehaltene Berechtigungen und die tatsächliche Wirkung einer Aktion müssen weiterhin überprüfbar sein.
