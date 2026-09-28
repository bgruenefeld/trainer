import { SkillId, TrainingSystemId } from '../shared/identity';
import { TrainingSource } from '../sources/training-source';
export type RetrievePhase = 'preparation' | 'outbound' | 'acquisition' | 'inbound';
/** Phasen sind eine Ablaufgliederung, keine zusätzlichen Skills oder Bewertungen. */
export interface RetrieveComponentModel {
  readonly systemId: TrainingSystemId;
  readonly phases: readonly {
    readonly phase: RetrievePhase;
    readonly skills: readonly SkillId[];
  }[];
  readonly source: TrainingSource;
}
