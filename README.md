# Feldfreund · Retriever Training

Mobile-first Angular-App für die Dokumentation von Retrievertraining. Die aktuelle Oberfläche verwendet einen aus der bereitgestellten Zusammenfassung von Wayne Mitchells „Retriever Trainer's Handbook“ abgeleiteten Katalog. Sie trennt Skills, Voraussetzungen, Übungen, individuelle Beobachtungen und Trainingshistorie.

Die Buchstellen wurden nicht unabhängig geprüft. Quellenstatus und offene fachliche Inhalte bleiben in der App sichtbar. Es gibt keine automatisch erfundenen Trainingsregeln, Prozentbewertungen, KI-Empfehlungen oder Altersfreigaben.

## Auf Render veröffentlichen

Die App ist für Render als **Static Site** vorbereitet. Im Render Dashboard **New → Blueprint** wählen und das Repository verbinden; `render.yaml` übernimmt Build, Ausgabeverzeichnis und Angular-Routing.

Die vollständige [Schritt-für-Schritt-Anleitung](docs/render-deployment.md) beschreibt auch das Hochladen des Projekts und die Prüfung nach dem Deployment. Trainingsdaten bleiben browserlokal; es gibt keine automatische Geräte-Synchronisierung.

## Lokal starten

Voraussetzungen: Node **24.15+ innerhalb der 24er-Reihe**, alternativ ^22.22.3 oder >=26; npm. `.nvmrc` verwendet Node 24. Die vorinstallierte Node-Version 22.22.1 ist zu alt für Angular 22.2.

```sh
nvm install
nvm use
npm ci
npm start
```

Die App läuft unter http://localhost:4200. Falls der Port belegt ist: `npm start -- --port 4201`.

Ohne nvm kann ein kompatibler Prozess gestartet werden:

```sh
npx --yes --package=node@24 -c 'npm start -- --port 4201'
```

## Funktionen und Routen

| Route               | Inhalt                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `/`                 | Aktiver Hund, bewusst gewählte Schwerpunkte, aktive Skills, Pflege und Regression                  |
| `/skills`           | 38 Skills, Kategorien, qualitative Zustände und Hinweise auf offene Voraussetzungen                |
| `/skills/:id`       | Zweck, Voraussetzungen, Folgeskills, Kompetenz und Zustand mit Verlauf, Übungen, Probleme und Quelle |
| `/puppy-foundation` | Sieben eigenständige Puppy-Module                                                                  |
| `/exercises/:id`    | Setup, Handlerverhalten, Erwartungen, Kriterien, Probleme, Faktoren und Inhaltslücken              |
| `/training`         | Übung und Hund wählen, Bedingungen erfassen, Beobachtungen dokumentieren, speichern                |
| `/history`          | Mitchell-Einträge sowie unverändert erhaltene frühere Aufzeichnungen                               |
| `/dogs`             | Hunde anlegen und auswählen                                                                        |

Der Übergang Puppy→Heelwork wird in den Heelwork-Details anhand von sieben individuell beurteilten Indikatoren erfasst. Der frühere Jumping-Hinweis ist als Prüfungskandidat außerhalb des aktiven Seeds erhalten und blockiert keine Readiness. Die Readiness-Indikatoren werden separat vom Skill-Status gespeichert. Die Dokumentation einer Übung verändert keinen Skill-Zustand automatisch.

## Architektur

```text
src/app/
  core/
    domain/
      dog/                     Bestehendes Hundemodell
      skills/                  Qualitative Zustände, Assessments, Graph und Readiness
      handler/                 Handler-Skills
      exercises/               Übungen, Faktoren und Guidance
      problems/                Ursachenhypothesen und Anpassungen
      training-plan/           Ziele, Roadmaps, individuelle Trainingsprofile
      training-session/        Ausführungen, Beobachtungen und Übungssnapshots
      sources/                 Quellen und Prüfstatus
      shared/                  Typisierte IDs
      skill/, exercise/, training/   Bisherige Modelle für Altbestände
    application/
      mitchell-store.ts        Signals-Fassade und Schreibaktionen
      trainer-store.ts         Hundeauswahl und frühere Sessions
      exercises/               Geprüfte Katalogabfragen
      readiness/               Individuelle Voraussetzungen und offene Prüfungen
      training/                Trainingsentwürfe
    infrastructure/persistence/
      indexed-db.ts            Versionierte Datenbankverbindung
      initialize-mitchell.ts   Einmaliger Einstieg ohne erfundene Entwicklungsstände
      mitchell-repositories.ts Neue Repository-Adapter
      repositories.ts          Hunde und frühere Sessions
  data/mitchell/               Quellenbezogener Skill-, Übungs- und Problemkatalog
  features/                   Lazy geladene Seiten
  shared/                     Kleine UI-Komponenten, Quellenanzeige und Labels
```

Die Domain importiert weder Angular noch IndexedDB. Repository-Interfaces bilden die Persistenzgrenze; die Provider in `app.config.ts` verbinden sie mit lokalen Adaptern. Ein REST-Backend kann später über andere Adapter eingebunden werden.

Es gibt ein einziges fachliches Domainmodell. Der alte Voran-Erfassungsflow und die Singular-Domainordner sind entfernt. Frühere Trainings bleiben über einen lesenden Archivadapter sichtbar; daraus werden keine Mitchell-Bewertungen abgeleitet.

## Fachliche Trennung

- **SkillDefinition:** Fähigkeit im Katalog, mit Kategorie, Zweck und Quelle.
- **SkillDependency:** gerichtete Hard-/Soft-/Maintenance-Beziehung; keine numerische Levelleiter.
- **DogSkillAssessment:** individuelle, begründete Einschätzung mit Kontext und Zeitpunkt.
- **TrainingExercise:** Methode und Aufbau der konkreten Übung, beteiligte Hunde-/Handler-Skills, Faktoren und Kriterien.
- **ExerciseExecution:** tatsächlich durchgeführte Übung mit Bedingungen, optionalen Kriterienbewertungen und Beobachtungen.
- **TrainingSession:** Hund, Trainingssystem, Zeitpunkt, optionale tatsächliche Dauer, Ausführungen und Reflexion.
- **TrainingProblem:** mehrere mögliche Ursachen und dazugehörige Anpassungen; keine automatisch festgestellte Diagnose.

`not_started`, `introduced`, `learning`, `stable`, `generalised`, `maintenance` und `regressed` sind qualitative Zustände ohne Zahlenrang. Noch nicht beurteilte Skills sind entsprechend gekennzeichnet. Readiness bleibt eine separate Beurteilung der hinterlegten Prüfungen, keine allgemeine Trainingsfreigabe.

Die alte Trennung Skill → TrainingMethod → TrainingSetup → Performance → TrainingSession bleibt ausschließlich für Altbestände bestehen. Im neuen Modell trägt die Übung die konkrete methodische Ausgestaltung; ihre Ausführung dokumentiert die Realität.

Weitere Details: [Domain-Modell](docs/domain-model.md), [Mitchell-Katalog](docs/mitchell-catalog.md), [Puppy Foundation](docs/puppy-foundation.md), [Migration und UI-Anbindung](docs/migration-and-ui.md).

## Persistenz und Migration

Der bestehende Datenbankname `retriever-trainer-v1` bleibt unverändert. **IndexedDB-Schema-Version 2** ergänzt `skillAssessments`, `systemSessions`, `trainingProfiles`, `goals` und `roadmaps`; die bisherigen Stores `dogs`, `sessions` und `meta` bleiben erhalten.

Die Schemaänderung erfolgt innerhalb der IndexedDB-Upgrade-Transaktion. Es werden keine alten Sessions umgeschrieben, gelöscht oder zu Skill-Bewertungen konvertiert. Bestehende Hunde behalten ihre IDs und Daten. Frische Installationen erhalten einmalig den fiktiven Demo-Hund Reggae, aber keine alten Voran-Demotrainings oder vorausgefüllten Skill-Zustände.

Skill-Assessments werden angehängt; dieselbe ID kann nicht überschrieben werden. Schreibaktionen melden erst nach dem Commit Erfolg. Neue Ausführungen enthalten einen Übungssnapshot, damit die zum Training gehörenden Kriterien, Inhalte und Quellen auch bei späteren Katalogänderungen erhalten bleiben.

Schwerpunkte und qualitative Readiness-Einschätzungen werden je Hund und System getrennt gespeichert. Die Auswahl des aktuell angezeigten Hundes bleibt flüchtiger UI-State. Nicht gespeicherte Formulare und Trainingsentwürfe überleben keinen Reload oder Routenwechsel.

Es gibt keine Synchronisierung zwischen Geräten und keine automatische Aktualisierung zwischen parallel geöffneten Tabs. Browserdaten können gelöscht werden; Export und Backup sind noch nicht implementiert.

## Tests und Build

```sh
npm run test:ci
npm test                 # Watch-Modus
npm run lint
npm run build
```

Vitest über den Angular-Testbuilder; `fake-indexeddb` nur in Tests. Tests umfassen Domain-Invarianten, Katalogintegrität, Graph-Traversierung, Readiness, echte v1→v2-Migration, dauerhafte Speicherung, Hundeisolation, Schreibfehler und Angular-Routen-/Formularintegration.

Produktionsdateien: `dist/client`. Unbekannte App-Routen müssen auf `index.html` zurückfallen. Die lokale Sites-Konfiguration enthält dieses SPA-Fallback. Es wurde keine Veröffentlichung vorgenommen; der Quellcode-Upload an Sites ist weiterhin nicht freigegeben.

## PWA

Service Worker und Manifest sind im Produktionsbuild aktiviert; HTTPS oder localhost sind erforderlich. Nach dem ersten erfolgreichen Laden und der Service-Worker-Aktivierung werden App-Dateien, lazy geladene Seiten, Icons und das Beispielfoto vorgehalten. Im Devserver ist der Service Worker deaktiviert.

Ein visueller Smartphone-Test und ein realer Offline-/Installationstest stehen noch aus; in der Arbeitsumgebung war kein Browser verfügbar.

## Bewusste Grenzen

- Der kanonische Seed basiert auf der laut Nutzer anhand bereitgestellter Buchseiten geprüften fachlichen Extraktion. Evidence bleibt mangels Edition `provided_summary`.
- Nicht vorgegebene Durchführungsschritte bleiben offen. Informal Puppy Retrieve enthält die ausdrücklich vorgegebenen Progressionen und Regressionen; bei anderen Übungen bleiben diese Felder offen.
- Der Flow dokumentiert zunächst eine Übungsausführung pro Session; das Modell unterstützt mehrere.
- Langfristige Ziele und Roadmaps haben Modelle und Repository-Adapter; eine eigene Zielplanungsoberfläche folgt später. Die App unterstellt kein langfristiges Ziel.
- Keine KI, automatische Diagnose, Trainingsplanung, Rankings, Gamification, Cloud, Konten oder sozialen Funktionen.
- Noch keine Bearbeitung oder Löschung gespeicherter Trainings, Foto-Uploads oder Backup-Funktion.

## Bildquelle

Das Labradorfoto ist ein **Beispielfoto, kein tatsächliches Foto von Reggae**. Franca, [Labrador Retriever yellow portrait](https://commons.wikimedia.org/wiki/File:Labrador_Retriever_yellow_portrait.jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). Die Oberfläche zeigt einen Ausschnitt. Reggaes Geburtsdatum und Geschlecht sind fiktive Demodaten.

### Heelwork

Der kanonische Katalog enthält zusätzlich sechs Heelwork Exercises und vier Heelwork Problems; insgesamt 13 Exercises, sieben Problems und elf Dependencies. Puppy Foundation bleibt auf seine sieben Übungen begrenzt. Heelwork ist über die Skill-Details und die bestehende Trainingserfassung erreichbar. Übungsvoraussetzungen sind rein methodische Referenzen, Altersangaben ausschließlich Text-Guidance. Details: [Heelwork](docs/heelwork.md).
