import { TrainingExercise, TrainingEffect, SuccessCriterion } from '../exercises/training-exercise';
import {
  ExerciseId,
  TrainingSystemId,
  SkillId,
  HandlerSkillId,
  requireText,
} from '../shared/identity';
import { TrainingSource, SourceEvidence, validateSource } from '../sources/training-source';

export interface ExerciseSnapshot {
  readonly exerciseId: ExerciseId;
  readonly systemId: TrainingSystemId;
  readonly version: string;
  readonly title: string;
  readonly primarySkill: SkillId;
  readonly secondarySkills: readonly SkillId[];
  readonly handlerSkills: readonly HandlerSkillId[];
  readonly trainingEffect: TrainingEffect;
  readonly successCriteria: readonly SuccessCriterion[];
  readonly source: TrainingSource;
}
function copyEvidence(evidence: SourceEvidence): SourceEvidence {
  switch (evidence.kind) {
    case 'provided_summary':
      return { kind: evidence.kind, reference: evidence.reference };
    case 'book_verified':
      return { kind: evidence.kind, locator: evidence.locator, edition: evidence.edition };
    case 'needs_verification':
      return { kind: evidence.kind, reason: evidence.reason };
  }
}
/** Ausschließlich die historischen Anzeigefelder, ohne geteilte Referenzen zum Katalog. */
export function createExerciseSnapshot(
  exercise: Pick<
    TrainingExercise,
    | 'id'
    | 'systemId'
    | 'version'
    | 'title'
    | 'primarySkill'
    | 'secondarySkills'
    | 'handlerSkills'
    | 'trainingEffect'
    | 'successCriteria'
    | 'source'
  >,
): ExerciseSnapshot {
  const source = exercise.source;
  return {
    exerciseId: exercise.id,
    systemId: exercise.systemId,
    version: exercise.version,
    title: exercise.title,
    primarySkill: exercise.primarySkill,
    secondarySkills: [...exercise.secondarySkills],
    handlerSkills: [...exercise.handlerSkills],
    trainingEffect: exercise.trainingEffect,
    successCriteria: exercise.successCriteria.map((c) => ({
      id: c.id,
      description: c.description,
      relatedSkills: [...c.relatedSkills],
    })),
    source: {
      systemId: source.systemId,
      author: source.author,
      title: source.title,
      method: source.method,
      ...(source.section === undefined ? {} : { section: source.section }),
      ...(source.chapter === undefined ? {} : { chapter: source.chapter }),
      evidence: copyEvidence(source.evidence),
    },
  };
}
export function validateExerciseSnapshot(snapshot: ExerciseSnapshot): void {
  requireText(snapshot.exerciseId, 'Übungs-ID');
  requireText(snapshot.version, 'Übungsversion');
  requireText(snapshot.title, 'Übungstitel');
  requireText(snapshot.primarySkill, 'Primärer Skill');
  validateSource(snapshot.source);
  if (snapshot.source.systemId !== snapshot.systemId)
    throw new Error('Snapshot und Quelle müssen zum selben System gehören.');
  if (!['drive_building', 'control_building', 'mixed', 'neutral'].includes(snapshot.trainingEffect))
    throw new Error('Unbekannter Trainingseffekt.');
  for (const ids of [
    snapshot.secondarySkills,
    snapshot.handlerSkills,
    snapshot.successCriteria.map((c) => c.id),
  ]) {
    if (new Set<string>(ids).size !== ids.length)
      throw new Error('Snapshot enthält doppelte Referenzen.');
    for (const id of ids) requireText(id, 'Snapshot-Referenz');
  }
  for (const criterion of snapshot.successCriteria) {
    requireText(criterion.description, 'Erfolgskriterium');
    for (const id of criterion.relatedSkills) requireText(id, 'Skill-Referenz');
  }
}
