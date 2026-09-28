import { DogId } from '../dog/dog';
import { SkillId, TrainingSystemId } from '../shared/identity';
import { DogSkillAssessment } from './skill-assessment';
export interface SkillAssessmentRepository {
  findAll(): Promise<readonly DogSkillAssessment[]>;
  findHistory(
    dogId: DogId,
    systemId: TrainingSystemId,
    skillId: SkillId,
  ): Promise<readonly DogSkillAssessment[]>;
  /** Neue Assessments ergänzen den Verlauf; bestehende Einträge werden nicht überschrieben. */
  append(assessment: DogSkillAssessment): Promise<void>;
}
