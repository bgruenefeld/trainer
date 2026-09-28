import { isRetiredMitchellSkill } from './retired-mitchell-skills';
import { DogId } from '../../domain/dog/dog';
import { SkillId, TrainingSessionId, TrainingSystemId } from '../../domain/shared/identity';
import { DogSkillAssessment, validateSkillAssessment } from '../../domain/skills/skill-assessment';
import {
  AssessmentReadRepository,
  ReassessmentRequired,
  SessionReadRepository,
  SessionCompatibilityIssue,
} from '../../application/persistence-read-models';
import { migrateAssessment, migrateSession } from './domain-migration';
import {
  TrainingSession,
  validateTrainingSession,
} from '../../domain/training-session/training-session';
import {
  DogTrainingProfile,
  DogTrainingProfileRepository,
} from '../../domain/training-plan/dog-training-profile';
import { LongTermGoal, SkillRoadmap } from '../../domain/training-plan/training-plan';
import { TrainingPlanRepository } from '../../domain/training-plan/training-plan.repository';
import { TrainerDatabase } from './indexed-db';
export class IndexedDbSkillAssessmentRepository implements AssessmentReadRepository {
  constructor(private readonly db: TrainerDatabase) {}
  private async read() {
    return (await this.db.read<unknown[]>('skillAssessments', (store) => store.getAll())).map(
      migrateAssessment,
    );
  }
  async findAll(): Promise<readonly DogSkillAssessment[]> {
    return (await this.read()).filter(
      (row): row is DogSkillAssessment =>
        !('status' in row) && !isRetiredMitchellSkill(row.systemId, row.skillId),
    );
  }
  async findReassessmentRequired(): Promise<readonly ReassessmentRequired[]> {
    return (await this.read()).filter(
      (row): row is ReassessmentRequired =>
        'status' in row && !isRetiredMitchellSkill(row.systemId, row.skillId),
    );
  }
  async findHistory(
    dogId: DogId,
    systemId: TrainingSystemId,
    skillId: SkillId,
  ): Promise<readonly DogSkillAssessment[]> {
    return (await this.findAll())
      .filter((row) => row.dogId === dogId && row.systemId === systemId && row.skillId === skillId)
      .sort((a, b) => Date.parse(a.assessedAt) - Date.parse(b.assessedAt));
  }
  append(assessment: DogSkillAssessment): Promise<void> {
    validateSkillAssessment(assessment);
    if (isRetiredMitchellSkill(assessment.systemId, assessment.skillId))
      throw new Error('Dieser Skill ist nur noch historisch lesbar.');
    return this.db.write('skillAssessments', assessment, 'add');
  }
}
export class IndexedDbSystemSessionRepository implements SessionReadRepository {
  constructor(private readonly db: TrainerDatabase) {}
  private async read() {
    return (await this.db.read<unknown[]>('systemSessions', (store) => store.getAll())).map(
      migrateSession,
    );
  }
  async findAll(): Promise<readonly TrainingSession[]> {
    return (await this.read()).filter((row): row is TrainingSession => 'executions' in row);
  }
  async findCompatibilityIssues(): Promise<readonly SessionCompatibilityIssue[]> {
    return (await this.read()).filter(
      (row): row is SessionCompatibilityIssue => !('executions' in row),
    );
  }
  async findById(id: TrainingSessionId): Promise<TrainingSession | undefined> {
    return (await this.findAll()).find((row) => row.id === id);
  }
  async findByDogId(dogId: DogId, systemId: TrainingSystemId): Promise<readonly TrainingSession[]> {
    return (await this.findAll()).filter((row) => row.dogId === dogId && row.systemId === systemId);
  }
  async save(session: TrainingSession): Promise<void> {
    validateTrainingSession(session);
    const skills = session.executions.flatMap((e) => [
      e.exerciseSnapshot.primarySkill,
      ...e.exerciseSnapshot.secondarySkills,
      ...e.exerciseSnapshot.successCriteria.flatMap((c) => c.relatedSkills),
      ...e.observations.flatMap((o) => (o.target.kind === 'dog_skill' ? [o.target.skillId] : [])),
    ]);
    if (
      skills.some((id) => isRetiredMitchellSkill(session.systemId, id)) &&
      !(await this.db.read('systemSessions', (store) => store.get(session.id)))
    )
      throw new Error('Neue Trainings dürfen keine archivierten Skills verwenden.');
    return this.db.write('systemSessions', session);
  }
}
export class IndexedDbTrainingProfileRepository implements DogTrainingProfileRepository {
  constructor(private readonly db: TrainerDatabase) {}
  findAll(): Promise<readonly DogTrainingProfile[]> {
    return this.db.read('trainingProfiles', (store) => store.getAll());
  }
  save(profile: DogTrainingProfile): Promise<void> {
    return this.db.write('trainingProfiles', profile);
  }
}
export class IndexedDbTrainingPlanRepository implements TrainingPlanRepository {
  constructor(private readonly db: TrainerDatabase) {}
  async findGoals(dogId: DogId, systemId: TrainingSystemId): Promise<readonly LongTermGoal[]> {
    return (
      await this.db.read<LongTermGoal[]>('goals', (store) =>
        store.index('dogSystem').getAll([dogId, systemId]),
      )
    ).map(projectGoal);
  }
  async findRoadmaps(dogId: DogId, systemId: TrainingSystemId): Promise<readonly SkillRoadmap[]> {
    return (
      await this.db.read<SkillRoadmap[]>('roadmaps', (store) =>
        store.index('dogSystem').getAll([dogId, systemId]),
      )
    ).map(projectRoadmap);
  }
  saveGoal(goal: LongTermGoal): Promise<void> {
    return this.db.write('goals', projectGoal(goal));
  }
  saveRoadmap(roadmap: SkillRoadmap): Promise<void> {
    return this.db.write('roadmaps', projectRoadmap(roadmap));
  }
}

function projectGoal({
  id,
  dogId,
  handlerId,
  systemId,
  aspiration,
  type,
  description,
}: LongTermGoal): LongTermGoal {
  return { id, dogId, handlerId, systemId, aspiration, type, description };
}
function projectRoadmap({
  id,
  dogId,
  goalId,
  systemId,
  focusSkills,
  indicatorAssessments,
  physicalAssessments,
  notes,
}: SkillRoadmap): SkillRoadmap {
  return {
    id,
    dogId,
    goalId,
    systemId,
    focusSkills,
    indicatorAssessments,
    physicalAssessments,
    notes,
  };
}
