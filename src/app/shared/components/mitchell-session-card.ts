import { DIFFICULTY_LABELS } from '../models/difficulty-labels';
import { RouterLink } from '@angular/router';
import { MitchellStore } from '../../core/application/mitchell-store';
import { Component, input, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TrainingSession } from '../../core/domain/training-session/training-session';
import { EFFECT_LABELS } from '../models/mitchell-labels';
@Component({
  selector: 'app-mitchell-session-card',
  imports: [DatePipe, RouterLink],
  template: `
    <article class="card" [id]="session().id">
      <div class="section-top">
        <span class="eyebrow">{{ session().startedAt | date: 'dd.MM.yyyy HH:mm' }}</span>
        @if (session().durationMinutes; as duration) {
          <span>{{ duration }} Min.</span>
        }
      </div>
      @for (execution of session().executions; track execution.id) {
        <h2>{{ execution.exerciseSnapshot.title }}</h2>
        <p>
          Skills im Snapshot:
          @for (
            id of [
              execution.exerciseSnapshot.primarySkill,
              ...execution.exerciseSnapshot.secondarySkills,
            ];
            track id
          ) {
            @if (skill(id); as known) {
              <a [routerLink]="['/skills', id]">{{ known.name }}</a>
            } @else {
              <span>{{ id }} (historischer Skill)</span>
            }
          }
        </p>
        @for (stage of contexts(execution.exerciseSnapshot.exerciseId); track stage.id) {
          <p>
            Aktueller Roadmap-Kontext:
            <a routerLink="/roadmap" [fragment]="stage.id">{{ stage.title }}</a>
          </p>
        }
        <p class="muted">{{ effects[execution.exerciseSnapshot.trainingEffect] }}</p>
        <p class="notes">{{ execution.setup.environmentNotes }}</p>
        @if (execution.setup.handlerPositionNotes) {
          <p class="notes">Handler: {{ execution.setup.handlerPositionNotes }}</p>
        }
        @for (factor of execution.setup.factors; track factor.factor) {
          <p>{{ factorText(factor) }}</p>
        }
        <div class="chip-list section-space">
          @for (criterion of execution.criteria; track criterion.criterionId) {
            <span class="badge"
              >{{
                criterionTitle(execution.exerciseSnapshot.successCriteria, criterion.criterionId)
              }}: {{ ratings[criterion.result] }}</span
            >
          } @empty {
            <p class="muted">Ohne Einzelbewertungen dokumentiert.</p>
          }
        </div>
      }
      @if (session().reflection) {
        <p class="notes">{{ session().reflection }}</p>
      }
    </article>
  `,
})
export class MitchellSessionCard {
  readonly store = inject(MitchellStore);
  skill(id: string) {
    return this.store.skills.find((s) => s.id === id);
  }
  contexts(id: string) {
    return this.store.roadmapCatalog
      .getRoadmap()
      .stages.filter((s) => s.exerciseIds.some((e) => e === id));
  }
  factorText(factor: import('../../core/domain/exercises/difficulty').DifficultySetting) {
    return 'description' in factor
      ? `${DIFFICULTY_LABELS[factor.factor]}: ${factor.description}`
      : `${factor.value}${'unit' in factor ? ' ' + factor.unit : ''}${'note' in factor && factor.note ? ' · ' + factor.note : ''} · ${DIFFICULTY_LABELS[factor.factor]}`;
  }
  readonly session = input.required<TrainingSession>();
  readonly effects = EFFECT_LABELS;
  readonly ratings = {
    observed: 'Beobachtet',
    partly_observed: 'Teilweise',
    not_observed: 'Nicht beobachtet',
  };
  criterionTitle(
    criteria: readonly { readonly id: string; readonly description: string }[] | undefined,
    id: string,
  ): string {
    return criteria?.find((c) => c.id === id)?.description ?? 'Dokumentiertes Kriterium';
  }
}
