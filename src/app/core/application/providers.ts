import { InjectionToken } from '@angular/core';
import { DogRepository } from '../domain/dog/dog.repository';
import { TrainingArchive } from './training-archive';
export const DOG_REPOSITORY = new InjectionToken<DogRepository>('DogRepository');
export const TRAINING_ARCHIVE = new InjectionToken<TrainingArchive>('TrainingArchive');
export const INITIALIZE_DATA = new InjectionToken<() => Promise<void>>('InitializeData');
