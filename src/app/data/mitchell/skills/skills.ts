import { entityId } from '../../../core/domain/shared/identity';
import { SkillCategory, SkillDefinition } from '../../../core/domain/skills/skill';
import { MITCHELL_SYSTEM_ID, mitchellSource } from '../sources/source';
const definitions = [
  [
    'FOUNDATION',
    'environmental_confidence',
    'Umweltsicherheit',
    'Sicherheit des Hundes in unterschiedlichen Umwelten und Situationen.',
  ],
  [
    'FOUNDATION',
    'socialisation',
    'Sozialisierung',
    'Positive und angemessene Erfahrung mit sozialen Umweltreizen.',
  ],
  [
    'FOUNDATION',
    'handler_orientation',
    'Orientierung am Handler',
    'Freiwillige räumliche und soziale Orientierung am Handler.',
  ],
  [
    'FOUNDATION',
    'informal_recall',
    'Informeller Rückruf',
    'Frühe, noch nicht formalisierte freiwillige Rückkehr zum Handler.',
  ],
  [
    'FOUNDATION',
    'leash_introduction',
    'Leinengewöhnung',
    'Frühe Gewöhnung an das Tragen und kurze Führen an einer Leine.',
  ],
  [
    'FOUNDATION',
    'retrieve_desire',
    'Apportierfreude',
    'Motivation, einem Apportiergegenstand nachzugehen und ihn aufzunehmen.',
  ],
  [
    'FOUNDATION',
    'confidence',
    'Selbstvertrauen',
    'Allgemeines Selbstvertrauen bei Training und Exploration.',
  ],
  [
    'FOUNDATION',
    'engagement',
    'Zusammenarbeit',
    'Bereitschaft zur freiwilligen Interaktion und Zusammenarbeit mit dem Handler.',
  ],
  [
    'CONTROL',
    'heelwork',
    'Fußarbeit',
    'Der Hund hält freiwillig und aufmerksam eine funktionale Position neben dem Handler und orientiert sich an dessen Bewegung, Richtung und Geschwindigkeit.',
  ],
  ['CONTROL', 'steadiness', 'Standruhe', 'In einer Retrievesituation ruhig warten können.'],
  ['CONTROL', 'sit_stay', 'Sitz und Bleib', 'Sitzen und am zugewiesenen Ort bleiben lernen.'],
  ['CONTROL', 'recall', 'Rückruf', 'Auf das Rückrufsignal zum Handler kommen.'],
  ['CONTROL', 'stop', 'Stoppen', 'Auf ein Signal anhalten.'],
  ['CONTROL', 'stop_whistle', 'Stopppfiff', 'Auf das Stoppsignal mit der Pfeife reagieren.'],
  [
    'RETRIEVE_COMPONENTS',
    'setup',
    'Startaufstellung',
    'Die Ausgangssituation für das Hinauslaufen aufbauen.',
  ],
  [
    'RETRIEVE_COMPONENTS',
    'outrun',
    'Hinauslaufen',
    'Den Weg vom Handler zum Zielbereich ausführen.',
  ],
  ['RETRIEVE_COMPONENTS', 'inrun', 'Zurücklaufen', 'Den Rückweg zum Handler ausführen.'],
  ['RETRIEVE_COMPONENTS', 'collection', 'Aufnehmen', 'Den Apportiergegenstand aufnehmen.'],
  ['RETRIEVE_COMPONENTS', 'delivery', 'Abgabe', 'Den Apportiergegenstand beim Handler abgeben.'],
  [
    'RETRIEVE_COMPONENTS',
    'return_to_heel',
    'Rückkehr an den Fuß',
    'Nach dem Retrieve an die Fußposition zurückkehren.',
  ],
  ['HANDLING', 'go_back', 'Zurückschicken', 'Auf Anweisung vom Handler weg nach hinten laufen.'],
  ['HANDLING', 'straight_line', 'Gerade Linie', 'Beim Hinauslaufen die vorgesehene Linie halten.'],
  ['HANDLING', 'directions', 'Richtungsarbeit', 'Richtungsanweisungen des Handlers umsetzen.'],
  ['HANDLING', 'left', 'Links', 'Eine Richtungsanweisung nach links umsetzen.'],
  ['HANDLING', 'right', 'Rechts', 'Eine Richtungsanweisung nach rechts umsetzen.'],
  [
    'HANDLING',
    'blind_handling',
    'Blind Handling',
    'Sich zu einer zuvor unbekannten Zielstelle führen lassen.',
  ],
  [
    'HANDLING',
    'handler_tolerance',
    'Toleranz gegenüber Handling',
    'Mit den Eingriffen des Handlers in der Zusammenarbeit umgehen.',
  ],
  ['INDEPENDENT_WORK', 'marking', 'Markieren', 'Fallstellen wahrnehmen und erinnern.'],
  ['INDEPENDENT_WORK', 'hunting', 'Suchen', 'Im Zielgebiet selbstständig suchen.'],
  ['ENVIRONMENT', 'diversions', 'Verleitungen', 'Mit Verleitungen im Training umgehen.'],
  ['ENVIRONMENT', 'shot', 'Schuss', 'Mit Schussreizen im Trainingsumfeld umgehen.'],
  ['ENVIRONMENT', 'water', 'Wasser', 'Sicherheit und Fähigkeiten im Wasser entwickeln.'],
  ['ENVIRONMENT', 'jumping', 'Springen', 'Sprünge bewältigen.'],
  ['ENVIRONMENT', 'obstacles', 'Hindernisse', 'Mit Hindernissen in der Arbeitsumgebung umgehen.'],
  ['ENVIRONMENT', 'cover', 'Deckung', 'In unterschiedlichem Bewuchs arbeiten.'],
  [
    'ADVANCED',
    'walk_up',
    'Walk-up',
    'Fähigkeiten für die gemeinsame Arbeit beim Walk-up entwickeln.',
  ],
  [
    'ADVANCED',
    'picking_up',
    'Picking-up',
    'Fähigkeiten für die Arbeit beim Picking-up entwickeln.',
  ],
  [
    'ADVANCED',
    'advanced_training',
    'Weiterführendes Training',
    'Bereits aufgebaute Fähigkeiten in weiterführender Arbeit verbinden.',
  ],
] as const satisfies readonly (readonly [SkillCategory, string, string, string])[];
export type MitchellSkillCode = (typeof definitions)[number][1];
export const mitchellSkillId = (code: MitchellSkillCode) => entityId<'Skill'>(`mitchell:${code}`);
/** Keine unbelegten Subskill-Zuordnungen oder Freischaltschwellen. */
export const MITCHELL_SKILLS: readonly SkillDefinition[] = definitions.map(
  ([category, code, name, purpose]) => ({
    id: mitchellSkillId(code),
    systemId: MITCHELL_SYSTEM_ID,
    code,
    name,
    purpose,
    category,
    subskills: [],
    source: mitchellSource(code === 'heelwork' ? 'Heelwork' : undefined),
  }),
);
