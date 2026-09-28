import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MitchellStore } from '../../core/application/mitchell-store';
import { DogPicker } from '../../shared/components/dog-picker';
import {
  CONDITION_LABELS,
  CATEGORY_LABELS,
  COMPETENCE_ICONS,
  COMPETENCE_LABELS,
} from '../../shared/models/mitchell-labels';
import { SkillCategory } from '../../core/domain/skills/skill';
@Component({
  selector: 'app-skill-roadmap',
  imports: [RouterLink, FormsModule, DogPicker],
  template: `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Mitchell · Skill-Übersicht</p>
        <h1>Fähigkeiten entwickeln.</h1>
        <p class="muted">Dein dokumentierter Stand und die Voraussetzungen im Überblick.</p>
      </div>
      <app-dog-picker />
    </div>
    <label
      >Trainingsbereich<select
        id="skill-filter"
        [ngModel]="category()"
        (ngModelChange)="category.set($event)"
      >
        <option value="relevant">Aktuell relevant</option>
        <option value="all">Alle Skills</option>
        @for (key of categories; track key) {
          <option [value]="key">{{ categoryLabels[key] }}</option>
        }
      </select></label
    >
    <p class="local-note">
      🔒 Voraussetzungen fehlen oder sind ungeklärt. Details bleiben zugänglich. Ein Skill-Status
      ist keine automatische Trainingsfreigabe.
    </p>
    <div class="roadmap-grid section-space">
      @for (row of rows(); track row.skill.id) {
        <a class="card roadmap-card" [routerLink]="['/skills', row.skill.id]"
          ><span class="eyebrow">{{ categoryLabels[row.skill.category] }}</span>
          <h2>{{ row.skill.name }}</h2>
          <p>{{ row.skill.purpose }}</p>
          <span class="status-badge" [class.regression]="row.condition === 'regressed'"
            >{{ row.competence ? icons[row.competence] : '○' }}
            {{
              row.reassessmentRequired
                ? 'Neue Einschätzung erforderlich'
                : row.competence
                  ? labels[row.competence!]
                  : 'Noch nicht beurteilt'
            }}</span
          >
          @if (row.condition; as condition) {
            <p>{{ conditionLabels[condition] }}</p>
          }
          @if (row.readiness && row.readiness.status !== 'ready') {
            <p class="readiness-note">
              🔒
              {{
                row.readiness.status === 'not_ready'
                  ? 'Voraussetzungen nicht erfüllt'
                  : 'Voraussetzungen prüfen'
              }}
            </p>
          }
          @for (relation of relations(row.skill.id); track $index) {
            <p>{{ relation }}</p>
          }
          @if (row.focused || store.roadmap()?.currentStage?.skillIds?.includes(row.skill.id)) {
            <span class="badge">Aktueller Schwerpunkt</span>
          }
        </a>
      }
    </div>
  `,
})
export class SkillRoadmap {
  readonly store = inject(MitchellStore);
  readonly conditionLabels = CONDITION_LABELS;
  readonly labels = COMPETENCE_LABELS;
  readonly icons = COMPETENCE_ICONS;
  readonly categoryLabels = CATEGORY_LABELS;
  readonly categories = Object.keys(CATEGORY_LABELS) as SkillCategory[];
  readonly category = signal<SkillCategory | 'all' | 'relevant'>('relevant');
  relations(id: string) {
    const current = new Set([
      ...(this.store.roadmap()?.currentStage?.skillIds ?? []),
      ...(this.store.profile()?.focusSkills ?? []),
    ]);
    return [...current].flatMap((target) =>
      this.store.graph
        .prerequisites(target)
        .filter((edge) => edge.requirement.skillId === id)
        .map(
          (edge) =>
            `${edge.requirement.type === 'hard' ? 'Harte Voraussetzung' : edge.requirement.type === 'soft' ? 'Unterstützende Grundlage' : 'Maintenance-Bezug'} für ${this.store.graph.getSkill(target).name}`,
        ),
    );
  }
  readonly rows = computed(() =>
    this.store
      .rows()
      .filter(
        (row) =>
          this.category() === 'all' ||
          (this.category() === 'relevant'
            ? this.store.relevantSkillIds().has(row.skill.id)
            : row.skill.category === this.category()),
      ),
  );
}
