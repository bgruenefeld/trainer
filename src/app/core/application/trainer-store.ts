import { computed, inject, Injectable, signal } from '@angular/core';
import { Dog, DogId } from '../domain/dog/dog';
import { TrainingSession } from '../domain/training/training';
import { DOG_REPOSITORY, INITIALIZE_DATA, SESSION_REPOSITORY } from './providers';
import { DogService } from './dog/dog-service';
import { TrainingService } from './training/training-service';
@Injectable({ providedIn: 'root' })
export class TrainerStore {
  private readonly dogsRepository = inject(DOG_REPOSITORY);
  private readonly sessionRepository = inject(SESSION_REPOSITORY);
  private readonly initializeData = inject(INITIALIZE_DATA);
  private readonly dogService = new DogService(this.dogsRepository);
  private readonly trainingService = new TrainingService(
    this.dogsRepository,
    this.sessionRepository,
  );
  private readonly dogState = signal<readonly Dog[]>([]);
  private readonly sessionState = signal<readonly TrainingSession[]>([]);
  private readonly selectedId = signal<DogId | undefined>(undefined);
  readonly dogs = this.dogState.asReadonly();
  readonly selectedDog = computed(() => this.dogs().find((dog) => dog.id === this.selectedId()));
  readonly sessions = computed(() =>
    this.sessionState()
      .filter((s) => s.dogId === this.selectedId())
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
  );
  readonly latest = computed(() => this.sessions()[0]);
  readonly loading = signal(true);
  readonly error = signal('');
  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.initializeData();
      const [dogs, sessions] = await Promise.all([
        this.dogsRepository.findAll(),
        this.sessionRepository.findAll(),
      ]);
      this.dogState.set(dogs);
      this.sessionState.set(sessions);
      if (!dogs.some((dog) => dog.id === this.selectedId())) this.selectedId.set(dogs[0]?.id);
    } catch {
      this.error.set(
        'Die lokalen Daten konnten nicht geladen werden. Bitte Speicherzugriff im Browser erlauben und erneut versuchen.',
      );
    } finally {
      this.loading.set(false);
    }
  }
  selectDog(id: string): void {
    if (this.dogs().some((dog) => dog.id === id)) this.selectedId.set(id as DogId);
  }
  async addDog(input: Omit<Dog, 'id'>): Promise<void> {
    const dog: Dog = {
      ...input,
      id: crypto.randomUUID() as DogId,
      name: input.name.trim(),
      breed: input.breed.trim(),
    };
    await this.dogService.save(dog);
    this.dogState.update((dogs) => [...dogs, dog]);
    this.selectDog(dog.id);
  }
  async saveSession(session: TrainingSession): Promise<void> {
    await this.trainingService.save(session);
    this.sessionState.update((sessions) => [
      ...sessions.filter((s) => s.id !== session.id),
      session,
    ]);
    this.selectDog(session.dogId);
  }
}
