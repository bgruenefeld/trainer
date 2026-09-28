import { entityId } from '../../../core/domain/shared/identity';
import { TrainingSource, TrainingSystem } from '../../../core/domain/sources/training-source';
export const MITCHELL_SYSTEM_ID = entityId<'TrainingSystem'>('mitchell');
export const CANONICAL_REFERENCE =
  'Kanonischer Seed: fachlich aus bereitgestellten Buchseiten extrahierte Informationen; laut Nutzer geprüft. Edition nicht angegeben.';
export type MitchellSection =
  | 'My Philosophy And Views For Retriever Training'
  | 'General Retriever Training'
  | 'The Plan – Your Plan To Turn Your Aspiration Into A Reality'
  | 'Puppy Informal Play Training'
  | 'Heelwork';
export function mitchellSource(section?: MitchellSection): TrainingSource {
  return {
    systemId: MITCHELL_SYSTEM_ID,
    author: 'Wayne Mitchell',
    title: "Retriever Trainer's Handbook",
    method: 'Mitchell',
    ...(section ? { section } : {}),
    evidence: { kind: 'provided_summary', reference: CANONICAL_REFERENCE },
  };
}
export const MITCHELL_SYSTEM: TrainingSystem = {
  id: MITCHELL_SYSTEM_ID,
  name: 'Mitchell',
  catalogVersion: '2.1.0',
  source: mitchellSource(),
};
