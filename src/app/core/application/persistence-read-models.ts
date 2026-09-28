import { DogSkillAssessment } from '../domain/skills/skill-assessment';
import { SkillAssessmentRepository } from '../domain/skills/skill-assessment.repository';
import { TrainingSessionRepository } from '../domain/training-session/training-session.repository';
import { DogId } from '../domain/dog/dog';
import { TrainingSystemId } from '../domain/shared/identity';
export interface ReassessmentRequired {
  readonly status: 'reassessment_required';
  readonly id: DogSkillAssessment['id'];
  readonly dogId: DogSkillAssessment['dogId'];
  readonly systemId: DogSkillAssessment['systemId'];
  readonly skillId: DogSkillAssessment['skillId'];
  readonly assessedAt: string;
  readonly reason: string;
}
export interface AssessmentReadRepository extends SkillAssessmentRepository {
  findReassessmentRequired(): Promise<readonly ReassessmentRequired[]>;
}
export interface SessionCompatibilityIssue {
  readonly id: string;
  readonly dogId: DogId;
  readonly systemId: TrainingSystemId;
  readonly reason: string;
}
export interface SessionReadRepository extends TrainingSessionRepository {
  findCompatibilityIssues(): Promise<readonly SessionCompatibilityIssue[]>;
}
/** Ein neuerer unklarer Eintrag darf keinen früheren gültigen Stand wieder aktivieren. */
export function effectiveAssessments(
  assessments: readonly DogSkillAssessment[],
  issues: readonly ReassessmentRequired[],
): readonly DogSkillAssessment[] {
  return assessments.filter(
    (a) =>
      !issues.some(
        (i) =>
          i.dogId === a.dogId &&
          i.systemId === a.systemId &&
          i.skillId === a.skillId &&
          Date.parse(i.assessedAt) >= Date.parse(a.assessedAt),
      ),
  );
}
