import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PERFORMANCE_CRITERIA, TrainingSession } from '../../core/domain/training/training';
import { CRITERION_LABELS, METHOD_LABELS, RATING_LABELS, TERRAIN_LABELS } from '../models/labels';
@Component({
  selector: 'app-session-card',
  imports: [DatePipe],
  template: ` <article class="card session-card">
    <div class="section-top">
      <span class="eyebrow">{{ session().date | date: 'dd.MM.yyyy' }}</span
      ><span class="muted">{{ session().duration }} Min.</span>
    </div>
    @for (run of session().runs; track run.id) {
      <div class="run">
        <h3>
          Voran <span class="method-tag">{{ methods[run.method] }}</span>
        </h3>
        <p class="run-distance">
          {{ run.setup.distanceMeters }} <span>m · {{ terrains[run.setup.terrainType] }}</span>
        </p>
        <div class="performance-summary">
          @for (criterion of criterionKeys; track criterion) {
            @if (run.performance[criterion]; as rating) {
              <span class="badge">{{ criteria[criterion] }}: {{ ratings[rating] }}</span>
            }
          }
          @if (isUnrated(run.performance)) {
            <span class="muted">Ohne Einzelbewertung dokumentiert</span>
          }
        </div>
        @if (run.note) {
          <p class="notes">{{ run.note }}</p>
        }
      </div>
    }
    @if (session().notes) {
      <p class="notes">{{ session().notes }}</p>
    }
  </article>`,
})
export class SessionCard {
  readonly session = input.required<TrainingSession>();
  readonly criterionKeys = PERFORMANCE_CRITERIA;
  readonly isUnrated = (performance: object): boolean => Object.keys(performance).length === 0;
  readonly methods = METHOD_LABELS;
  readonly terrains = TERRAIN_LABELS;
  readonly criteria = CRITERION_LABELS;
  readonly ratings = RATING_LABELS;
}
