import { COMPETENCE_LABELS } from '../../shared/models/mitchell-labels';
import { ExerciseId } from '../../core/domain/shared/identity';
import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MitchellStore } from '../../core/application/mitchell-store';
import { DogPicker } from '../../shared/components/dog-picker';
import { TrainingSourceComponent } from '../../shared/components/training-source';
import { RoadmapStageId } from '../../core/domain/shared/identity';
import {
  RoadmapStageStatus,
  RoadmapFinding,
} from '../../core/domain/training-plan/training-roadmap';
@Component({
  selector: 'app-training-roadmap',
  imports: [RouterLink, DogPicker, TrainingSourceComponent, DatePipe],
  templateUrl: './training-roadmap.html',
})
export class TrainingRoadmapComponent {
  readonly store = inject(MitchellStore);
  exerciseSkillState(id: ExerciseId): string {
    const exercise = this.store.catalog.findExercise(id);
    const assessment = exercise ? this.store.latest().get(exercise.primarySkill) : undefined;
    return assessment ? COMPETENCE_LABELS[assessment.competence] : 'Noch nicht beurteilt';
  }
  readonly error = signal('');
  readonly notice = signal('');
  readonly statuses: Record<RoadmapStageStatus, string> = {
    not_started: '○ Noch nicht begonnen',
    active: '◐ Im Aufbau',
    ready_to_progress: '◇ Bereit für den nächsten Abschnitt',
    established: '✓ Etabliert',
    needs_attention: '⚠ Aufmerksamkeit erforderlich',
  };
  readonly findings: Record<RoadmapFinding, string> = {
    not_yet_relevant: 'Später vorgesehen',
    current_focus: 'Aktueller Schwerpunkt',
    needs_attention: '⚠ Prüfbedarf',
    maintenance_due: '↻ Pflegebedarf',
    regression: '⚠ Rückschritt',
  };
  async focus(id?: RoadmapStageId): Promise<void> {
    this.error.set('');
    this.notice.set('');
    try {
      await this.store.setRoadmapFocus(id);
      this.notice.set('Schwerpunkt gespeichert.');
    } catch {
      this.error.set('Schwerpunkt konnte nicht gespeichert werden. Bitte erneut versuchen.');
    }
  }
}
