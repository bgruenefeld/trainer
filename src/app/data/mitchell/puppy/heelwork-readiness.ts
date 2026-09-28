import { QualitativeReadinessIndicator } from '../../../core/domain/skills/readiness';
import { MitchellSkillCode, mitchellSkillId } from '../skills/skills';
import { mitchellSource } from '../sources/source';
const indicators = [
  ['retrieve-desire', 'Der Welpe zeigt Freude am Retrieve.', 'retrieve_desire'],
  [
    'environment',
    'Der Welpe bewegt sich mit ausreichendem Selbstvertrauen in verschiedenen geeigneten Umwelten.',
    'environmental_confidence',
  ],
  ['engagement', 'Der Welpe arbeitet freiwillig mit dem Handler zusammen.', 'engagement'],
  ['informal-recall', 'Eine Grundlage des informellen Recalls ist vorhanden.', 'informal_recall'],
  ['lead', 'Der Welpe akzeptiert die Leine.', 'leash_introduction'],
  ['sit-stay', 'Erste Sit-/Stay-Grundlagen wurden eingeführt.', 'sit_stay'],
  ['confidence', 'Der Welpe besitzt ausreichendes allgemeines Selbstvertrauen.', 'confidence'],
] as const satisfies readonly (readonly [string, string, MitchellSkillCode])[];
export const PUPPY_HEELWORK_INDICATORS: readonly QualitativeReadinessIndicator[] = indicators.map(
  ([id, description, skill]) => ({
    id: `mitchell:puppy-heelwork:${id}`,
    description,
    relatedSkills: [mitchellSkillId(skill)],
    source: mitchellSource('Puppy Informal Play Training'),
  }),
);
