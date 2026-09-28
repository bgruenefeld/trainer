# Heelwork – kanonisches Mitchell-Delta

Quelle: Wayne Mitchell, „Retriever Trainer's Handbook“, Section `Heelwork`, Evidence `provided_summary`. Die Inhalte wurden aus bereitgestellten Buchseiten fachlich extrahiert. Edition und Seitenzahlen sind nicht angegeben und werden nicht ergänzt.

## Skill-Ziel

Die bestehende ID `mitchell:heelwork` bleibt erhalten. Der Hund hält freiwillig und aufmerksam eine funktionale Position seitlich neben dem Handler und orientiert sich an Bewegung, Richtung und Geschwindigkeit. Allgemeine Leinenführigkeit ist damit nicht gleichgesetzt. TrainingEffect bleibt `control_building`.

Die einzige zusätzliche Skill-Dependency ist `heelwork → steadiness`, Typ `hard`. Sie dokumentiert Mitchells Trainingsreihenfolge, keine allgemeine kynologische Aussage. `acceptedCompetences` bleibt undefiniert. Insgesamt sind elf Dependencies aktiv.

## Sechs Exercises

| ID                           | Schwerpunkt                                                | Methodische Übungsvoraussetzung |
| ---------------------------- | ---------------------------------------------------------- | ------------------------------- |
| heelwork_basic_square        | Gerade Abschnitte und deutliche 90°-Richtungswechsel       | nicht vorgegeben                |
| heelwork_mixed_rectangles    | Wechselnde Seitenlängen, Richtungswechsel und Tempo        | heelwork_basic_square           |
| heelwork_triangles           | Zunehmend spitzere Winkel                                  | heelwork_mixed_rectangles       |
| heelwork_180_turns           | 180°-Wendungen                                             | heelwork_triangles              |
| heelwork_off_lead_transition | Schrittweise ohne aktive Leinenhilfe arbeiten              | nicht vorgegeben                |
| heelwork_distractions        | Generalisierung unter zunehmenden Umwelt- und Sozialreizen | nicht vorgegeben                |

`prerequisiteExerciseIds` ist Methodenwissen. Der Katalogservice validiert Referenzen; das Feld erzeugt weder UI-Sperre noch Readiness- oder Completion-Anforderung. Es wurden keine weiteren Übungsvoraussetzungen oder neuen Module ergänzt.

`turn_angle` und `pace_variation` ergänzen die bestehenden DifficultyFactors. Änderungen dieser Faktoren verwenden `changed_unknown` mit beschreibender Begründung. Weder Winkelgröße noch Geschwindigkeit wird in eine Schwierigkeitsskala umgerechnet. Tatsächliche Settings für diese Faktoren können qualitativ beschrieben werden.

Off-lead enthält die drei vorgegebenen Stufen: Leine mit abnehmender aktiver Einwirkung, Leine ohne aktive Nutzung in der Hand, Heelwork ohne Leine. Die Ablenkungsfolge bleibt geordnete Guidance: anderer Untergrund/Gras, Gerüche und Umweltreize, sichtbarer Ball/Dummy, ruhige trainierte Hunde, mehrere Hunde/Gruppen, bewegte Hunde, stärkere Umweltreize. Daraus entsteht keine globale starre Reihenfolge.

Nicht vorgegebene Schrittfolgen und Regressionen bleiben leer und als Inhaltslücken gekennzeichnet. Es gibt keine zusätzlichen Distanzen, Dauern, Wiederholungen oder Übungen späterer Kapitel.

## Vier Problems

- `heelwork_nose_down`: Nase unten/Suchen am Fuß.
- `heelwork_pulling_forward`: dauerhaftes oder wiederholtes Vorlaufen.
- `heelwork_too_far_side`: zu großer seitlicher Abstand.
- `heelwork_lagging`: wiederholtes Zurückbleiben.

Die 14 Ursachen, ihre Area-Zuordnungen und 14 Anpassungen samt Ursachenreferenzen folgen exakt dem freigegebenen Delta. Es gibt keine automatische Diagnose. Der Retrieve-/Markierungsreiz beim Zurückbleiben bleibt eine gezielte Motivationsanpassung, keine neue Marking Exercise. Zusätzliche Verknüpfungen einzelner Übungen mit Problemen wurden nicht abgeleitet; die Probleme sind über die bestehenden Skill-Details sichtbar.

Die Area-Union behält alle bisherigen Werte und ergänzt:

- `dog`: hundbezogene Faktoren außerhalb einer sinnvoll konkret benennbaren trainierten Fähigkeit, etwa Motivation, Unsicherheit oder Aufmerksamkeit.
- `training`: bisheriger Trainingsaufbau, Reihenfolge, Dosierung oder Gestaltung.

`dog_skill` bezeichnet weiterhin eine konkrete trainierte Fähigkeit. Bestehende Daten werden nicht umgeschrieben.

## Guidance und Generalisierung

Die Altersangabe steht ausschließlich in `recommendedAge.text`: „ungefähr ab 6–7 Monaten oder später“. Selbstbewusste Hunde gegebenenfalls früher, sensible oder unsichere Hunde gegebenenfalls später: ebenfalls nur Guidance. Keine numerischen min/max-Werte, Alters-Gates oder zusätzlichen automatischen Prüfungen.

Die vier Einstiegshinweise, der Übergang zu Steadiness und die Interpretationen für `introduced`, `learning`, `stable`, `generalised` sind quellenbezogene Beschreibungen. Die bestehenden sieben Puppy→Heelwork-Indikatoren bleiben unverändert. Keine automatische Kompetenzberechnung.

Die reguläre Leinen-Guidance ist ausdrücklich Mitchell-spezifisch: korrekte Position mit lockerer Leine, keine dauerhafte Spannung; bei Positionsfehler kann eine kurze gezielte Leineninformation erfolgen, danach unmittelbar wieder lockere Leine. Handler-Seite und Richtungswechsel sind ebenfalls Methoden-Guidance, keine universellen Regeln oder mathematischen Turn-Ratios.

## Source-specific correction methods

Nur als Quelleninformation für eine spätere UX-/fachliche Entscheidung dokumentiert:

- Körperliches Blockieren der Lauflinie.
- Fußbewegung beim Problem „Nase unten“.
- Überraschende Geräuschreize.
- Leine gegen Stiefel/Wellington zur Überraschungswirkung.
- Rassel-/Steinchenreiz.

Diese speziellen Methoden stehen ausschließlich in dieser Dokumentation. Sie sind keine Default-ProblemAdjustments, Anfänger-Schrittfolgen, automatischen Empfehlungen, Readiness-Regeln oder zwingenden Progressionen. Die kurze gezielte Leineninformation ist gemäß gesonderter Freigabe von diesen speziellen Methoden zu unterscheiden und gehört zur gekennzeichneten regulären Guidance.

## Integration und Prüfung

Der gemeinsame Katalog enthält 38 Skills, elf Handler-Skills, elf Dependencies, 13 Exercises und sieben Problems. Puppy Foundation zeigt ausdrücklich nur seine sieben Übungen. Heelwork ist über die bestehenden Skill-Details, Übungsdetails und Trainingserfassung erreichbar.

Snapshots und bestehende Trainings bleiben unverändert. Tests prüfen exakte Delta-IDs, Quellen, Areas und Ursachenverknüpfungen, Übungsvoraussetzungen, Guidance ohne Altersblockade, qualitative Faktoränderungen, Snapshot-Unabhängigkeit, die sieben Puppy-Karten und Off-lead-Erfassung ohne Veränderung früherer Daten.

Die drei Modellfragen sind durch Freigabe geklärt. Offen bleibt die spätere fachliche/UX-Entscheidung über die ausschließlich dokumentierten speziellen Korrekturmethoden.
