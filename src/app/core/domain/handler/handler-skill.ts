import { HandlerId, HandlerSkillId, ObservationId, TrainingSystemId } from '../shared/identity';
import { TrainingSource } from '../sources/training-source';
import { SkillCompetence, SkillCondition } from '../skills/skill';
export type HandlerSkillCode =
  | 'timing'
  | 'body_language'
  | 'positioning'
  | 'observation'
  | 'consistency'
  | 'cue_clarity'
  | 'pressure_control'
  | 'training_planning'
  | 'difficulty_management'
  | 'emotional_self_control'
  | 'active_handling';
export interface HandlerSkillDefinition {
  readonly id: HandlerSkillId;
  readonly systemId: TrainingSystemId;
  readonly code: HandlerSkillCode;
  readonly name: string;
  readonly purpose: string;
  readonly source: TrainingSource;
}
export interface HandlerSkillAssessment {
  readonly handlerId: HandlerId;
  readonly skillId: HandlerSkillId;
  readonly competence: SkillCompetence;
  readonly condition: SkillCondition;
  readonly assessedAt: string;
  readonly context: string;
  readonly rationale: string;
  readonly observationIds: readonly ObservationId[];
}
