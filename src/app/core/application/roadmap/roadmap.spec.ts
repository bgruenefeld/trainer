import { describe, expect, it } from 'vitest';
import { RoadmapCatalogService } from './roadmap-catalog-service';
import { RoadmapService, RoadmapInput } from './roadmap-service';
import { MITCHELL_MAIN_ROADMAP, roadmapStageId } from '../../../data/mitchell/roadmap/roadmap';
import {
  MITCHELL_SKILLS,
  MITCHELL_DEPENDENCIES,
  MITCHELL_SYSTEM_ID,
  PUPPY_EXERCISES,
  HEELWORK_EXERCISES,
  PUPPY_HEELWORK_INDICATORS,
  mitchellSkillId,
} from '../../../data/mitchell/catalog';
import { SkillGraph } from '../../domain/skills/skill-graph';
import { SkillCompetence, SkillCondition } from '../../domain/skills/skill';
import { DogSkillAssessment } from '../../domain/skills/skill-assessment';
import { entityId } from '../../domain/shared/identity';
import { DEMO_DOG } from '../../infrastructure/persistence/demo-dog';
import { createMitchellExerciseCatalog } from '../exercises/mitchell-exercises';
import { createMitchellReadinessService } from '../readiness/mitchell-readiness';
import { createExerciseSnapshot } from '../../domain/training-session/exercise-snapshot';
import { TrainingSession } from '../../domain/training-session/training-session';
const graph = new SkillGraph(MITCHELL_SYSTEM_ID, MITCHELL_SKILLS, MITCHELL_DEPENDENCIES);
const catalog = (data = MITCHELL_MAIN_ROADMAP) =>
  new RoadmapCatalogService(data, graph, createMitchellExerciseCatalog());
const service = () => new RoadmapService(catalog(), createMitchellReadinessService());
const input: RoadmapInput = {
  dogId: DEMO_DOG.id,
  assessments: [],
  assessmentIssues: [],
  sessions: [],
};
const puppy = roadmapStageId('puppy_foundation');
const heel = roadmapStageId('heelwork');
const profile = {
  id: 'profile',
  dogId: DEMO_DOG.id,
  systemId: MITCHELL_SYSTEM_ID,
  focusSkills: [],
  constraints: [],
  indicators: PUPPY_HEELWORK_INDICATORS.map((i) => ({
    indicatorId: i.id,
    result: 'met' as const,
    rationale: 'Beobachtet',
  })),
};
function assessment(
  competence: SkillCompetence,
  condition: SkillCondition = 'normal',
  code: Parameters<typeof mitchellSkillId>[0] = 'heelwork',
  date = '2026-09-28T10:00:00Z',
): DogSkillAssessment {
  return {
    id: entityId<'Assessment'>(`${code}:${date}`),
    dogId: DEMO_DOG.id,
    systemId: MITCHELL_SYSTEM_ID,
    skillId: mitchellSkillId(code),
    competence,
    condition,
    assessedAt: date,
    assessedBy: entityId<'Handler'>('handler'),
    context: 'Im Training',
    rationale: 'Beobachtet',
    observationIds: [],
  };
}
function session(exercise = HEELWORK_EXERCISES[0]): TrainingSession {
  return {
    schemaVersion: 3,
    id: entityId<'TrainingSession'>('session'),
    dogId: DEMO_DOG.id,
    handlerId: entityId<'Handler'>('handler'),
    systemId: MITCHELL_SYSTEM_ID,
    roadmapId: entityId<'Roadmap'>('old-personal-roadmap'),
    startedAt: '2026-09-27T10:00:00Z',
    reflection: 'Historisch',
    executions: [
      {
        id: 'execution',
        exerciseSnapshot: createExerciseSnapshot(exercise),
        setup: { factors: [], environmentNotes: '', handlerPositionNotes: '' },
        criteria: exercise.successCriteria.map((c) => ({ criterionId: c.id, result: 'observed' })),
        observations: [],
        notes: '',
      },
    ],
  };
}
describe('Mitchell Roadmap-Katalog', () => {
  it('enthält exakt die 25 vorgegebenen Stages in Reihenfolge', () => {
    expect(
      catalog()
        .getRoadmap()
        .stages.map((s) => s.title),
    ).toEqual([
      'Puppy Foundation',
      'Heelwork',
      'Steadiness',
      'Setup',
      'Delivery',
      'Outrun Part 1',
      'Outrun Part 2',
      'Inrun and Recall',
      'Training Tool – Stopping and Return on Voice/Body Language Only',
      'Collection',
      'Returning to Heel',
      'Diversions',
      'Go-Back Command',
      'Stop Whistle',
      'Pulling the Dog About in a Straight Line',
      'Directions Part 1',
      'Directions Part 2',
      'Collecting Blinds by Handling',
      'Hunting',
      'Training for Shot',
      'Marking',
      'Walk-Up',
      'Full Jumping',
      'Water Work',
      'Advanced Training',
    ]);
    const stages = catalog().getRoadmap().stages;
    expect(stages.map((s) => s.contentStatus)).toEqual([
      'available',
      'available',
      ...Array(23).fill('planned'),
    ]);
    expect(stages[0].exerciseIds).toEqual(PUPPY_EXERCISES.map((e) => e.id));
    expect(stages[0].exerciseIds).toHaveLength(7);
    expect(stages[0].skillIds).toHaveLength(9);
    expect(stages[1].exerciseIds).toEqual(HEELWORK_EXERCISES.map((e) => e.id));
    expect(stages[1].exerciseIds).toHaveLength(6);
    expect(
      stages
        .slice(2)
        .every((s) => s.exerciseIds.length === 0 && !s.readinessGuidance && !s.completionGuidance),
    ).toBe(true);
    expect(stages[8].skillIds).toEqual([]);
    expect(stages[14].skillIds).toEqual([]);
  });
  it('validiert unbekannte Referenzen und Zyklen', () => {
    const withPrerequisite = (id: string) => ({
      ...MITCHELL_MAIN_ROADMAP,
      stages: MITCHELL_MAIN_ROADMAP.stages.map((s, i) =>
        i === 0 ? { ...s, prerequisiteStageIds: [entityId<'RoadmapStage'>(id)] } : s,
      ),
    });
    expect(() => catalog(withPrerequisite('missing'))).toThrow('Unbekannte');
    expect(() => catalog(withPrerequisite(heel))).toThrow('Zyklische');
    expect(() => catalog(withPrerequisite(puppy))).toThrow('Zyklische');
    expect(() =>
      catalog({
        ...MITCHELL_MAIN_ROADMAP,
        stages: [...MITCHELL_MAIN_ROADMAP.stages, MITCHELL_MAIN_ROADMAP.stages[0]],
      }),
    ).toThrow('Doppelte');
    expect(() =>
      catalog({
        ...MITCHELL_MAIN_ROADMAP,
        stages: MITCHELL_MAIN_ROADMAP.stages.map((s, i) =>
          i === 2 ? { ...s, exerciseIds: [PUPPY_EXERCISES[0].id] } : s,
        ),
      }),
    ).toThrow('Geplante');
    expect(() =>
      catalog({
        ...MITCHELL_MAIN_ROADMAP,
        stages: MITCHELL_MAIN_ROADMAP.stages.map((s, i) =>
          i === 0 ? { ...s, exerciseIds: [entityId<'Exercise'>('missing')] } : s,
        ),
      }),
    ).toThrow('Unbekannte');
    expect(() =>
      catalog({
        ...MITCHELL_MAIN_ROADMAP,
        stages: MITCHELL_MAIN_ROADMAP.stages.map((s, i) =>
          i === 0 ? { ...s, skillIds: [entityId<'Skill'>('missing')] } : s,
        ),
      }),
    ).toThrow();
  });
});
describe('Qualitative Roadmap-Projektion', () => {
  it('markiert zukünftige untrainierte Skills niemals als Defizit', () => {
    const result = service().getRoadmapForDog(input);
    expect(result.currentStage?.id).toBe(puppy);
    expect(result.attention).toEqual([]);
    expect(result.stages.every((s) => s.status === 'not_started')).toBe(true);
    expect(result.stages[2].findings.every((f) => f.kind === 'not_yet_relevant')).toBe(true);
  });
  it('leitet aus allen Puppy-Indikatoren Übergangsbereitschaft, aber keine Etablierung ab', () => {
    const result = service().getRoadmapForDog({ ...input, profile });
    expect(result.stages[0].status).toBe('ready_to_progress');
    expect(result.establishedStages).toEqual([]);
    expect(result.currentStage?.id).toBe(heel);
    expect(result.nextStage?.title).toBe('Steadiness');
    expect(result.stableSkills).toEqual([]);
  });
  it('wertet nicht erfüllte oder fehlende Indikatoren nicht als Übergangsbereitschaft', () => {
    for (const indicators of [
      [],
      profile.indicators.slice(1),
      profile.indicators.map((i) => ({ ...i, result: 'not_met' as const })),
    ])
      expect(
        service().getStageStatus({ ...input, profile: { ...profile, indicators } }, puppy),
      ).toBe('not_started');
  });
  it.each([
    ['stable', 'normal', 'established'],
    ['generalised', 'normal', 'established'],
    ['stable', 'maintenance', 'established'],
    ['generalised', 'maintenance', 'established'],
    ['introduced', 'normal', 'active'],
    ['learning', 'normal', 'active'],
    ['stable', 'regressed', 'needs_attention'],
    ['learning', 'regressed', 'needs_attention'],
    ['not_started', 'normal', 'not_started'],
  ] as const)('Heelwork %s + %s → %s', (competence, condition, expected) => {
    const result = service().getRoadmapForDog({
      ...input,
      assessments: [assessment(competence, condition)],
    });
    expect(result.stages[1].status).toBe(expected);
    expect(result.stages[1].status).not.toBe('ready_to_progress');
    expect(result.stages[1].findings.some((f) => f.kind === 'maintenance_due')).toBe(
      condition === 'maintenance',
    );
    expect(result.stages[1].findings.some((f) => f.kind === 'regression')).toBe(
      condition === 'regressed',
    );
  });
  it('priorisiert den frühesten aktiven available Stage', () => {
    expect(
      service().getCurrentRecommendedStage({ ...input, assessments: [assessment('learning')] })?.id,
    ).toBe(heel);
    expect(
      service().getCurrentRecommendedStage({
        ...input,
        assessments: [assessment('learning'), assessment('learning', 'normal', 'informal_recall')],
      })?.id,
    ).toBe(puppy);
  });
  it('zeigt nach verfügbaren übergangsbereiten/etablierten Stages nur einen Ausblick', () => {
    const result = service().getRoadmapForDog({
      ...input,
      profile,
      assessments: [assessment('stable')],
    });
    expect(result.currentStage).toBeUndefined();
    expect(result.nextStage?.title).toBe('Steadiness');
    expect(result.stages[1].status).toBe('established');
  });
  it('setzt den Fokus bei früherem Rückschritt nicht zurück', () => {
    const result = service().getRoadmapForDog({
      ...input,
      assessments: [assessment('learning'), assessment('learning', 'regressed', 'informal_recall')],
    });
    expect(result.currentStage?.id).toBe(heel);
    expect(result.stages[0].status).toBe('needs_attention');
    expect(result.attention[0].kind).toBe('regression');
  });
  it('verwendet früher stabile Assessments nur für Fokus-Kontinuität, nicht für aktuellen Status', () => {
    const result = service().getRoadmapForDog({
      ...input,
      profile,
      assessments: [
        assessment('stable', 'normal', 'heelwork', '2026-09-27T10:00:00Z'),
        assessment('learning', 'regressed'),
      ],
    });
    expect(result.currentStage).toBeUndefined();
    expect(result.nextStage?.title).toBe('Steadiness');
    expect(result.establishedStages).toEqual([]);
    expect(result.stableSkills).toEqual([]);
    expect(result.attention[0].kind).toBe('regression');
  });
  it.each(MITCHELL_MAIN_ROADMAP.stages)(
    'erlaubt Nutzerfokus auf $title ohne Kompetenzbehauptung',
    (stage) => {
      const result = service().getRoadmapForDog({
        ...input,
        profile: {
          ...profile,
          indicators: [],
          roadmapFocus: { roadmapId: MITCHELL_MAIN_ROADMAP.id, currentStageId: stage.id },
        },
      });
      expect(result.currentStage?.id).toBe(stage.id);
      expect(
        result.stages
          .find((s) => s.stage.id === stage.id)
          ?.findings.some((f) => f.kind === 'current_focus'),
      ).toBe(true);
      expect(result.stages.every((s) => s.status === 'not_started')).toBe(true);
      expect(result.establishedStages).toEqual([]);
    },
  );
  it('weist unbekannten Nutzerfokus zurück', () => {
    expect(() =>
      service().getRoadmapForDog({
        ...input,
        profile: {
          ...profile,
          roadmapFocus: {
            roadmapId: MITCHELL_MAIN_ROADMAP.id,
            currentStageId: roadmapStageId('missing'),
          },
        },
      }),
    ).toThrow('Unbekannte');
  });
  it('leitet aus beliebig vielen Ausführungen keine Completion ab und verändert keine Eingaben', () => {
    const data = {
      ...input,
      sessions: Array.from({ length: 20 }, (_, i) => ({
        ...session(),
        id: entityId<'TrainingSession'>(`s${i}`),
      })),
    };
    const before = structuredClone(data);
    const result = service().getRoadmapForDog(data);
    expect(result.stages[1].status).toBe('active');
    expect(result.stages[1].trainedExerciseIds).toEqual([HEELWORK_EXERCISES[0].id]);
    expect(result.establishedStages).toEqual([]);
    expect(data).toEqual(before);
    expect(JSON.stringify(result)).not.toMatch(/percent|percentage|score|completed|%/i);
  });
  it('schließt mehrfach zugeordnete geplante Kapitel nicht über gemeinsame Skills ab', () => {
    const result = service().getRoadmapForDog({
      ...input,
      assessments: [
        assessment('generalised', 'normal', 'outrun'),
        assessment('stable', 'normal', 'directions'),
      ],
    });
    for (const index of [5, 6, 15, 16]) {
      expect(result.stages[index].stage.contentStatus).toBe('planned');
      expect(result.stages[index].status).not.toBe('established');
      expect(result.stages[index].status).not.toBe('ready_to_progress');
    }
  });
  it('verwendet neueste gültige Einschätzungen und respektiert ungeklärte historische Bewertungen', () => {
    const stable = assessment('stable');
    const data = {
      ...input,
      assessments: [stable],
      assessmentIssues: [
        {
          status: 'reassessment_required' as const,
          id: stable.id,
          dogId: stable.dogId,
          systemId: stable.systemId,
          skillId: stable.skillId,
          assessedAt: stable.assessedAt,
          reason: 'Unklar',
        },
      ],
    };
    expect(service().getStageStatus(data, heel)).toBe('not_started');
    expect(
      service().getStageStatus(
        {
          ...input,
          assessments: [
            assessment('learning'),
            assessment('stable', 'normal', 'heelwork', '2026-09-27T10:00:00Z'),
          ],
        },
        heel,
      ),
    ).toBe('active');
  });
  it('vermischt weder Hunde noch Systeme und lehnt widersprüchliche Bewertungen ab', () => {
    expect(
      service().getStageStatus(
        {
          ...input,
          assessments: [{ ...assessment('stable'), dogId: 'other' as typeof DEMO_DOG.id }],
        },
        heel,
      ),
    ).toBe('not_started');
    expect(() =>
      service().getRoadmapForDog({
        ...input,
        assessments: [
          assessment('stable'),
          { ...assessment('learning'), id: entityId<'Assessment'>('other') },
        ],
      }),
    ).toThrow('Widersprüchliche');
  });
});
