import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TrainerDatabase } from './indexed-db';
import { IndexedDbDogRepository } from './repositories';
import { DEMO_DOG } from './demo-dog';
import { DogId } from '../../domain/dog/dog';
let db: TrainerDatabase;
let dogs: IndexedDbDogRepository;
let name: string;
beforeEach(() => {
  name = crypto.randomUUID();
  db = new TrainerDatabase(name);
  dogs = new IndexedDbDogRepository(db);
});
afterEach(async () => {
  await db.close();
  indexedDB.deleteDatabase(name);
});
describe('Hundepersistenz', () => {
  it('speichert Hunde dauerhaft über eine neue Verbindung hinweg', async () => {
    await dogs.save(DEMO_DOG);
    await db.close();
    expect(await new IndexedDbDogRepository(db).findById(DEMO_DOG.id)).toEqual(DEMO_DOG);
    expect(await dogs.findAll()).toHaveLength(1);
    expect(await dogs.findById('missing' as DogId)).toBeUndefined();
  });
  it('gibt Kopien zurück, sodass Änderungen keine impliziten Writes auslösen', async () => {
    await dogs.save(DEMO_DOG);
    const dog = await dogs.findById(DEMO_DOG.id);
    Object.assign(dog!, { name: 'Geändert' });
    expect((await dogs.findById(DEMO_DOG.id))?.name).toBe('Reggae');
  });
});
