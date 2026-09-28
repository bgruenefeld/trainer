import { DEMO_DOG } from './demo-dog';
export const DEFAULT_SETUP = {
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
export const DEMO_SESSIONS = [
  {
    id: 'demo-visible',
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
    id: 'demo-memory',
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
    id: 'demo-blind',
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
