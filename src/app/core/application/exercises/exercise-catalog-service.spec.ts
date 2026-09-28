import { describe, expect, it } from 'vitest';
import { ExerciseCatalog, ExerciseCatalogService } from './exercise-catalog-service';
import { createMitchellExerciseCatalog } from './mitchell-exercises';
import {
  MITCHELL_SYSTEM_ID,
  MITCHELL_SKILLS,
  MITCHELL_HANDLER_SKILLS,
  PUPPY_EXERCISES,
  PUPPY_MODULES,
  PUPPY_PROBLEMS,
  mitchellSkillId,
} from '../../../data/mitchell/catalog';
import { entityId } from '../../domain/shared/identity';
const catalog: ExerciseCatalog = {
  systemId: MITCHELL_SYSTEM_ID,
  skills: MITCHELL_SKILLS,
  handlerSkills: MITCHELL_HANDLER_SKILLS,
  exercises: PUPPY_EXERCISES,
  modules: PUPPY_MODULES,
  problems: PUPPY_PROBLEMS,
};
const exerciseId = (code: string) => entityId<'Exercise'>(`puppy_${code}`);
describe('Puppy-Katalog', () => {
  it('bildet sieben eigenständige Module mit auflösbaren Übungen und drei Problemen', () => {
    const service = createMitchellExerciseCatalog();
    expect(service.getModules()).toHaveLength(7);
    expect(service.getExercises()).toHaveLength(13);
    expect(service.getProblems()).toHaveLength(7);
    const exercises = service.getModules().flatMap((module) => module.exercises);
    expect(new Set(exercises).size).toBe(7);
    for (const id of exercises) expect(service.findExercise(id)).toBeDefined();
  });
  it('ordnet informellen Rückruf Hund und Handler zu und erhält seinen optimalen Trigger', () => {
    const service = createMitchellExerciseCatalog();
    const exercise = service.findExercise(exerciseId('informal_recall'))!;
    expect(exercise.primarySkill).toBe(mitchellSkillId('informal_recall'));
    expect(exercise.secondarySkills).toContain(mitchellSkillId('handler_orientation'));
    expect(exercise.handlerSkills).toHaveLength(4);
    expect(exercise.optimalTriggers[0]).toContain('von sich aus');
    expect(
      service.forSkill(mitchellSkillId('handler_orientation')).map((item) => item.id),
    ).toContain(exercise.id);
    expect(
      service
        .forHandlerSkill(entityId<'HandlerSkill'>('mitchell:handler:timing'))
        .map((item) => item.id),
    ).toContain(exercise.id);
  });
  it('trennt Leinengewöhnung von Heelwork und Geländeerkundung von Hunting', () => {
    const service = createMitchellExerciseCatalog();
    expect(service.forSkill(mitchellSkillId('heelwork'))).toHaveLength(6);
    expect(service.forSkill(mitchellSkillId('hunting'))).toEqual([]);
    expect(service.findExercise(exerciseId('terrain_exploration'))?.cautions).toContain(
      'Nicht als Hunting-Training modellieren.',
    );
  });
  it('erfasst Puppy Retrieve ohne formale Abgabebewertung oder Zahlenvorgaben', () => {
    const exercise = createMitchellExerciseCatalog().findExercise(exerciseId('informal_retrieve'))!;
    expect(exercise.secondarySkills).toContain(mitchellSkillId('informal_recall'));
    expect([exercise.primarySkill, ...exercise.secondarySkills]).not.toContain(
      mitchellSkillId('delivery'),
    );
    expect(exercise.successCriteria).toHaveLength(3);
    expect(exercise.setup.instructions).toContain('kurze Distanz');
    expect(exercise.trainingEffect).toBe('drive_building');
  });
  it('macht fehlende Sitz-/Bleib-Anleitung und Anpassungen explizit statt Regeln zu erfinden', () => {
    const exercise = createMitchellExerciseCatalog().findExercise(exerciseId('intro_sit_stay'))!;
    expect(exercise.trainingEffect).toBe('control_building');
    expect(exercise.steps).toEqual([]);
    expect(exercise.contentGaps?.map((gap) => gap.field)).toContain('steps');
    for (const item of PUPPY_EXERCISES) {
      expect(item.prerequisites).toEqual([]);
      expect(item.guidance?.recommendedAge).toBeUndefined();
      if (item.id !== 'puppy_informal_retrieve') {
        expect(item.progression).toEqual([]);
        expect(item.regression).toEqual([]);
      }
      expect(item.source.evidence.kind).toBe('provided_summary');
    }
  });
  it('verbindet Probleme mit mehreren Hypothesen und nachvollziehbaren Anpassungen', () => {
    const service = createMitchellExerciseCatalog();
    const problems = service.problemsForExercise(exerciseId('informal_retrieve'));
    expect(problems).toHaveLength(2);
    for (const problem of service.getProblems()) {
      expect(problem.possibleCauses.length).toBeGreaterThan(1);
      for (const adjustment of problem.adjustments)
        expect(
          adjustment.possibleCauseIds.every((id) =>
            problem.possibleCauses.some((cause) => cause.id === id),
          ),
        ).toBe(true);
    }
    expect(
      problems
        .flatMap((problem) => problem.possibleCauses)
        .some((cause) => cause.description.includes('Fallenlassen')),
    ).toBe(true);
  });
  it('liefert bei unbekannten Detail-IDs undefined und lehnt unbekannte Problemabfragen ab', () => {
    const service = createMitchellExerciseCatalog();
    expect(service.findExercise(exerciseId('missing'))).toBeUndefined();
    expect(service.findProblem(entityId<'TrainingProblem'>('missing'))).toBeUndefined();
    expect(() => service.problemsForExercise(exerciseId('missing'))).toThrow('Unbekannte');
  });
  it('isoliert den validierten Katalog von späteren Mutationen', () => {
    const input = structuredClone(catalog);
    const service = new ExerciseCatalogService(input);
    Object.assign(input.exercises[0], { title: 'Verändert' });
    Object.assign(service.getExercises()[0], { title: 'Verändert' });
    expect(service.getExercises()[0].title).not.toBe('Verändert');
  });
});
describe('Katalogintegrität', () => {
  it('weist doppelte Übungen und unbekannte Skill-/Problem-/Modulreferenzen zurück', () => {
    expect(
      () =>
        new ExerciseCatalogService({
          ...catalog,
          exercises: [...PUPPY_EXERCISES, PUPPY_EXERCISES[0]],
        }),
    ).toThrow('Doppelte');
    expect(() => new ExerciseCatalogService({ ...catalog, skills: [] })).toThrow('Unbekannte');
    expect(() => new ExerciseCatalogService({ ...catalog, problems: [] })).toThrow('Unbekannte');
    expect(
      () =>
        new ExerciseCatalogService({
          ...catalog,
          modules: [{ ...PUPPY_MODULES[0], exercises: [exerciseId('missing')] }],
        }),
    ).toThrow('Unbekannte');
  });
  it('weist Ursachenreferenzen aus einem anderen Problem zurück', () => {
    const problem = PUPPY_PROBLEMS[0];
    const wrong = {
      ...problem,
      adjustments: [
        { ...problem.adjustments[0], possibleCauseIds: [PUPPY_PROBLEMS[1].possibleCauses[0].id] },
      ],
    };
    expect(
      () =>
        new ExerciseCatalogService({ ...catalog, problems: [wrong, ...PUPPY_PROBLEMS.slice(1)] }),
    ).toThrow('Unbekannte');
  });
  it('weist fremde Quellen auch innerhalb einer Anpassung zurück', () => {
    const problem = PUPPY_PROBLEMS[0];
    const wrong = {
      ...problem,
      adjustments: [
        {
          ...problem.adjustments[0],
          source: { ...problem.source, systemId: entityId<'TrainingSystem'>('other') },
        },
      ],
    };
    expect(
      () =>
        new ExerciseCatalogService({ ...catalog, problems: [wrong, ...PUPPY_PROBLEMS.slice(1)] }),
    ).toThrow('System');
  });
  it('weist unangekündigte inhaltliche Lücken zurück', () => {
    expect(
      () =>
        new ExerciseCatalogService({
          ...catalog,
          exercises: PUPPY_EXERCISES.map((exercise) => ({ ...exercise, contentGaps: [] })),
        }),
    ).toThrow('Inhaltslücke');
  });
  it('weist Schrittzuordnungen zu nicht beteiligten Handler-Skills zurück', () => {
    const exercise = PUPPY_EXERCISES[0];
    const wrong = {
      ...exercise,
      steps: [
        {
          id: 'test-step',
          instruction: 'Test',
          handlerBehaviour: [],
          relatedHandlerSkills: [entityId<'HandlerSkill'>('mitchell:handler:timing')],
        },
      ],
    };
    expect(
      () =>
        new ExerciseCatalogService({ ...catalog, exercises: [wrong, ...PUPPY_EXERCISES.slice(1)] }),
    ).toThrow('Unbekannte');
  });
});

describe('Gerichtete Übungsanpassungen', () => {
  it('erhält Erhöhung, Verringerung und unbekannte Änderung separat', () => {
    const exercise = PUPPY_EXERCISES[0];
    const changes = [
      { factor: 'distance' as const, direction: 'increase' as const, rationale: 'Testkontext' },
      { factor: 'duration' as const, direction: 'decrease' as const, rationale: 'Testkontext' },
      {
        factor: 'terrain' as const,
        direction: 'changed_unknown' as const,
        rationale: 'Testkontext',
      },
    ];
    const regression = [
      {
        id: 'regression',
        description: 'Test',
        changes: [
          { factor: 'distance' as const, direction: 'decrease' as const, rationale: 'Testkontext' },
        ],
        source: exercise.source,
      },
    ];
    const adjusted = {
      ...exercise,
      regression,
      difficultyFactors: changes.map((c) => c.factor),
      progression: [
        {
          id: 'test-adjustment',
          description: 'Synthetischer Test',
          changes,
          source: exercise.source,
        },
      ],
    };
    const service = new ExerciseCatalogService({
      ...catalog,
      exercises: [adjusted, ...PUPPY_EXERCISES.slice(1)],
    });
    expect(service.findExercise(exercise.id)?.progression[0].changes).toEqual(changes);
    expect(service.findExercise(exercise.id)?.regression[0].changes[0]).toMatchObject({
      factor: 'distance',
      direction: 'decrease',
    });
    expect(
      () =>
        new ExerciseCatalogService({
          ...catalog,
          exercises: [
            {
              ...adjusted,
              progression: [{ ...adjusted.progression[0], changes: [changes[0], changes[0]] }],
            },
            ...PUPPY_EXERCISES.slice(1),
          ],
        }),
    ).toThrow('einmal');
  });
});
