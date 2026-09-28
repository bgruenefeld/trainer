import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { recommendExercise } from '../../core/application/training/training-flow';
import { EFFECT_LABELS } from '../models/mitchell-labels';
@Component({
  selector: 'app-exercise-recommendation',
  imports: [RouterLink],
  template: `@if (recommendation(); as rec) {
      <h3>{{ rec.exercise.title }}</h3>
      <p>{{ rec.stage.title }} · {{ effects[rec.exercise.trainingEffect] }}</p>
      <p>{{ rec.exercise.objective }}</p>
      <a class="button primary" routerLink="/training" [queryParams]="{ exercise: rec.exercise.id }"
        >Training starten</a
      >
      <details>
        <summary>Warum diese Übung?</summary>
        @for (reason of rec.reasons; track reason) {
          <p>{{ reason }}</p>
        }
      </details>
    } @else {
      <p>Für den aktuellen Schwerpunkt ist noch keine konkrete Übung ausgewählt.</p>
      <a class="button primary" routerLink="/training">Übung auswählen</a>
    }`,
})
export class ExerciseRecommendation {
  readonly recommendation = input<ReturnType<typeof recommendExercise>>();
  readonly effects = EFFECT_LABELS;
}
