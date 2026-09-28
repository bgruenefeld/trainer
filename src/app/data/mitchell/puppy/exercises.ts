import { puppyProblemId, PuppyProblemCode } from '../problems/puppy-problems';
import {
  TrainingExercise,
  ExercisePurpose,
  TrainingEffect,
  WorkingMode,
  ExerciseAdjustment,
} from '../../../core/domain/exercises/training-exercise';
import { DifficultyFactor } from '../../../core/domain/exercises/difficulty';
import { HandlerSkillCode } from '../../../core/domain/handler/handler-skill';
import { entityId } from '../../../core/domain/shared/identity';
import { MitchellSkillCode, mitchellSkillId } from '../skills/skills';
import { MITCHELL_SYSTEM_ID, mitchellSource } from '../sources/source';
interface SeedExercise {
  readonly id: string;
  readonly title: string;
  readonly primary: MitchellSkillCode;
  readonly secondary: readonly MitchellSkillCode[];
  readonly handlers: readonly HandlerSkillCode[];
  readonly purpose: readonly ExercisePurpose[];
  readonly trainingEffect: TrainingEffect;
  readonly workingMode: WorkingMode;
  readonly objective: string;
  readonly contexts: readonly string[];
  readonly difficultyFactors: readonly DifficultyFactor[];
  readonly setup: readonly string[];
  readonly steps: readonly string[];
  readonly expectedBehaviour: readonly string[];
  readonly criteria: readonly string[];
  readonly optimalTriggers: readonly string[];
  readonly progression: readonly Omit<ExerciseAdjustment, 'source'>[];
  readonly regression: readonly Omit<ExerciseAdjustment, 'source'>[];
  readonly notes: readonly string[];
  readonly cautions: readonly string[];
}
// Bestehende, inhaltlich passende Übungs-/Problemzuordnungen bleiben erhalten.
const problems: Readonly<Record<string, readonly PuppyProblemCode[]>> = {
  puppy_environmental_exposure: ['puppy_timidity'],
  puppy_handler_orientation: ['puppy_reluctant_to_return'],
  puppy_informal_recall: ['puppy_reluctant_to_return'],
  puppy_informal_retrieve: ['puppy_reluctant_to_return', 'puppy_retrieve_release_problem'],
  puppy_terrain_exploration: ['puppy_timidity'],
};
const definitions = [
  {
    id: 'puppy_environmental_exposure',
    title: 'Environmental Exposure',
    primary: 'environmental_confidence',
    secondary: ['confidence', 'socialisation'],
    handlers: ['observation', 'pressure_control'],
    purpose: ['confidence_building', 'generalisation'],
    trainingEffect: 'neutral',
    workingMode: 'mixed',
    objective:
      'Aufbau von Umweltsicherheit und Selbstvertrauen durch positive und überschaubare Erfahrungen in unterschiedlichen Umgebungen.',
    contexts: [
      'Menschen',
      'andere Hunde',
      'Haushaltsgeräusche',
      'Fahrzeuge',
      'verschiedene Orte',
      'unterschiedliche Untergründe',
      'Deckung',
      'kleine natürliche Hindernisse',
      'flaches Wasser',
      'Wald',
      'Heide',
      'Schilf',
      'Pfützen',
      'kleine Gräben',
    ],
    difficultyFactors: ['novelty', 'distractions', 'terrain', 'cover', 'obstacle'],
    setup: [],
    steps: [],
    expectedBehaviour: [],
    criteria: [
      'Welpe erkundet die Umgebung freiwillig.',
      'Welpe bleibt grundsätzlich für den Handler erreichbar bzw. ansprechbar.',
      'Der Welpe zeigt in bekannten oder angemessen gesteigerten Situationen zunehmende Sicherheit.',
    ],
    optimalTriggers: [],
    progression: [],
    regression: [],
    notes: [],
    cautions: ['Nicht als Hunting-Training klassifizieren.'],
  },
  {
    id: 'puppy_handler_orientation',
    title: 'Handler Orientation',
    primary: 'handler_orientation',
    secondary: ['engagement', 'confidence'],
    handlers: ['timing', 'body_language', 'observation', 'pressure_control'],
    purpose: ['teaching', 'confidence_building'],
    trainingEffect: 'neutral',
    workingMode: 'mixed',
    objective: 'Der Welpe entwickelt freiwillige Orientierung und Kontaktaufnahme zum Handler.',
    contexts: [],
    difficultyFactors: [],
    setup: [],
    steps: [
      'Handler bewegt sich.',
      'Welpe erhält Raum zur Exploration.',
      'Welpe orientiert sich von sich aus zurück.',
      'Handler reagiert einladend.',
    ],
    expectedBehaviour: [],
    criteria: [
      'Welpe orientiert sich freiwillig zum Handler zurück.',
      'Welpe sucht regelmäßig räumliche oder soziale Orientierung am Handler.',
    ],
    optimalTriggers: [],
    progression: [],
    regression: [],
    notes: [],
    cautions: [],
  },
  {
    id: 'puppy_informal_recall',
    title: 'Informal Recall',
    primary: 'informal_recall',
    secondary: ['handler_orientation', 'engagement'],
    handlers: ['timing', 'body_language', 'observation', 'pressure_control'],
    purpose: ['teaching', 'confidence_building'],
    trainingEffect: 'mixed',
    workingMode: 'mixed',
    objective: 'Der Welpe lernt, freiwillig und positiv zum Handler zurückzukehren.',
    contexts: [],
    difficultyFactors: [],
    setup: [],
    steps: [],
    expectedBehaviour: [],
    criteria: [
      'Welpe bewegt sich freiwillig zum Handler.',
      'Rückkehr ist mit positiver sozialer Interaktion verbunden.',
    ],
    optimalTriggers: [
      'Welpe schaut von sich aus zum Handler.',
      'Welpe sucht räumliche Orientierung.',
      'Welpe beginnt freiwillig Kontakt aufzunehmen.',
    ],
    progression: [],
    regression: [],
    notes: [
      'Handler-Verhalten: offene, einladende Körpersprache',
      'Handler-Verhalten: Körperposition eher niedrig und wenig bedrohlich',
      'Handler-Verhalten: unnötigen sozialen Druck vermeiden',
      'Handler-Verhalten: günstigen Moment für das Signal nutzen',
    ],
    cautions: ['Nicht als formal generalisierten Recall klassifizieren.'],
  },
  {
    id: 'puppy_leash_introduction',
    title: 'Leash Introduction',
    primary: 'leash_introduction',
    secondary: [],
    handlers: ['observation', 'pressure_control'],
    purpose: ['teaching', 'confidence_building'],
    trainingEffect: 'neutral',
    workingMode: 'handler_controlled',
    objective: 'Der Welpe gewöhnt sich ohne formales Heelwork-Training an eine Leine.',
    contexts: [],
    difficultyFactors: [],
    setup: [],
    steps: [],
    expectedBehaviour: [],
    criteria: [
      'Welpe akzeptiert die Leine ohne deutliche Unsicherheit.',
      'Welpe kann sich während kurzer Leinensequenzen grundsätzlich weiter bewegen.',
    ],
    optimalTriggers: [],
    progression: [],
    regression: [],
    notes: [
      'kurze Sequenzen',
      'Leine kennenlernen',
      'anschließend wieder freie Bewegung ermöglichen',
    ],
    cautions: ['Leash Introduction ist NICHT Heelwork.'],
  },
  {
    id: 'puppy_informal_retrieve',
    title: 'Informal Puppy Retrieve',
    primary: 'retrieve_desire',
    secondary: ['handler_orientation', 'engagement', 'informal_recall'],
    handlers: ['body_language', 'timing', 'observation', 'pressure_control'],
    purpose: ['teaching', 'confidence_building'],
    trainingEffect: 'drive_building',
    workingMode: 'mixed',
    objective:
      'Freude an der frühen Retrieve-Verhaltenskette aufbauen: Chase → Pickup → Return toward Handler',
    contexts: [],
    difficultyFactors: ['novelty', 'distractions', 'distance'],
    setup: [
      'wenig Ablenkung',
      'kurze Distanz',
      'gut sichtbares und für den Welpen geeignetes Apportierobjekt',
      'einfache Umgebung',
    ],
    steps: [],
    expectedBehaviour: [
      'Welpe läuft freiwillig zum Gegenstand.',
      'Welpe nimmt den Gegenstand auf.',
      'Welpe bewegt sich mit dem Gegenstand zurück in Richtung Handler.',
    ],
    criteria: ['freiwilliger Chase', 'Pickup', 'Rückkehrbewegung in Richtung Handler'],
    optimalTriggers: [],
    progression: [
      {
        id: 'puppy_informal_retrieve:progression:1',
        description: 'Anderes geeignetes Apportierobjekt verwenden.',
        changes: [
          {
            factor: 'novelty',
            direction: 'increase',
            rationale: 'Anderes geeignetes Apportierobjekt verwenden.',
          },
        ],
      },
      {
        id: 'puppy_informal_retrieve:progression:2',
        description: 'Übung an einem anderen geeigneten Ort durchführen.',
        changes: [
          {
            factor: 'novelty',
            direction: 'increase',
            rationale: 'Übung an einem anderen geeigneten Ort durchführen.',
          },
        ],
      },
      {
        id: 'puppy_informal_retrieve:progression:3',
        description: 'Umweltkomplexität leicht erhöhen.',
        changes: [
          {
            factor: 'distractions',
            direction: 'increase',
            rationale: 'Umweltkomplexität leicht erhöhen.',
          },
        ],
      },
    ],
    regression: [
      {
        id: 'puppy_informal_retrieve:regression:1',
        description: 'Ablenkung reduzieren.',
        changes: [
          {
            factor: 'distractions',
            direction: 'decrease',
            rationale: 'Ablenkung reduzieren.',
          },
        ],
      },
      {
        id: 'puppy_informal_retrieve:regression:2',
        description: 'Distanz reduzieren.',
        changes: [
          {
            factor: 'distance',
            direction: 'decrease',
            rationale: 'Distanz reduzieren.',
          },
        ],
      },
      {
        id: 'puppy_informal_retrieve:regression:3',
        description: 'Umgebung vereinfachen.',
        changes: [],
      },
    ],
    notes: [
      'Handler-Verhalten: niedrige oder einladende Körperposition',
      'Handler-Verhalten: offene Körpersprache',
      'Handler-Verhalten: Welpen nicht verfolgen',
      'Handler-Verhalten: Apportiergegenstand nicht sofort wegnehmen',
      'Handler-Verhalten: Rückkehr zum Handler positiv gestalten',
      'Handler-Anpassung bei Regression: Handlerverhalten stärker einladend gestalten.',
    ],
    cautions: ['Noch keine formale perfekte Delivery verlangen.'],
  },
  {
    id: 'puppy_intro_sit_stay',
    title: 'Introductory Sit and Stay',
    primary: 'sit_stay',
    secondary: [],
    handlers: ['timing', 'cue_clarity', 'observation'],
    purpose: ['teaching'],
    trainingEffect: 'control_building',
    workingMode: 'handler_controlled',
    objective: 'Erste einfache Kontrollsequenzen mit Sit und kurzem Verbleiben aufbauen.',
    contexts: [],
    difficultyFactors: [],
    setup: [],
    steps: [],
    expectedBehaviour: [],
    criteria: ['erste ruhige kurze Sit-/Stay-Sequenzen sind möglich'],
    optimalTriggers: [],
    progression: [],
    regression: [],
    notes: [],
    cautions: [
      'Geringer Trainingsanteil.',
      'Puppy Foundation bleibt insgesamt motivations- und erfahrungsorientiert.',
      'Keine intensive frühe Kontrolle.',
    ],
  },
  {
    id: 'puppy_terrain_exploration',
    title: 'Terrain Exploration',
    primary: 'environmental_confidence',
    secondary: ['confidence'],
    handlers: ['observation', 'pressure_control'],
    purpose: ['confidence_building', 'generalisation'],
    trainingEffect: 'neutral',
    workingMode: 'dog_independent',
    objective:
      'Der Welpe sammelt selbstständige, positive Erfahrungen mit unterschiedlichen natürlichen Geländeformen.',
    contexts: [
      'Heide',
      'Wald',
      'Schilf',
      'Pfützen',
      'kleine Gräben',
      'kleine natürliche Hindernisse',
    ],
    difficultyFactors: ['novelty', 'terrain', 'cover', 'obstacle'],
    setup: [],
    steps: [],
    expectedBehaviour: [],
    criteria: [
      'Welpe erkundet geeignetes Gelände freiwillig.',
      'Welpe bewältigt kleine Umweltunterschiede ohne unnötigen Handlerdruck.',
    ],
    optimalTriggers: [],
    progression: [],
    regression: [],
    notes: [],
    cautions: ['Nicht als Hunting-Training modellieren.'],
  },
] as const satisfies readonly SeedExercise[];
export const PUPPY_EXERCISES: readonly TrainingExercise[] = definitions.map(
  (input: SeedExercise) => {
    const source = mitchellSource('Puppy Informal Play Training');
    return {
      id: entityId<'Exercise'>(input.id),
      systemId: MITCHELL_SYSTEM_ID,
      version: '2.0.0',
      title: input.title,
      primarySkill: mitchellSkillId(input.primary),
      secondarySkills: input.secondary.map(mitchellSkillId),
      handlerSkills: input.handlers.map((code) =>
        entityId<'HandlerSkill'>(`mitchell:handler:${code}`),
      ),
      objective: input.objective,
      purpose: input.purpose,
      trainingEffect: input.trainingEffect,
      workingMode: input.workingMode,
      prerequisites: [],
      environment: { contexts: input.contexts, description: input.contexts.join(' · ') },
      difficultyFactors: input.difficultyFactors,
      optimalTriggers: input.optimalTriggers,
      setup: { instructions: input.setup, equipment: [], conditions: [] },
      steps: input.steps.map((instruction, i) => ({
        id: `${input.id}:step:${i + 1}`,
        instruction,
        handlerBehaviour: [],
        relatedHandlerSkills: [],
      })),
      expectedBehaviour: input.expectedBehaviour,
      successCriteria: input.criteria.map((description, i) => ({
        id: entityId<'Criterion'>(`${input.id}:criterion:${i + 1}`),
        description,
        relatedSkills: [],
      })),
      progression: input.progression.map((change) => ({ ...change, source })),
      regression: input.regression.map((change) => ({ ...change, source })),
      commonProblems: (problems[input.id] ?? []).map(puppyProblemId),
      physicalConstraints: [],
      cautions: input.cautions,
      guidance: { notes: input.notes, source },
      contentGaps: (['setup', 'steps', 'progression', 'regression'] as const)
        .filter((field) => input[field].length === 0)
        .map((field) => ({ field, reason: 'Im kanonischen Datensatz nicht vorgegeben.', source })),
      source,
    };
  },
);
