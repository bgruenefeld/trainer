import { DogId } from '../dog/dog';
import { ConstraintAssessment } from '../exercises/guidance';
import { GoalId, HandlerId, RoadmapId, SkillId, TrainingSystemId } from '../shared/identity';
import { IndicatorAssessment } from '../skills/readiness';
export type GoalType =
  'general_gundog' | 'shooting_companion' | 'working_test' | 'picking_up' | 'field_trial';
export interface LongTermGoal {
  readonly id: GoalId;
  readonly dogId: DogId;
  readonly handlerId: HandlerId;
  readonly systemId: TrainingSystemId;
  readonly aspiration: string;
  readonly type: GoalType;
  readonly description: string;
}
/** Bewusst gewählte Schwerpunkte, keine automatisch generierte Übungsreihenfolge. */
export interface SkillRoadmap {
  readonly id: RoadmapId;
  readonly dogId: DogId;
  readonly goalId: GoalId;
  readonly systemId: TrainingSystemId;
  readonly focusSkills: readonly SkillId[];
  readonly indicatorAssessments: readonly IndicatorAssessment[];
  readonly physicalAssessments: readonly ConstraintAssessment[];
  readonly notes: string;
}
