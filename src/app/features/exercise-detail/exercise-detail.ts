import { DIFFICULTY_LABELS } from '../../shared/models/difficulty-labels';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MitchellStore } from '../../core/application/mitchell-store';
import { TrainingSourceComponent } from '../../shared/components/training-source';
import { EFFECT_LABELS } from '../../shared/models/mitchell-labels';
@Component({
  selector: 'app-exercise-detail',
  imports: [RouterLink, TrainingSourceComponent],
  templateUrl: './exercise-detail.html',
})
export class ExerciseDetail {
  readonly store = inject(MitchellStore);
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);
  readonly exercise = computed(() =>
    this.store.catalog.getExercises().find((e) => e.id === this.params()?.get('id')),
  );
  readonly prerequisiteExercises = computed(() =>
    (this.exercise()?.prerequisiteExerciseIds ?? []).map((id) =>
      this.store.catalog.findExercise(id)!,
    ),
  );
  readonly problems = computed(() =>
    this.exercise() ? this.store.catalog.problemsForExercise(this.exercise()!.id) : [],
  );
  readonly handlers = computed(() =>
    this.store.handlerSkills.filter((h) => this.exercise()?.handlerSkills.includes(h.id)),
  );
  readonly effects = EFFECT_LABELS;
  readonly factorLabels = DIFFICULTY_LABELS;
}
