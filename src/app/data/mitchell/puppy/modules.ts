import { TrainingModule } from '../../../core/domain/exercises/training-exercise';
import { PUPPY_EXERCISES } from './exercises';
/** Sieben eigenständige Module, zunächst jeweils mit einer abstrahierten Übung. */
export const PUPPY_MODULES: readonly TrainingModule[] = PUPPY_EXERCISES.map((exercise) => ({
  id: `${exercise.id}:module`,
  systemId: exercise.systemId,
  title: exercise.title,
  objective: exercise.objective,
  exercises: [exercise.id],
  source: exercise.source,
}));
