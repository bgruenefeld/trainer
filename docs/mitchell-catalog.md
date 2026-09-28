# Kanonischer Mitchell-Katalog

Verbindlich sind der freigegebene kanonische Datensatz und die anschließenden Präzisierungen. Es wurden keine weiteren Buchinhalte recherchiert oder Trainingsregeln ergänzt.

## Aktiver Bestand

- 38 Hundeskills in sieben Kategorien; die neutralen bestehenden Definitionen außerhalb Puppy Foundation bleiben erhalten.
- Elf Handler-Skills mit den vorgegebenen Beschreibungen.
- Exakt elf Dependencies, ohne `acceptedCompetences`.
- Vier Retrieve-Phasen mit den vorgegebenen Komponenten.
- Sieben Puppy Exercises und drei Puppy Problems sowie sechs Heelwork Exercises und vier Heelwork Problems.
- Sieben qualitative Puppy→Heelwork-Indikatoren.
- 15 Trainingsprinzipien als `SourcedStatement` und 15 ausdrücklich vorgegebene Skill-/Effekt-Zuordnungen als partielle Map.

| Voraussetzung       | Ziel            | Typ         |
| ------------------- | --------------- | ----------- |
| heelwork            | setup           | soft        |
| setup               | outrun          | soft        |
| go_back             | stop_whistle    | soft        |
| recall              | directions      | soft        |
| stop                | directions      | hard        |
| go_back             | directions      | hard        |
| directions          | blind_handling  | hard        |
| heelwork            | return_to_heel  | maintenance |
| steadiness          | walk_up         | hard        |
| handler_orientation | informal_recall | soft        |
| heelwork            | steadiness      | hard        |

Fehlende Kompetenzschwellen werden nicht aus diesen Typen oder Beschreibungen abgeleitet. Die bestehende Domain-Semantik bleibt unverändert. Readiness ist keine allgemeine Trainingsfreigabe.

## Quellen

Autor ist Wayne Mitchell, Titel „Retriever Trainer's Handbook“, Methode Mitchell. `provided_summary` dokumentiert die laut Nutzer anhand bereitgestellter Buchseiten fachlich extrahierten und geprüften Inhalte. Für `book_verified` fehlt die erforderliche Edition; es werden weder Edition noch Seitenzahlen erfunden.

Puppy-Inhalte tragen `section: Puppy Informal Play Training`. Für allgemeine Inhalte bleibt die Section mangels eindeutiger Einzelzuordnung leer. Die Quellenanzeige unterscheidet die gespeicherte Referenz von einer eigenen Buchprüfung.

## Zurückgestellte Aussagen

`src/app/data/verification/mitchell-statements.ts` bewahrt die früheren Hinweise zu Handling vor größeren Hunting-/Marking-Anteilen und körperlicher Reife beim Jumping als `needs_verification`. Die Datei liegt außerhalb des kanonischen Seeds und wird von keiner aktiven Policy, Dependency oder UI-Entscheidung importiert.

Die frühere Jumping-Prüfung blockiert keine Readiness mehr, auch wenn individuelle alte Prüfdaten gespeichert sind. Diese Daten werden nicht gelöscht. Die Aussagen sind bei Auswertung der betreffenden Kapitel erneut zu prüfen.

## Historische Daten

`return_to_handler` und `early_delivery_foundation` sind keine aktiven Skills mehr. Der Persistenzadapter hält ihre Assessments aus dem aktiven Lesemodell heraus. Das bestehende Archiv zeigt die Originaleinschätzungen einschließlich mehrdeutiger alter Zustände an. Weder Löschung noch Zuordnung zu anderen Skills erfolgt. Neue Assessments mit diesen IDs werden zurückgewiesen.

Übungen und Probleme verwenden die kanonischen IDs; der Katalog und neue Übungssnapshots tragen Version 2.0.0. Historische Trainings behalten ihre damaligen IDs, Versionen, Kriterien und Skill-Zuordnungen. Neue Trainings dürfen keine archivierten Skills verwenden. Die IndexedDB-Struktur bleibt unverändert.

## Prüfungen

Katalogtests sichern die exakten aktiven IDs, elf Kanten samt Typen, Referenzen, Übungseffekte, Retrieve-Phasen, qualitative Readiness, Anpassungsrichtungen und Snapshots ab. Problemanpassungen benötigen weiterhin mindestens eine gültige Ursache desselben Problems. Persistenz- und UI-Tests prüfen historische Lesbarkeit und den Ausschluss archivierter Skills aus dem aktiven Stand.

## Heelwork-Delta

Die neue Section `Heelwork` und die einzige zusätzliche Dependency erweitern den Seed. Details zu Übungsvoraussetzungen, Guidance, neuen Faktoren und der Trennung spezieller Korrekturmethoden stehen in [Heelwork](heelwork.md). Andere Kapitel bleiben unverändert. Die allgemeinen 15 Trainingsprinzipien und sieben Puppy-Readiness-Indikatoren werden nicht durch die kapitelbezogene Guidance ersetzt.
