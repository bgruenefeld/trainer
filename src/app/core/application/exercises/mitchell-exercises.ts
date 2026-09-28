import {
  MITCHELL_SYSTEM_ID,
  MITCHELL_SKILLS,
  MITCHELL_HANDLER_SKILLS,
  PUPPY_EXERCISES,
  PUPPY_MODULES,
  PUPPY_PROBLEMS,
  HEELWORK_EXERCISES,
  HEELWORK_PROBLEMS,
} from '../../../data/mitchell/catalog';
import { ExerciseCatalogService } from './exercise-catalog-service';
export function createMitchellExerciseCatalog(): ExerciseCatalogService {
  return new ExerciseCatalogService({
    systemId: MITCHELL_SYSTEM_ID,
    skills: MITCHELL_SKILLS,
    handlerSkills: MITCHELL_HANDLER_SKILLS,
    exercises: [...PUPPY_EXERCISES, ...HEELWORK_EXERCISES],
    modules: PUPPY_MODULES,
    problems: [...PUPPY_PROBLEMS, ...HEELWORK_PROBLEMS],
  });
}
