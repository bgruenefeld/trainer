# Feldfreund · Retriever Training

Mobile-first Angular-App zum Dokumentieren von Retriever- und Dummytraining. Der Prototyp bietet Hundeanlage, Dashboard, schrittweise Trainingserfassung und eine nach Hund gefilterte Historie. Alle Daten bleiben in diesem Browser auf diesem Gerät.

## Entwicklung

Voraussetzungen: Node **24.15 oder neuer innerhalb der 24er-Reihe** (alternativ Node ^22.22.3 oder >=26), npm. `.nvmrc` verwendet Node 24. Angular **22.2.0** ist die beim Setup über npm bestätigte stabile Version. Die Systemversion Node 22.22.1 ist dafür zu alt.

```sh
nvm install
nvm use
npm ci
npm start
```

App: http://localhost:4200. Alternativ ohne nvm, wenn Node 24 noch nicht systemweit installiert ist: `npx --yes --package=node@24 -c 'npm start'`.

```sh
npm run lint
npm run test:ci
npm test                 # Watch-Modus
npm run build
```

Produktionsdateien: `dist/retriever-trainer/browser`. Auf einem statischen Host müssen unbekannte App-Routen wie `/dogs` und `/history` auf `index.html` zurückfallen. Der Angular-Devserver übernimmt das bereits. `.openai/hosting.json` ordnet den statischen Build der privaten Sites-Vorschau zu.

## Architektur

Abhängigkeiten zeigen zur Domain. Es gibt keine Angular-Imports in den Domain-Dateien. Die fachlichen Application-Services verwenden ausschließlich die Repository-Interfaces. Angular-spezifische Signals und DI sind in der Application-Fassade und im Trainingsentwurf gekapselt. Die Komponenten binden diese Zustände und delegieren Aktionen.

```text
src/app/
  core/
    domain/
      dog/             Dog, DogId, Validierung, DogRepository
      skill/           Skill, SkillId, LINE_OUT
      exercise/        Exercise als wiederverwendbare Vorlage
      training/        Setup, Performance, Run, Session, Repository
    application/
      dog/             DogService
      training/        TrainingService und TrainingDraft
      providers.ts     DI-Tokens für Repository-Ports
      trainer-store.ts Signals-Fassade, Hundauswahl, Ladevorgänge
    infrastructure/
      persistence/     IndexedDB, Repository-Adapter, einmaliger Demo-Seed
  features/
    dashboard/         Übersicht, Schwerpunkt, letztes Training
    dogs/              Hunde anzeigen und anlegen
    training/          Sechsstufige Trainingserfassung
    history/           Historie des ausgewählten Hundes
  shared/
    components/        Hundauswahl und Session-Karte
    models/            Deutsche Labels für fachliche Typen
```

Die vier Seiten werden per Router lazy geladen. Die DI-Zuordnung liegt zentral in `app.config.ts`. Ein späterer REST-Adapter implementiert `DogRepository` und `TrainingSessionRepository`; nur die Provider und die Dateninitialisierung werden ausgetauscht. Domain, Services und Seiten müssen dafür nicht grundsätzlich umgebaut werden. Die Fassade hält für diesen kleinen Prototyp alle Sessions im Speicher; für große Datenmengen kann sie später paginierte Abfragen verwenden.

## Fachliches Modell

**Skill → TrainingMethod → TrainingSetup → Performance → TrainingSession** beschreibt die fachliche Trennung, keine Vererbung und keine Levelhierarchie:

- **Skill:** die Fähigkeit, hier `LINE_OUT` / Voran; inklusive Name, Beschreibung und Kategorie.
- **TrainingMethod:** die Methode, hier sichtbares Ziel, Memory, Geländeleitlinie, gestaffelte Apporte oder Blind. Memory und Blind sind keine eigenen Skills.
- **TrainingSetup:** voneinander unabhängige Bedingungen: Meter, Sichtbarkeit beim Start, Kenntnis der Zielstelle durch den Hund, Leitlinie, Wartezeit, Verleitung, Gelände und Sichtbarkeit des Gegenstands am Ziel. `retrieveObject` unterscheidet Dummy und Tennisball.
- **Performance:** optionale Bewertung je fachlichem Kriterium, `NEEDS_SUPPORT`, `MOSTLY` oder `RELIABLE`. Ein fehlender Eintrag bedeutet „nicht bewertet“, niemals „nicht geschafft“. Es gibt keinen Gesamt-Score.
- **TrainingRun:** tatsächliche Ausführung mit Skill-ID, Methode, konkretem Setup, Einzelbewertungen und optionaler Notiz.
- **TrainingSession:** Hund-ID, ISO-Zeitpunkt, Dauer **in Minuten**, Notizen und eine Liste von Durchläufen.
- **Exercise:** optionale Vorlage mit vorgeschlagenem Setup. Ein Durchlauf speichert seine tatsächlichen Bedingungen als Snapshot.
- **Dog:** typisierte ID, Name, Geburtsdatum als `YYYY-MM-DD`, Rasse, optional Geschlecht und Foto-URL.

Meter, Gelände, Zielkenntnis und andere Dimensionen werden nicht auf eine gemeinsame Schwierigkeitszahl reduziert. Ein 100-m-Memory kann unter bestimmten Bedingungen leichter sein als ein 40-m-Blind. Spätere Dimensionen wie Wind oder Bewuchsdichte können als zusätzliche typisierte Felder ergänzt werden; beim Persistenzschema ist dann eine Migration bestehender Datensätze erforderlich.

`TrainingService` validiert Sessions und prüft die Existenz des Hundes. Die Domain validiert unter anderem positive Distanzen/Dauern, nichtnegative Wartezeiten, echte Geburtsdaten, mindestens einen Durchlauf, eindeutige Durchlauf-IDs und Einzelbewertungen. Repositories validieren vor dem Schreiben zusätzlich die fachlichen Grundregeln. Eine spätere externe API benötigt darüber hinaus vollständige Validierung unbekannter Payloads an der Systemgrenze.

## Speicherung und Offline-Betrieb

Native IndexedDB ohne zusätzliche Datenbankbibliothek: versioniertes Schema mit `dogs`, `sessions`, `meta`; ein Index auf `dogId` unterstützt gezielte Abfragen. Schreib-Promises werden erst beim Transaktionsabschluss erfolgreich. Es gibt keinen stillen Wechsel zu flüchtigem Speicher: Fehler werden angezeigt, Entwürfe bleiben während der Erfassung bestehen.

Der Demo-Seed schreibt Hund, drei Trainings und einen Marker in einer gemeinsamen Transaktion. Er ist wiederholbar und bei parallelen Tabs sicher. Er überschreibt keine späteren Änderungen. Schemaänderungen gehören in den `onupgradeneeded`-Handler von `indexed-db.ts`.

Angular Service Worker und Web-App-Manifest sind im **Produktionsbuild** aktiviert. HTTPS oder localhost sind erforderlich. Nach dem ersten erfolgreichen Laden und der Service-Worker-Aktivierung werden App-Shell, lazy geladene Seiten, Icons und das Beispielfoto für Offline-Nutzung vorgehalten. Der Development-Server registriert keinen Service Worker. Installierbarkeit und Offline-Reload sollten vor produktiver Verwendung zusätzlich auf den vorgesehenen Mobilgeräten geprüft werden.

Browserdaten können vom Benutzer oder Betriebssystem gelöscht werden. Es gibt noch keinen Export, Backup, Sync oder serverseitige Sicherung. Die Hundauswahl ist lokaler UI-State und wird beim Neuladen auf den ersten vorhandenen Hund zurückgesetzt. Ein noch nicht gespeicherter Trainingsentwurf überlebt keinen Reload oder Routenwechsel.

## Annahmen und bewusst begrenzter Umfang

- Deutsche Oberfläche, ein Benutzer pro Browser, keine Anmeldung.
- Demo-Hund Reggae, Labrador Retriever. Geburtsdatum 12.04.2022 und Geschlecht sind fiktive Ergänzungen.
- Die UI erfasst zunächst **einen Durchlauf pro Session**; Domain, Repository und Historie unterstützen mehrere.
- Das Trainingsdatum ist der Zeitpunkt des Speicherns; die Dauer gibt der Benutzer in Minuten an.
- Der Dashboard-Schwerpunkt „Voran“ ist redaktionell festgelegt, keine automatische Empfehlung.
- Die Methoden liefern hilfreiche Startwerte; das Setup ist anschließend frei und unabhängig editierbar.
- Die drei Demotrainings (15 m sichtbarer Tennisball, 50 m Memory, 30 m Blind) sind Anschauungsdaten und keine fachlich berechnete Progression.
- Noch keine Difficulty Engine, automatisierte Planung, Gesamtbewertung, Fortschrittsdiagramme, weiteren Skills, Foto-Uploads, Bearbeitungs-/Löschfunktionen oder Backend-Anbindung.
- Zusätzliche Feature-Ordner werden erst angelegt, wenn die zugehörige Funktion implementiert wird.

## Tests

Vitest über den offiziellen Angular-Testbuilder. `fake-indexeddb` emuliert IndexedDB nur in Tests. Geprüft werden fachliche Invarianten, Teilbewertungen, mehrere Durchläufe, dauerhafte Wiederöffnung, Upsert, Hundeisolation, Kopiersemantik, einmaliges Seeding bei parallelen Starts, Hundeexistenz, Entwurfsvalidierung und die Fehleranzeige der App.

```sh
npm run test:ci
```

Diese Tests ersetzen keinen realen Browser-/Gerätetest des Service Workers und der Installation.

## Bildquelle

Das Labradorfoto ist ein **Beispielfoto, kein tatsächliches Foto von Reggae**. Franca, [Labrador Retriever yellow portrait](https://commons.wikimedia.org/wiki/File:Labrador_Retriever_yellow_portrait.jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). Die Oberfläche zeigt einen runden Ausschnitt. Die PWA-Icons sind einfache geometrische Richtungszeichen.
