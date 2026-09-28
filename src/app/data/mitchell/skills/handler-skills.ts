import {
  HandlerSkillCode,
  HandlerSkillDefinition,
} from '../../../core/domain/handler/handler-skill';
import { entityId } from '../../../core/domain/shared/identity';
import { MITCHELL_SYSTEM_ID, mitchellSource } from '../sources/source';
const definitions = [
  ['timing', 'Timing', 'Passender Zeitpunkt von Signal, Reaktion, Bestätigung oder Anpassung.'],
  [
    'body_language',
    'Körpersprache',
    'Bewusster Einsatz der Körperhaltung und Bewegung als Teil der Kommunikation.',
  ],
  [
    'positioning',
    'Positionierung',
    'Geeignete räumliche Position des Handlers im Trainingsaufbau.',
  ],
  ['observation', 'Beobachtung', 'Beobachtung von Hund, Umwelt und Trainingsverlauf.'],
  [
    'consistency',
    'Konsistenz',
    'Verlässliche und verständliche Anwendung von Regeln und Signalen.',
  ],
  ['cue_clarity', 'Signalklarheit', 'Klare, unterscheidbare und nachvollziehbare Signale.'],
  [
    'pressure_control',
    'Umgang mit Druck',
    'Angemessene Steuerung des sozialen und körpersprachlichen Drucks.',
  ],
  [
    'training_planning',
    'Trainingsplanung',
    'Planung von Ziel, Aufbau und Reihenfolge einer Trainingseinheit.',
  ],
  [
    'difficulty_management',
    'Schwierigkeit gestalten',
    'Gezielte Steuerung einzelner Schwierigkeitsfaktoren.',
  ],
  [
    'emotional_self_control',
    'Emotionale Selbstkontrolle',
    'Ruhiges und kontrolliertes Handlerverhalten.',
  ],
  [
    'active_handling',
    'Aktives Handling',
    'Aktive Bewegung und Positionierung des Handlers zur Unterstützung des Trainings.',
  ],
] as const satisfies readonly (readonly [HandlerSkillCode, string, string])[];
export const MITCHELL_HANDLER_SKILLS: readonly HandlerSkillDefinition[] = definitions.map(
  ([code, name, purpose]) => ({
    id: entityId<'HandlerSkill'>(`mitchell:handler:${code}`),
    systemId: MITCHELL_SYSTEM_ID,
    code,
    name,
    purpose,
    source: mitchellSource(),
  }),
);
