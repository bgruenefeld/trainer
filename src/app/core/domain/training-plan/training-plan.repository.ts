import { DogId } from '../dog/dog';
import { TrainingSystemId } from '../shared/identity';
import { LongTermGoal, SkillRoadmap } from './training-plan';
export interface TrainingPlanRepository {
  findGoals(dogId: DogId, systemId: TrainingSystemId): Promise<readonly LongTermGoal[]>;
  findRoadmaps(dogId: DogId, systemId: TrainingSystemId): Promise<readonly SkillRoadmap[]>;
  saveGoal(goal: LongTermGoal): Promise<void>;
  saveRoadmap(roadmap: SkillRoadmap): Promise<void>;
}
