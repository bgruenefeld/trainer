import { DogId } from '../dog/dog';
import {
  ExerciseId,
  RoadmapId,
  RoadmapStageId,
  SkillId,
  TrainingSystemId,
} from '../shared/identity';
import { SourcedStatement, TrainingSource } from '../sources/training-source';
/** Didaktisches Methodenwissen, unabhängig vom SkillGraph und individuellen Plänen. */
export interface TrainingRoadmap {
  readonly id: RoadmapId;
  readonly title: string;
  readonly systemId: TrainingSystemId;
  readonly stages: readonly RoadmapStage[];
  readonly source: TrainingSource;
}
export interface RoadmapStage {
  readonly id: RoadmapStageId;
  readonly title: string;
  readonly skillIds: readonly SkillId[];
  readonly exerciseIds: readonly ExerciseId[];
  readonly prerequisiteStageIds?: readonly RoadmapStageId[];
  readonly contentStatus: 'available' | 'planned';
  readonly readinessGuidance?: readonly SourcedStatement[];
  readonly completionGuidance?: readonly SourcedStatement[];
  readonly source: TrainingSource;
}
/** Projektion des Profils, keine zweite Persistenz und keine Methodenquelle. */
export interface DogRoadmapProgress {
  readonly dogId: DogId;
  readonly roadmapId: RoadmapId;
  readonly currentStageId?: RoadmapStageId;
  readonly focusedSkillIds: readonly SkillId[];
}
/** Darstellung, keine SkillCompetence und keine gespeicherte Completion. */
export type RoadmapStageStatus =
  'not_started' | 'active' | 'ready_to_progress' | 'established' | 'needs_attention';
export type RoadmapFinding =
  'not_yet_relevant' | 'current_focus' | 'needs_attention' | 'maintenance_due' | 'regression';
export interface RoadmapFindingDetail {
  readonly kind: RoadmapFinding;
  readonly stageId: RoadmapStageId;
  readonly skillId?: SkillId;
  readonly explanation: string;
}
