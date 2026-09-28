import { DogId } from '../../domain/dog/dog';
import { ConstraintAssessment, PhysicalConstraint } from '../../domain/exercises/guidance';
import { SkillId, TrainingSystemId } from '../../domain/shared/identity';
import { DogSkillAssessment, validateSkillAssessment } from '../../domain/skills/skill-assessment';
import { SkillGraph } from '../../domain/skills/skill-graph';
import {
  IndicatorAssessment,
  QualitativeReadinessIndicator,
  ReadinessResult,
  evaluateReadiness,
} from '../../domain/skills/readiness';
import { SkillAssessmentValue } from '../../domain/skills/skill';
export interface SkillReadinessPolicy {
  readonly skillId: SkillId;
  readonly indicators: readonly QualitativeReadinessIndicator[];
  readonly constraints: readonly PhysicalConstraint[];
}
/** Individueller Prüfstand: Aufrufende Fassade lädt diesen für genau einen Hund und ein System. */
export interface ReadinessProfile {
  readonly dogId: DogId;
  readonly systemId: TrainingSystemId;
  readonly skillAssessments: readonly DogSkillAssessment[];
  readonly indicators: readonly IndicatorAssessment[];
  readonly constraints: readonly ConstraintAssessment[];
}
export class SkillReadinessService {
  private readonly policies: readonly SkillReadinessPolicy[];
  constructor(
    private readonly graph: SkillGraph,
    policies: readonly SkillReadinessPolicy[],
  ) {
    this.policies = structuredClone(policies);
    this.unique(policies.map((policy) => policy.skillId));
    for (const policy of this.policies) {
      graph.getSkill(policy.skillId);
      this.unique(policy.indicators.map((indicator) => indicator.id));
      this.unique(policy.constraints.map((constraint) => constraint.id));
      for (const entry of [...policy.indicators, ...policy.constraints]) {
        if (entry.source.systemId !== graph.systemId)
          throw new Error('Readiness-Quelle gehört zu einem anderen System.');
      }
      for (const indicator of policy.indicators)
        for (const skillId of indicator.relatedSkills) graph.getSkill(skillId);
      for (const constraint of policy.constraints) {
        if (!constraint.affectedSkills.includes(policy.skillId))
          throw new Error('Körperliche Prüfung passt nicht zum Zielskill.');
        for (const skillId of constraint.affectedSkills) graph.getSkill(skillId);
      }
    }
  }
  assess(skillId: SkillId, profile: ReadinessProfile): ReadinessResult {
    this.graph.getSkill(skillId);
    if (profile.systemId !== this.graph.systemId)
      throw new Error('Prüfstand gehört zu einem anderen System.');
    this.unique(profile.skillAssessments.map((assessment) => assessment.id));
    this.unique(profile.indicators.map((indicator) => indicator.indicatorId));
    this.unique(profile.constraints.map((constraint) => constraint.constraintId));
    const latest = new Map<SkillId, DogSkillAssessment>();
    for (const assessment of profile.skillAssessments) {
      validateSkillAssessment(assessment);
      if (assessment.dogId !== profile.dogId || assessment.systemId !== profile.systemId)
        throw new Error(
          'Assessments verschiedener Hunde oder Systeme dürfen nicht vermischt werden.',
        );
      this.graph.getSkill(assessment.skillId);
      const previous = latest.get(assessment.skillId);
      if (
        previous &&
        Date.parse(previous.assessedAt) === Date.parse(assessment.assessedAt) &&
        (previous.competence !== assessment.competence ||
          previous.condition !== assessment.condition)
      )
        throw new Error('Widersprüchliche Assessments zum selben Zeitpunkt benötigen Klärung.');
      if (!previous || Date.parse(previous.assessedAt) < Date.parse(assessment.assessedAt))
        latest.set(assessment.skillId, assessment);
    }
    const states = new Map<SkillId, SkillAssessmentValue>(
      [...latest].map(([id, assessment]) => [id, assessment]),
    );
    const policy = this.policies.find((item) => item.skillId === skillId);
    const indicators: readonly IndicatorAssessment[] = (policy?.indicators ?? []).map(
      (indicator) =>
        profile.indicators.find((item) => item.indicatorId === indicator.id) ?? {
          indicatorId: indicator.id,
          result: 'unknown',
          rationale: 'Noch nicht individuell beurteilt.',
        },
    );
    const constraints: readonly ConstraintAssessment[] = (policy?.constraints ?? []).map(
      (constraint) =>
        profile.constraints.find((item) => item.constraintId === constraint.id) ?? {
          constraintId: constraint.id,
          status: 'unknown',
          rationale: 'Noch nicht individuell beurteilt.',
        },
    );
    return evaluateReadiness(
      this.graph.prerequisites(skillId).map((edge) => edge.requirement),
      states,
      indicators,
      constraints,
    );
  }
  private unique(ids: readonly string[]): void {
    if (new Set(ids).size !== ids.length)
      throw new Error('Doppelte IDs im Prüfstand oder in der Readiness-Konfiguration.');
  }
}
