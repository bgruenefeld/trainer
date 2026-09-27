import { DogId } from '../dog/dog';
import { SessionId, TrainingSession } from './training';
export interface TrainingSessionRepository {
  findAll(): Promise<readonly TrainingSession[]>;
  findById(id: SessionId): Promise<TrainingSession | undefined>;
  findByDogId(dogId: DogId): Promise<readonly TrainingSession[]>;
  save(session: TrainingSession): Promise<void>;
}
