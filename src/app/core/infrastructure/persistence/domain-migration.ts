import { DogSkillAssessment, validateSkillAssessment } from '../../domain/skills/skill-assessment';
import { SKILL_COMPETENCES, SkillCompetence } from '../../domain/skills/skill';
import {
  ReassessmentRequired,
  SessionCompatibilityIssue,
} from '../../application/persistence-read-models';
import {
  TrainingSession,
  validateTrainingSession,
} from '../../domain/training-session/training-session';
import { TrainingExercise } from '../../domain/exercises/training-exercise';
import { createExerciseSnapshot } from '../../domain/training-session/exercise-snapshot';

/** Persistierte Werte sind keine Domainobjekte, bis die Projektion validiert wurde. */
export function migrateAssessment(value: unknown): DogSkillAssessment | ReassessmentRequired {
  const row = value as DogSkillAssessment & { state?: string };
  const {
    id,
    dogId,
    systemId,
    skillId,
    assessedAt,
    assessedBy,
    context,
    rationale,
    observationIds,
  } = row;
  const base = {
    id,
    dogId,
    systemId,
    skillId,
    assessedAt,
    assessedBy,
    context,
    rationale,
    observationIds,
  };
  const competence =
    row.competence ??
    (SKILL_COMPETENCES.includes(row.state as SkillCompetence)
      ? (row.state as SkillCompetence)
      : undefined);
  const condition =
    row.competence === undefined && competence !== undefined ? 'normal' : row.condition;
  if (competence !== undefined && condition !== undefined) {
    const assessment = { ...base, competence, condition };
    try {
      validateSkillAssessment(assessment);
      return assessment;
    } catch {
      /* Ungültige Daten bleiben an dieser Grenze. */
    }
  }
  return {
    status: 'reassessment_required',
    id,
    dogId,
    systemId,
    skillId,
    assessedAt,
    reason:
      'Der alte Eintrag enthält keine eindeutig rekonstruierbare Kompetenz. Neue Einschätzung erforderlich.',
  };
}
export function migrateSession(value: unknown): TrainingSession | SessionCompatibilityIssue {
  const row = value as TrainingSession;
  try {
    if (![2, 3].includes(row.schemaVersion)) throw new Error('Unbekannte Session-Version');
    const executions = row.executions.map((execution) => {
      const old = execution as typeof execution & {
        exerciseId?: string;
        exerciseVersion?: string;
        exerciseTitle?: string;
        trainingEffect?: string;
        skills?: readonly string[];
        handlerSkills?: readonly string[];
        source?: TrainingExercise['source'];
        exerciseSnapshot: TrainingExercise & typeof execution.exerciseSnapshot;
      };
      const snapshot = old.exerciseSnapshot;
      const migrated = createExerciseSnapshot({
        ...snapshot,
        id: snapshot.exerciseId ?? snapshot.id,
      });
      if (
        (old.exerciseId !== undefined && old.exerciseId !== migrated.exerciseId) ||
        (old.exerciseVersion !== undefined && old.exerciseVersion !== migrated.version) ||
        (old.exerciseTitle !== undefined && old.exerciseTitle !== migrated.title) ||
        (old.trainingEffect !== undefined && old.trainingEffect !== migrated.trainingEffect) ||
        (old.skills !== undefined &&
          JSON.stringify(old.skills) !==
            JSON.stringify([migrated.primarySkill, ...migrated.secondarySkills])) ||
        (old.handlerSkills !== undefined &&
          JSON.stringify(old.handlerSkills) !== JSON.stringify(migrated.handlerSkills)) ||
        (old.source !== undefined &&
          JSON.stringify(
            createExerciseSnapshot({ ...snapshot, id: migrated.exerciseId, source: old.source })
              .source,
          ) !== JSON.stringify(migrated.source))
      )
        throw new Error('Widersprüchlicher Snapshot');
      return {
        id: execution.id,
        exerciseSnapshot: migrated,
        setup: execution.setup,
        criteria: execution.criteria,
        observations: execution.observations,
        notes: execution.notes,
      };
    });
    const session: TrainingSession = {
      schemaVersion: 3,
      id: row.id,
      dogId: row.dogId,
      handlerId: row.handlerId,
      systemId: row.systemId,
      ...(row.roadmapId === undefined ? {} : { roadmapId: row.roadmapId }),
      startedAt: row.startedAt,
      ...(row.durationMinutes === undefined ? {} : { durationMinutes: row.durationMinutes }),
      executions,
      reflection: row.reflection,
    };
    validateTrainingSession(session);
    return session;
  } catch {
    return {
      id: row.id,
      dogId: row.dogId,
      systemId: row.systemId,
      reason:
        'Ein historisches Training besitzt keinen eindeutigen Übungssnapshot. Die Originaldaten bleiben erhalten.',
    };
  }
}
