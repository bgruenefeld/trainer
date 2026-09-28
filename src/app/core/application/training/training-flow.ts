import { TrainingExercise } from '../../domain/exercises/training-exercise';
import { TrainingSession } from '../../domain/training-session/training-session';
import { RoadmapStage } from '../../domain/training-plan/training-roadmap';
import { DogSkillAssessment } from '../../domain/skills/skill-assessment';
import { SkillId } from '../../domain/shared/identity';
export function exerciseHistory(sessions: readonly TrainingSession[]) {
  const result = new Map<string, string>();
  for (const session of sessions)
    for (const execution of session.executions) {
      const id = execution.exerciseSnapshot.exerciseId;
      if (!result.has(id) || Date.parse(result.get(id)!) < Date.parse(session.startedAt))
        result.set(id, session.startedAt);
    }
  return result;
}
/** Eingaben gehören zu genau einem Hund/System. Reihenfolge statt Scores oder Completion. */
export function recommendExercise(
  stage: RoadmapStage | undefined,
  exercises: readonly TrainingExercise[],
  focus: readonly SkillId[],
  assessments: ReadonlyMap<SkillId, DogSkillAssessment>,
  sessions: readonly TrainingSession[],
) {
  if (!stage || stage.contentStatus !== 'available') return undefined;
  let candidates = exercises.filter((e) => stage.exerciseIds.includes(e.id));
  const skills = (e: TrainingExercise) => [e.primarySkill, ...e.secondarySkills];
  const prefer = (predicate: (e: TrainingExercise) => boolean) => {
    const matching = candidates.filter(predicate);
    if (matching.length) candidates = matching;
  };
  prefer((e) => skills(e).some((id) => focus.includes(id)));
  prefer((e) => skills(e).some((id) => assessments.get(id)?.condition === 'regressed'));
  prefer((e) => skills(e).some((id) => assessments.get(id)?.condition === 'maintenance'));
  const history = exerciseHistory(sessions);
  const exercise = [...candidates].sort(
    (a, b) =>
      (Date.parse(history.get(b.id) ?? '') || 0) - (Date.parse(history.get(a.id) ?? '') || 0),
  )[0];
  if (!exercise) return undefined;
  const reasons = [`Diese Übung gehört zu eurem aktuellen Schwerpunkt ${stage.title}.`];
  if (skills(exercise).some((id) => focus.includes(id)))
    reasons.push('Ein zugehöriger Skill ist von dir als Fokus gewählt.');
  for (const id of skills(exercise)) {
    const state = assessments.get(id);
    if (state?.condition === 'regressed')
      reasons.push('Für einen zugehörigen Skill wurde ein Rückschritt dokumentiert.');
    else if (state?.condition === 'maintenance')
      reasons.push('Ein zugehöriger Skill befindet sich in Pflege.');
    if (state && ['introduced', 'learning'].includes(state.competence))
      reasons.push('Ein zugehöriger Skill befindet sich aktuell im Aufbau.');
  }
  for (const id of exercise.prerequisiteExerciseIds ?? []) {
    const prerequisite = exercises.find((e) => e.id === id);
    if (prerequisite) {
      reasons.push(`Baut auf ${prerequisite.title} auf.`);
      if (history.has(id)) reasons.push(`${prerequisite.title} wurde bereits trainiert.`);
    }
  }
  if (history.has(exercise.id))
    reasons.push('Diese Übung wurde bereits trainiert und kann weiter gefestigt werden.');
  return { exercise, stage, reasons: [...new Set(reasons)] };
}
export function nextExercises(exercise: TrainingExercise, exercises: readonly TrainingExercise[]) {
  return exercises.filter((e) => e.prerequisiteExerciseIds?.includes(exercise.id));
}
