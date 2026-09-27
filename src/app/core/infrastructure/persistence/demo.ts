import { Dog, DogId } from '../../domain/dog/dog';
import { SessionId, TrainingSession, TrainingSetup } from '../../domain/training/training';
import { TrainerDatabase } from './indexed-db';
export const DEMO_DOG: Dog = {
  id: 'demo-reggae' as DogId,
  name: 'Reggae',
  breed: 'Labrador Retriever',
  dateOfBirth: '2022-04-12',
  sex: 'MALE',
  photoUrl: '/images/labrador.jpg',
};
export const DEFAULT_SETUP: TrainingSetup = {
  distanceMeters: 30,
  targetVisible: false,
  targetLocationKnown: false,
  terrainGuidance: 'NONE',
  delaySeconds: 0,
  distractionLevel: 'NONE',
  terrainType: 'SHORT_GRASS',
  dummyVisibility: 'VISIBLE',
  retrieveObject: 'DUMMY',
};
export const DEMO_SESSIONS: readonly TrainingSession[] = [
  {
    id: 'demo-visible' as SessionId,
    dogId: DEMO_DOG.id,
    date: '2026-09-20T09:00:00+02:00',
    duration: 15,
    notes: 'Demotraining · ruhiger Einstieg mit sichtbarem Tennisball.',
    runs: [
      {
        id: 'demo-run-1',
        skillId: 'LINE_OUT',
        method: 'VISIBLE_TARGET',
        setup: {
          ...DEFAULT_SETUP,
          distanceMeters: 15,
          targetVisible: true,
          targetLocationKnown: true,
          retrieveObject: 'TENNIS_BALL',
        },
        performance: { TAKES_LINE: 'RELIABLE', ENGAGEMENT: 'RELIABLE', FINDS_DUMMY: 'RELIABLE' },
      },
    ],
  },
  {
    id: 'demo-memory' as SessionId,
    dogId: DEMO_DOG.id,
    date: '2026-09-23T17:00:00+02:00',
    duration: 20,
    notes: 'Demotraining · bekannte Zielstelle auf der Wiese.',
    runs: [
      {
        id: 'demo-run-2',
        skillId: 'LINE_OUT',
        method: 'MEMORY',
        setup: {
          ...DEFAULT_SETUP,
          distanceMeters: 50,
          targetLocationKnown: true,
          delaySeconds: 60,
        },
        performance: {
          HOLDS_DIRECTION: 'RELIABLE',
          HOLDS_DISTANCE: 'MOSTLY',
          RETURNS_TO_HANDLER: 'RELIABLE',
        },
      },
    ],
  },
  {
    id: 'demo-blind' as SessionId,
    dogId: DEMO_DOG.id,
    date: '2026-09-26T10:30:00+02:00',
    duration: 12,
    notes: 'Demotraining · gut sichtbares Dummy an unbekannter Zielstelle.',
    runs: [
      {
        id: 'demo-run-3',
        skillId: 'LINE_OUT',
        method: 'BLIND',
        setup: { ...DEFAULT_SETUP },
        performance: {
          TAKES_LINE: 'RELIABLE',
          HOLDS_DIRECTION: 'MOSTLY',
          REACHES_TARGET: 'RELIABLE',
          FINDS_DUMMY: 'RELIABLE',
        },
      },
    ],
  },
];
/** Marker und Datensätze werden in einer einzigen Transaktion geschrieben, auch bei parallelen Tabs. */
export async function seedDemo(db: TrainerDatabase): Promise<void> {
  const connection = await db.open();
  return new Promise((resolve, reject) => {
    const tx = connection.transaction(['dogs', 'sessions', 'meta'], 'readwrite');
    const marker = tx.objectStore('meta').get('demo-v1');
    marker.onsuccess = () => {
      if (marker.result) return;
      tx.objectStore('dogs').put(DEMO_DOG);
      for (const session of DEMO_SESSIONS) tx.objectStore('sessions').put(session);
      tx.objectStore('meta').put(true, 'demo-v1');
    };
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error('Demodaten konnten nicht angelegt werden.'));
    tx.onerror = () => reject(tx.error);
  });
}
