import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TrainerDatabase } from './indexed-db';
import { IndexedDbDogRepository, IndexedDbTrainingSessionRepository } from './repositories';
import { DEMO_DOG, DEMO_SESSIONS, seedDemo } from './demo';
import { DogId } from '../../domain/dog/dog';
import { SessionId } from '../../domain/training/training';
import { TrainingService } from '../../application/training/training-service';
let db: TrainerDatabase;
let dogs: IndexedDbDogRepository;
let sessions: IndexedDbTrainingSessionRepository;
let name: string;
beforeEach(() => {
  name = crypto.randomUUID();
  db = new TrainerDatabase(name);
  dogs = new IndexedDbDogRepository(db);
  sessions = new IndexedDbTrainingSessionRepository(db);
});
afterEach(async () => {
  await db.close();
  indexedDB.deleteDatabase(name);
});
describe('IndexedDB-Repositories', () => {
  it('speichert Hunde dauerhaft über eine neue Verbindung hinweg', async () => {
    await dogs.save(DEMO_DOG);
    await db.close();
    expect(await new IndexedDbDogRepository(db).findById(DEMO_DOG.id)).toEqual(DEMO_DOG);
    expect(await dogs.findAll()).toHaveLength(1);
    expect(await dogs.findById('missing' as DogId)).toBeUndefined();
  });
  it('lädt komplette Sessions mit mehreren Durchläufen und optionalen Bewertungen', async () => {
    const session = {
      ...DEMO_SESSIONS[0],
      runs: [...DEMO_SESSIONS[0].runs, { ...DEMO_SESSIONS[1].runs[0], performance: {} }],
    };
    await sessions.save(session);
    await db.close();
    expect(await sessions.findById(session.id)).toEqual(session);
  });
  it('isoliert Trainings nach Hund und aktualisiert anstatt zu duplizieren', async () => {
    await sessions.save(DEMO_SESSIONS[0]);
    await sessions.save({ ...DEMO_SESSIONS[1], dogId: 'other' as DogId });
    await sessions.save({ ...DEMO_SESSIONS[0], notes: 'Überarbeitet' });
    expect(await sessions.findAll()).toHaveLength(2);
    expect(await sessions.findByDogId(DEMO_DOG.id)).toEqual([
      { ...DEMO_SESSIONS[0], notes: 'Überarbeitet' },
    ]);
    expect(await sessions.findById('missing' as SessionId)).toBeUndefined();
  });
  it('gibt Kopien zurück, sodass Änderungen keine impliziten Writes auslösen', async () => {
    await dogs.save(DEMO_DOG);
    const dog = await dogs.findById(DEMO_DOG.id);
    Object.assign(dog!, { name: 'Geändert' });
    expect((await dogs.findById(DEMO_DOG.id))?.name).toBe('Reggae');
  });
  it('legt Demodaten einmalig an, auch bei parallelen Starts', async () => {
    await Promise.all([seedDemo(db), seedDemo(db)]);
    await dogs.save({ ...DEMO_DOG, name: 'Mein Reggae' });
    await sessions.save({ ...DEMO_SESSIONS[0], notes: 'Meine Notiz' });
    await seedDemo(db);
    expect(await sessions.findAll()).toHaveLength(3);
    expect((await dogs.findById(DEMO_DOG.id))?.name).toBe('Mein Reggae');
    expect((await sessions.findById(DEMO_SESSIONS[0].id))?.notes).toBe('Meine Notiz');
  });
  it('verhindert im Anwendungsdienst Sessions für nicht vorhandene Hunde', async () => {
    const service = new TrainingService(dogs, sessions);
    await expect(service.save(DEMO_SESSIONS[0])).rejects.toThrow('existiert nicht');
    expect(await sessions.findAll()).toHaveLength(0);
    await dogs.save(DEMO_DOG);
    await service.save(DEMO_SESSIONS[0]);
    expect(await sessions.findAll()).toHaveLength(1);
  });
  it('verwirft fachlich ungültige Daten vor dem Schreiben', async () => {
    expect(() => sessions.save({ ...DEMO_SESSIONS[0], duration: -1 })).toThrow();
    expect(await sessions.findAll()).toHaveLength(0);
  });
});
