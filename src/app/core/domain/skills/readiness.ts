import { SkillId } from '../shared/identity';
import { TrainingSource } from '../sources/training-source';
import { ConstraintAssessment } from '../exercises/guidance';
import { SkillRequirement, SkillAssessmentValue } from './skill';
export interface QualitativeReadinessIndicator {
  readonly id: string;
  readonly description: string;
  readonly relatedSkills: readonly SkillId[];
  readonly source: TrainingSource;
}
export interface IndicatorAssessment {
  readonly indicatorId: string;
  readonly result: 'met' | 'not_met' | 'unknown';
  readonly rationale: string;
}
export interface RequirementReview {
  readonly requirement: SkillRequirement;
  readonly competence?: SkillAssessmentValue['competence'];
  readonly condition?: SkillAssessmentValue['condition'];
  readonly result: 'met' | 'not_met' | 'unknown';
}
export interface ReadinessResult {
  readonly status: 'ready' | 'not_ready' | 'needs_review';
  readonly requirements: readonly RequirementReview[];
  readonly indicators: readonly IndicatorAssessment[];
  readonly physicalConstraints: readonly ConstraintAssessment[];
}
/** Prüft explizite Daten; Alter, Übungsanzahl und automatische Scores sind keine Eingaben.
 * Aufrufender Service liefert Zustände genau eines Hundes und Systems sowie alle relevanten Prüfungen.
 */
export function evaluateReadiness(
  requirements: readonly SkillRequirement[],
  states: ReadonlyMap<SkillId, SkillAssessmentValue>,
  indicators: readonly IndicatorAssessment[],
  physicalConstraints: readonly ConstraintAssessment[],
): ReadinessResult {
  const reviews: readonly RequirementReview[] = requirements.map((requirement) => {
    const assessment = states.get(requirement.skillId);
    const competence = assessment?.competence;
    const result =
      competence === undefined
        ? 'unknown'
        : requirement.acceptedCompetences?.length
          ? requirement.acceptedCompetences.includes(competence)
            ? 'met'
            : 'not_met'
          : competence === 'not_started'
            ? 'not_met'
            : 'unknown';
    return { requirement, competence, condition: assessment?.condition, result };
  });
  const hard = reviews.filter((review) => review.requirement.type === 'hard');
  const blocked =
    hard.some((review) => review.result === 'not_met') ||
    physicalConstraints.some((constraint) => constraint.status === 'restricted');
  const unknown =
    hard.some((review) => review.result === 'unknown') ||
    indicators.some((indicator) => indicator.result !== 'met') ||
    physicalConstraints.some((constraint) => constraint.status === 'unknown');
  return {
    status: blocked ? 'not_ready' : unknown ? 'needs_review' : 'ready',
    requirements: reviews,
    indicators,
    physicalConstraints,
  };
}
