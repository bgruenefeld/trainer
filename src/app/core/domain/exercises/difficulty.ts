import { requireText } from '../shared/identity';
import { TrainingSource } from '../sources/training-source';
export type DifficultyFactor =
  | 'distance'
  | 'turn_angle'
  | 'pace_variation'
  | 'angle'
  | 'terrain'
  | 'cover'
  | 'obstacle'
  | 'obstacle_angle'
  | 'visibility'
  | 'wind_direction'
  | 'scent_availability'
  | 'distractions'
  | 'handler_distance'
  | 'duration'
  | 'delay'
  | 'number_of_retrieves'
  | 'novelty';
/** Physische Messwerte und qualitative Beobachtungen; keine globale Schwierigkeitsskala. */
export type DifficultySetting =
  | { readonly factor: 'distance' | 'handler_distance'; readonly value: number; readonly unit: 'm' }
  | {
      readonly factor: 'angle' | 'obstacle_angle';
      readonly value: number;
      readonly unit: 'degrees';
    }
  | { readonly factor: 'duration' | 'delay'; readonly value: number; readonly unit: 'seconds' }
  | { readonly factor: 'number_of_retrieves'; readonly value: number; readonly unit: 'count' }
  | {
      readonly factor: 'terrain';
      readonly value:
        'short_grass' | 'high_grass' | 'path' | 'forest' | 'water' | 'mixed' | 'other';
      readonly note?: string;
    }
  | {
      readonly factor: 'visibility';
      readonly value: 'visible' | 'partly_hidden' | 'hidden';
      readonly note?: string;
    }
  | {
      readonly factor: 'wind_direction';
      readonly value: 'headwind' | 'tailwind' | 'crosswind' | 'variable' | 'calm' | 'unknown';
      readonly note?: string;
    }
  | {
      readonly factor:
        | 'cover'
        | 'obstacle'
        | 'scent_availability'
        | 'distractions'
        | 'novelty'
        | 'turn_angle'
        | 'pace_variation';
      readonly description: string;
    };
export interface DifficultyChange {
  readonly factor: DifficultyFactor;
  /** Bewertung des konkreten Kontextes durch Handler oder belegte Übungsanpassung. */
  readonly direction: 'increase' | 'decrease' | 'changed_unknown';
  readonly rationale: string;
}
export interface DifficultyProgressionReview {
  readonly increasedFactors: readonly DifficultyFactor[];
  readonly multipleIncreases: boolean;
}
/** Liefert eine Beobachtung, keine automatische Freigabe oder erfundene Anpassung. */
export function reviewDifficultyChanges(
  changes: readonly DifficultyChange[],
): DifficultyProgressionReview {
  const factors = changes.map((change) => change.factor);
  if (new Set(factors).size !== factors.length)
    throw new Error('Jeder Faktor darf pro Vergleich nur einmal vorkommen.');
  for (const change of changes) {
    if (!['increase', 'decrease', 'changed_unknown'].includes(change.direction))
      throw new Error('Unbekannte Änderungsrichtung.');
    requireText(change.rationale, 'Begründung der Änderung');
  }
  const increasedFactors = changes
    .filter((change) => change.direction === 'increase')
    .map((change) => change.factor);
  return { increasedFactors, multipleIncreases: increasedFactors.length > 1 };
}
export function validateDifficultySettings(settings: readonly DifficultySetting[]): void {
  if (new Set(settings.map((setting) => setting.factor)).size !== settings.length)
    throw new Error('Setup enthält doppelte Schwierigkeitsfaktoren.');
  for (const setting of settings) {
    if ('value' in setting && typeof setting.value === 'number') {
      if (!Number.isFinite(setting.value) || setting.value < 0)
        throw new Error('Messwerte müssen endlich und nicht negativ sein.');
      if (setting.factor === 'number_of_retrieves' && !Number.isInteger(setting.value))
        throw new Error('Die Anzahl muss ganzzahlig sein.');
    }
  }
}
export interface DifficultyPrinciple {
  readonly text: string;
  readonly source: TrainingSource;
}
