import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { DOG_REPOSITORY, INITIALIZE_DATA, SESSION_REPOSITORY } from './core/application/providers';
import { TrainerDatabase } from './core/infrastructure/persistence/indexed-db';
import {
  IndexedDbDogRepository,
  IndexedDbTrainingSessionRepository,
} from './core/infrastructure/persistence/repositories';
import { seedDemo } from './core/infrastructure/persistence/demo';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
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
      provide: SESSION_REPOSITORY,
      useFactory: (db: TrainerDatabase) => new IndexedDbTrainingSessionRepository(db),
      deps: [TrainerDatabase],
    },
    {
      provide: INITIALIZE_DATA,
      useFactory: (db: TrainerDatabase) => () => seedDemo(db),
      deps: [TrainerDatabase],
    },
  ],
};
