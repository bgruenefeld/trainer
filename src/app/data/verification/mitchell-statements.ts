import { SourcedStatement } from '../../core/domain/sources/training-source';
import { mitchellSource } from '../mitchell/sources/source';
/** Außerhalb des aktiven Seeds; keine Policies oder Dependencies importieren diese Kandidaten. */
export const MITCHELL_VERIFICATION_CANDIDATES: readonly SourcedStatement[] = [
  {
    text: 'Handling soll ausreichend entwickelt sein, bevor Hunting und Marking einen großen Trainingsanteil bekommen. Welche einzelnen Skills und Zustände dies genau abbilden, bleibt zu klären.',
    source: {
      ...mitchellSource(),
      evidence: {
        kind: 'needs_verification',
        reason:
          'Aus früher bereitgestelltem Material erhalten; bei der Kapitelanalyse von Handling, Hunting und Marking erneut prüfen.',
      },
    },
  },
  {
    text: 'Körperliche Reife bei der Beurteilung von Sprungarbeit berücksichtigen.',
    source: {
      ...mitchellSource(),
      evidence: {
        kind: 'needs_verification',
        reason:
          'Frühere Aussage zu Jumping; bei Auswertung des betreffenden Kapitels erneut prüfen.',
      },
    },
  },
];
