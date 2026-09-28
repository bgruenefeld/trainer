import { TrainingGuidance } from '../../../core/domain/exercises/guidance';
import { SkillCompetence } from '../../../core/domain/skills/skill';
import { SourcedStatement } from '../../../core/domain/sources/training-source';
import { mitchellSource } from '../sources/source';
export const HEELWORK_SOURCE = mitchellSource('Heelwork');
/** Beschreibendes Methodenwissen; keine Eingabe für automatische Readiness. */
export const HEELWORK_GUIDANCE: TrainingGuidance = {
  source: HEELWORK_SOURCE,
  recommendedAge: { text: 'ungefähr ab 6–7 Monaten oder später' },
  notes: [
    'korrekte Position seitlich am Handler',
    'ausreichende Orientierung zum Handler',
    'folgt Richtungsänderungen',
    'passt Geschwindigkeit an',
    'zieht nicht dauerhaft vor',
    'bleibt nicht dauerhaft zurück',
    'driftet nicht deutlich seitlich weg',
    'Nicht mit allgemeiner Leinenführigkeit gleichsetzen.',
    'Heelwork wird zunächst getrennt vom eigentlichen Retrieve trainiert.',
    'Zu Beginn möglichst geringe Ablenkung und möglichst wenig interessante Geruchseinflüsse.',
    'Korrekte Position: Leine locker.',
    'Positionsfehler: kurze, gezielte Leineninformation möglich; danach Leine wieder locker.',
    'Keine dauerhafte Leinenspannung als Normalzustand.',
    'Heelwork ist eine Control-Building-Disziplin, soll aber aktiv, spielerisch und mit positiver Trainingsstimmung aufgebaut werden.',
    'Bereits aufgebautes Retrieve-Interesse soll erhalten bleiben.',
    'Skill zuerst technisch aufbauen, danach unter wechselnden Bedingungen generalisieren.',
    'Progression nicht nach Kalender, sondern nach ausreichender Stabilität.',
    'Rechtshändiger Handler: Hund links. Linkshändiger Handler: Hund rechts. Die bevorzugte Hand bleibt für andere Aufgaben frei. Dies ist Guidance innerhalb der Mitchell-Methode, keine universelle harte Regel.',
    'Bei Positionsfehler kann eine kurze gezielte Leineninformation erfolgen; danach unmittelbar wieder lockere Leine.',
    'Selbstbewusster Hund ggf. früher; sensibler oder unsicherer Hund ggf. später.',
    'TURN INTO DOG: Hund, der zu weit vorne läuft, wird durch Richtungswechsel in seine Richtung zum Zurücknehmen seiner Position veranlasst.',
    'TURN AWAY FROM DOG: Hund wird zum Aufschließen und Vorwärtsbewegen ermuntert.',
    'Zu Beginn werden Richtungswechsel in Richtung des Hundes häufiger eingesetzt, wenn Vorprellen das relevante Problem ist.',
  ],
};
export const HEELWORK_READINESS_GUIDANCE: readonly SourcedStatement[] = [
  'Ausreichende Retrieve-Motivation vorhanden.',
  'Ausreichendes Selbstvertrauen.',
  'Leine bekannt.',
  'Handlerorientierung vorhanden.',
].map((text) => ({ text, source: HEELWORK_SOURCE }));
export const HEELWORK_STEADINESS_GUIDANCE: readonly SourcedStatement[] = [
  'Heelwork ist ausreichend stabil aufgebaut.',
  'Der Hund zeigt weiterhin gute Retrieve-Motivation.',
].map((text) => ({ text, source: HEELWORK_SOURCE }));
export const HEELWORK_COMPETENCE_GUIDANCE: Readonly<
  Partial<Record<SkillCompetence, SourcedStatement>>
> = Object.fromEntries(
  Object.entries({
    introduced: 'erste Heelwork-Sequenzen begonnen',
    learning: 'Position und Richtungswechsel befinden sich im Aufbau',
    stable: 'Hund hält Position unter bekannten, kontrollierten Bedingungen ausreichend stabil',
    generalised:
      'Heelwork funktioniert auch auf verändertem Untergrund und bei schrittweise erhöhten Ablenkungen',
  }).map(([competence, text]) => [competence, { text, source: HEELWORK_SOURCE }]),
);
