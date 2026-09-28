import { SkillId, TrainingSystemId } from '../shared/identity';
import { TrainingSource } from '../sources/training-source';
export type SkillCategory =
  | 'FOUNDATION'
  | 'CONTROL'
  | 'RETRIEVE_COMPONENTS'
  | 'HANDLING'
  | 'INDEPENDENT_WORK'
  | 'ENVIRONMENT'
  | 'ADVANCED';
export const SKILL_COMPETENCES = [
  'not_started',
  'introduced',
  'learning',
  'stable',
  'generalised',
] as const;
export type SkillCompetence = (typeof SKILL_COMPETENCES)[number];
export const SKILL_CONDITIONS = ['normal', 'maintenance', 'regressed'] as const;
export type SkillCondition = (typeof SKILL_CONDITIONS)[number];
export interface SkillAssessmentValue {
  readonly competence: SkillCompetence;
  readonly condition: SkillCondition;
}
export interface SkillDefinition {
  readonly id: SkillId;
  readonly systemId: TrainingSystemId;
  readonly code: string;
  readonly name: string;
  readonly purpose: string;
  readonly category: SkillCategory;
  /** Gruppierung ist keine Voraussetzung und überträgt keinen Status. */
  readonly subskills: readonly SkillId[];
  readonly source: TrainingSource;
}
export type DependencyType = 'hard' | 'soft' | 'maintenance';
export interface SkillRequirement {
  readonly skillId: SkillId;
  readonly type: DependencyType;
  /** Explizite Menge statt ordinalem Mindestlevel; ohne Menge ist Review erforderlich. */
  readonly acceptedCompetences?: readonly SkillCompetence[];
  readonly rationale: string;
  readonly source: TrainingSource;
}
/** Richtung: requirement.skillId → targetSkillId. */
export interface SkillDependency {
  readonly id: string;
  readonly targetSkillId: SkillId;
  readonly requirement: SkillRequirement;
}
