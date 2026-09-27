import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TrainerStore } from '../../core/application/trainer-store';
@Component({
  selector: 'app-dogs',
  imports: [FormsModule, DatePipe],
  template: ` <div class="page-heading">
      <div>
        <p class="eyebrow">Euer Team</p>
        <h1>Meine Hunde</h1>
        <p class="muted">Für jeden Hund eine eigene Trainingsgeschichte.</p>
      </div>
    </div>
    <div class="two-columns">
      <section class="dog-list">
        @for (dog of store.dogs(); track dog.id) {
          <article class="card dog-card">
            <span class="avatar">{{ dog.name.charAt(0) }}</span>
            <div>
              <h2>{{ dog.name }}</h2>
              <p>{{ dog.breed }}</p>
              <p class="muted">Geboren am {{ dog.dateOfBirth | date: 'dd.MM.yyyy' }}</p>
            </div>
            <button
              type="button"
              [class.selected]="store.selectedDog()?.id === dog.id"
              [attr.aria-pressed]="store.selectedDog()?.id === dog.id"
              (click)="store.selectDog(dog.id)"
            >
              {{ store.selectedDog()?.id === dog.id ? 'Ausgewählt' : 'Auswählen' }}
            </button>
          </article>
        }
      </section>
      <section class="card">
        <h2>Hund hinzufügen</h2>
        <form #form="ngForm" (ngSubmit)="save()">
          <label
            >Name<input name="name" [(ngModel)]="name" required maxlength="80" autocomplete="off"
          /></label>
          <label
            >Rasse<input
              name="breed"
              [(ngModel)]="breed"
              required
              maxlength="100"
              autocomplete="off"
          /></label>
          <label
            >Geburtsdatum<input name="birth" [(ngModel)]="birth" type="date" required [max]="today"
          /></label>
          <label
            >Geschlecht <span class="muted">(optional)</span
            ><select name="sex" [(ngModel)]="sex">
              <option value="">Keine Angabe</option>
              <option value="MALE">Rüde</option>
              <option value="FEMALE">Hündin</option>
            </select></label
          >
          @if (error()) {
            <p class="error" role="alert">{{ error() }}</p>
          }
          @if (saved()) {
            <p class="success" role="status">Hund angelegt und ausgewählt.</p>
          }
          <button class="primary full-width" type="submit" [disabled]="form.invalid || busy()">
            {{ busy() ? 'Wird gespeichert …' : 'Hund speichern' }}
          </button>
        </form>
      </section>
    </div>`,
})
export class Dogs {
  readonly store = inject(TrainerStore);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly saved = signal(false);
  readonly today = new Date().toISOString().slice(0, 10);
  name = '';
  breed = 'Labrador Retriever';
  birth = '';
  sex: '' | 'MALE' | 'FEMALE' = '';
  async save(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.saved.set(false);
    try {
      await this.store.addDog({
        name: this.name,
        breed: this.breed,
        dateOfBirth: this.birth,
        ...(this.sex ? { sex: this.sex } : {}),
      });
      this.name = '';
      this.birth = '';
      this.saved.set(true);
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Speichern fehlgeschlagen. Bitte erneut versuchen.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
