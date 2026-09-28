import { describe, expect, it } from 'vitest';
import { requireTimestamp } from './shared/identity';
import {
  changeSkillAssessment,
  entityId,
  evaluateReadiness,
  reviewDifficultyChanges,
  validateDifficultySettings,
  validateGuidance,
  validateSource,
  validateTrainingSession,
  validateSkillAssessment,
  type DogSkillAssessment,
  type SkillRequirement,
  type SkillCompetence,
  type TrainingSession,
  type TrainingSource,
} from './index';
import { DogId } from './dog/dog';
// Synthetische Daten für Softwareverhalten; keine Mitchell-Regeln oder Buchbelege.
const systemId = entityId<'TrainingSystem'>('test-system');
const skillId = entityId<'Skill'>('test-system:prerequisite');
const source: TrainingSource = {
  systemId,
  author: 'Test author',
  title: 'Test source',
  method: 'Test',
  evidence: { kind: 'provided_summary', reference: 'Synthetic test fixture' },
};
const assessment: DogSkillAssessment = {
  id: entityId<'Assessment'>('a1'),
  dogId: 'dog-1' as DogId,
  systemId,
  skillId,
  competence: 'learning',
  condition: 'normal',
  assessedAt: '2026-09-27T10:00:00Z',
  assessedBy: entityId<'Handler'>('handler-1'),
  context: 'Bekanntes Gelände',
  rationale: 'Beobachtung des Handlers',
  observationIds: [],
};
function requirement(type: SkillRequirement['type'] = 'hard'): SkillRequirement {
  return {
    skillId,
    type,
    acceptedCompetences: ['stable', 'generalised'],
    rationale: 'Explizite Testanforderung',
    source,
  };
}
function readiness(competence: SkillCompetence, type: SkillRequirement['type'] = 'hard') {
  return evaluateReadiness(
    [requirement(type)],
    new Map([[skillId, { competence, condition: 'normal' }]]),
    [],
    [],
  );
}
describe('Qualitative Skill-Beurteilungen', () => {
  it('weist Bedingungen als Kompetenz und fehlende Bedingungen zurück', () => {
    for (const competence of ['maintenance', 'regressed']) {
      expect(() =>
        validateSkillAssessment({ ...assessment, competence } as DogSkillAssessment),
      ).toThrow('Kompetenz');
    }
    expect(() =>
      validateSkillAssessment({
        ...assessment,
        condition: undefined,
      } as unknown as DogSkillAssessment),
    ).toThrow('Bedingung');
  });
  it('dokumentiert Entwicklung ohne das bisherige Assessment zu verändern', () => {
    const previous = Object.freeze({ ...assessment });
    const current = {
      ...assessment,
      id: entityId<'Assessment'>('a2'),
      competence: 'stable' as const,
    };
    const change = changeSkillAssessment(previous, current);
    expect(change.previous.competence).toBe('learning');
    expect(change.current.competence).toBe('stable');
    expect(previous.competence).toBe('learning');
  });
  it.each(['maintenance', 'regressed'] as const)(
    'dokumentiert %s getrennt von Kompetenz',
    (condition) => {
      const current = {
        ...assessment,
        id: entityId<'Assessment'>('a2'),
        competence: 'generalised' as const,
        condition,
      };
      expect(changeSkillAssessment(assessment, current).current).toMatchObject({
        competence: 'generalised',
        condition,
      });
    },
  );
  it('verhindert vermischte Hunde, Skills und Systeme', () => {
    const current = { ...assessment, id: entityId<'Assessment'>('a2') };
    for (const patch of [
      { dogId: 'other' as DogId },
      { skillId: entityId<'Skill'>('other') },
      { systemId: entityId<'TrainingSystem'>('other') },
    ]) {
      expect(() => changeSkillAssessment(assessment, { ...current, ...patch })).toThrow(
        'denselben',
      );
    }
  });
  it('verlangt neue Identität, Kontext, Begründung und nachvollziehbare Zeitfolge', () => {
    expect(() => changeSkillAssessment(assessment, assessment)).toThrow('neue');
    const current = { ...assessment, id: entityId<'Assessment'>('a2') };
    expect(() => changeSkillAssessment(assessment, { ...current, rationale: ' ' })).toThrow(
      'Begründung',
    );
    expect(() => changeSkillAssessment(assessment, { ...current, context: '' })).toThrow(
      /kontext/i,
    );
    expect(() =>
      changeSkillAssessment(assessment, { ...current, assessedAt: '2020-01-01T00:00:00Z' }),
    ).toThrow('vor');
  });
});
describe('Explizite Readiness-Anforderungen', () => {
  it('blockiert bei nicht erfüllten harten Voraussetzungen', () => {
    expect(readiness('introduced').status).toBe('not_ready');
    expect(readiness('stable').status).toBe('ready');
    expect(readiness('generalised').status).toBe('ready');
    expect(readiness('learning').status).toBe('not_ready');
  });
  it('erfindet keine Schwelle und behandelt fehlende Assessments als offen', () => {
    expect(evaluateReadiness([requirement()], new Map(), [], []).status).toBe('needs_review');
    expect(
      evaluateReadiness(
        [{ ...requirement(), acceptedCompetences: undefined }],
        new Map([[skillId, { competence: 'stable', condition: 'normal' }]]),
        [],
        [],
      ).status,
    ).toBe('needs_review');
  });
  it.each(['maintenance', 'regressed'] as const)(
    'blockiert Kompetenz nicht allein wegen %s',
    (condition) => {
      const result = evaluateReadiness(
        [requirement()],
        new Map([[skillId, { competence: 'generalised', condition }]]),
        [],
        [],
      );
      expect(result.status).toBe('ready');
      expect(result.requirements[0].condition).toBe(condition);
    },
  );
  it.each(['soft', 'maintenance'] as const)('blockiert nicht durch %s-Beziehungen', (type) => {
    const result = readiness('learning', type);
    expect(result.status).toBe('ready');
    expect(result.requirements[0].result).toBe('not_met');
  });
  it('behandelt qualitative Indikatoren als Review statt als erfundene harte Regel', () => {
    const result = evaluateReadiness(
      [],
      new Map(),
      [{ indicatorId: 'lead-acceptance', result: 'not_met', rationale: 'Noch zu beobachten' }],
      [],
    );
    expect(result.status).toBe('needs_review');
  });
  it('unterscheidet körperliche Einschränkungen von fehlender Prüfung', () => {
    const constraint = {
      constraintId: 'physical',
      status: 'restricted' as const,
      assessedAt: '2026-09-27T10:00:00Z',
      rationale: 'Individuell festgestellt',
    };
    expect(evaluateReadiness([], new Map(), [], [constraint]).status).toBe('not_ready');
    expect(
      evaluateReadiness([], new Map(), [], [{ ...constraint, status: 'unknown' }]).status,
    ).toBe('needs_review');
  });
  it('nutzt Alters-Guidance nicht als Voraussetzung', () => {
    const before = readiness('stable');
    validateGuidance({
      recommendedAge: { minMonths: 100 },
      notes: ['Synthetischer Testwert'],
      source,
    });
    expect(readiness('stable')).toEqual(before);
  });
});
describe('Unabhängige Schwierigkeitsfaktoren', () => {
  it('erkennt mehrere ausdrücklich beurteilte Erhöhungen ohne Score', () => {
    const result = reviewDifficultyChanges([
      { factor: 'distance', direction: 'increase', rationale: 'Kontextbewertung' },
      { factor: 'cover', direction: 'increase', rationale: 'Kontextbewertung' },
    ]);
    expect(result).toEqual({ increasedFactors: ['distance', 'cover'], multipleIncreases: true });
  });
  it('interpretiert unbekannte Geländeänderungen nicht automatisch als Erschwerung', () => {
    expect(
      reviewDifficultyChanges([
        { factor: 'terrain', direction: 'changed_unknown', rationale: 'Anderer Ort' },
      ]).multipleIncreases,
    ).toBe(false);
  });
  it('verhindert doppelte Faktoren, ungültige Messwerte und gebrochene Anzahlen', () => {
    expect(() =>
      validateDifficultySettings([{ factor: 'distance', value: NaN, unit: 'm' }]),
    ).toThrow();
    expect(() =>
      validateDifficultySettings([{ factor: 'number_of_retrieves', value: 1.5, unit: 'count' }]),
    ).toThrow();
    expect(() =>
      validateDifficultySettings([
        { factor: 'distance', value: 1, unit: 'm' },
        { factor: 'distance', value: 2, unit: 'm' },
      ]),
    ).toThrow('doppelte');
    expect(() =>
      reviewDifficultyChanges([
        { factor: 'cover', direction: 'increase', rationale: '' },
        { factor: 'cover', direction: 'decrease', rationale: '' },
      ]),
    ).toThrow('einmal');
  });
});
const session: TrainingSession = {
  schemaVersion: 3,
  id: entityId<'TrainingSession'>('session-1'),
  dogId: assessment.dogId,
  handlerId: assessment.assessedBy,
  systemId,
  startedAt: assessment.assessedAt,
  reflection: 'Beobachtungen statt Diagnose',
  executions: [
    {
      id: 'execution-1',
      exerciseSnapshot: {
        exerciseId: entityId<'Exercise'>('exercise-1'),
        systemId,
        version: '1',
        title: 'Testübung',
        primarySkill: skillId,
        secondarySkills: [],
        handlerSkills: [],
        trainingEffect: 'mixed',
        successCriteria: [],
        source,
      },
      setup: { factors: [], environmentNotes: '', handlerPositionNotes: '' },
      criteria: [],
      notes: '',
      observations: [
        {
          id: entityId<'Observation'>('observation-1'),
          target: { kind: 'environment' },
          description: 'Verändertes Gelände',
          recordedAt: assessment.assessedAt,
          recordedBy: assessment.assessedBy,
          possibleProblems: [],
        },
      ],
    },
  ],
};
describe('Training, Quellen und Beobachtungen', () => {
  it('erlaubt unbewertete Ausführungen ohne erfundene Dauer oder Distanz', () => {
    expect(() => validateTrainingSession(session)).not.toThrow();
    expect(session.executions[0].criteria).toEqual([]);
  });
  it('bewahrt Beobachtungen ohne automatische Skill-Bewertung', () => {
    validateTrainingSession(session);
    expect(session.executions[0].observations[0].target.kind).toBe('environment');
    expect('state' in session.executions[0]).toBe(false);
  });
  it('verhindert Quellen anderer Systeme und doppelte Beobachtungs-IDs', () => {
    expect(() =>
      validateTrainingSession({ ...session, systemId: entityId<'TrainingSystem'>('other') }),
    ).toThrow('System');
    expect(() =>
      validateTrainingSession({
        ...session,
        executions: [session.executions[0], { ...session.executions[0], id: 'execution-2' }],
      }),
    ).toThrow('Beobachtungs');
  });
  it('verhindert leere Sessions und ungültige Dauern', () => {
    expect(() => validateTrainingSession({ ...session, executions: [] })).toThrow();
    expect(() => validateTrainingSession({ ...session, durationMinutes: -1 })).toThrow();
  });
  it('unterscheidet Zusammenfassung von verifizierter Buchstelle', () => {
    expect(() => validateSource(source)).not.toThrow();
    expect(() =>
      validateSource({
        ...source,
        evidence: { kind: 'book_verified', locator: '', edition: 'Test' },
      }),
    ).toThrow('Buchstelle');
  });
  it('verhindert widersprüchliche Guidance und leere IDs', () => {
    expect(() =>
      validateGuidance({ recommendedAge: { minMonths: 10, maxMonths: 2 }, notes: [], source }),
    ).toThrow('Zeitraum');
    expect(() => entityId<'Skill'>('  ')).toThrow();
  });
});

describe('Zeitliche Nachvollziehbarkeit', () => {
  it('verhindert normalisierte Scheindaten und Zeiten ohne Zeitzone', () => {
    expect(() => requireTimestamp('2026-02-30T10:00:00Z')).toThrow();
    expect(() => requireTimestamp('2026-09-27T10:00:00')).toThrow();
    expect(() => requireTimestamp('2026-09-27T24:00:00Z')).toThrow();
    expect(() => requireTimestamp('2024-02-29T10:00:00+02:00')).not.toThrow();
  });
});
