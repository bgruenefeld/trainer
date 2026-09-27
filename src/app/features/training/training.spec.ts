import 'fake-indexeddb/auto';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import { Training } from './training';
import { TrainerStore } from '../../core/application/trainer-store';
import {
  DOG_REPOSITORY,
  INITIALIZE_DATA,
  SESSION_REPOSITORY,
} from '../../core/application/providers';
import { TrainerDatabase } from '../../core/infrastructure/persistence/indexed-db';
import {
  IndexedDbDogRepository,
  IndexedDbTrainingSessionRepository,
} from '../../core/infrastructure/persistence/repositories';
import { seedDemo } from '../../core/infrastructure/persistence/demo';
let db: TrainerDatabase;
afterEach(async () => {
  await db?.close();
});
describe('Training-UI mit echten Anwendungsdiensten', () => {
  it('führt durch alle Schritte, persistiert Bewertungen und lädt sie wieder', async () => {
    db = new TrainerDatabase(crypto.randomUUID());
    const sessions = new IndexedDbTrainingSessionRepository(db);
    await TestBed.configureTestingModule({
      imports: [Training],
      providers: [
        provideRouter([]),
        { provide: DOG_REPOSITORY, useValue: new IndexedDbDogRepository(db) },
        { provide: SESSION_REPOSITORY, useValue: sessions },
        { provide: INITIALIZE_DATA, useValue: () => seedDemo(db) },
      ],
    }).compileComponents();
    const store = TestBed.inject(TrainerStore);
    await store.load();
    const fixture = TestBed.createComponent(Training);
    fixture.detectChanges();
    const click = (label: string): void => {
      const buttons = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      ) as HTMLButtonElement[];
      const button = buttons.find((item) => item.textContent?.includes(label));
      expect(button, `Button ${label}`).toBeDefined();
      button!.click();
      fixture.detectChanges();
    };
    click('Weiter');
    click('Weiter');
    click('Memory');
    click('Weiter');
    const distance = fixture.nativeElement.querySelector('input[type=number]') as HTMLInputElement;
    distance.value = '50';
    distance.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    click('Weiter');
    click('Sicher');
    click('Weiter');
    await fixture.whenStable();
    click('Training speichern');
    await expect.poll(() => fixture.componentInstance.saved()).toBe(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Gut gemacht');
    await db.close();
    await store.load();
    expect(store.sessions()).toHaveLength(4);
    expect(store.latest()?.runs[0]).toMatchObject({
      method: 'MEMORY',
      setup: { distanceMeters: 50 },
      performance: { TAKES_LINE: 'RELIABLE' },
    });
  });
});
