import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrainerStore } from '../../core/application/trainer-store';
import { DogPicker } from '../../shared/components/dog-picker';
import { SessionCard } from '../../shared/components/session-card';
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DogPicker, SessionCard],
  template: `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Draußen. Zusammen. Weiter.</p>
        <h1>Bereit fürs Training?</h1>
        <p class="muted">Ein guter Moment für euch zwei.</p>
      </div>
      <app-dog-picker />
    </div>
    @if (store.selectedDog(); as dog) {
      <section class="partner-card">
        <div class="partner-copy">
          <span class="eyebrow">Dein Team</span>
          <h2>Du & {{ dog.name }}</h2>
          <p>{{ dog.breed }}</p>
          <a class="button primary" routerLink="/training"
            >Training starten <span aria-hidden="true">↗</span></a
          >
        </div>
        @if (dog.photoUrl) {
          <img
            class="partner-photo"
            [src]="dog.photoUrl"
            [alt]="
              dog.id === 'demo-reggae' ? 'Labrador Retriever – Beispielfoto für Reggae' : dog.name
            "
            width="280"
            height="280"
          />
        } @else {
          <div class="dog-initial" aria-hidden="true">{{ dog.name.charAt(0) }}</div>
        }
      </section>
      @if (dog.id === 'demo-reggae') {
        <p class="photo-credit">
          Beispielfoto:
          <a href="https://commons.wikimedia.org/wiki/File:Labrador_Retriever_yellow_portrait.jpg"
            >Franca</a
          >
          · <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a> · Ausschnitt
        </p>
      }
      <div class="dashboard-grid">
        <section>
          <div class="section-top">
            <h2>Letztes Training</h2>
            <a routerLink="/history">Alle ansehen →</a>
          </div>
          @if (store.latest(); as session) {
            <app-session-card [session]="session" />
          } @else {
            <div class="card">
              <h3>Euer erster Eintrag wartet.</h3>
              <p>Starte ein Training und halte fest, was ihr geübt habt.</p>
            </div>
          }
        </section>
        <section>
          <div class="section-top">
            <h2>Trainingsschwerpunkt</h2>
            <span class="small-label">Zum Einstieg</span>
          </div>
          <div class="card focus-card">
            <span class="direction-icon" aria-hidden="true">↑</span>
            <div>
              <h3>Eine klare Linie.</h3>
              <p>
                Beim Voran übt ihr den geraden Weg zum Ziel. Wähle die Bedingungen passend für euch.
              </p>
            </div>
            <a routerLink="/training">Voran trainieren →</a>
          </div>
        </section>
      </div>
      <section class="skills-section">
        <div class="section-top">
          <h2>Trainingsbereiche</h2>
          <span class="muted">1 Skill verfügbar</span>
        </div>
        <a class="card skill-card" routerLink="/training"
          ><span class="skill-number">01</span>
          <div>
            <h3>Voran</h3>
            <p>Gerade Linie. Selbstständig zum Ziel.</p>
          </div>
          <span class="skill-count">5 Methoden <span aria-hidden="true">↗</span></span></a
        >
      </section>
      <p class="local-note">
        Auf diesem Gerät gespeichert. Reggaes Beispieltrainings zeigen verschiedene Bedingungen,
        keine berechnete Progression.
      </p>
    } @else {
      <div class="card">
        <h2>Wer trainiert mit dir?</h2>
        <a class="button primary" routerLink="/dogs">Hund anlegen</a>
      </div>
    }
  `,
})
export class Dashboard {
  readonly store = inject(TrainerStore);
}
