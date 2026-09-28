import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MitchellStore } from '../../core/application/mitchell-store';
import { EFFECT_LABELS } from '../../shared/models/mitchell-labels';
@Component({
  selector: 'app-puppy-foundation',
  imports: [RouterLink],
  template: `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Mitchell · Puppy Foundation</p>
        <h1>Freude an Zusammenarbeit.</h1>
        <p class="muted">
          Sieben eigenständige Module. Keine feste Reihenfolge, keine Altersfreigaben.
        </p>
      </div>
    </div>
    <p class="review">
      Motivation und Zusammenarbeit stehen im Mittelpunkt. Kontrollarbeit nimmt in dieser Phase nur
      einen geringen Anteil ein.
    </p>
    <div class="roadmap-grid section-space">
      @for (exercise of exercises; track exercise.id; let i = $index) {
        <a class="card roadmap-card" [routerLink]="['/exercises', exercise.id]"
          ><span class="eyebrow">Modul {{ i + 1 }}</span>
          <h2>{{ exercise.title }}</h2>
          <p>{{ exercise.objective }}</p>
          <span class="badge">{{ effects[exercise.trainingEffect] }}</span>
          @if (!exercise.steps.length) {
            <p class="readiness-note">Konkrete Durchführung noch nicht beschrieben.</p>
          }
        </a>
      }
    </div>
    <section class="card section-space">
      <h2>Der Übergang zur Fußarbeit</h2>
      <p>
        Orientierung, Apportierfreude, Umweltsicherheit und weitere qualitative Beobachtungen helfen
        bei der Einschätzung.
      </p>
      <a class="button section-space" routerLink="/skills/mitchell:heelwork"
        >Readiness gemeinsam prüfen →</a
      >
    </section>
  `,
})
export class PuppyFoundation {
  readonly store = inject(MitchellStore);
  readonly exercises = this.store.puppyExercises;
  readonly effects = EFFECT_LABELS;
}
