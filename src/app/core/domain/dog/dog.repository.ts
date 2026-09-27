import { Dog, DogId } from './dog';
export interface DogRepository {
  findAll(): Promise<readonly Dog[]>;
  findById(id: DogId): Promise<Dog | undefined>;
  save(dog: Dog): Promise<void>;
}
