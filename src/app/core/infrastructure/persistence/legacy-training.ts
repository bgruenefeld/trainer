import { DogId } from '../../domain/dog/dog';
import { ArchivedTraining } from '../../application/training-archive';
/** Ausschließlich Persistenzformat v1. Alle Werte bleiben im Originalspeicher erhalten. */
export function decodeArchivedTraining(value: unknown): ArchivedTraining {
  const row = value as {
    id: string;
    dogId: DogId;
    date: string;
    duration?: number;
    notes?: string;
    runs?: unknown[];
  };
  return {
    id: row.id,
    dogId: row.dogId,
    date: row.date,
    duration: row.duration,
    notes: row.notes ?? '',
    details: (row.runs ?? []).map((run) => describeValue(run)),
  };
}

const labels: Readonly<Record<string, string>> = {
  skillId: 'Fähigkeit',
  LINE_OUT: 'Voran',
  method: 'Methode',
  setup: 'Bedingungen',
  performance: 'Beobachtungen',
  note: 'Notiz',
  VISIBLE_TARGET: 'Sichtbares Ziel',
  MEMORY: 'Memory',
  TERRAIN_GUIDANCE: 'Geländeleitlinie',
  STAGED_RETRIEVES: 'Gestaffelte Apporte',
  BLIND: 'Blind',
  distanceMeters: 'Distanz (m)',
  targetVisible: 'Ziel sichtbar',
  targetLocationKnown: 'Zielstelle bekannt',
  terrainGuidance: 'Geländeführung',
  delaySeconds: 'Wartezeit (s)',
  distractionLevel: 'Ablenkung',
  terrainType: 'Gelände',
  dummyVisibility: 'Sichtbarkeit',
  retrieveObject: 'Apportiergegenstand',
  SHORT_GRASS: 'Kurze Wiese',
  HIGH_GRASS: 'Hohes Gras',
  PATH: 'Weg',
  FOREST: 'Wald',
  WATER: 'Wasser',
  MIXED: 'Gemischt',
  NONE: 'Keine',
  LOW: 'Gering',
  MEDIUM: 'Mittel',
  HIGH: 'Hoch',
  VISIBLE: 'Sichtbar',
  PARTLY_HIDDEN: 'Teilweise verdeckt',
  HIDDEN: 'Verdeckt',
  DUMMY: 'Dummy',
  TENNIS_BALL: 'Tennisball',
  GAME: 'Wild',
  TAKES_LINE: 'Nimmt Linie an',
  ENGAGEMENT: 'Tempo und Engagement',
  HOLDS_DIRECTION: 'Hält Richtung',
  HOLDS_DISTANCE: 'Hält Distanz',
  REACHES_TARGET: 'Erreicht Zielbereich',
  FINDS_DUMMY: 'Findet Apportiergegenstand',
  RETURNS_TO_HANDLER: 'Kehrt zurück',
  NEEDS_SUPPORT: 'Mit Hilfe',
  MOSTLY: 'Meistens',
  RELIABLE: 'Sicher',
};
function describeValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
  if (typeof value !== 'object') return labels[String(value)] ?? String(value);
  if (Array.isArray(value)) return value.map(describeValue).join(', ');
  return Object.entries(value)
    .filter(([key]) => key !== 'id')
    .map(([key, entry]) => `${labels[key] ?? key}: ${describeValue(entry)}`)
    .join('\n');
}
