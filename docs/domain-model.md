# Domainmodell nach dem Refactoring

Unter `src/app/core/domain` existiert genau ein fachliches Modell. Die alten Ordner `skill/`, `exercise/` und `training/` sowie ihr Erfassungsflow sind entfernt. Persistierte Altwerte werden ausschließlich an der Infrastrukturgrenze behandelt; siehe [Migration und UI](migration-and-ui.md).

## Fachliches Wissen und individuelle Daten

`TrainingSource` beschreibt Methodenwissen: Skills, Übungen, Anforderungen, Probleme, Guidance und Retrieve-Komponenten behalten ihre Quellen. Individuelle Assessments, Sessions, Profile, Ziele und Roadmaps tragen keine eigene Methodenquelle. Der historische `ExerciseSnapshot` bewahrt die Quelle seiner fachlichen Definition.

Domain-Code und Domain-Tests importieren weder Angular noch Infrastructure. IDs sind opake Typen. Felder und Arrays sind readonly; dies ist kein Runtime-Freeze.

## Kompetenz und Zustand

`SkillCompetence` enthält `not_started`, `introduced`, `learning`, `stable`, `generalised`. `SkillCondition` enthält separat `normal`, `maintenance`, `regressed`. Hund- und Handler-Assessments dokumentieren beides. `changeSkillAssessment` prüft neue Identität, denselben Hund/Skill/System, Kontext, Begründung und Zeitfolge; bisherige Assessments bleiben erhalten.

Readiness prüft die expliziten `acceptedCompetences` einer Anforderung. Es gibt keine implizite Rangfolge oder erfundene Standardschwelle. `generalised + maintenance` kann eine harte Voraussetzung erfüllen; `regressed` allein blockiert nicht. Der Zustand bleibt im Prüfergebnis verfügbar.

Fehlende Assessments ergeben `unknown`. Ohne akzeptierte Kompetenzmenge bleibt eine begonnene Kompetenz ungeklärt, `not_started` ist unerfüllt. Unerfüllte harte Voraussetzungen oder körperliche Einschränkungen ergeben `not_ready`; offene harte Voraussetzungen, Indikatoren oder körperliche Prüfungen ergeben `needs_review`. Soft- und Maintenance-Beziehungen erzeugen alleine keine harte Blockade. Alter schaltet nichts frei.

## Gerichtete Anpassungen

`ExerciseAdjustment.changes` verwendet die vorhandenen `DifficultyChange` mit Faktor, Richtung (`increase`, `decrease`, `changed_unknown`) und Begründung. Progression und Regression bewahren damit ihre Änderungsrichtung. `reviewDifficultyChanges` erkennt mehrere Erhöhungen ohne Score oder automatische Trainingsvorgabe.

## Historische Trainings

`ExerciseExecution` besitzt genau einen verpflichtenden `ExerciseSnapshot`. Er enthält Übungs-ID, System, Version, Titel, primären und sekundäre Skills, Handler-Skills, Trainingseffekt, Erfolgskriterien und Quelle. Die übrigen Ausführungsfelder dokumentieren tatsächliche Bedingungen, Bewertungen, Beobachtungen und Notizen.

`createExerciseSnapshot` kopiert Arrays, Kriterienobjekte, deren Skill-Arrays, Quelle und Evidence explizit. Die Factory verwendet keinen generischen Deep-Clone. Änderungen an der Definition verändern den bestehenden Snapshot nicht. Beim Speichern und Anzeigen wird kein aktueller Katalog benötigt. Die Session-Datensatzversion ist 3; IndexedDB bleibt auf Version 2.

Tests sichern Readiness, gerichtete Änderungen, Snapshot-Unabhängigkeit, historische Migration und die notwendige erneute Einschätzung mehrdeutiger Altwerte ab. Neue Mitchell-Inhalte wurden im Refactoring nicht ergänzt.

## Freigegebene Erweiterungen für Heelwork

`TrainingExercise.prerequisiteExerciseIds?: readonly ExerciseId[]` dokumentiert ausschließlich methodische Übungsvoraussetzungen. Referenzen werden im Katalog validiert, aber nicht als automatische Sperre, Completion oder Readiness ausgewertet.

`DifficultyFactor` ergänzt `turn_angle` und `pace_variation`; qualitative Settings beschreiben die tatsächliche Variation. Änderungen ohne eindeutige Erhöhungs-/Verringerungssemantik verwenden `changed_unknown`. Es entsteht keine numerische Schwierigkeitsskala.

`ProblemCause.area` ergänzt `dog` (hundbezogene Faktoren außerhalb konkreter Skills) und `training` (Aufbau, Reihenfolge, Dosierung, Gestaltung). `dog_skill` bleibt für konkrete trainierte Fähigkeiten erhalten. Bestehende Daten und Snapshots werden nicht migriert.
