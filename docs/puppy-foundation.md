# Kanonische Puppy Foundation

Die vorhandenen sieben Module verwenden jeweils eine kanonische Übung. Ihre Reihenfolge ist keine Trainingsvorgabe.

| ID | Titel | TrainingEffect |
| --- | --- | --- |
| puppy_environmental_exposure | Environmental Exposure | neutral |
| puppy_handler_orientation | Handler Orientation | neutral |
| puppy_informal_recall | Informal Recall | mixed |
| puppy_leash_introduction | Leash Introduction | neutral |
| puppy_informal_retrieve | Informal Puppy Retrieve | drive_building |
| puppy_intro_sit_stay | Introductory Sit and Stay | control_building |
| puppy_terrain_exploration | Terrain Exploration | neutral |

Ziele, beteiligte Skills, Handler-Skills, Arbeitsmodi, Kontexte und Erfolgskriterien stammen aus der kanonischen Vorgabe. Leinengewöhnung bleibt von Heelwork, Geländeerkundung von Hunting und informeller Recall von formal generalisiertem Recall getrennt. Puppy Retrieve verlangt keine perfekte formale Delivery.

## Unvollständigkeit erhalten

Nur Handler Orientation besitzt eine ausdrücklich vorgegebene vierteilige Schrittfolge. Nicht vorgegebene Durchführungsschritte bleiben leer und werden als Inhaltslücke gekennzeichnet. Unsequenzierte Handler-Hinweise stehen in `guidance.notes`; daraus entsteht keine erfundene Reihenfolge. Nicht vorgegebene einzelne Kriterien-/Handler-Skill-Zuordnungen bleiben leer.

Progression beim informellen Retrieve enthält zweimal `novelty: increase` (anderes Objekt, anderer Ort) und einmal `distractions: increase`. Regression enthält `distractions: decrease`, `distance: decrease` und die Beschreibung „Umgebung vereinfachen“ mit leerem `changes`-Array. Einladenderes Handlerverhalten bleibt ein Guidance-Hinweis und ist kein DifficultyChange. Die Begründung der gerichteten Änderung übernimmt jeweils die vorgegebene Anpassungsbeschreibung.

Andere Übungen erhalten keine erfundenen Progressionen oder Regressionen. Fehlende Felder bleiben als solche sichtbar. Keine Alterswerte, Meterwerte, Wiederholungszahlen, Zeitvorgaben, Scores oder Prozente wurden ergänzt.

## Probleme

Drei kanonische Probleme enthalten 17 mögliche Ursachen und 16 Anpassungen. IDs und sämtliche Ursache-/Anpassungsverknüpfungen entsprechen der ausdrücklichen Freigabe. Es gibt keine Modellöffnung und keine automatische Diagnose.

Die erlaubte semantische Area-Zuordnung verwendet vorhandene Werte:

- `handler`: Körpersprache, Timing, Verfolgen, sozialer Druck, Anspannung und die fünf Ursachen des Abgabeproblems.
- `environment`: Umweltschwierigkeit, fehlende passende Umweltgewöhnung, fehlende Explorationsmöglichkeiten, Überforderung durch die Gesamtsituation und konkurrierende Gegenstands-/Umweltreize.

Zusätzliche Ursache-/Skill-, Handler-Skill- oder Faktorzuordnungen werden nicht erfunden. Bestehende passende Übungs-/Problemverknüpfungen bleiben erhalten.

## Herkunft und Historie

Alle Inhalte tragen die zentrale Quelle mit Section „Puppy Informal Play Training“ und `provided_summary`. Die Referenz erklärt die fachliche Extraktion aus bereitgestellten Buchseiten; eine Edition liegt nicht vor.

Neue Snapshots werden unabhängig vom Katalog erzeugt. Frühere Trainings behalten ihren damaligen Inhalt. Weitere Details: [Kanonischer Katalog](mitchell-catalog.md) und [Migration](migration-and-ui.md).
