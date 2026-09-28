import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ArchivedTraining } from '../../core/application/training-archive';
@Component({
  selector: 'app-session-card',
  imports: [DatePipe],
  template: `<article class="card session-card">
    <span class="eyebrow">Archiv · {{ session().date | date: 'dd.MM.yyyy' }}</span>
    @if (session().duration; as duration) {
      <p>{{ duration }} Min.</p>
    }
    <p class="notes">{{ session().notes }}</p>
    <details>
      <summary>Ursprüngliche Trainingsdaten</summary>
      @for (detail of session().details; track $index) {
        <p class="notes">{{ detail }}</p>
      }
    </details>
  </article>`,
})
export class SessionCard {
  readonly session = input.required<ArchivedTraining>();
}
