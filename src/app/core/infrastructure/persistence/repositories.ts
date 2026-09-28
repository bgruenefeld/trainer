import { archiveRetiredAssessment } from './retired-mitchell-skills';
import { ArchivedTraining, TrainingArchive } from '../../application/training-archive';
import { decodeArchivedTraining } from './legacy-training';
import { Dog, DogId, validateDog } from '../../domain/dog/dog';
import { DogRepository } from '../../domain/dog/dog.repository';
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
export class IndexedDbTrainingArchive implements TrainingArchive {
  constructor(private readonly db: TrainerDatabase) {}
  async findAll(): Promise<readonly ArchivedTraining[]> {
    const rows = await this.db.read<unknown[]>('sessions', (store) => store.getAll());
    const assessments = await this.db.read<unknown[]>('skillAssessments', (store) =>
      store.getAll(),
    );
    return [
      ...rows.map(decodeArchivedTraining),
      ...assessments.flatMap((value) => {
        const archived = archiveRetiredAssessment(value);
        return archived ? [archived] : [];
      }),
    ];
  }
}
