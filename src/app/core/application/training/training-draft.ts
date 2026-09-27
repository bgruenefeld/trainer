import { signal } from '@angular/core';
import { DogId } from '../../domain/dog/dog';
import {
  Performance,
  PerformanceCriterion,
  Rating,
  SessionId,
  TrainingMethod,
  TrainingSession,
  TrainingSetup,
  validateSession,
  validateSetup,
} from '../../domain/training/training';
export class TrainingDraft {
  readonly step = signal(0);
  readonly dogId = signal<DogId | undefined>(undefined);
  readonly method = signal<TrainingMethod>('VISIBLE_TARGET');
  readonly setup = signal<TrainingSetup>({
    distanceMeters: 15,
    targetVisible: true,
    targetLocationKnown: true,
    terrainGuidance: 'NONE',
    delaySeconds: 0,
    distractionLevel: 'NONE',
    terrainType: 'SHORT_GRASS',
    dummyVisibility: 'VISIBLE',
    retrieveObject: 'DUMMY',
  });
  readonly performance = signal<Performance>({});
  readonly duration = signal(15);
  readonly notes = signal('');
  readonly error = signal('');
  private readonly id = crypto.randomUUID() as SessionId;
  private readonly runId = crypto.randomUUID();
  setSetup<K extends keyof TrainingSetup>(key: K, value: TrainingSetup[K]): void {
    this.setup.update((setup) => ({ ...setup, [key]: value }));
  }
  selectMethod(method: TrainingMethod): void {
    this.method.set(method);
    // Nur Startwerte; Bedingungen bleiben im nächsten Schritt unabhängig editierbar.
    this.setup.update((setup) => ({
      ...setup,
      targetVisible: method === 'VISIBLE_TARGET',
      targetLocationKnown: method !== 'BLIND',
      terrainGuidance: method === 'TERRAIN_GUIDANCE' ? 'PATH' : 'NONE',
    }));
  }
  rate(criterion: PerformanceCriterion, rating?: Rating): void {
    this.performance.update((current) => {
      const next = { ...current };
      if (rating) next[criterion] = rating;
      else delete next[criterion];
      return next;
    });
  }
  next(): void {
    this.error.set('');
    try {
      if (!this.dogId()) throw new Error('Bitte einen Hund auswählen.');
      if (this.step() === 3) validateSetup(this.setup());
      this.step.update((step) => Math.min(5, step + 1));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Bitte Eingaben prüfen.');
    }
  }
  back(): void {
    this.error.set('');
    this.step.update((step) => Math.max(0, step - 1));
  }
  toSession(): TrainingSession {
    const dogId = this.dogId();
    if (!dogId) throw new Error('Bitte einen Hund auswählen.');
    const session: TrainingSession = {
      id: this.id,
      dogId,
      date: new Date().toISOString(),
      duration: this.duration(),
      notes: this.notes().trim(),
      runs: [
        {
          id: this.runId,
          skillId: 'LINE_OUT',
          method: this.method(),
          setup: this.setup(),
          performance: this.performance(),
        },
      ],
    };
    validateSession(session);
    return session;
  }
}
