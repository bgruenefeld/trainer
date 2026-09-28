import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrainingExercise } from '../../core/domain/exercises/training-exercise';
import { HandlerSkillDefinition } from '../../core/domain/handler/handler-skill';
import { TrainingSourceComponent } from './training-source';
@Component({
  selector: 'app-exercise-preparation',
  imports: [RouterLink, TrainingSourceComponent],
  template: ` <h2>Ziel</h2>
    <p>{{ exercise().objective }}</p>
    @if (!exercise().steps.length) {
      <p class="review">
        Für diese Übung liegt derzeit noch keine vollständige Schritt-für-Schritt-Anleitung vor.
      </p>
    }
    <h2>Aufbau</h2>
    @for (line of setup(); track $index) {
      <p>{{ line }}</p>
    } @empty {
      <p>Kein weiterer Aufbau beschrieben.</p>
    }
    @for (step of exercise().steps; track step.id) {
      <p>{{ step.instruction }}</p>
    }
    <h2>Handler</h2>
    @for (handler of handlers(); track handler.id) {
      @if (exercise().handlerSkills.includes(handler.id)) {
        <p>{{ handler.name }}: {{ handler.purpose }}</p>
      }
    }
    @for (step of exercise().steps; track step.id) {
      @for (line of step.handlerBehaviour; track $index) {
        <p>{{ line }}</p>
      }
    }
    <h2>Heute beachten</h2>
    <p>Quellenbezogene Hinweise der Mitchell-Methode.</p>
    @for (note of exercise().guidance?.notes ?? []; track $index) {
      <p>{{ note }}</p>
    }
    @for (note of exercise().cautions; track $index) {
      <p>{{ note }}</p>
    }
    @for (id of exercise().prerequisiteExerciseIds ?? []; track id) {
      @for (prior of exercises(); track prior.id) {
        @if (prior.id === id) {
          <p>
            Baut auf <a [routerLink]="['/exercises', id]">{{ prior.title }}</a> auf. Keine
            automatische Trainingssperre.
          </p>
        }
      }
    }
    <h2>Erfolgskriterien</h2>
    <ul>
      @for (criterion of exercise().successCriteria; track criterion.id) {
        <li>{{ criterion.description }}</li>
      }
    </ul>
    <app-training-source [source]="exercise().source" />`,
})
export class ExercisePreparation {
  readonly exercise = input.required<TrainingExercise>();
  readonly exercises = input<readonly TrainingExercise[]>([]);
  readonly handlers = input<readonly HandlerSkillDefinition[]>([]);
  setup() {
    const setup = this.exercise().setup;
    return [...setup.instructions, ...setup.conditions, ...setup.equipment];
  }
}
