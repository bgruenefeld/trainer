import { DatePipe } from '@angular/common';
import { ExercisePreparation } from '../../shared/components/exercise-preparation';
import { nextExercises } from '../../core/application/training/training-flow';
import { EFFECT_LABELS } from '../../shared/models/mitchell-labels';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MitchellStore } from '../../core/application/mitchell-store';
import { PuppyDraft } from '../../core/application/training/puppy-draft';
import { TrainingExercise } from '../../core/domain/exercises/training-exercise';
import { DogId } from '../../core/domain/dog/dog';
@Component({
  selector: 'app-puppy-training',
  imports: [FormsModule, RouterLink, DatePipe, ExercisePreparation],
  templateUrl: './puppy-training.html',
})
export class PuppyTraining {
  readonly store = inject(MitchellStore);
  readonly draft = signal<PuppyDraft | undefined>(undefined);
  readonly error = signal('');
  readonly saved = signal(false);
  readonly exercises = this.store.catalog.getExercises();
  dogId: string = this.store.dogs.selectedDog()?.id ?? '';
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap);
  exerciseId: string | undefined;
  readonly effects = EFFECT_LABELS;
  readonly factorLabels: Record<string, string> = {
    distance: 'Distanz (m)',
    handler_distance: 'Handlerabstand (m)',
    duration: 'Übungsdauer (Sekunden)',
    delay: 'Verzögerung (Sekunden)',
    number_of_retrieves: 'Anzahl Apporte',
    angle: 'Winkel (Grad)',
    obstacle_angle: 'Hinderniswinkel (Grad)',
    terrain: 'Gelände',
    distractions: 'Ablenkung',
    novelty: 'Neuheit',
    turn_angle: 'Richtungswechselwinkel',
    pace_variation: 'Tempowechsel',
    cover: 'Bewuchs',
    obstacle: 'Hindernis',
    scent_availability: 'Witterungsverfügbarkeit',
    visibility: 'Sichtbarkeit',
    wind_direction: 'Windrichtung',
  };
  numeric(factor: string) {
    return [
      'distance',
      'handler_distance',
      'duration',
      'delay',
      'number_of_retrieves',
      'angle',
      'obstacle_angle',
    ].includes(factor);
  }
  groups() {
    const stages = this.store.roadmapCatalog
      .getRoadmap()
      .stages.filter((s) => s.contentStatus === 'available');
    const current = this.store.roadmap()?.currentStage;
    const currentIds = current?.contentStatus === 'available' ? current.exerciseIds : [];
    return [
      {
        title: 'Aktueller Schwerpunkt',
        exercises: this.exercises.filter((e) => currentIds.includes(e.id)),
      },
      ...stages.map((s) => ({
        title: s.title,
        exercises: this.exercises.filter(
          (e) => s.exerciseIds.includes(e.id) && !currentIds.includes(e.id),
        ),
      })),
      {
        title: 'Weitere Übungen',
        exercises: this.exercises.filter((e) => !stages.some((s) => s.exerciseIds.includes(e.id))),
      },
    ].filter((g) => g.exercises.length);
  }
  following() {
    return this.draft() ? nextExercises(this.draft()!.exercise, this.exercises) : [];
  }
  activeHints() {
    const e = this.draft()!.exercise;
    return [...new Set([...(e.guidance?.notes ?? []), ...e.steps.map((s) => s.instruction)])].slice(
      0,
      4,
    );
  }
  partiallyObserved() {
    return Object.values(this.draft()?.ratings() ?? {}).includes('partly_observed');
  }
  repeat() {
    const exercise = this.draft()!.exercise;
    this.saved.set(false);
    this.draft.set(new PuppyDraft(this.draft()!.dogId, exercise));
  }
  choose(id: string) {
    this.exerciseId = id;
    this.start();
  }

  readonly choices = [
    { value: 'observed', label: 'Beobachtet' },
    { value: 'partly_observed', label: 'Teilweise' },
    { value: 'not_observed', label: 'Nicht beobachtet' },
  ] as const;
  exercise(): TrainingExercise | undefined {
    return this.exercises.find((e) => e.id === (this.exerciseId ?? this.params()?.get('exercise')));
  }
  start(): void {
    this.error.set('');
    const exercise = this.exercise();
    if (!exercise || !this.store.dogs.dogs().some((d) => d.id === this.dogId)) {
      this.error.set('Bitte Hund und Übung auswählen.');
      return;
    }
    this.saved.set(false);
    this.draft.set(new PuppyDraft(this.dogId as DogId, exercise));
  }
  async save(): Promise<void> {
    const draft = this.draft();
    if (!draft || this.store.busy() || this.saved()) return;
    draft.error.set('');
    try {
      await this.store.saveSession(draft.session());
      this.store.dogs.selectDog(draft.dogId);
      this.saved.set(true);
    } catch (error) {
      draft.error.set(
        error instanceof Error
          ? error.message
          : 'Speichern fehlgeschlagen. Deine Eingaben bleiben erhalten.',
      );
    }
  }
  dogName(id: string): string {
    return this.store.dogs.dogs().find((d) => d.id === id)?.name ?? 'Hund';
  }
}
