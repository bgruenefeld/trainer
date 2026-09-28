import {
  CriterionId,
  ExerciseId,
  HandlerSkillId,
  SkillId,
  TrainingProblemId,
  TrainingSystemId,
} from '../shared/identity';
import { TrainingSource } from '../sources/training-source';
import { SkillRequirement } from '../skills/skill';
import { DifficultyChange, DifficultyFactor, DifficultySetting } from './difficulty';
import { PhysicalConstraint, TrainingGuidance } from './guidance';
export type ExercisePurpose =
  'teaching' | 'proofing' | 'generalisation' | 'maintenance' | 'diagnostic' | 'confidence_building';
export type TrainingEffect = 'drive_building' | 'control_building' | 'mixed' | 'neutral';
export type WorkingMode = 'handler_controlled' | 'dog_independent' | 'mixed';
export interface ExerciseEnvironment {
  readonly contexts: readonly string[];
  readonly description: string;
}
export interface ExerciseSetup {
  readonly instructions: readonly string[];
  readonly equipment: readonly string[];
  /** Qualitative Buchvorgaben bleiben Text; keine erfundenen numerischen Startwerte. */
  readonly conditions: readonly string[];
}
export interface TrainingStep {
  readonly id: string;
  readonly instruction: string;
  readonly handlerBehaviour: readonly string[];
  readonly relatedHandlerSkills: readonly HandlerSkillId[];
}
export interface SuccessCriterion {
  readonly id: CriterionId;
  readonly description: string;
  readonly relatedSkills: readonly SkillId[];
}
export interface ExerciseAdjustment {
  readonly id: string;
  readonly description: string;
  readonly changes: readonly DifficultyChange[];
  readonly source: TrainingSource;
}
export interface ExerciseContentGap {
  readonly field:
    'setup' | 'steps' | 'handlerSkills' | 'successCriteria' | 'progression' | 'regression';
  readonly reason: string;
  readonly source: TrainingSource;
}
export interface TrainingExercise {
  readonly id: ExerciseId;
  readonly systemId: TrainingSystemId;
  readonly version: string;
  readonly contentGaps?: readonly ExerciseContentGap[];
  readonly title: string;
  readonly primarySkill: SkillId;
  readonly secondarySkills: readonly SkillId[];
  readonly objective: string;
  readonly prerequisites: readonly SkillRequirement[];
  /** Methodische Übungsprogression; keine Sperre, Readiness oder Completion-Anforderung. */
  readonly prerequisiteExerciseIds?: readonly ExerciseId[];
  readonly handlerSkills: readonly HandlerSkillId[];
  readonly purpose: readonly ExercisePurpose[];
  readonly trainingEffect: TrainingEffect;
  readonly workingMode: WorkingMode;
  readonly environment?: ExerciseEnvironment;
  readonly difficultyFactors: readonly DifficultyFactor[];
  readonly optimalTriggers: readonly string[];
  readonly setup: ExerciseSetup;
  readonly steps: readonly TrainingStep[];
  readonly expectedBehaviour: readonly string[];
  readonly successCriteria: readonly SuccessCriterion[];
  readonly progression: readonly ExerciseAdjustment[];
  readonly regression: readonly ExerciseAdjustment[];
  readonly commonProblems: readonly TrainingProblemId[];
  readonly cautions: readonly string[];
  readonly physicalConstraints: readonly PhysicalConstraint[];
  readonly guidance?: TrainingGuidance;
  readonly source: TrainingSource;
}
export interface ExecutionSetup {
  readonly factors: readonly DifficultySetting[];
  readonly environmentNotes: string;
  readonly handlerPositionNotes: string;
}
export interface TrainingModule {
  readonly id: string;
  readonly systemId: TrainingSystemId;
  readonly title: string;
  readonly objective: string;
  readonly exercises: readonly ExerciseId[];
  readonly source: TrainingSource;
}
