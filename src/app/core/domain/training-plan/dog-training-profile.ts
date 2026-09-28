import { DogId } from '../dog/dog';
import { RoadmapId, RoadmapStageId, SkillId, TrainingSystemId } from '../shared/identity';
import { IndicatorAssessment } from '../skills/readiness';
import { ConstraintAssessment } from '../exercises/guidance';
/** Individuelle Auswahl ohne automatisch unterstelltes langfristiges Trainingsziel. */
export interface DogTrainingProfile {
  readonly id: string;
  readonly dogId: DogId;
  readonly systemId: TrainingSystemId;
  /** Bewusster Nutzerfokus; keine Kompetenz- oder Abschlussbehauptung. */
  readonly roadmapFocus?: {
    readonly roadmapId: RoadmapId;
    readonly currentStageId?: RoadmapStageId;
  };
  readonly focusSkills: readonly SkillId[];
  readonly indicators: readonly IndicatorAssessment[];
  readonly constraints: readonly ConstraintAssessment[];
}
export interface DogTrainingProfileRepository {
  findAll(): Promise<readonly DogTrainingProfile[]>;
  save(profile: DogTrainingProfile): Promise<void>;
}
