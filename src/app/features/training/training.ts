import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrainerStore } from '../../core/application/trainer-store';
import { TrainingDraft } from '../../core/application/training/training-draft';
import { LINE_OUT } from '../../core/domain/skill/skill';
import {
  PERFORMANCE_CRITERIA,
  Rating,
  TerrainType,
  TrainingMethod,
} from '../../core/domain/training/training';
import {
  CRITERION_LABELS,
  METHOD_DESCRIPTIONS,
  METHOD_LABELS,
  RATING_LABELS,
  TERRAIN_LABELS,
} from '../../shared/models/labels';
@Component({
  selector: 'app-training',
  imports: [FormsModule, RouterLink],
  templateUrl: './training.html',
})
export class Training implements OnInit {
  readonly store = inject(TrainerStore);
  readonly draft = new TrainingDraft();
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly skill = LINE_OUT;
  readonly steps = ['Hund', 'Skill', 'Methode', 'Setup', 'Ergebnis', 'Speichern'];
  readonly methods = Object.keys(METHOD_LABELS) as TrainingMethod[];
  readonly terrains = Object.keys(TERRAIN_LABELS) as TerrainType[];
  readonly criteria = PERFORMANCE_CRITERIA;
  readonly ratings: readonly Rating[] = ['NEEDS_SUPPORT', 'MOSTLY', 'RELIABLE'];
  readonly methodLabels = METHOD_LABELS;
  readonly methodDescriptions = METHOD_DESCRIPTIONS;
  readonly terrainLabels = TERRAIN_LABELS;
  readonly criterionLabels = CRITERION_LABELS;
  readonly ratingLabels = RATING_LABELS;
  ngOnInit(): void {
    this.draft.dogId.set(this.store.selectedDog()?.id);
  }
  async save(): Promise<void> {
    if (this.saving() || this.saved()) return;
    this.saving.set(true);
    this.draft.error.set('');
    try {
      await this.store.saveSession(this.draft.toSession());
      this.saved.set(true);
    } catch (error) {
      this.draft.error.set(
        error instanceof Error
          ? error.message
          : 'Speichern fehlgeschlagen. Deine Eingaben bleiben erhalten.',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
