import { SkillId } from '../skill/skill';
import { TrainingMethod, TrainingSetup } from '../training/training';
/** Wiederverwendbare Übungsvorlage; ein TrainingRun dokumentiert die Ausführung. */
export interface Exercise {
  readonly id: string;
  readonly name: string;
  readonly skillId: SkillId;
  readonly method: TrainingMethod;
  readonly suggestedSetup: TrainingSetup;
}
