import { Component, input } from '@angular/core';
import { TrainingSource } from '../../core/domain/sources/training-source';
@Component({
  selector: 'app-training-source',
  template: `<details class="source-note">
    <summary>Quelle und Einordnung</summary>
    <p>{{ source().author }} · {{ source().title }}</p>
    <p>Methode: {{ source().method }}</p>
    @if (source().section; as section) {
      <p>Abschnitt: {{ section }}</p>
    }
    @switch (source().evidence.kind) {
      @case ('provided_summary') {
        <p>
          Bereitgestellte fachliche Zusammenfassung; Einzelheiten zur Herkunft stehen in der
          Referenz.
        </p>
      }
      @case ('book_verified') {
        <p>An einer Buchstelle geprüft.</p>
      }
      @case ('needs_verification') {
        <p>Quellenzuordnung noch offen.</p>
      }
    }
    <p>{{ evidenceText() }}</p>
  </details>`,
})
export class TrainingSourceComponent {
  readonly source = input.required<TrainingSource>();
  evidenceText(): string {
    const evidence = this.source().evidence;
    return evidence.kind === 'provided_summary'
      ? evidence.reference
      : evidence.kind === 'book_verified'
        ? `${evidence.edition} · ${evidence.locator}`
        : evidence.reason;
  }
}
