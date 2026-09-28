# Mitchell Trainingsroadmap

Die Roadmap ist didaktisches Methodenwissen: Mitchells Hauptlinie aus „The Plan – Your Plan To Turn Your Aspiration Into A Reality“. Sie ist keine allgemeingültige Retriever-Trainingsreihenfolge. Der SkillGraph beschreibt davon unabhängig fachliche Skill-Abhängigkeiten. Die 38 Skills, elf Handler-Skills und elf Skill-Dependencies bleiben unverändert.

## Kanonische Hauptlinie

1. Puppy Foundation
2. Heelwork
3. Steadiness
4. Setup
5. Delivery
6. Outrun Part 1
7. Outrun Part 2
8. Inrun and Recall
9. Training Tool – Stopping and Return on Voice/Body Language Only
10. Collection
11. Returning to Heel
12. Diversions
13. Go-Back Command
14. Stop Whistle
15. Pulling the Dog About in a Straight Line
16. Directions Part 1
17. Directions Part 2
18. Collecting Blinds by Handling
19. Hunting
20. Training for Shot
21. Marking
22. Walk-Up
23. Full Jumping
24. Water Work
25. Advanced Training

Roadmap-ID: `mitchell_main_roadmap`. Puppy und Heelwork sind `available` mit exakt sieben bzw. sechs bereits vorhandenen Übungen. Die übrigen 23 Stages sind `planned`: bekannte Kapitelposition, aber noch keine ausgearbeiteten Übungen. Sie enthalten keine Übungsreferenzen, Readiness- oder Completion-Regeln. Die Detailansicht zeigt Quellenstatus und eindeutig zugeordnete Skills. Bei Stopping/Return und Pulling/Straight Line bleiben Skill-Zuordnungen vorerst leer. Outrun Part 1/2 und Directions Part 1/2 teilen sich jeweils einen Skill; dessen Bewertung erzeugt keine getrennten Kapitelabschlüsse.

Die Reihenfolge wird allein durch das Stage-Array beschrieben. Nur Heelwork referenziert Puppy als explizite Stage-Voraussetzung. Keine weiteren Abhängigkeiten werden aus der Reihenfolge erfunden. Referenzprüfung validiert IDs, Systeme, Quellen, Skill-/Übungsreferenzen, Stage-Voraussetzungen und Zyklen.

## Status und individuelle Kompetenz

`RoadmapStageStatus` ist ein abgeleiteter Darstellungsstatus, keine neue `SkillCompetence`. Kein Status wird gespeichert oder als manueller Stage-Abschluss angeboten. Keine Prozentwerte, Scores, Punkte oder Session-basierte Completion.

- `not_started`: kein begonnener Skill-Aufbau oder relevantes Übungstraining dokumentiert. Ein Assessment mit `not_started` alleine ist keine Trainingsaktivität.
- `active`: relevante Kompetenz eingeführt/im Aufbau oder relevante Aktivität dokumentiert. Bei anderen als den ausdrücklich geregelten Stages gibt es keine automatische Etablierung.
- `ready_to_progress`: ausschließlich Puppy, wenn die bestehende Puppy→Heelwork-Prüfung bereit meldet. Sieben erfüllte Indikatoren bedeuten keine Etablierung aller Puppy-Skills.
- `established`: ausschließlich Heelwork, wenn das aktuelle wirksame Heelwork-Assessment `stable` oder `generalised` und nicht `regressed` ist. `maintenance` verhindert diesen Status nicht.
- `needs_attention`: mindestens ein Stage-Skill ist explizit als `regressed` beurteilt. Konkrete Findings erläutern den Befund.

Für Heelwork→Steadiness gibt es keine automatische Übergangsbereitschaft. Steadiness bleibt der nächste vorgesehene Abschnitt; die operative Übergangsprüfung wird erst nach Kapitelauswertung ergänzt. Leere Readiness-Prüfungen anderer Skills gelten nicht als Nachweis einer Stage-Bereitschaft.

Die letzte wirksame Bewertung pro Hund/System/Skill zählt. Ungeklärte historische Assessments dürfen ältere Kompetenzwerte nicht reaktivieren. Widersprüchliche zeitgleiche Bewertungen werden nicht stillschweigend aufgelöst. Sessions belegen nur Aktivität und werden unverändert gelesen. Beobachtete Kriterien erzeugen keinen Übungsabschluss.

## Fokus

Eine gültige Nutzerwahl hat Vorrang, auch für einen geplanten Abschnitt. Sie stellt keine Kompetenzbehauptung dar. Navigation und Fokuswahl sind nicht durch Voraussetzungen gesperrt.

Ohne Nutzerwahl gilt:

1. Frühester aktiver verfügbarer Abschnitt.
2. Folgender verfügbarer Abschnitt nach einer übergangsbereiten Stage, sofern dieser nicht bereits etabliert ist.
3. Frühester verbleibender verfügbarer Abschnitt, der weder etabliert noch übergangsbereit ist.
4. Sind die verfügbaren Abschnitte etabliert/übergangsbereit, erscheint der nächste geplante Abschnitt ausschließlich als Ausblick; kein automatischer geplanter Fokus.

Regression in früheren Abschnitten bleibt sichtbar und setzt einen späteren Fokus nicht automatisch zurück. Frühere gültige stabile Heelwork-Assessments dienen bei späterer Regression ausschließlich der Kontinuität des automatischen Fokus, niemals der aktuellen Kompetenz- oder Etablierungsanzeige. Frühe Attention-Stages werden bei belegter späterer Aktivität nicht zum neuen Fokus gemacht. Nutzerfokus bleibt auch bei Regression unverändert.

## Findings

Mehrere Findings können nebeneinander bestehen. `on_track` wird nicht verwendet.

- `current_focus`: automatisch vorgeschlagener oder bewusst gewählter Schwerpunkt.
- `not_yet_relevant`: späterer Skill ohne begonnenen Aufbau; kein Defizit.
- `regression`: explizite Condition `regressed`.
- `maintenance_due`: explizite Condition `maintenance`, in der UI „Pflegebedarf“. Kein berechneter Fälligkeitstermin und nicht derselbe Schweregrad wie Regression.
- `needs_attention`: konkret als nicht erfüllt beurteilter Puppy-Übergangsindikator im aktuellen/bereits relevanten Bereich; keine Ableitung aus fehlenden Assessments.

Fehlende Daten bleiben ungeklärt. Noch nicht ausgearbeitete Kapitel sind kein Hundedefizit. Tatsächlich dokumentierte Regression/Maintenance bleibt auch bei später zugeordneten Skills sichtbar. Bei mehrfach zugeordneten Skills werden Findings in der Gesamtübersicht nicht doppelt gezählt.

## Persistenz und UI

`DogRoadmapProgress` ist ein Lesemodell ohne Methodenquelle. Die einzige aktive Nutzerzustandsquelle bleibt `DogTrainingProfile`: optionales `roadmapFocus: { roadmapId, currentStageId? }`, vorhandene `focusSkills`. Keine zweite Fokusliste, neue Datenbank oder neuer Object Store. Fehlende optionale Felder benötigen keine Migration. Fokusänderungen erhalten Indikatoren, Constraints und Skill-Fokus.

Historische persönliche `SkillRoadmap`-Datensätze und `TrainingSession.roadmapId` bleiben unverändert. Sie werden nicht als Referenz auf die neue Methodenroadmap umgedeutet. Keine Completion-Migration.

`/roadmap` zeigt Trainingsweg, aktuellen Schwerpunkt, stabile Skills, Aufbau, Aufmerksamkeit, Übungshistorie und nächsten vorgesehenen Abschnitt. `/skills` bleibt die getrennte Skill-Übersicht. Dashboard und Roadmap benutzen dieselbe Projektion. „Warum?“-Informationen entstehen deterministisch aus Kapitelreihenfolge, Stage-Voraussetzungen und bestehender Readiness. Der Katalog selbst bleibt unveränderliches Methodenwissen.

## Offene fachliche Punkte

- Operative Übergangsprüfung Heelwork→Steadiness.
- Detailinhalte, eventuelle eigene Kapitelkompetenzen und Statusregeln der 23 geplanten Stages.
- Eindeutige Skill-Zuordnung für die beiden derzeit leer zugeordneten Kapitel.
- Keine globale Etablierungsregel für Puppy oder spätere Kapitel eingeführt.
