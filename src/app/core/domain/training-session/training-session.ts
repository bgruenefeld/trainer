import { DogId } from '../dog/dog';
import { ExecutionSetup } from '../exercises/training-exercise';
import { validateDifficultySettings } from '../exercises/difficulty';
import {
  CriterionId,
  HandlerId,
  HandlerSkillId,
  ObservationId,
  RoadmapId,
  SkillId,
  TrainingProblemId,
  TrainingSessionId,
  TrainingSystemId,
  requireText,
  requireTimestamp,
} from '../shared/identity';
import { ExerciseSnapshot, validateExerciseSnapshot } from './exercise-snapshot';
import { RetrievePhase } from './retrieve';
export type ObservationTarget =
  | { readonly kind: 'dog_skill'; readonly skillId: SkillId }
  | { readonly kind: 'handler_skill'; readonly skillId: HandlerSkillId }
  | { readonly kind: 'retrieve_phase'; readonly phase: RetrievePhase }
  | { readonly kind: 'environment' };
export interface TrainingObservation {
  readonly id: ObservationId;
  readonly target: ObservationTarget;
  readonly description: string;
  readonly recordedAt: string;
  readonly recordedBy: HandlerId;
  /** Ungeprüfte Hypothesen; keine automatisch bestätigte Diagnose. */
  readonly possibleProblems: readonly TrainingProblemId[];
}
export interface CriterionObservation {
  readonly criterionId: CriterionId;
  readonly result: 'observed' | 'partly_observed' | 'not_observed';
  readonly note?: string;
}
export interface ExerciseExecution {
  readonly id: string;
  readonly exerciseSnapshot: ExerciseSnapshot;
  readonly setup: ExecutionSetup;
  /** Fehlende Kriterien sind unbewertet. */
  readonly criteria: readonly CriterionObservation[];
  readonly observations: readonly TrainingObservation[];
  readonly notes: string;
}
export interface TrainingSession {
  readonly schemaVersion: 3;
  readonly id: TrainingSessionId;
  readonly dogId: DogId;
  readonly handlerId: HandlerId;
  readonly systemId: TrainingSystemId;
  readonly roadmapId?: RoadmapId;
  readonly startedAt: string;
  /** Tatsächliche Dauer, keine Trainingsvorgabe. */
  readonly durationMinutes?: number;
  readonly executions: readonly ExerciseExecution[];
  readonly reflection: string;
}
export function validateTrainingSession(session: TrainingSession): void {
  if (session.schemaVersion !== 3) throw new Error('Unbekannte Session-Version.');
  requireText(session.id, 'Session-ID');
  requireText(session.dogId, 'Hund-ID');
  requireText(session.handlerId, 'Handler-ID');
  requireText(session.systemId, 'System-ID');
  requireTimestamp(session.startedAt);
  if (
    session.durationMinutes !== undefined &&
    (!Number.isFinite(session.durationMinutes) || session.durationMinutes <= 0)
  )
    throw new Error('Eine dokumentierte Dauer muss positiv und endlich sein.');
  if (!session.executions.length)
    throw new Error('Mindestens eine Übungsausführung ist erforderlich.');
  if (
    new Set(session.executions.map((execution) => execution.id)).size !== session.executions.length
  )
    throw new Error('Ausführungs-IDs müssen eindeutig sein.');
  const observationIds = session.executions.flatMap((execution) =>
    execution.observations.map((observation) => observation.id),
  );
  if (new Set(observationIds).size !== observationIds.length)
    throw new Error('Beobachtungs-IDs müssen innerhalb der Session eindeutig sein.');
  for (const execution of session.executions) {
    requireText(execution.id, 'Ausführungs-ID');
    validateExerciseSnapshot(execution.exerciseSnapshot);
    if (execution.exerciseSnapshot.systemId !== session.systemId)
      throw new Error('Ausführung und Session müssen zum selben System gehören.');
    if (
      execution.criteria.some(
        (c) => !execution.exerciseSnapshot.successCriteria.some((s) => s.id === c.criterionId),
      )
    )
      throw new Error('Unbekanntes Erfolgskriterium.');
    validateDifficultySettings(execution.setup.factors);
    if (
      new Set(execution.criteria.map((criterion) => criterion.criterionId)).size !==
      execution.criteria.length
    )
      throw new Error('Ein Erfolgskriterium darf je Ausführung nur einmal bewertet werden.');
    for (const observation of execution.observations) {
      requireTimestamp(observation.recordedAt);
      requireText(observation.description, 'Beobachtung');
    }
  }
}
