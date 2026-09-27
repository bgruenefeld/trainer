import { InjectionToken } from '@angular/core';
import { DogRepository } from '../domain/dog/dog.repository';
import { TrainingSessionRepository } from '../domain/training/training-session.repository';
export const DOG_REPOSITORY = new InjectionToken<DogRepository>('DogRepository');
export const SESSION_REPOSITORY = new InjectionToken<TrainingSessionRepository>(
  'TrainingSessionRepository',
);
export const INITIALIZE_DATA = new InjectionToken<() => Promise<void>>('InitializeData');
