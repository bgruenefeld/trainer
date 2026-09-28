import { SkillDependency, DependencyType } from '../../../core/domain/skills/skill';
import { MitchellSkillCode, mitchellSkillId } from '../skills/skills';
import { mitchellSource } from '../sources/source';
const definitions = [
  [
    'heelwork',
    'setup',
    'soft',
    'Gutes Heelwork unterstützt einen sauberen Setup, ist hier aber noch nicht als harte technische Sperre zu behandeln.',
  ],
  ['setup', 'outrun', 'soft', 'Die Qualität des Setups beeinflusst den Outrun.'],
  [
    'go_back',
    'stop_whistle',
    'soft',
    'Go-back unterstützt den späteren Aufbau der Distanzkontrolle und des Stop-Whistle-Trainings.',
  ],
  [
    'recall',
    'directions',
    'soft',
    'Recall ist eine relevante Kontrollgrundlage, wird hier aber nicht als alleinige harte technische Voraussetzung modelliert.',
  ],
  [
    'stop',
    'directions',
    'hard',
    'Für gezieltes Directional Handling muss der Hund kontrollierbar gestoppt werden können.',
  ],
  [
    'go_back',
    'directions',
    'hard',
    'Go-back ist eine zentrale Grundlage für spätere Richtungsarbeit.',
  ],
  [
    'directions',
    'blind_handling',
    'hard',
    'Blind Handling baut auf etablierter Richtungsarbeit auf.',
  ],
  [
    'heelwork',
    'return_to_heel',
    'maintenance',
    'Heelwork bleibt während des Aufbaus und Erhalts des Return-to-Heel relevant.',
  ],
  ['steadiness', 'walk_up', 'hard', 'Walk-up setzt ausreichende Steadiness voraus.'],
  [
    'handler_orientation',
    'informal_recall',
    'soft',
    'Freiwillige Orientierung am Handler erleichtert den frühen Recall.',
  ],
  [
    'heelwork',
    'steadiness',
    'hard',
    'Innerhalb von Mitchells Trainingssystem wird Heelwork als formale Grundlage für den anschließenden Aufbau von Steadiness behandelt.',
  ],
] as const satisfies readonly (readonly [
  MitchellSkillCode,
  MitchellSkillCode,
  DependencyType,
  string,
])[];
export const MITCHELL_DEPENDENCIES: readonly SkillDependency[] = definitions.map(
  ([from, to, type, rationale]) => ({
    id: `mitchell:${from}:${to}:${type}`,
    targetSkillId: mitchellSkillId(to),
    requirement: {
      skillId: mitchellSkillId(from),
      type,
      rationale,
      source: mitchellSource(from === 'heelwork' && to === 'steadiness' ? 'Heelwork' : undefined),
    },
  }),
);
