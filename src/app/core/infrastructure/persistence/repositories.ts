import { Dog, DogId, validateDog } from '../../domain/dog/dog';
import { DogRepository } from '../../domain/dog/dog.repository';
import { SessionId, TrainingSession, validateSession } from '../../domain/training/training';
import { TrainingSessionRepository } from '../../domain/training/training-session.repository';
import { TrainerDatabase } from './indexed-db';
export class IndexedDbDogRepository implements DogRepository {
  constructor(private readonly db: TrainerDatabase) {}
  findAll(): Promise<readonly Dog[]> {
    return this.db.read('dogs', (store) => store.getAll());
  }
  findById(id: DogId): Promise<Dog | undefined> {
    return this.db.read('dogs', (store) => store.get(id));
  }
  save(dog: Dog): Promise<void> {
    validateDog(dog);
    return this.db.write('dogs', dog);
  }
}
export class IndexedDbTrainingSessionRepository implements TrainingSessionRepository {
  constructor(private readonly db: TrainerDatabase) {}
  findAll(): Promise<readonly TrainingSession[]> {
    return this.db.read('sessions', (store) => store.getAll());
  }
  findById(id: SessionId): Promise<TrainingSession | undefined> {
    return this.db.read('sessions', (store) => store.get(id));
  }
  findByDogId(id: DogId): Promise<readonly TrainingSession[]> {
    return this.db.read('sessions', (store) => store.index('dogId').getAll(id));
  }
  save(session: TrainingSession): Promise<void> {
    validateSession(session);
    return this.db.write('sessions', session);
  }
}
