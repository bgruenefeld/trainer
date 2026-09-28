# Migration und UI-Anbindung

## Datenbestand erhalten

`TrainerDatabase` öffnet denselben Datenbanknamen wie bisher mit Schema-Version 2. Beim Upgrade werden ausschließlich fehlende Stores angelegt. Die IndexedDB-Upgrade-Transaktion schützt vor einem teilweise aktualisierten Schema. Ein blockiertes Upgrade zeigt eine Fehlermeldung mit Wiederholungsmöglichkeit; eine nachträglich erfolgreiche, bereits abgewiesene Öffnung wird geschlossen.

`initializeMitchell` nutzt einen eigenen Marker. Bestehende Hunde werden nicht ergänzt oder verändert. Nur wenn bei der ersten Initialisierung kein Hund vorhanden ist, wird Reggae angelegt. Weder Voran-Demotrainings noch Skill-Bewertungen werden erzeugt. Der alte Seeder und die Legacy-Domain sind entfernt. Explizite Persistenz-Fixtures sichern die Lesbarkeit früherer Trainings ab.

| Store            | Verwendung                                                           |
| ---------------- | -------------------------------------------------------------------- |
| dogs             | Bestehende Hunde, unverändert                                        |
| sessions         | Frühere Voran-Sessions, unverändert                                  |
| meta             | Bestehende Marker und neuer Initialisierungsmarker                   |
| skillAssessments | Individuelle Beurteilungen mit Verlauf, nur `add`                    |
| systemSessions   | Neue Trainings mit Übungssnapshot                                    |
| trainingProfiles | Schwerpunkte, qualitative Indikatoren und körperliche Einschätzungen |
| goals / roadmaps | Adapter für das vorhandene Planungsmodell, noch ohne eigene UI       |

Neue Stores haben einen Index auf `[dogId, systemId]`. Repository-Interfaces bleiben unabhängig von IndexedDB. Die Signals-Fassade lädt für diesen Prototyp alle Datensätze und filtert nach aktivem Hund/System; Pagination ist noch nicht erforderlich.

## Individuelle Einschätzungen

Die Skill-Detailseite speichert Kompetenz, Zustand, Kontext und Begründung in einem neuen Assessment. Frühere Einträge bleiben lesbar. Die Application prüft die Hundeexistenz und den Skill. Speichern wird während einer laufenden Mutation gesperrt. Ein Schreibfehler lässt den bisherigen Datenstand und die Formulareingaben erhalten.

Fokussierte Skills sind eine bewusste Auswahl und kein automatisch erzeugter Trainingsplan. Ein Profil kann ohne langfristiges Ziel existieren. Puppy→Heelwork-Indikatoren sind separate Beurteilungen; das Alter wird nicht als Gate ausgewertet. Die frühere Jumping-Prüfung ist im kanonischen Seed nicht aktiv. Ihre historischen individuellen Werte bleiben gespeichert.

Readiness und Zustand werden nebeneinander gezeigt. Die Roadmap zeigt keine Prozentwerte. Noch nicht beurteilte Skills werden von ausdrücklich als `not_started` dokumentierten Skills unterschieden.

## Trainingserfassung

Nach der Hund-/Übungsauswahl ist der Trainingsentwurf fest mit diesem Hund verknüpft. Ein zwischenzeitlicher Wechsel der globalen Hundauswahl ändert den Empfänger des Eintrags nicht. Der Flow erfasst Bedingungen, optionale Einzelkriterien und Reflexion. Distanz und Dauer haben keine vorgegebenen Trainingswerte.

Eine stabile Session-ID verhindert doppelte Einträge durch einen erneuten Speicherversuch. Der Erfolg wird erst nach dem Datenbank-Commit angezeigt. Speichern erzeugt keine Skill-Assessments und bestätigt keine Problemursachen.

Die Ausführung enthält einen verpflichtenden, schlanken `ExerciseSnapshot`; alle verschachtelten Felder werden explizit unabhängig kopiert. Neue Sessions tragen die Datensatzversion 3, die IndexedDB-Version bleibt 2. Die Historie liest Kriterienbeschreibungen aus diesem Snapshot. Neue und alte Sessions werden getrennt gekennzeichnet; alte Sessions bleiben unverändert.

## UI und Zugriff

Alle neuen Seiten sind lazy geladene Standalone Components. Die bestehende Gestaltung und Hundeverwaltung werden weiterverwendet. Komponenten greifen auf Application-Fassaden und Katalogabfragen zu, niemals direkt auf IndexedDB.

Skill- und Übungsdetails zeigen unbekannte IDs als nicht gefunden. Quellenstatus, Grenzen der Readiness und fachliche Inhaltslücken sind im UI sichtbar. Ungeklärte Voraussetzungen verhindern nicht das Lesen der Details oder die Dokumentation tatsächlich gemachter Beobachtungen.

## Prüfung

Migrationstests erstellen zunächst eine reale IndexedDB-Version 1 mit Hund, Sessions und Marker, schließen sie und öffnen sie über Version 2. Zusätzlich werden frische und wiederholte Initialisierung, Append-Semantik, Wiederöffnung und Hund-/Systemisolation geprüft.

Angular-Integrationstests prüfen Routing, Quellenanzeige, Statusverlauf, Hundwechsel, Schreibfehler, Trainingserfassung mit Kriterien und Snapshot, Doppelspeichern sowie dauerhafte Readiness-Einschätzungen.

Die lokale HTTP-Erreichbarkeit wurde geprüft. Eine visuelle Browserprüfung sowie reale Installation und Offline-Neustart der PWA konnten mangels verfügbarem Browser nicht durchgeführt werden. Veröffentlichung bleibt ausgesetzt.

## Kompatibilitätsgrenze nach dem Domain-Refactoring

Die Adapter projizieren beim Lesen; alte Originaldatensätze werden nicht umgeschrieben. Eindeutige frühere Kompetenzwerte werden mit `condition: normal` übernommen. `maintenance` und `regressed` ohne dokumentierte Kompetenz werden ausschließlich als `reassessment_required` im Application-Lesemodell gemeldet, niemals als Domain-Assessment. Die UI verlangt eine neue Kompetenzwahl. Ein solcher neuerer Eintrag verhindert auch den Rückfall auf ein älteres gültiges Assessment; erst eine zeitlich spätere neue Beurteilung löst den Hinweis auf.

Vollständige historische Übungssnapshots werden ohne aktuellen Katalog auf die schlanke Form projiziert. Fehlende Snapshots oder widersprüchliche redundante Felder werden als Kompatibilitätshinweis angezeigt, nicht durch aktuelle Katalogdaten ersetzt. Die Originale bleiben gespeichert. Persönliche Ziele und Roadmaps werden ohne frühere `source`-Felder gelesen und geschrieben.

Die alte `sessions`-Ablage ist nur über einen lesenden Archivadapter erreichbar. Sie liefert Anzeigedaten und keine alternative fachliche Trainingsstruktur. Domain-Tests hängen nicht von Infrastructure oder Demodaten ab.

## Kanonischer Seed und archivierte Skills

Die beiden früheren Skills `return_to_handler` und `early_delivery_foundation` sind ausschließlich Persistenzkompatibilität. Der lesende Archivadapter zeigt frühere Assessments mit Datum, ursprünglicher Kompetenz/Zustand beziehungsweise Legacy-Zustand, Kontext und Begründung an. Diese Einträge gelangen nicht in aktive Assessments oder Readiness. Neue Assessments werden für diese IDs zurückgewiesen; historische Snapshots bleiben ohne Neuzuordnung lesbar.

Die alten Hinweise zu Jumping und der zeitlichen Gewichtung von Handling/Hunting/Marking bleiben als `needs_verification` außerhalb des Seeds erhalten. Keine aktive Policy importiert diese Kandidaten. Neue kanonische Übungs-/Problem-IDs werden ausschließlich für neue Katalogeinträge verwendet; vorhandene Trainings werden nicht umgeschrieben.
