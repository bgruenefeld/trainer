# Feldfreund auf Render installieren

Die App wird als **Static Site** veröffentlicht. Sie benötigt keinen laufenden Node-Server, keinen Start Command und keine Render-Datenbank. Render baut die Angular-App und liefert die fertigen Dateien über HTTPS aus.

## Einfachster Weg: Blueprint

1. Lade den aktuellen Projektstand in ein GitHub- oder GitLab-Repository hoch. Ein privates Repository ist möglich. Wichtig: den **gesamten aktuellen Quellcode** hochladen, einschließlich bisher unversionierter Projektdateien, `render.yaml`, `.node-version` und `package-lock.json`. Nicht `node_modules` oder `dist` hochladen; diese sind bereits in `.gitignore` ausgeschlossen.
2. Öffne [das Render Dashboard](https://dashboard.render.com/) und wähle **New → Blueprint**.
3. Verbinde deinen Git-Anbieter und wähle das Repository.
4. Wähle den Branch mit dem aktuellen App-Stand. Blueprint Path: **render.yaml**. Die Datei liegt im Hauptverzeichnis des Repositorys.
5. Prüfe die Vorschau: ein Dienst **feldfreund**, Typ **Static Site**, keine Datenbank. Klicke **Deploy Blueprint**.
6. Warte auf den erfolgreichen Build. Öffne anschließend die von Render angezeigte **https://…onrender.com**-Adresse.

Die Einstellungen kommen aus `render.yaml`. Du musst keine geheimen Schlüssel, Portnummern oder Startbefehle eintragen. Änderungen am verbundenen Branch werden standardmäßig automatisch neu bereitgestellt.

Im lokalen Projekt war bei der Vorbereitung noch kein Git-Remote eingetragen. Falls du noch kein Repository hast, lege beispielsweise auf GitHub ein leeres privates Repository an. Mit einer Git-Oberfläche kannst du den aktuellen Projektstand prüfen, committen und dorthin pushen. Alternativ im Projektordner (REPOSITORY-URL ersetzen):

```sh
git status
git add .
git commit -m "Prepare Feldfreund for Render"
git remote add origin REPOSITORY-URL
git push -u origin HEAD
```

Vor dem Commit die Dateiliste prüfen. Wenn bereits ein Remote vorhanden ist, entfällt `git remote add`. Render muss genau den Branch verwenden, den du hochgeladen hast. Die vielen bestehenden Änderungen der vorherigen Arbeitsschritte müssen mit hochgeladen werden, damit die vollständige App bereitsteht.

## Alternative: manuell als Static Site

Falls du statt Blueprint **New → Static Site** verwendest:

| Einstellung | Wert |
| --- | --- |
| Repository / Branch | Dein Repository und der hochgeladene Branch |
| Root Directory | Leer, wenn das Projekt im Repository-Hauptverzeichnis liegt |
| Build Command | `npm ci --include=dev && npm run build -- --configuration production` |
| Publish Directory | `dist/client` |
| Environment Variable | `SKIP_INSTALL_DEPS=true` |
| Node-Version | Wird durch `.node-version` auf `24.19.0` festgelegt |

Unter **Redirects/Rewrites** hinzufügen:

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

Unter **Headers** hinzufügen: Path `/*`, Name `Cache-Control`, Value `no-cache`.

Bei manueller Anlage werden diese Einstellungen nicht automatisch aus `render.yaml` übernommen. Deshalb ist der Blueprint-Weg einfacher. Keine zusätzliche Einstellung `NODE_VERSION` setzen, sofern du nicht bewusst die Datei überschreiben möchtest.

## Nach dem ersten Deployment prüfen

- Startseite öffnen und einen Hund auswählen/anlegen.
- `/roadmap` direkt in die Adresszeile eingeben und neu laden: keine 404-Seite.
- `/skills/mitchell:heelwork` direkt öffnen und neu laden.
- Eine Testeinheit beginnen, dokumentieren und speichern; die Startzeit muss zum tatsächlichen Beginn passen.
- Seite neu laden: Der Eintrag bleibt im selben Browser unter Historie erhalten.
- Auf dem Smartphone öffnen und optional über das Browsermenü zum Startbildschirm hinzufügen.

## Wo liegen die Trainingsdaten?

Hunde, Assessments, Fokus und Trainingshistorie liegen weiterhin in **IndexedDB im Browser**, nicht bei Render. Das Deployment ergänzt keinen Account, kein Backend und keine Synchronisierung.

- Bereits unter `localhost` gespeicherte Einträge erscheinen unter der neuen Render-Adresse nicht automatisch.
- Smartphone und Computer haben getrennte Datenbestände, ebenso unterschiedliche Browserprofile.
- Auch eine spätere eigene Domain ist für den Browser eine andere Adresse mit eigenem Speicher.
- Ein Deployment unter derselben Adresse löscht den Browserspeicher nicht. Das Löschen von Website-Daten kann dagegen die lokalen Trainingsdaten entfernen.

Die bereitgestellte App ist über ihre URL erreichbar. Ein privates Quellcode-Repository ist kein Login-Schutz für die ausgelieferte App. Browserlokale Trainingsdaten anderer Geräte werden dadurch nicht veröffentlicht.

## Updates und Fehlerbehebung

Änderungen committen und zum verbundenen Branch pushen. Render führt den Build erneut aus. Bei geöffneter App kann der vorhandene Angular-Service-Worker noch die bisherige Version verwenden: nach erfolgreichem Deployment die App neu laden und gegebenenfalls alle App-Tabs schließen und erneut öffnen. Zum Aktualisieren nicht die Website-Daten löschen.

- **Build schlägt wegen Node fehl:** `.node-version` hochladen; einen abweichenden `NODE_VERSION`-Wert in Render entfernen oder bewusst anpassen.
- **Build findet Angular nicht:** `npm ci --include=dev` verwenden; Angular-Buildtools sind Entwicklungsabhängigkeiten.
- **404 beim direkten Routenaufruf:** Rewrite `/* → /index.html` prüfen.
- **Leere oder falsche Website:** Publish Directory muss `dist/client` sein, nicht nur `dist`.
- **Lockfile-Fehler:** `package.json` und `package-lock.json` müssen zum selben Projektstand gehören.

Static Sites benötigen keinen laufenden Server-Tarif. Beachte dennoch die aktuellen Workspace-Kontingente für Bandbreite und Build-Minuten in deinem Render-Account.

## Offizielle Referenzen

- [Render Blueprints](https://render.com/docs/infrastructure-as-code)
- [Blueprint YAML Reference](https://render.com/docs/blueprint-spec)
- [Static Sites](https://render.com/docs/static-sites)
- [Node-Version festlegen](https://render.com/docs/node-version)
- [Redirects und Rewrites](https://render.com/docs/redirects-rewrites)
