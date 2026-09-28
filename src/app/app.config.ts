import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { DOG_REPOSITORY, INITIALIZE_DATA, TRAINING_ARCHIVE } from './core/application/providers';
import { TrainerDatabase } from './core/infrastructure/persistence/indexed-db';
import {
  IndexedDbDogRepository,
  IndexedDbTrainingArchive,
} from './core/infrastructure/persistence/repositories';
import { initializeMitchell } from './core/infrastructure/persistence/initialize-mitchell';
import {
  SKILL_ASSESSMENTS,
  SYSTEM_SESSIONS,
  TRAINING_PROFILES,
  TRAINING_PLANS,
} from './core/application/mitchell-providers';
import {
  IndexedDbSkillAssessmentRepository,
  IndexedDbSystemSessionRepository,
  IndexedDbTrainingProfileRepository,
  IndexedDbTrainingPlanRepository,
} from './core/infrastructure/persistence/mitchell-repositories';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: SKILL_ASSESSMENTS,
      useFactory: (db: TrainerDatabase) => new IndexedDbSkillAssessmentRepository(db),
      deps: [TrainerDatabase],
    },
    {
      provide: SYSTEM_SESSIONS,
      useFactory: (db: TrainerDatabase) => new IndexedDbSystemSessionRepository(db),
      deps: [TrainerDatabase],
    },
    {
      provide: TRAINING_PROFILES,
      useFactory: (db: TrainerDatabase) => new IndexedDbTrainingProfileRepository(db),
      deps: [TrainerDatabase],
    },
    {
      provide: TRAINING_PLANS,
      useFactory: (db: TrainerDatabase) => new IndexedDbTrainingPlanRepository(db),
      deps: [TrainerDatabase],
    },
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: TrainerDatabase, useFactory: () => new TrainerDatabase() },
    {
      provide: DOG_REPOSITORY,
      useFactory: (db: TrainerDatabase) => new IndexedDbDogRepository(db),
      deps: [TrainerDatabase],
    },
    {
      provide: TRAINING_ARCHIVE,
      useFactory: (db: TrainerDatabase) => new IndexedDbTrainingArchive(db),
      deps: [TrainerDatabase],
    },
    {
      provide: INITIALIZE_DATA,
      useFactory: (db: TrainerDatabase) => () => initializeMitchell(db),
      deps: [TrainerDatabase],
    },
  ],
};
