import {
  TrainingExercise,
  ExercisePurpose,
  ExerciseAdjustment,
} from '../../../core/domain/exercises/training-exercise';
import { DifficultyFactor } from '../../../core/domain/exercises/difficulty';
import { HandlerSkillCode } from '../../../core/domain/handler/handler-skill';
import { entityId } from '../../../core/domain/shared/identity';
import { mitchellSkillId } from '../skills/skills';
import { MITCHELL_SYSTEM_ID } from '../sources/source';
import { HEELWORK_GUIDANCE, HEELWORK_SOURCE } from './guidance';
interface SeedExercise {
  readonly id: string;
  readonly title: string;
  readonly objective: string;
  readonly handlers: readonly HandlerSkillCode[];
  readonly purpose: readonly ExercisePurpose[];
  readonly factors: readonly DifficultyFactor[];
  readonly setup: readonly string[];
  readonly expected: readonly string[];
  readonly criteria: readonly string[];
  readonly prerequisites: readonly string[];
  readonly progression: readonly Omit<ExerciseAdjustment, 'source'>[];
  readonly notes: readonly string[];
}
const definitions = [
  {
    id: 'heelwork_basic_square',
    title: 'Basic Heelwork Square',
    objective:
      'Aufbau einer stabilen Heelwork-Position mit klaren geraden Linien und 90°-Richtungswechseln.',
    handlers: [
      'body_language',
      'positioning',
      'timing',
      'observation',
      'consistency',
      'active_handling',
      'pressure_control',
    ],
    purpose: ['teaching'],
    factors: ['distractions', 'terrain', 'novelty', 'duration'],
    setup: [
      'Hund an der Leine',
      'geringe Ablenkung',
      'möglichst wenig interessante Gerüche',
      'einfacher, gut überschaubarer Untergrund',
      'quadratischer oder klar rechteckiger Verlauf',
      'zunächst deutliche 90°-Richtungswechsel',
    ],
    expected: [
      'Hund bleibt seitlich in funktionaler Heelwork-Position',
      'Hund folgt 90°-Richtungswechseln',
      'Hund bleibt ausreichend am Handler orientiert',
    ],
    criteria: [
      'Hund folgt geraden Abschnitten stabil',
      'Hund folgt 90°-Turns ohne deutlichen Positionsverlust',
      'Leine bleibt bei korrekter Position überwiegend locker',
      'Hund zieht nicht dauerhaft voraus',
      'Hund bleibt nicht dauerhaft zurück',
    ],
    prerequisites: [],
    progression: [],
    notes: [
      'Mitchell-spezifische Heelwork-Guidance.',
      'Handler-Verhalten: klare Bewegungsrichtung',
      'Handler-Verhalten: aktiv führen',
      'Handler-Verhalten: korrekte Position mit lockerer Leine bestätigen',
      'Handler-Verhalten: nicht dauerhaft an gespannter Leine führen',
      'Handler-Verhalten: rechtzeitig auf Positionsfehler reagieren',
    ],
  },
  {
    id: 'heelwork_mixed_rectangles',
    title: 'Mixed Squares and Rectangles',
    objective:
      'Der Hund soll nicht nur ein gleichförmiges Muster lernen, sondern auf wechselnde Streckenlängen, Richtungswechsel und Tempoänderungen des Handlers reagieren.',
    handlers: ['body_language', 'positioning', 'timing', 'observation', 'active_handling'],
    purpose: ['teaching', 'proofing'],
    factors: ['duration', 'novelty', 'distractions', 'pace_variation'],
    setup: [],
    expected: [],
    criteria: [
      'Hund bleibt auch bei wechselnden Seitenlängen in Position',
      'Hund reagiert auf nicht vorhersehbare Richtungswechsel',
      'Hund passt seine Geschwindigkeit an den Handler an',
    ],
    prerequisites: ['heelwork_basic_square'],
    progression: [
      {
        id: 'heelwork_mixed_rectangles:progression:1',
        description: 'unterschiedlich lange Seiten',
        changes: [],
      },
      {
        id: 'heelwork_mixed_rectangles:progression:2',
        description: 'unterschiedlich viele Schritte vor Richtungswechseln',
        changes: [],
      },
      {
        id: 'heelwork_mixed_rectangles:progression:3',
        description: 'Wechsel zwischen langsamem, normalem und schnellerem Gehen',
        changes: [
          {
            factor: 'pace_variation',
            direction: 'changed_unknown',
            rationale: 'Wechsel zwischen langsamem, normalem und schnellerem Tempo.',
          },
        ],
      },
    ],
    notes: ['Mitchell-spezifische Heelwork-Guidance.'],
  },
  {
    id: 'heelwork_triangles',
    title: 'Heelwork Triangles',
    objective: 'Heelwork bei spitzeren Richtungswinkeln stabilisieren.',
    handlers: ['body_language', 'positioning', 'timing', 'active_handling'],
    purpose: ['teaching', 'proofing'],
    factors: ['turn_angle'],
    setup: [],
    expected: [],
    criteria: [
      'Hund hält auch bei spitzeren Richtungsänderungen eine funktionale Position',
      'Hund reagiert weiterhin auf die Bewegung des Handlers',
    ],
    prerequisites: ['heelwork_mixed_rectangles'],
    progression: [
      {
        id: 'heelwork_triangles:progression',
        description: 'Von 90°-Richtungswechseln zu zunehmend spitzeren Winkeln übergehen.',
        changes: [
          {
            factor: 'turn_angle',
            direction: 'changed_unknown',
            rationale: 'Übergang von 90°-Richtungswechseln zu spitzeren Winkeln.',
          },
        ],
      },
    ],
    notes: ['Mitchell-spezifische Heelwork-Guidance.'],
  },
  {
    id: 'heelwork_180_turns',
    title: 'Heelwork 180 Degree Turns',
    objective:
      'Der Hund folgt starken Richtungswechseln des Handlers, ohne die funktionale Heelwork-Position zu verlieren.',
    handlers: ['body_language', 'positioning', 'timing', 'active_handling'],
    purpose: ['teaching', 'proofing'],
    factors: ['turn_angle'],
    setup: [],
    expected: [],
    criteria: [
      'Hund folgt 180°-Wendungen',
      'Hund bleibt seitlich am Handler',
      'Hund driftet nicht deutlich nach vorne, hinten oder außen',
    ],
    prerequisites: ['heelwork_triangles'],
    progression: [],
    notes: ['Mitchell-spezifische Heelwork-Guidance.', 'Richtungswechsel: 180°-Wendungen.'],
  },
  {
    id: 'heelwork_off_lead_transition',
    title: 'Heelwork Off-Lead Transition',
    objective:
      'Die bisher mit Leinenunterstützung aufgebaute Heelwork-Position schrittweise ohne aktive Leinenhilfe erhalten.',
    handlers: [
      'body_language',
      'observation',
      'consistency',
      'pressure_control',
      'active_handling',
    ],
    purpose: ['proofing', 'generalisation'],
    factors: [],
    setup: [],
    expected: [],
    criteria: [
      'Hund hält Position ohne dauerhafte Leinenspannung',
      'Hund bleibt bei Richtungswechseln am Handler orientiert',
      'Hund kann die Position ohne aktive Leinenhilfe erhalten',
    ],
    prerequisites: [],
    progression: [
      {
        id: 'heelwork_off_lead_transition:progression:1',
        description: 'Leine vorhanden, aber zunehmend ohne aktive Einwirkung.',
        changes: [],
      },
      {
        id: 'heelwork_off_lead_transition:progression:2',
        description: 'Leine vorhanden, aber nicht aktiv in der Hand genutzt.',
        changes: [],
      },
      {
        id: 'heelwork_off_lead_transition:progression:3',
        description: 'Heelwork ohne Leine.',
        changes: [],
      },
    ],
    notes: ['Mitchell-spezifische Heelwork-Guidance.'],
  },
  {
    id: 'heelwork_distractions',
    title: 'Heelwork with Distractions',
    objective: 'Heelwork unter schrittweise zunehmenden Umwelt- und Sozialreizen stabilisieren.',
    handlers: ['observation', 'timing', 'consistency', 'difficulty_management', 'pressure_control'],
    purpose: ['generalisation', 'proofing'],
    factors: ['distractions', 'terrain', 'novelty'],
    setup: [],
    expected: [],
    criteria: [
      'Hund hält Heelwork auch bei zunehmender Ablenkung',
      'Hund bleibt ausreichend am Handler orientiert',
      'Hund verlässt die Position nicht eigenständig',
      'Verhalten zeigt Generalisierung über unterschiedliche Kontexte',
    ],
    prerequisites: [],
    progression: [],
    notes: [
      'Mitchell-spezifische Heelwork-Guidance.',
      'Progressions-Guidance in dieser Reihenfolge, keine starre globale Trainingsreihenfolge:',
      'anderer Untergrund / Gras',
      'Gerüche und Umweltreize',
      'sichtbarer Ball oder Dummy als Ablenkung',
      'ruhige bereits trainierte Hunde',
      'mehrere Hunde / Gruppen',
      'bewegte Hunde',
      'stärkere Umweltreize',
    ],
  },
] as const satisfies readonly SeedExercise[];
export const HEELWORK_EXERCISES: readonly TrainingExercise[] = definitions.map(
  (item: SeedExercise) => ({
    id: entityId<'Exercise'>(item.id),
    systemId: MITCHELL_SYSTEM_ID,
    version: '1.0.0',
    title: item.title,
    primarySkill: mitchellSkillId('heelwork'),
    secondarySkills: [],
    objective: item.objective,
    prerequisites: [],
    ...(item.prerequisites.length
      ? { prerequisiteExerciseIds: item.prerequisites.map((id) => entityId<'Exercise'>(id)) }
      : {}),
    handlerSkills: item.handlers.map((code) =>
      entityId<'HandlerSkill'>(`mitchell:handler:${code}`),
    ),
    purpose: item.purpose,
    trainingEffect: 'control_building',
    workingMode: 'handler_controlled',
    difficultyFactors: item.factors,
    optimalTriggers: [],
    setup: { instructions: item.setup, equipment: [], conditions: [] },
    steps: [],
    expectedBehaviour: item.expected,
    successCriteria: item.criteria.map((description, i) => ({
      id: entityId<'Criterion'>(`${item.id}:criterion:${i + 1}`),
      description,
      relatedSkills: [mitchellSkillId('heelwork')],
    })),
    progression: item.progression.map((adjustment) => ({ ...adjustment, source: HEELWORK_SOURCE })),
    regression: [],
    commonProblems: [],
    cautions: [],
    physicalConstraints: [],
    guidance: { ...HEELWORK_GUIDANCE, notes: [...HEELWORK_GUIDANCE.notes, ...item.notes] },
    contentGaps: [
      {
        field: 'steps',
        reason: 'Keine zusätzliche Schrittfolge im Heelwork-Delta vorgegeben.',
        source: HEELWORK_SOURCE,
      },
      {
        field: 'regression',
        reason: 'Keine Übungsregression im Heelwork-Delta vorgegeben.',
        source: HEELWORK_SOURCE,
      },
      ...(item.progression.length
        ? []
        : [
            {
              field: 'progression' as const,
              reason:
                'Keine strukturierten Anpassungen vorgegeben; vorhandene Progressionshinweise stehen in der Guidance.',
              source: HEELWORK_SOURCE,
            },
          ]),
    ],
    source: HEELWORK_SOURCE,
  }),
);
