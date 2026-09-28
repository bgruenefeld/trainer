import { TrainingEffect } from '../../../core/domain/exercises/training-exercise';
import { MitchellSkillCode } from './skills';
export const MITCHELL_TRAINING_EFFECTS: Readonly<
  Partial<Record<MitchellSkillCode, TrainingEffect>>
> = {
  retrieve_desire: 'drive_building',
  outrun: 'drive_building',
  marking: 'drive_building',
  hunting: 'drive_building',
  heelwork: 'control_building',
  steadiness: 'control_building',
  sit_stay: 'control_building',
  stop: 'control_building',
  stop_whistle: 'control_building',
  recall: 'mixed',
  informal_recall: 'mixed',
  setup: 'mixed',
  delivery: 'mixed',
  return_to_heel: 'mixed',
  directions: 'mixed',
};
