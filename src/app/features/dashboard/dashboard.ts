import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MitchellStore } from '../../core/application/mitchell-store';
import { DogPicker } from '../../shared/components/dog-picker';
import { ExerciseRecommendation } from '../../shared/components/exercise-recommendation';
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DogPicker, ExerciseRecommendation, DatePipe],
  template: `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Mitchell · Übersicht</p>
        <h1>Gemeinsam weiterlernen.</h1>
      </div>
      <app-dog-picker />
    </div>
    @if (store.dogs.selectedDog(); as dog) {
      <p class="eyebrow">Dein Team</p>
      <h2>Du & {{ dog.name }}</h2>
      <section class="card section-space">
        <h2>Heute</h2>
        <app-exercise-recommendation [recommendation]="store.recommendation()" />
      </section>
      <section class="card section-space">
        <h2>Euer Trainingsweg</h2>
        @if (store.roadmap(); as roadmap) {
          @if (previous(); as prior) {
            <p>Vorheriger Abschnitt: {{ prior.stage.title }} · {{ statuses[prior.status] }}</p>
          }
          <p>
            <strong>Aktueller Schwerpunkt:</strong>
            {{ roadmap.currentStage?.title ?? 'Weiterer Weg als Ausblick' }}
          </p>
          @if (roadmap.nextStage; as next) {
            <p>Nächster vorgesehener Abschnitt: {{ next.title }}</p>
            @if (next.contentStatus === 'planned') {
              <p>Detaillierte Trainingsinhalte werden noch ergänzt.</p>
            }
          }
        }
        <a routerLink="/roadmap">Trainingsplan öffnen</a>
      </section>
      <section class="card section-space">
        <h2>Trainingslage</h2>
        <div class="dashboard-grid">
          @for (group of store.trainingSituation(); track group.title) {
            <div>
              <h3>{{ group.title }}</h3>
              @for (row of group.rows; track row.skill.id) {
                <p>
                  <a [routerLink]="['/skills', row.skill.id]">{{ row.skill.name }}</a>
                </p>
              } @empty {
                <p class="muted">Keine entsprechenden Einschätzungen dokumentiert.</p>
              }
            </div>
          }
        </div>
        @for (finding of store.roadmap()?.attention ?? []; track $index) {
          @if (
            finding.kind === 'needs_attention' &&
            finding.skillId &&
            store.relevantSkillIds().has(finding.skillId)
          ) {
            <p>Hinweis: {{ finding.explanation }}</p>
          }
        }
        @if (store.pendingReassessments().length) {
          <p><a routerLink="/skills">Historische Einschätzungen prüfen</a></p>
        }
        <p class="muted">
          Für spätere Trainingsabschnitte sind noch keine Bewertungen erforderlich.
        </p>
      </section>
      <section class="card section-space">
        <h2>Letztes Training</h2>
        @if (store.sessions()[0]; as session) {
          <p>
            {{ session.startedAt | date: 'dd.MM.yyyy HH:mm' }}
            @if (session.durationMinutes) {
              · {{ session.durationMinutes }} Min.
            }
          </p>
          @for (execution of session.executions; track execution.id) {
            <h3>{{ execution.exerciseSnapshot.title }}</h3>
            <p>{{ skillName(execution.exerciseSnapshot.primarySkill) }}</p>
            @for (stage of contexts(execution.exerciseSnapshot.exerciseId); track stage.id) {
              <p>Aktueller Roadmap-Kontext: {{ stage.title }}</p>
            }
          }
          <p>
            {{
              session.reflection ||
                session.executions[0]?.setup?.environmentNotes ||
                'Keine freie Beobachtung dokumentiert.'
            }}
          </p>
          <a routerLink="/history" [fragment]="session.id">Details</a>
        } @else {
          <p>Noch kein Training dokumentiert.</p>
        }
      </section>
    } @else {
      <a class="button primary" routerLink="/dogs">Hund anlegen</a>
    }
  `,
})
export class Dashboard {
  readonly store = inject(MitchellStore);
  readonly statuses = {
    established: '✓ Etabliert',
    ready_to_progress: '◇ Bereit für den nächsten Abschnitt',
    active: '◐ Im Aufbau',
    not_started: '○ Noch nicht begonnen',
    needs_attention: '⚠ Aufmerksamkeit',
  };
  previous() {
    const roadmap = this.store.roadmap();
    if (!roadmap) return undefined;
    const index = roadmap.stages.findIndex((s) => s.stage.id === roadmap.currentStage?.id);
    return index > 0 ? roadmap.stages[index - 1] : roadmap.establishedStages.at(-1);
  }
  skillName(id: string) {
    return this.store.skills.find((s) => s.id === id)?.name ?? id;
  }
  contexts(id: string) {
    return this.store.roadmapCatalog
      .getRoadmap()
      .stages.filter((s) => s.exerciseIds.some((e) => e === id));
  }
}
