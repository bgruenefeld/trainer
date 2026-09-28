import {
  createExerciseSnapshot,
  ExerciseSnapshot,
} from '../../domain/training-session/exercise-snapshot';
import { signal } from '@angular/core';
import { DogId } from '../../domain/dog/dog';
import { TrainingExercise } from '../../domain/exercises/training-exercise';
import {
  DifficultyFactor,
  DifficultySetting,
  validateDifficultySettings,
} from '../../domain/exercises/difficulty';
import { CriterionId, entityId } from '../../domain/shared/identity';
import {
  CriterionObservation,
  TrainingSession,
  validateTrainingSession,
} from '../../domain/training-session/training-session';
export class PuppyDraft {
  readonly step = signal(0);
  readonly ratings = signal<Readonly<Partial<Record<CriterionId, CriterionObservation['result']>>>>(
    {},
  );
  readonly error = signal('');
  readonly startedAt = signal<string | undefined>(undefined);
  readonly factorValues: Partial<Record<DifficultyFactor, string | number | null>> = {};
  distance: number | null = null;
  duration: number | null = null;
  environment = '';
  handler = '';
  notes = '';
  private readonly id = entityId<'TrainingSession'>(crypto.randomUUID());
  private readonly snapshot: ExerciseSnapshot;
  constructor(
    readonly dogId: DogId,
    readonly exercise: TrainingExercise,
  ) {
    this.snapshot = createExerciseSnapshot(exercise);
  }
  next(): void {
    this.step.update((step) => Math.min(4, step + 1));
  }
  begin(): void {
    this.error.set('');
    try {
      validateDifficultySettings(this.settings());
      if (!this.startedAt()) this.startedAt.set(new Date().toISOString());
      this.step.set(2);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Bedingungen prüfen.');
    }
  }
  settings(): DifficultySetting[] {
    const result: DifficultySetting[] = [];
    for (const factor of this.exercise.difficultyFactors) {
      const value = factor === 'distance' ? this.distance : this.factorValues[factor];
      if (value === null || value === undefined || value === '') continue;
      switch (factor) {
        case 'distance':
        case 'handler_distance':
          result.push({ factor, value: Number(value), unit: 'm' });
          break;
        case 'angle':
        case 'obstacle_angle':
          result.push({ factor, value: Number(value), unit: 'degrees' });
          break;
        case 'duration':
        case 'delay':
          result.push({ factor, value: Number(value), unit: 'seconds' });
          break;
        case 'number_of_retrieves':
          result.push({ factor, value: Number(value), unit: 'count' });
          break;
        case 'terrain':
          result.push({ factor, value: 'other', note: String(value) });
          break;
        case 'visibility':
          result.push({ factor, value: value as 'visible' | 'partly_hidden' | 'hidden' });
          break;
        case 'wind_direction':
          result.push({
            factor,
            value: value as 'headwind' | 'tailwind' | 'crosswind' | 'variable' | 'calm' | 'unknown',
          });
          break;
        default:
          result.push({ factor, description: String(value) });
      }
    }
    return result;
  }
  rate(id: CriterionId, result?: CriterionObservation['result']): void {
    this.ratings.update((rows) => {
      const copy = { ...rows };
      if (result) copy[id] = result;
      else delete copy[id];
      return copy;
    });
  }
  session(): TrainingSession {
    if (!this.startedAt()) throw new Error('Bitte zuerst Training beginnen.');
    const now = new Date().toISOString();
    const factors = this.settings();
    const criteria: CriterionObservation[] = this.snapshot.successCriteria.flatMap((c) =>
      this.ratings()[c.id] ? [{ criterionId: c.id, result: this.ratings()[c.id]! }] : [],
    );
    const session: TrainingSession = {
      schemaVersion: 3,
      id: this.id,
      dogId: this.dogId,
      handlerId: entityId<'Handler'>('local-handler'),
      systemId: this.snapshot.systemId,
      startedAt: this.startedAt()!,
      ...(this.duration === null ? {} : { durationMinutes: this.duration }),
      reflection: this.notes.trim(),
      executions: [
        {
          id: `${this.id}:execution`,
          exerciseSnapshot: this.snapshot,
          setup: {
            factors,
            environmentNotes: this.environment.trim(),
            handlerPositionNotes: this.handler.trim(),
          },
          criteria,
          notes: '',
          observations: [
            ...(this.environment.trim()
              ? [
                  {
                    id: entityId<'Observation'>(`${this.id}:environment`),
                    target: { kind: 'environment' as const },
                    description: this.environment.trim(),
                    recordedAt: now,
                    recordedBy: entityId<'Handler'>('local-handler'),
                    possibleProblems: [],
                  },
                ]
              : []),
          ],
        },
      ],
    };
    validateTrainingSession(session);
    return session;
  }
}
