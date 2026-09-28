import { TrainingSystemId, requireText } from '../shared/identity';
/** Herkunft der Abstraktion ist von der behaupteten Buchquelle getrennt. */
export type SourceEvidence =
  | { readonly kind: 'provided_summary'; readonly reference: string }
  | { readonly kind: 'book_verified'; readonly locator: string; readonly edition: string }
  | { readonly kind: 'needs_verification'; readonly reason: string };
export interface TrainingSource {
  readonly systemId: TrainingSystemId;
  readonly author: string;
  readonly title: string;
  readonly method: string;
  readonly section?: string;
  readonly chapter?: string;
  readonly evidence: SourceEvidence;
}
export interface TrainingSystem {
  readonly id: TrainingSystemId;
  readonly name: string;
  readonly catalogVersion: string;
  readonly source: TrainingSource;
}
export interface SourcedStatement {
  readonly text: string;
  readonly source: TrainingSource;
}
export function validateSource(source: TrainingSource): void {
  requireText(source.systemId, 'System-ID');
  requireText(source.author, 'Autor');
  requireText(source.title, 'Titel');
  requireText(source.method, 'Methode');
  switch (source.evidence.kind) {
    case 'provided_summary':
      requireText(source.evidence.reference, 'Zusammenfassungsreferenz');
      break;
    case 'book_verified':
      requireText(source.evidence.locator, 'Buchstelle');
      requireText(source.evidence.edition, 'Ausgabe');
      break;
    case 'needs_verification':
      requireText(source.evidence.reason, 'Offene Quellenfrage');
      break;
    default:
      throw new Error('Unbekannter Quellenstatus.');
  }
}
