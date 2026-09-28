import { SkillId } from '../shared/identity';
import { TrainingSource, validateSource } from '../sources/training-source';
export interface TrainingGuidance {
  readonly recommendedAge?: {
    readonly minMonths?: number;
    readonly maxMonths?: number;
    readonly text?: string;
  };
  readonly initialTrainingDuration?: string;
  readonly distanceGuidance?: string;
  readonly notes: readonly string[];
  readonly source: TrainingSource;
}
export type PhysicalConstraintType =
  'skeletal_maturity' | 'fitness' | 'injury' | 'environment' | 'season';
export interface PhysicalConstraint {
  readonly id: string;
  readonly type: PhysicalConstraintType;
  readonly description: string;
  readonly affectedSkills: readonly SkillId[];
  readonly source: TrainingSource;
}
export type ConstraintAssessment = {
  readonly constraintId: string;
  readonly rationale: string;
} & (
  | { readonly status: 'clear' | 'restricted'; readonly assessedAt: string }
  | { readonly status: 'unknown'; readonly assessedAt?: string }
);
export function validateGuidance(guidance: TrainingGuidance): void {
  validateSource(guidance.source);
  const age = guidance.recommendedAge;
  for (const value of [age?.minMonths, age?.maxMonths]) {
    if (value !== undefined && (!Number.isFinite(value) || value < 0))
      throw new Error('Alters-Guidance muss nicht negativ und endlich sein.');
  }
  if (age?.minMonths !== undefined && age.maxMonths !== undefined && age.minMonths > age.maxMonths)
    throw new Error('Ungültiger Guidance-Zeitraum.');
  // Guidance wird ausschließlich beschrieben, niemals als Freischaltbedingung ausgewertet.
}
