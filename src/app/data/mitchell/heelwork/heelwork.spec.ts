import { describe, expect, it } from 'vitest';
import {
  HEELWORK_EXERCISES,
  HEELWORK_PROBLEMS,
  HEELWORK_GUIDANCE,
  HEELWORK_COMPETENCE_GUIDANCE,
  HEELWORK_READINESS_GUIDANCE,
  HEELWORK_STEADINESS_GUIDANCE,
  MITCHELL_SKILLS,
  MITCHELL_HANDLER_SKILLS,
  MITCHELL_DEPENDENCIES,
  PUPPY_EXERCISES,
  PUPPY_PROBLEMS,
  PUPPY_MODULES,
  MITCHELL_SYSTEM_ID,
  PUPPY_HEELWORK_INDICATORS,
} from '../catalog';
import { createMitchellExerciseCatalog } from '../../../core/application/exercises/mitchell-exercises';
import { ExerciseCatalogService } from '../../../core/application/exercises/exercise-catalog-service';
import { createMitchellReadinessService } from '../../../core/application/readiness/mitchell-readiness';
import {
  createExerciseSnapshot,
  validateExerciseSnapshot,
} from '../../../core/domain/training-session/exercise-snapshot';
import { validateGuidance } from '../../../core/domain/exercises/guidance';
import {
  reviewDifficultyChanges,
  validateDifficultySettings,
} from '../../../core/domain/exercises/difficulty';
import { entityId } from '../../../core/domain/shared/identity';
import { DogId } from '../../../core/domain/dog/dog';
const catalog = () => createMitchellExerciseCatalog();
const exercise = (id: string) => HEELWORK_EXERCISES.find((e) => e.id === id)!;
const settings = {
  systemId: MITCHELL_SYSTEM_ID,
  skills: MITCHELL_SKILLS,
  handlerSkills: MITCHELL_HANDLER_SKILLS,
  exercises: [...PUPPY_EXERCISES, ...HEELWORK_EXERCISES],
  modules: PUPPY_MODULES,
  problems: [...PUPPY_PROBLEMS, ...HEELWORK_PROBLEMS],
};
describe('Freigegebenes Heelwork-Delta', () => {
  it('behält Skills bei und ergänzt ausschließlich heelwork → steadiness als elfte Kante', () => {
    expect(MITCHELL_SKILLS).toHaveLength(38);
    expect(MITCHELL_HANDLER_SKILLS).toHaveLength(11);
    expect(MITCHELL_DEPENDENCIES).toHaveLength(11);
    const edge = MITCHELL_DEPENDENCIES.filter((e) => e.targetSkillId === 'mitchell:steadiness');
    expect(edge).toHaveLength(1);
    expect(edge[0].requirement).toMatchObject({
      skillId: 'mitchell:heelwork',
      type: 'hard',
      source: { section: 'Heelwork', evidence: { kind: 'provided_summary' } },
    });
    expect(edge[0].requirement.acceptedCompetences).toBeUndefined();
    expect(MITCHELL_SKILLS.filter((s) => s.code === 'heelwork')).toHaveLength(1);
    expect(MITCHELL_SKILLS.find((s) => s.code === 'heelwork')?.purpose).toBe(
      'Der Hund hält freiwillig und aufmerksam eine funktionale Position neben dem Handler und orientiert sich an dessen Bewegung, Richtung und Geschwindigkeit.',
    );
  });
  it('enthält genau sechs Heelwork-Übungen und vier Probleme ohne spätere Kapitelübungen', () => {
    expect(HEELWORK_EXERCISES.map((e) => e.id)).toEqual([
      'heelwork_basic_square',
      'heelwork_mixed_rectangles',
      'heelwork_triangles',
      'heelwork_180_turns',
      'heelwork_off_lead_transition',
      'heelwork_distractions',
    ]);
    expect(HEELWORK_PROBLEMS.map((p) => p.id)).toEqual([
      'heelwork_nose_down',
      'heelwork_pulling_forward',
      'heelwork_too_far_side',
      'heelwork_lagging',
    ]);
    expect(catalog().getExercises()).toHaveLength(13);
    expect(catalog().getProblems()).toHaveLength(7);
    expect(
      catalog()
        .getExercises()
        .map((e) => e.id),
    ).toEqual([...PUPPY_EXERCISES, ...HEELWORK_EXERCISES].map((e) => e.id));
    expect(HEELWORK_EXERCISES.map((e) => e.successCriteria.length)).toEqual([5, 3, 2, 3, 3, 4]);
    for (const e of HEELWORK_EXERCISES) {
      expect(e.trainingEffect).toBe('control_building');
      expect(e.primarySkill).toBe('mitchell:heelwork');
      expect(e.secondarySkills).toEqual([]);
      expect(e.workingMode).toBe('handler_controlled');
      for (const h of e.handlerSkills)
        expect(MITCHELL_HANDLER_SKILLS.some((s) => s.id === h)).toBe(true);
    }
    expect(exercise('heelwork_off_lead_transition').purpose).toEqual([
      'proofing',
      'generalisation',
    ]);
  });
  it('validiert exakt die drei methodischen Übungsreferenzen, ohne Skill-Prerequisites zu erfinden', () => {
    expect(
      HEELWORK_EXERCISES.flatMap((e) => (e.prerequisiteExerciseIds ?? []).map((id) => [e.id, id])),
    ).toEqual([
      ['heelwork_mixed_rectangles', 'heelwork_basic_square'],
      ['heelwork_triangles', 'heelwork_mixed_rectangles'],
      ['heelwork_180_turns', 'heelwork_triangles'],
    ]);
    expect(HEELWORK_EXERCISES.every((e) => e.prerequisites.length === 0)).toBe(true);
    expect(
      () =>
        new ExerciseCatalogService({
          ...settings,
          exercises: settings.exercises.map((e) =>
            e.id === 'heelwork_triangles'
              ? { ...e, prerequisiteExerciseIds: [entityId<'Exercise'>('missing')] }
              : e,
          ),
        }),
    ).toThrow('Unbekannte');
    expect(
      () =>
        new ExerciseCatalogService({
          ...settings,
          exercises: settings.exercises.map((e) =>
            e.id === 'heelwork_triangles'
              ? {
                  ...e,
                  prerequisiteExerciseIds: [
                    entityId<'Exercise'>('heelwork_basic_square'),
                    entityId<'Exercise'>('heelwork_basic_square'),
                  ],
                }
              : e,
          ),
        }),
    ).toThrow('Doppelte');
  });
  it('erhält Winkel und Tempo als Änderungen ohne erfundene Schwierigkeitsskala', () => {
    const turn = exercise('heelwork_triangles').progression[0].changes;
    const pace = exercise('heelwork_mixed_rectangles').progression[2].changes;
    expect(turn).toEqual([
      {
        factor: 'turn_angle',
        direction: 'changed_unknown',
        rationale: 'Übergang von 90°-Richtungswechseln zu spitzeren Winkeln.',
      },
    ]);
    expect(pace).toEqual([
      {
        factor: 'pace_variation',
        direction: 'changed_unknown',
        rationale: 'Wechsel zwischen langsamem, normalem und schnellerem Tempo.',
      },
    ]);
    expect(reviewDifficultyChanges([...turn, ...pace])).toEqual({
      increasedFactors: [],
      multipleIncreases: false,
    });
    expect(() =>
      validateDifficultySettings([
        { factor: 'turn_angle', description: '180°-Wendungen' },
        { factor: 'pace_variation', description: 'Wechselndes Tempo' },
      ]),
    ).not.toThrow();
    for (const e of HEELWORK_EXERCISES)
      for (const a of e.progression)
        for (const c of a.changes) expect(e.difficultyFactors).toContain(c.factor);
  });
  it('behandelt Alter und Kompetenzinterpretationen als Guidance statt als Readiness-Eingabe', () => {
    expect(HEELWORK_GUIDANCE.recommendedAge).toEqual({
      text: 'ungefähr ab 6–7 Monaten oder später',
    });
    expect(HEELWORK_READINESS_GUIDANCE).toHaveLength(4);
    expect(HEELWORK_STEADINESS_GUIDANCE).toHaveLength(2);
    expect(Object.keys(HEELWORK_COMPETENCE_GUIDANCE)).toEqual([
      'introduced',
      'learning',
      'stable',
      'generalised',
    ]);
    const profile = {
      dogId: 'test' as DogId,
      systemId: MITCHELL_SYSTEM_ID,
      skillAssessments: [],
      constraints: [],
      indicators: PUPPY_HEELWORK_INDICATORS.map((i) => ({
        indicatorId: i.id,
        result: 'met' as const,
        rationale: 'Test',
      })),
    };
    const service = createMitchellReadinessService();
    const before = service.assess(entityId<'Skill'>('mitchell:heelwork'), profile);
    validateGuidance(HEELWORK_GUIDANCE);
    validateGuidance({
      ...HEELWORK_GUIDANCE,
      recommendedAge: { text: 'Anderer rein beschreibender Testtext' },
    });
    expect(before.status).toBe('ready');
    expect(service.assess(entityId<'Skill'>('mitchell:heelwork'), profile)).toEqual(before);
  });
  it('verwendet die Heelwork-Quelle überall im Delta ohne erfundene Edition', () => {
    const sources = [
      HEELWORK_GUIDANCE.source,
      ...HEELWORK_READINESS_GUIDANCE.map((i) => i.source),
      ...HEELWORK_STEADINESS_GUIDANCE.map((i) => i.source),
      ...Object.values(HEELWORK_COMPETENCE_GUIDANCE).map((i) => i!.source),
      ...HEELWORK_EXERCISES.flatMap((e) => [
        e.source,
        e.guidance!.source,
        ...e.progression.map((a) => a.source),
        ...e.contentGaps!.map((g) => g.source),
      ]),
      ...HEELWORK_PROBLEMS.flatMap((p) => [
        p.source,
        ...p.possibleCauses.map((c) => c.source),
        ...p.adjustments.map((a) => a.source),
      ]),
    ];
    for (const source of sources) {
      expect(source.section).toBe('Heelwork');
      expect(source.evidence.kind).toBe('provided_summary');
      expect(source.evidence).not.toHaveProperty('edition');
    }
  });
  it('enthält keine speziellen Korrekturmethoden in Default-Daten oder Schrittfolgen', () => {
    const defaults = JSON.stringify([HEELWORK_EXERCISES, HEELWORK_PROBLEMS]);
    expect(defaults).not.toMatch(
      /Fußbewegung|überraschende Geräusch|Wellington|Stiefel|Rassel|Steinchen/,
    );
    expect(HEELWORK_GUIDANCE.notes.join(' ')).toContain('danach unmittelbar wieder lockere Leine');
    expect(HEELWORK_EXERCISES.every((e) => e.steps.length === 0 && e.regression.length === 0)).toBe(
      true,
    );
  });
  it.each(HEELWORK_EXERCISES)('kopiert historische Snapshot-Daten unabhängig für $id', (e) => {
    const input = structuredClone(e);
    const snapshot = createExerciseSnapshot(input);
    const expected = structuredClone(snapshot);
    validateExerciseSnapshot(snapshot);
    Object.assign(input, { title: 'Späterer Katalogtitel' });
    Object.assign(input.handlerSkills, { 0: entityId<'HandlerSkill'>('changed') });
    Object.assign(input.successCriteria[0], { description: 'Späteres Kriterium' });
    Object.assign(input.successCriteria[0].relatedSkills, { 0: entityId<'Skill'>('changed') });
    Object.assign(input.source.evidence, { reference: 'Spätere Quelle' });
    expect(snapshot).toEqual(expected);
  });
});

describe('Verbindliche Ursachen und Anpassungen', () => {
  it('verwendet die exakt freigegebenen Areas und Verknüpfungen', () => {
    expect(
      Object.fromEntries(
        HEELWORK_PROBLEMS.flatMap((p) => p.possibleCauses.map((c) => [c.id, c.area])),
      ),
    ).toEqual({
      heelwork_nose_environment: 'environment',
      heelwork_nose_early_hunting: 'training',
      heelwork_nose_cover: 'environment',
      heelwork_forward_position: 'dog',
      heelwork_forward_handler_timing: 'handler',
      heelwork_forward_turn_pattern: 'training',
      heelwork_forward_attention: 'dog',
      heelwork_side_handler_pressure: 'handler',
      heelwork_side_unpleasant_training: 'training',
      heelwork_side_handler_mood: 'handler',
      heelwork_side_low_social_reward: 'handler',
      heelwork_lagging_timidity: 'dog',
      heelwork_lagging_handler_pressure: 'handler',
      heelwork_lagging_low_motivation: 'dog',
    });
    expect(
      Object.fromEntries(
        HEELWORK_PROBLEMS.flatMap((p) => p.adjustments.map((a) => [a.id, a.possibleCauseIds])),
      ),
    ).toEqual({
      heelwork_nose_reduce_scent: ['heelwork_nose_environment', 'heelwork_nose_cover'],
      heelwork_nose_reduce_complexity: ['heelwork_nose_environment', 'heelwork_nose_cover'],
      heelwork_nose_refocus: [
        'heelwork_nose_environment',
        'heelwork_nose_early_hunting',
        'heelwork_nose_cover',
      ],
      heelwork_forward_turn_into: ['heelwork_forward_position', 'heelwork_forward_turn_pattern'],
      heelwork_forward_correct_earlier: [
        'heelwork_forward_handler_timing',
        'heelwork_forward_position',
      ],
      heelwork_forward_restore_lead: ['heelwork_forward_position', 'heelwork_forward_attention'],
      heelwork_forward_refocus: ['heelwork_forward_attention'],
      heelwork_side_reduce_pressure: [
        'heelwork_side_handler_pressure',
        'heelwork_side_unpleasant_training',
      ],
      heelwork_side_positive_interaction: [
        'heelwork_side_low_social_reward',
        'heelwork_side_unpleasant_training',
      ],
      heelwork_side_review_handler: [
        'heelwork_side_handler_mood',
        'heelwork_side_handler_pressure',
      ],
      heelwork_side_find_cause: [
        'heelwork_side_handler_pressure',
        'heelwork_side_unpleasant_training',
        'heelwork_side_handler_mood',
        'heelwork_side_low_social_reward',
      ],
      heelwork_lagging_encourage: ['heelwork_lagging_timidity', 'heelwork_lagging_low_motivation'],
      heelwork_lagging_reduce_pressure: [
        'heelwork_lagging_handler_pressure',
        'heelwork_lagging_timidity',
      ],
      heelwork_lagging_add_forward_motivation: ['heelwork_lagging_low_motivation'],
    });
    const allProblems = [...PUPPY_PROBLEMS, ...HEELWORK_PROBLEMS];
    expect(new Set(allProblems.flatMap((p) => p.possibleCauses.map((c) => c.id))).size).toBe(31);
    expect(new Set(allProblems.flatMap((p) => p.adjustments.map((a) => a.id))).size).toBe(30);
    for (const p of allProblems) {
      for (const id of p.relatedSkills) expect(MITCHELL_SKILLS.some((s) => s.id === id)).toBe(true);
      for (const a of p.adjustments) {
        expect(a.possibleCauseIds.length).toBeGreaterThan(0);
        for (const id of a.possibleCauseIds)
          expect(p.possibleCauses.some((c) => c.id === id)).toBe(true);
      }
    }
  });
});
