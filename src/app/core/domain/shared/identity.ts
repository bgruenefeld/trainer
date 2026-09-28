/** Opaque IDs: Katalog-IDs sind systemweit eindeutig, fachliche Codes bleiben separat. */
export type EntityId<Kind extends string> = string & { readonly __domainId: Kind };
export function entityId<Kind extends string>(value: string): EntityId<Kind> {
  if (!value.trim() || value !== value.trim())
    throw new Error('Eine ID darf nicht leer sein oder äußere Leerzeichen enthalten.');
  return value as EntityId<Kind>;
}
export type TrainingSystemId = EntityId<'TrainingSystem'>;
export type SkillId = EntityId<'Skill'>;
export type HandlerSkillId = EntityId<'HandlerSkill'>;
export type ExerciseId = EntityId<'Exercise'>;
export type TrainingProblemId = EntityId<'TrainingProblem'>;
export type TrainingSessionId = EntityId<'TrainingSession'>;
export type HandlerId = EntityId<'Handler'>;
export type AssessmentId = EntityId<'Assessment'>;
export type GoalId = EntityId<'Goal'>;
export type RoadmapId = EntityId<'Roadmap'>;
export type ObservationId = EntityId<'Observation'>;
export type CriterionId = EntityId<'Criterion'>;
export function requireText(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} fehlt.`);
}
export function requireTimestamp(value: string): void {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || !Number.isFinite(Date.parse(value)))
    throw new Error('Ein ISO-Zeitpunkt mit Zeitzone ist erforderlich.');
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
  if (
    date.toISOString().slice(0, 10) !== value.slice(0, 10) ||
    Number(match[4]) > 23 ||
    Number(match[5]) > 59 ||
    Number(match[6]) > 59
  )
    throw new Error('Ungültiges Kalenderdatum oder Uhrzeit.');
}

export type RoadmapStageId = EntityId<'RoadmapStage'>;
