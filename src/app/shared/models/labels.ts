import {
  PerformanceCriterion,
  Rating,
  TerrainType,
  TrainingMethod,
} from '../../core/domain/training/training';
export const METHOD_LABELS: Record<TrainingMethod, string> = {
  VISIBLE_TARGET: 'Sichtbares Ziel',
  MEMORY: 'Memory',
  TERRAIN_GUIDANCE: 'Geländeleitlinie',
  STAGED_RETRIEVES: 'Gestaffelte Apporte',
  BLIND: 'Blind',
};
export const METHOD_DESCRIPTIONS: Record<TrainingMethod, string> = {
  VISIBLE_TARGET: 'Der Hund sieht das Ziel beim Start.',
  MEMORY: 'Der Hund erinnert sich an die Zielstelle.',
  TERRAIN_GUIDANCE: 'Ein Weg oder eine Kante unterstützt die Linie.',
  STAGED_RETRIEVES: 'Mehrere Apporte werden gestaffelt ausgelegt.',
  BLIND: 'Die Zielstelle ist dem Hund unbekannt.',
};
export const TERRAIN_LABELS: Record<TerrainType, string> = {
  SHORT_GRASS: 'Kurzgemähte Wiese',
  HIGH_GRASS: 'Hohes Gras',
  PATH: 'Weg',
  FOREST: 'Wald',
  WATER: 'Wasser',
  MIXED: 'Gemischtes Gelände',
};
export const CRITERION_LABELS: Record<PerformanceCriterion, string> = {
  TAKES_LINE: 'Nimmt die Linie an',
  ENGAGEMENT: 'Tempo & Engagement',
  HOLDS_DIRECTION: 'Hält die Richtung',
  HOLDS_DISTANCE: 'Hält die Distanz durch',
  REACHES_TARGET: 'Erreicht den Zielbereich',
  FINDS_DUMMY: 'Findet den Apportiergegenstand',
  RETURNS_TO_HANDLER: 'Kehrt zu dir zurück',
};
export const RATING_LABELS: Record<Rating, string> = {
  NEEDS_SUPPORT: 'Mit Hilfe',
  MOSTLY: 'Meistens',
  RELIABLE: 'Sicher',
};
