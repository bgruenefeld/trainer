# Trainingszyklus

## Nutzerfluss

Übersicht → Training starten → Übung vorbereiten → Bedingungen → Training beginnen → Durchführung → Wie lief es? → Reflexion → gespeicherte Zusammenfassung.

Es gibt keine neue persistierte Domainstruktur, Completion, Scores oder automatische Kompetenzänderung. Bestehende Kriterien, Snapshots, Assessments und Trainingsprofile bleiben maßgeblich.

## Dashboard und Empfehlungen

Vier Bereiche: Heute, Euer Trainingsweg, Trainingslage, Letztes Training. Der kompakte Teamkopf lässt die Hauptaktion früh erscheinen. Die Gesamtzahl aller Skills entfällt auf dem Dashboard.

Die Empfehlung betrachtet ausschließlich Übungen des aktuellen verfügbaren Stage. Bei geplantem oder fehlendem Stage gibt es keine Empfehlung. Innerhalb der Kandidaten gilt nacheinander: Fokus-Skills, dokumentierte Regression, Maintenance, zuletzt trainierte passende Übung, Katalogreihenfolge als Gleichstandsauflösung. Jeder Filter wird nur angewendet, wenn passende Kandidaten existieren. Es gibt keine Scores, Zeitgrenzen oder vorgeschobene Readiness. Eine Ausführung bedeutet bereits trainiert, niemals abgeschlossen.

„Warum diese Übung?“ verwendet feste Templates für tatsächliche Stage-Zugehörigkeit, Skill-Fokus, Kompetenz/Condition, methodische Voraussetzungen und dokumentierte Aktivität. Voraussetzungen werden nicht als erfüllt interpretiert und sperren nichts. Es wird keine Progression aus der Anzahl von Sessions abgeleitet.

Trainingslage berücksichtigt nur relevante Skills. Die vier Gruppen sind disjunkt: zuerst Regression, dann Maintenance, danach normale stabile/generaliserte beziehungsweise eingeführte/lernende Kompetenz. Zusätzliche konkret nicht erfüllte Puppy-Indikatoren erscheinen als Hinweise. Fehlende Daten bleiben neutral.

## Vorbereitung und Bedingungen

Vorbereitung zeigt ausschließlich vorhandene Ziele, Setup, Schritte, Handler-Skills und -Verhalten, aktive Guidance, Vorsichtshinweise, Kriterien und methodische Übungsvoraussetzungen. Zwölf Übungen besitzen keine vollständige Schrittfolge; dies wird ausdrücklich angezeigt. Keine automatisch erzeugten Inhalte und keine speziellen quellenbezogenen Korrekturmethoden als Default.

Nur die von der Übung deklarierten DifficultyFactors sind erfassbar. Bestehende physische Messwerte bleiben Messwerte; qualitative Faktoren werden beschrieben. Turn angle und pace variation erhalten keine numerische Schwierigkeitsskala. Gelände kann als freie Beschreibung mit bestehendem Wert `other` dokumentiert werden. Alle Bedingungen sind optional. Übungsdauer in Sekunden ist von der optionalen Gesamtdauer der Session in Minuten getrennt.

## Durchführung und Startzeit

Ein Entwurf ist noch keine begonnene Session. `startedAt` wird ausschließlich durch `begin()` beim Klick auf „Training beginnen“ gesetzt. Wiederholte Aufrufe und spätere Speicherung ändern diesen Zeitpunkt nicht. Vor Beginn lässt sich keine Session erzeugen. Die bestehenden Session-Typen und Persistenz bleiben unverändert.

Während der Durchführung erscheinen Ziel, bis zu vier vorhandene Hinweise in Katalogreihenfolge (ergänzt um vorhandene Schritte) sowie Kriterien zur Orientierung. Kein Live-Scoring, kein erzwungenes Bewerten und kein neuer Timer.

## Abschluss und nächster Schritt

Nach „Training abschließen“ sind Kriterien mit `observed`, `partly_observed`, `not_observed` bewertbar; fehlende Bewertungen bleiben offen. Reflexion und tatsächliche Gesamtdauer sind optional. Die Speicherung verändert weder Assessments noch Übungs-/Stage-Completion.

Die Zusammenfassung zeigt dokumentierte Kriterien und Reflexion. Bei mindestens einem teilweise beobachteten Kriterium erscheint „Diese Übung weiter festigen“. Wiederholung erzeugt einen neuen, noch nicht begonnenen Entwurf. Als nächster methodischer Schritt werden ausschließlich Übungen mit expliziter Voraussetzung auf die gerade trainierte Übung gezeigt. Puppy erhält keine erfundene Folgereihenfolge. Immer erreichbar: Trainingsplan und Historie.

## Roadmap, Skills und Historie

Die vertikale Roadmap hat eine durchgehende Linie mit Knoten und markiert den Fokus. Verfügbare Stages zeigen exakt sieben Puppy- beziehungsweise sechs Heelwork-Übungen. Die Übungshistorie zeigt nur dokumentiert/nicht dokumentiert und den letzten Zeitpunkt. Geplante Stages enthalten weiterhin keine Übungen oder erfundenen Defizite.

Der Standardfilter „Aktuell relevant“ vereint aktuelle Stage-Skills, Fokus-Skills, deren direkte Graph-Voraussetzungen sowie Maintenance, Regression und eingeführte/lernende Skills. Graph-Beziehungen werden als harte Voraussetzung, unterstützende Grundlage oder Maintenance-Bezug bezeichnet. Alle Skills und Kategorien bleiben zugänglich.

Historienkarten beziehen Übungstitel, Skill-IDs, TrainingEffect und Kriterien aus dem Snapshot. Namen bekannter Skills sind Navigationsbeschriftungen; unbekannte historische IDs bleiben neutral lesbar. Eine heutige Stage-Zuordnung ist ausdrücklich „Aktueller Roadmap-Kontext“, kein historischer Fakt. Alte `session.roadmapId`-Werte werden nicht umgedeutet. Details-Links führen per Fragment zur gespeicherten Session.

## Mobile Bedienung und Prüfung

Hauptaktionen stehen vor langen Inhalten. Die haftende Aktionsleiste sitzt oben mit Safe-Area-Abstand; dadurch kollidiert sie nicht mit der zweizeiligen unteren Navigation. Schaltflächen sind mindestens 48 px hoch, Kriterien unter 500 px zweispaltig. Die Roadmap bleibt vertikal. Es gibt keine breiten Tabellen.

Tests prüfen Startzeit, Auswahlprioritäten, wiederholbare Empfehlungen, fehlende Completion, Kriterien/Snapshots, Defaultfilter, Pflege/Regression und den gesamten Speicherablauf. Reale mobile Browser-Sichtprüfung benötigt einen verfügbaren Browser; DOM-Tests sind kein Ersatz für Pixelprüfung.
