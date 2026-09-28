import { describe, expect, it } from 'vitest';
import { createMitchellReadinessService } from './mitchell-readiness';
import { ReadinessProfile, SkillReadinessService } from './skill-readiness-service';
import {
  MITCHELL_DEPENDENCIES,
  MITCHELL_SKILLS,
  MITCHELL_SYSTEM_ID,
  PUPPY_HEELWORK_INDICATORS,
  mitchellSkillId as id,
} from '../../../data/mitchell/catalog';
import { DogId } from '../../domain/dog/dog';
import { DogSkillAssessment } from '../../domain/skills/skill-assessment';
import { SkillGraph } from '../../domain/skills/skill-graph';
import { SkillCompetence } from '../../domain/skills/skill';
import { entityId } from '../../domain/shared/identity';
const profile: ReadinessProfile = {
  dogId: 'reggae' as DogId,
  systemId: MITCHELL_SYSTEM_ID,
  skillAssessments: [],
  indicators: [],
  constraints: [],
};
function assessment(
  code: Parameters<typeof id>[0],
  competence: SkillCompetence,
  date = '2026-09-27T10:00:00Z',
): DogSkillAssessment {
  return {
    id: entityId<'Assessment'>(`${code}:${date}:${competence}`),
    dogId: profile.dogId,
    systemId: profile.systemId,
    skillId: id(code),
    competence,
    condition: 'normal',
    assessedAt: date,
    assessedBy: entityId<'Handler'>('local-handler'),
    context: 'Bekannte Bedingungen',
    rationale: 'Individuelle Beobachtung',
    observationIds: [],
  };
}
describe('Mitchell-Readiness', () => {
  it('erklärt fehlende Voraussetzungen für Directions und erfindet keine Statusschwelle', () => {
    const service = createMitchellReadinessService();
    const missing = service.assess(id('directions'), profile);
    expect(missing.status).toBe('needs_review');
    expect(missing.requirements).toHaveLength(3);
    expect(
      service.assess(id('directions'), {
        ...profile,
        skillAssessments: [assessment('stop', 'not_started')],
      }).status,
    ).toBe('not_ready');
    expect(
      service.assess(id('directions'), {
        ...profile,
        skillAssessments: [
          assessment('stop', 'stable'),
          assessment('recall', 'stable'),
          assessment('go_back', 'stable'),
        ],
      }).status,
    ).toBe('needs_review');
  });
  it('füllt alle sieben fehlenden Puppy→Heelwork-Indikatoren als offen auf', () => {
    const result = createMitchellReadinessService().assess(id('heelwork'), profile);
    expect(result.indicators).toHaveLength(7);
    expect(result.status).toBe('needs_review');
    expect(result.indicators.every((indicator) => indicator.result === 'unknown')).toBe(true);
  });
  it('wertet Puppy→Heelwork qualitativ und ohne Altersdaten aus', () => {
    const service = createMitchellReadinessService();
    const indicators = PUPPY_HEELWORK_INDICATORS.map((indicator) => ({
      indicatorId: indicator.id,
      result: 'met' as const,
      rationale: 'Bewusst beobachtet',
    }));
    expect(service.assess(id('heelwork'), { ...profile, indicators }).status).toBe('ready');
    expect(
      service.assess(id('heelwork'), { ...profile, indicators: indicators.slice(1) }).status,
    ).toBe('needs_review');
    expect(
      service.assess(id('heelwork'), {
        ...profile,
        indicators: indicators.map((indicator, i) =>
          i === 0 ? { ...indicator, result: 'not_met' } : indicator,
        ),
      }).status,
    ).toBe('needs_review');
  });
  it('aktiviert den zurückgestellten Jumping-Hinweis auch bei alter Einschränkung nicht', () => {
    const result = createMitchellReadinessService().assess(id('jumping'), {
      ...profile,
      constraints: [
        {
          constraintId: 'mitchell:jumping:skeletal-maturity',
          status: 'restricted',
          assessedAt: '2026-09-27T10:00:00Z',
          rationale: 'Historischer Eintrag',
        },
      ],
    });
    expect(result.status).toBe('ready');
    expect(result.physicalConstraints).toEqual([]);
  });
  it('berücksichtigt das neueste Assessment einschließlich Regression unabhängig von Eingabereihenfolge', () => {
    // Ausschließlich synthetische Testschwelle; nicht Bestandteil des Mitchell-Katalogs.
    const edges = MITCHELL_DEPENDENCIES.map((edge) => ({
      ...edge,
      requirement: { ...edge.requirement, acceptedCompetences: ['stable'] as const },
    }));
    const service = new SkillReadinessService(
      new SkillGraph(MITCHELL_SYSTEM_ID, MITCHELL_SKILLS, edges),
      [],
    );
    const stable = assessment('directions', 'stable');
    const regressed = assessment('directions', 'learning', '2026-09-28T10:00:00Z');
    expect(
      service.assess(id('blind_handling'), { ...profile, skillAssessments: [stable] }).status,
    ).toBe('ready');
    expect(
      service.assess(id('blind_handling'), { ...profile, skillAssessments: [regressed, stable] })
        .status,
    ).toBe('not_ready');
  });
  it('verhindert vermischte Hunde, Systeme und widersprüchliche zeitgleiche Assessments', () => {
    const service = createMitchellReadinessService();
    expect(() =>
      service.assess(id('directions'), {
        ...profile,
        skillAssessments: [{ ...assessment('stop', 'stable'), dogId: 'other' as DogId }],
      }),
    ).toThrow('vermischt');
    expect(() =>
      service.assess(id('directions'), {
        ...profile,
        systemId: entityId<'TrainingSystem'>('other'),
      }),
    ).toThrow('System');
    expect(() =>
      service.assess(id('directions'), {
        ...profile,
        skillAssessments: [assessment('stop', 'stable'), assessment('stop', 'learning')],
      }),
    ).toThrow('Widersprüchliche');
  });
  it('weist doppelte individuelle Indikatorbewertungen zurück', () => {
    const indicator = {
      indicatorId: PUPPY_HEELWORK_INDICATORS[0].id,
      result: 'met' as const,
      rationale: 'Test',
    };
    expect(() =>
      createMitchellReadinessService().assess(id('heelwork'), {
        ...profile,
        indicators: [indicator, indicator],
      }),
    ).toThrow('Doppelte');
  });
});
