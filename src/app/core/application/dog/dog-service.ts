import { Dog, validateDog } from '../../domain/dog/dog';
import { DogRepository } from '../../domain/dog/dog.repository';
export class DogService {
  constructor(private readonly dogs: DogRepository) {}
  async save(dog: Dog): Promise<void> {
    validateDog(dog);
    await this.dogs.save(dog);
  }
}
