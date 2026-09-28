import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MitchellStore } from '../../core/application/mitchell-store';
import { DogPicker } from '../../shared/components/dog-picker';
import { SessionCard } from '../../shared/components/session-card';
import { MitchellSessionCard } from '../../shared/components/mitchell-session-card';
@Component({
  selector: 'app-history',
  imports: [RouterLink, DogPicker, SessionCard, MitchellSessionCard],
  template: `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Trainingstagebuch</p>
        <h1>Eure Beobachtungen.</h1>
        <p class="muted">
          {{ store.dogs.selectedDog()?.name ?? 'Dein Hund' }} ·
          {{ store.sessions().length }} Mitchell-Einträge
        </p>
      </div>
      <app-dog-picker />
    </div>
    @for (issue of store.compatibilityIssues(); track issue.id) {
      <p class="review">{{ issue.reason }}</p>
    }
    <div class="history-list">
      @for (session of store.sessions(); track session.id) {
        <app-mitchell-session-card [session]="session" />
      } @empty {
        <section class="card">
          <h2>Noch keine Mitchell-Einträge</h2>
          <p>Dokumentiere eure ersten Beobachtungen.</p>
          <a class="button primary section-space" routerLink="/training">Training dokumentieren</a>
        </section>
      }
    </div>
    @if (store.dogs.sessions().length) {
      <section class="section-space">
        <h2>Bisherige Aufzeichnungen</h2>
        <p class="muted">
          Frühere Trainings und Einschätzungen archivierter Skills bleiben erhalten. Keine Umdeutung
          auf andere Skills.
        </p>
        <div class="history-list section-space">
          @for (session of store.dogs.sessions(); track session.id) {
            <app-session-card [session]="session" />
          }
        </div>
      </section>
    }
  `,
})
export class History {
  readonly store = inject(MitchellStore);
}
