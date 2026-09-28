import { DifficultyFactor } from '../exercises/difficulty';
import { HandlerSkillId, SkillId, TrainingProblemId, TrainingSystemId } from '../shared/identity';
import { TrainingSource } from '../sources/training-source';
export interface ProblemCause {
  readonly id: string;
  readonly description: string;
  /** dog_skill: konkrete trainierte Fähigkeit; dog: sonstige hundbezogene Faktoren
   * wie Motivation, Unsicherheit oder Aufmerksamkeit; training: bisheriger Aufbau,
   * Reihenfolge, Dosierung oder Gestaltung des Trainings. */
  readonly area:
    'dog_skill' | 'dog' | 'handler' | 'training' | 'environment' | 'equipment' | 'physical';
  readonly relatedSkills: readonly SkillId[];
  readonly handlerSkills: readonly HandlerSkillId[];
  readonly factors: readonly DifficultyFactor[];
  readonly source: TrainingSource;
}
export interface ProblemAdjustment {
  readonly id: string;
  readonly possibleCauseIds: readonly string[];
  readonly description: string;
  readonly source: TrainingSource;
}
export interface TrainingProblem {
  readonly id: TrainingProblemId;
  readonly systemId: TrainingSystemId;
  readonly title: string;
  readonly observedBehaviour: string;
  readonly relatedSkills: readonly SkillId[];
  readonly possibleCauses: readonly ProblemCause[];
  readonly adjustments: readonly ProblemAdjustment[];
  readonly source: TrainingSource;
}
