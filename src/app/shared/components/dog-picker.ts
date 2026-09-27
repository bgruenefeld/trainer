import { Component, inject } from '@angular/core';
import { TrainerStore } from '../../core/application/trainer-store';
@Component({
  selector: 'app-dog-picker',
  template: ` <label class="dog-picker"
    >Dein Trainingspartner
    <select
      [value]="store.selectedDog()?.id ?? ''"
      (change)="store.selectDog($any($event.target).value)"
    >
      @for (dog of store.dogs(); track dog.id) {
        <option [value]="dog.id">{{ dog.name }}</option>
      }
    </select>
  </label>`,
})
export class DogPicker {
  readonly store = inject(TrainerStore);
}
