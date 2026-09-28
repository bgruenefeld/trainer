import { SkillGraph } from '../../domain/skills/skill-graph';
import {
  MITCHELL_DEPENDENCIES,
  MITCHELL_SKILLS,
  MITCHELL_SYSTEM_ID,
  PUPPY_HEELWORK_INDICATORS,
  mitchellSkillId,
} from '../../../data/mitchell/catalog';
import { SkillReadinessService } from './skill-readiness-service';
/** Composition Root des Katalogs; Domain bleibt unabhängig von Mitchell-Daten. */
export function createMitchellReadinessService(): SkillReadinessService {
  return new SkillReadinessService(
    new SkillGraph(MITCHELL_SYSTEM_ID, MITCHELL_SKILLS, MITCHELL_DEPENDENCIES),
    [
      {
        skillId: mitchellSkillId('heelwork'),
        indicators: PUPPY_HEELWORK_INDICATORS,
        constraints: [],
      },
    ],
  );
}
