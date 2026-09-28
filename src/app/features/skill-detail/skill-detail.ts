import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MitchellStore } from '../../core/application/mitchell-store';
import {
  SKILL_COMPETENCES,
  SKILL_CONDITIONS,
  SkillCompetence,
  SkillCondition,
} from '../../core/domain/skills/skill';
import { COMPETENCE_LABELS, CONDITION_LABELS } from '../../shared/models/mitchell-labels';
import { DogPicker } from '../../shared/components/dog-picker';
import { TrainingSourceComponent } from '../../shared/components/training-source';
@Component({
  selector: 'app-skill-detail',
  imports: [RouterLink, FormsModule, DatePipe, DogPicker, TrainingSourceComponent],
  templateUrl: './skill-detail.html',
})
export class SkillDetail {
  readonly store = inject(MitchellStore);
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);
  readonly row = computed(() =>
    this.store.rows().find((row) => row.skill.id === this.params()?.get('id')),
  );
  readonly exercises = computed(() =>
    this.row() ? this.store.catalog.forSkill(this.row()!.skill.id) : [],
  );
  readonly dependencies = computed(() =>
    this.row() ? this.store.graph.prerequisites(this.row()!.skill.id) : [],
  );
  readonly dependents = computed(() =>
    this.row() ? this.store.graph.dependents(this.row()!.skill.id) : [],
  );
  readonly problems = computed(() =>
    this.store.catalog
      .getProblems()
      .filter((problem) => this.row() && problem.relatedSkills.includes(this.row()!.skill.id)),
  );
  readonly history = computed(() =>
    this.store
      .assessments()
      .filter((a) => a.skillId === this.row()?.skill.id)
      .sort((a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt)),
  );
  readonly skillIndicators = computed(() =>
    this.row()?.skill.code === 'heelwork' ? this.store.indicators : [],
  );
  readonly physical = computed(() =>
    this.store.constraints.filter(
      (c) => this.row() && c.affectedSkills.includes(this.row()!.skill.id),
    ),
  );
  readonly states = SKILL_COMPETENCES;
  readonly labels = COMPETENCE_LABELS;
  readonly error = signal('');
  readonly notice = signal('');
  readonly conditions = SKILL_CONDITIONS;
  readonly conditionLabels = CONDITION_LABELS;
  condition: SkillCondition = 'normal';
  competence: SkillCompetence | '' = 'not_started';
  context = '';
  rationale = '';
  indicatorValues: Record<string, 'met' | 'not_met' | 'unknown'> = {};
  indicatorNotes: Record<string, string> = {};
  constraintValues: Record<string, 'clear' | 'restricted' | 'unknown'> = {};
  constraintNotes: Record<string, string> = {};
  constructor() {
    effect(() => {
      this.store.dogs.selectedDog();
      this.params();
      untracked(() => {
        const row = this.row();
        this.competence = row?.reassessmentRequired ? '' : (row?.competence ?? 'not_started');
        this.condition = row?.condition ?? 'normal';
        this.context = '';
        this.rationale = '';
        this.error.set('');
        this.notice.set('');
        const profile = this.store.profile();
        this.indicatorValues = {};
        this.indicatorNotes = {};
        for (const i of profile?.indicators ?? []) {
          this.indicatorValues[i.indicatorId] = i.result;
          this.indicatorNotes[i.indicatorId] = i.rationale;
        }
        this.constraintValues = {};
        this.constraintNotes = {};
        for (const c of profile?.constraints ?? []) {
          this.constraintValues[c.constraintId] = c.status;
          this.constraintNotes[c.constraintId] = c.rationale;
        }
      });
    });
  }
  async perform(action: () => Promise<void>): Promise<void> {
    this.error.set('');
    this.notice.set('');
    try {
      await action();
      this.notice.set('Gespeichert.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.');
    }
  }
  save(): void {
    const row = this.row();
    if (row && this.competence)
      void this.perform(() =>
        this.store.assess(
          row.skill.id,
          this.competence as SkillCompetence,
          this.context,
          this.rationale,
          this.condition,
        ),
      );
  }
  focus(): void {
    const row = this.row();
    if (row) void this.perform(() => this.store.toggleFocus(row.skill.id));
  }
  saveIndicator(id: string): void {
    void this.perform(() =>
      this.store.saveIndicator(
        id,
        this.indicatorValues[id] ?? 'unknown',
        this.indicatorNotes[id] ?? '',
      ),
    );
  }
  constraint(id: string): void {
    void this.perform(() =>
      this.store.saveConstraint(
        id,
        this.constraintValues[id] ?? 'unknown',
        this.constraintNotes[id] ?? '',
      ),
    );
  }
}
