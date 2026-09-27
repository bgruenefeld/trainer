import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrainerStore } from '../../core/application/trainer-store';
import { DogPicker } from '../../shared/components/dog-picker';
import { SessionCard } from '../../shared/components/session-card';
@Component({
  selector: 'app-history',
  imports: [DogPicker, SessionCard, RouterLink],
  template: `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Euer Trainingstagebuch</p>
        <h1>Was ihr geschafft habt.</h1>
        <p class="muted">
          {{ store.sessions().length }} Einheiten für
          {{ store.selectedDog()?.name ?? 'deinen Hund' }}
        </p>
      </div>
      <app-dog-picker />
    </div>
    <div class="history-list">
      @for (session of store.sessions(); track session.id) {
        <app-session-card [session]="session" />
      } @empty {
        <div class="card empty-state">
          <h2>Noch ganz am Anfang.</h2>
          <p>Hier findest du nach dem Speichern eure Trainingseinheiten.</p>
          <a class="button primary" routerLink="/training">Erstes Training starten</a>
        </div>
      }
    </div>
  `,
})
export class History {
  readonly store = inject(TrainerStore);
}
