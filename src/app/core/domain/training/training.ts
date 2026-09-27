import { DogId } from '../dog/dog';
import { SkillId } from '../skill/skill';
export type SessionId = string & { readonly __brand: 'SessionId' };
export type TrainingMethod =
  'VISIBLE_TARGET' | 'MEMORY' | 'TERRAIN_GUIDANCE' | 'STAGED_RETRIEVES' | 'BLIND';
export type TerrainType = 'SHORT_GRASS' | 'HIGH_GRASS' | 'PATH' | 'FOREST' | 'WATER' | 'MIXED';
export interface TrainingSetup {
  readonly distanceMeters: number;
  readonly targetVisible: boolean;
  /** Kenntnis des Hundes über die Zielstelle, nicht die des Hundeführers. */
  readonly targetLocationKnown: boolean;
  readonly terrainGuidance: 'NONE' | 'PATH' | 'EDGE' | 'FENCE';
  readonly delaySeconds: number;
  readonly distractionLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  readonly terrainType: TerrainType;
  readonly dummyVisibility: 'VISIBLE' | 'PARTLY_HIDDEN' | 'HIDDEN';
  readonly retrieveObject: 'DUMMY' | 'TENNIS_BALL';
}
export const PERFORMANCE_CRITERIA = [
  'TAKES_LINE',
  'ENGAGEMENT',
  'HOLDS_DIRECTION',
  'HOLDS_DISTANCE',
  'REACHES_TARGET',
  'FINDS_DUMMY',
  'RETURNS_TO_HANDLER',
] as const;
export type PerformanceCriterion = (typeof PERFORMANCE_CRITERIA)[number];
export type Rating = 'NEEDS_SUPPORT' | 'MOSTLY' | 'RELIABLE';
/** Fehlende Kriterien sind unbewertet; kein Gesamt-Score. */
export type Performance = Readonly<Partial<Record<PerformanceCriterion, Rating>>>;
export interface TrainingRun {
  readonly id: string;
  readonly skillId: SkillId;
  readonly method: TrainingMethod;
  readonly setup: TrainingSetup;
  readonly performance: Performance;
  readonly note?: string;
}
export interface TrainingSession {
  readonly id: SessionId;
  readonly dogId: DogId;
  /** ISO-Zeitpunkt. */
  readonly date: string;
  /** Dauer in Minuten. */
  readonly duration: number;
  readonly notes: string;
  readonly runs: readonly TrainingRun[];
}
export function validateSetup(setup: TrainingSetup): void {
  if (!Number.isFinite(setup.distanceMeters) || setup.distanceMeters <= 0)
    throw new Error('Die Distanz muss größer als 0 m sein.');
  if (!Number.isFinite(setup.delaySeconds) || setup.delaySeconds < 0)
    throw new Error('Die Wartezeit darf nicht negativ sein.');
}
export function validateSession(session: TrainingSession): void {
  if (!session.id || !session.dogId || !Number.isFinite(Date.parse(session.date)))
    throw new Error('Hund und gültiges Trainingsdatum sind erforderlich.');
  if (!Number.isFinite(session.duration) || session.duration <= 0)
    throw new Error('Die Dauer muss größer als 0 Minuten sein.');
  if (session.runs.length === 0)
    throw new Error('Mindestens ein Trainingsdurchlauf ist erforderlich.');
  if (new Set(session.runs.map((run) => run.id)).size !== session.runs.length)
    throw new Error('Durchlauf-IDs müssen eindeutig sein.');
  for (const run of session.runs) {
    if (!run.id) throw new Error('Durchlauf-ID fehlt.');
    validateSetup(run.setup);
    for (const [criterion, rating] of Object.entries(run.performance)) {
      if (
        !PERFORMANCE_CRITERIA.includes(criterion as PerformanceCriterion) ||
        !['NEEDS_SUPPORT', 'MOSTLY', 'RELIABLE'].includes(rating)
      )
        throw new Error('Ungültige Einzelbewertung.');
    }
  }
}
