import { SourcedStatement } from '../../../core/domain/sources/training-source';
import { mitchellSource } from '../sources/source';
const texts = [
  'Motivation und Zusammenarbeit werden vor stärkerer formaler Kontrolle aufgebaut.',
  'Kontrolle wird zunächst in Handlernähe entwickelt und später auf Distanz übertragen.',
  'Ein Retrieve wird als Kombination mehrerer trainierbarer Komponenten betrachtet.',
  'Bei Problemen soll die betroffene Komponente identifiziert werden, statt nur den gesamten Retrieve zu wiederholen.',
  'Training schreitet nicht allein aufgrund von Alter oder Zeit fort.',
  'Progression soll sich an ausreichender Stabilität einer Fähigkeit orientieren.',
  'Schwierigkeitsfaktoren sollen möglichst kontrolliert und nicht unnötig mehrere gleichzeitig erhöht werden.',
  'Schwächen sollen gezielt trainiert werden.',
  'Bereits entwickelte Fähigkeiten benötigen Maintenance.',
  'Ein Hund kann in bereits entwickelten Fähigkeiten regressieren.',
  'Handlerverhalten ist Bestandteil des Trainingssystems.',
  'Timing, Körpersprache, Positionierung und Beobachtung sind relevante Handler-Fähigkeiten.',
  'Training soll beendet werden, bevor mentale oder körperliche Ermüdung die Qualität deutlich verschlechtert.',
  'Zu viel frühes Control-Building kann Motivation und Vorwärtsdrang beeinträchtigen.',
  'Marking und Hunting enthalten einen höheren Anteil selbstständiger Arbeit des Hundes als viele Handling-Aufgaben.',
] as const;
export const MITCHELL_TRAINING_PRINCIPLES: readonly SourcedStatement[] = texts.map((text) => ({
  text,
  source: mitchellSource(),
}));
