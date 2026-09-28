import { DogId } from '../dog/dog';
import { TrainingSessionId, TrainingSystemId } from '../shared/identity';
import { TrainingSession } from './training-session';
export interface TrainingSessionRepository {
  findAll(): Promise<readonly TrainingSession[]>;
  findById(id: TrainingSessionId): Promise<TrainingSession | undefined>;
  findByDogId(dogId: DogId, systemId: TrainingSystemId): Promise<readonly TrainingSession[]>;
  save(session: TrainingSession): Promise<void>;
}
