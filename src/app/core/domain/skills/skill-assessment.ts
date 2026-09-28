import { DogId } from '../dog/dog';
import {
  AssessmentId,
  HandlerId,
  ObservationId,
  SkillId,
  TrainingSystemId,
  requireText,
  requireTimestamp,
} from '../shared/identity';
import { SKILL_COMPETENCES, SKILL_CONDITIONS, SkillCompetence, SkillCondition } from './skill';
/** Vom Menschen beurteilter Kontext; keine automatisch abgeleitete Trainingsregel. */
export interface DogSkillAssessment {
  readonly id: AssessmentId;
  readonly dogId: DogId;
  readonly systemId: TrainingSystemId;
  readonly skillId: SkillId;
  readonly competence: SkillCompetence;
  readonly condition: SkillCondition;
  readonly assessedAt: string;
  readonly assessedBy: HandlerId;
  readonly context: string;
  readonly rationale: string;
  readonly observationIds: readonly ObservationId[];
}
export interface SkillAssessmentChange {
  readonly previous: DogSkillAssessment;
  readonly current: DogSkillAssessment;
}
/** Keine lineare Lernleiter: bewusste Korrekturen und Rückschritte sind möglich. */
export function changeSkillAssessment(
  previous: DogSkillAssessment,
  current: DogSkillAssessment,
): SkillAssessmentChange {
  validateSkillAssessment(previous);
  validateSkillAssessment(current);
  if (previous.id === current.id)
    throw new Error('Eine Änderung benötigt eine neue Assessment-ID.');
  if (
    previous.dogId !== current.dogId ||
    previous.skillId !== current.skillId ||
    previous.systemId !== current.systemId
  )
    throw new Error('Die Änderung muss denselben Hund, Skill und dasselbe System betreffen.');
  if (Date.parse(current.assessedAt) < Date.parse(previous.assessedAt))
    throw new Error('Die Änderung darf nicht vor dem bisherigen Assessment liegen.');
  return { previous, current };
}

export function validateSkillAssessment(assessment: DogSkillAssessment): void {
  requireText(assessment.id, 'Assessment-ID');
  requireText(assessment.dogId, 'Hund-ID');
  requireText(assessment.skillId, 'Skill-ID');
  requireText(assessment.systemId, 'System-ID');
  requireText(assessment.assessedBy, 'Handler-ID');
  if (!SKILL_COMPETENCES.includes(assessment.competence))
    throw new Error('Unbekannte Skill-Kompetenz.');
  if (!SKILL_CONDITIONS.includes(assessment.condition))
    throw new Error('Unbekannte Skill-Bedingung.');
  requireTimestamp(assessment.assessedAt);
  requireText(assessment.context, 'Beobachtungskontext');
  requireText(assessment.rationale, 'Begründung');
}
