import { DogId } from '../domain/dog/dog';
/** Nur eine lesbare Darstellung alter Trainings, kein zweites fachliches Modell. */
export interface ArchivedTraining {
  readonly id: string;
  readonly dogId: DogId;
  readonly date: string;
  readonly duration?: number;
  readonly notes: string;
  readonly details: readonly string[];
}
export interface TrainingArchive {
  findAll(): Promise<readonly ArchivedTraining[]>;
}
