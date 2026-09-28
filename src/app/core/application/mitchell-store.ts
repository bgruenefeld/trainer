import { exerciseHistory, recommendExercise } from './training/training-flow';
import { RoadmapCatalogService } from './roadmap/roadmap-catalog-service';
import { RoadmapService } from './roadmap/roadmap-service';
import { MITCHELL_MAIN_ROADMAP } from '../../data/mitchell/roadmap/roadmap';
import { RoadmapStageId } from '../domain/shared/identity';
import {
  effectiveAssessments,
  ReassessmentRequired,
  SessionCompatibilityIssue,
} from './persistence-read-models';
import { Injectable, computed, inject, signal } from '@angular/core';
import { TrainerStore } from './trainer-store';
import { DOG_REPOSITORY } from './providers';
import { SKILL_ASSESSMENTS, SYSTEM_SESSIONS, TRAINING_PROFILES } from './mitchell-providers';
import {
  DogSkillAssessment,
  changeSkillAssessment,
  validateSkillAssessment,
} from '../domain/skills/skill-assessment';
import { SkillId, entityId } from '../domain/shared/identity';
import { SkillCompetence, SkillCondition } from '../domain/skills/skill';
import { SkillGraph } from '../domain/skills/skill-graph';
import { DogTrainingProfile } from '../domain/training-plan/dog-training-profile';
import {
  TrainingSession,
  validateTrainingSession,
} from '../domain/training-session/training-session';
import { IndicatorAssessment } from '../domain/skills/readiness';
import { ConstraintAssessment, PhysicalConstraint } from '../domain/exercises/guidance';
import { createMitchellReadinessService } from './readiness/mitchell-readiness';
import { createMitchellExerciseCatalog } from './exercises/mitchell-exercises';
import {
  MITCHELL_SKILLS,
  MITCHELL_SYSTEM_ID,
  MITCHELL_DEPENDENCIES,
  MITCHELL_HANDLER_SKILLS,
  PUPPY_EXERCISES,
  HEELWORK_GUIDANCE,
  HEELWORK_READINESS_GUIDANCE,
  HEELWORK_STEADINESS_GUIDANCE,
  HEELWORK_COMPETENCE_GUIDANCE,
  PUPPY_HEELWORK_INDICATORS,
} from '../../data/mitchell/catalog';
@Injectable({ providedIn: 'root' })
export class MitchellStore {
  readonly dogs = inject(TrainerStore);
  private readonly dogRepository = inject(DOG_REPOSITORY);
  private readonly assessmentsRepository = inject(SKILL_ASSESSMENTS);
  private readonly sessionsRepository = inject(SYSTEM_SESSIONS);
  private readonly profilesRepository = inject(TRAINING_PROFILES);
  private readonly assessmentsState = signal<readonly DogSkillAssessment[]>([]);
  private readonly sessionsState = signal<readonly TrainingSession[]>([]);
  private readonly profilesState = signal<readonly DogTrainingProfile[]>([]);
  private readonly assessmentIssues = signal<readonly ReassessmentRequired[]>([]);
  private readonly sessionIssues = signal<readonly SessionCompatibilityIssue[]>([]);
  readonly compatibilityIssues = computed(() =>
    this.sessionIssues().filter(
      (i) => i.dogId === this.dogs.selectedDog()?.id && i.systemId === MITCHELL_SYSTEM_ID,
    ),
  );
  readonly pendingReassessments = computed(() =>
    this.assessmentIssues().filter(
      (i) =>
        i.dogId === this.dogs.selectedDog()?.id &&
        i.systemId === MITCHELL_SYSTEM_ID &&
        !this.assessments().some(
          (a) => a.skillId === i.skillId && Date.parse(a.assessedAt) > Date.parse(i.assessedAt),
        ),
    ),
  );
  readonly effective = computed(() =>
    effectiveAssessments(this.assessments(), this.assessmentIssues()),
  );
  readonly loading = signal(true);
  readonly error = signal('');
  readonly busy = signal(false);
  readonly skills = MITCHELL_SKILLS;
  readonly handlerSkills = MITCHELL_HANDLER_SKILLS;
  readonly catalog = createMitchellExerciseCatalog();
  readonly puppyExercises = this.catalog
    .getExercises()
    .filter((e) => PUPPY_EXERCISES.some((p) => p.id === e.id));
  readonly heelworkGuidance = HEELWORK_GUIDANCE;
  readonly heelworkReadinessGuidance = HEELWORK_READINESS_GUIDANCE;
  readonly heelworkSteadinessGuidance = HEELWORK_STEADINESS_GUIDANCE;
  readonly heelworkCompetenceGuidance = HEELWORK_COMPETENCE_GUIDANCE;
  readonly graph = new SkillGraph(MITCHELL_SYSTEM_ID, MITCHELL_SKILLS, MITCHELL_DEPENDENCIES);
  readonly readinessService = createMitchellReadinessService();
  readonly roadmapCatalog = new RoadmapCatalogService(
    MITCHELL_MAIN_ROADMAP,
    this.graph,
    this.catalog,
  );
  readonly roadmapService = new RoadmapService(this.roadmapCatalog, this.readinessService);
  readonly roadmap = computed(() => {
    const dog = this.dogs.selectedDog();
    return dog
      ? this.roadmapService.getRoadmapForDog({
          dogId: dog.id,
          assessments: this.assessments(),
          assessmentIssues: this.assessmentIssues(),
          sessions: this.sessions(),
          profile: this.profile(),
        })
      : undefined;
  });
  async setRoadmapFocus(currentStageId?: RoadmapStageId): Promise<void> {
    if (currentStageId) this.roadmapCatalog.getStage(currentStageId);
    await this.saveProfile({
      ...this.currentProfile(),
      roadmapFocus: {
        roadmapId: MITCHELL_MAIN_ROADMAP.id,
        ...(currentStageId ? { currentStageId } : {}),
      },
    });
  }
  readonly indicators = PUPPY_HEELWORK_INDICATORS;
  readonly constraints: readonly PhysicalConstraint[] = [];
  readonly assessments = computed(() =>
    this.assessmentsState().filter(
      (a) => a.dogId === this.dogs.selectedDog()?.id && a.systemId === MITCHELL_SYSTEM_ID,
    ),
  );
  readonly latest = computed(() => {
    const map = new Map<SkillId, DogSkillAssessment>();
    for (const row of this.effective()) {
      const previous = map.get(row.skillId);
      if (!previous || Date.parse(previous.assessedAt) < Date.parse(row.assessedAt))
        map.set(row.skillId, row);
    }
    return map;
  });
  readonly profile = computed(() =>
    this.profilesState().find(
      (p) => p.dogId === this.dogs.selectedDog()?.id && p.systemId === MITCHELL_SYSTEM_ID,
    ),
  );
  readonly sessions = computed(() =>
    this.sessionsState()
      .filter((s) => s.dogId === this.dogs.selectedDog()?.id && s.systemId === MITCHELL_SYSTEM_ID)
      .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt)),
  );
  readonly rows = computed(() =>
    this.skills.map((skill) => ({
      skill,
      competence: this.latest().get(skill.id)?.competence,
      condition: this.latest().get(skill.id)?.condition,
      reassessmentRequired: this.pendingReassessments().some((i) => i.skillId === skill.id),
      assessed: this.latest().has(skill.id),
      focused: this.profile()?.focusSkills.includes(skill.id) ?? false,
      readiness: this.dogs.selectedDog()
        ? this.readinessService.assess(skill.id, {
            dogId: this.dogs.selectedDog()!.id,
            systemId: MITCHELL_SYSTEM_ID,
            skillAssessments: this.effective(),
            indicators: this.profile()?.indicators ?? [],
            constraints: this.profile()?.constraints ?? [],
          })
        : undefined,
    })),
  );
  readonly exerciseHistory = computed(() => exerciseHistory(this.sessions()));
  readonly relevantSkillIds = computed(() => {
    const current = new Set([
      ...(this.roadmap()?.currentStage?.skillIds ?? []),
      ...(this.profile()?.focusSkills ?? []),
    ]);
    const relevant = new Set(current);
    for (const id of current)
      for (const edge of this.graph.prerequisites(id)) relevant.add(edge.requirement.skillId);
    for (const row of this.rows())
      if (
        row.condition === 'maintenance' ||
        row.condition === 'regressed' ||
        row.competence === 'introduced' ||
        row.competence === 'learning'
      )
        relevant.add(row.skill.id);
    return relevant;
  });
  readonly relevantRows = computed(() =>
    this.rows().filter((row) => this.relevantSkillIds().has(row.skill.id)),
  );
  readonly trainingSituation = computed(() => {
    const rows = this.relevantRows();
    return [
      {
        title: 'Stabil',
        rows: rows.filter(
          (r) =>
            r.condition === 'normal' &&
            (r.competence === 'stable' || r.competence === 'generalised'),
        ),
      },
      {
        title: 'Im Aufbau',
        rows: rows.filter(
          (r) =>
            r.condition === 'normal' &&
            (r.competence === 'introduced' || r.competence === 'learning'),
        ),
      },
      { title: 'Pflege', rows: rows.filter((r) => r.condition === 'maintenance') },
      { title: 'Rückschritte', rows: rows.filter((r) => r.condition === 'regressed') },
    ];
  });
  readonly recommendation = computed(() =>
    recommendExercise(
      this.roadmap()?.currentStage,
      this.catalog.getExercises(),
      this.profile()?.focusSkills ?? [],
      this.latest(),
      this.sessions(),
    ),
  );
  readonly active = computed(() =>
    this.rows().filter(
      (row) => row.competence !== undefined && ['introduced', 'learning'].includes(row.competence),
    ),
  );
  readonly maintenance = computed(() =>
    this.rows().filter((row) => row.condition === 'maintenance'),
  );
  readonly regressed = computed(() => this.rows().filter((row) => row.condition === 'regressed'));
  readonly focused = computed(() => this.rows().filter((row) => row.focused));
  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const [assessments, sessions, profiles, assessmentIssues, sessionIssues] = await Promise.all([
        this.assessmentsRepository.findAll(),
        this.sessionsRepository.findAll(),
        this.profilesRepository.findAll(),
        this.assessmentsRepository.findReassessmentRequired(),
        this.sessionsRepository.findCompatibilityIssues(),
      ]);
      this.assessmentIssues.set(assessmentIssues);
      this.sessionIssues.set(sessionIssues);
      this.assessmentsState.set(assessments);
      this.sessionsState.set(sessions);
      this.profilesState.set(profiles);
    } catch {
      this.error.set('Entwicklungsstand konnte nicht geladen werden. Bitte erneut versuchen.');
    } finally {
      this.loading.set(false);
    }
  }
  async assess(
    skillId: SkillId,
    competence: SkillCompetence,
    context: string,
    rationale: string,
    condition: SkillCondition = 'normal',
  ): Promise<void> {
    const dog = this.requireDog();
    this.graph.getSkill(skillId);
    const previous = this.latest().get(skillId);
    const assessment: DogSkillAssessment = {
      id: entityId<'Assessment'>(crypto.randomUUID()),
      dogId: dog.id,
      systemId: MITCHELL_SYSTEM_ID,
      skillId,
      competence,
      condition,
      context: context.trim(),
      rationale: rationale.trim(),
      assessedAt: new Date(
        Math.max(
          Date.now(),
          previous ? Date.parse(previous.assessedAt) + 1 : 0,
          ...this.pendingReassessments()
            .filter((i) => i.skillId === skillId)
            .map((i) => Date.parse(i.assessedAt) + 1),
        ),
      ).toISOString(),
      assessedBy: entityId<'Handler'>('local-handler'),
      observationIds: [],
    };
    validateSkillAssessment(assessment);
    if (previous) changeSkillAssessment(previous, assessment);
    await this.write(async () => {
      await this.ensureDog(dog.id);
      await this.assessmentsRepository.append(assessment);
      this.assessmentsState.update((rows) => [...rows, assessment]);
    });
  }
  async toggleFocus(skillId: SkillId): Promise<void> {
    this.graph.getSkill(skillId);
    const profile = this.currentProfile();
    await this.saveProfile({
      ...profile,
      focusSkills: profile.focusSkills.includes(skillId)
        ? profile.focusSkills.filter((id) => id !== skillId)
        : [...profile.focusSkills, skillId],
    });
  }
  async saveIndicator(
    indicatorId: string,
    result: IndicatorAssessment['result'],
    rationale: string,
  ): Promise<void> {
    if (!this.indicators.some((i) => i.id === indicatorId))
      throw new Error('Unbekannter Indikator.');
    if (!rationale.trim()) throw new Error('Bitte eine Beobachtung angeben.');
    const profile = this.currentProfile();
    await this.saveProfile({
      ...profile,
      indicators: [
        ...profile.indicators.filter((i) => i.indicatorId !== indicatorId),
        { indicatorId, result, rationale: rationale.trim() },
      ],
    });
  }
  async saveConstraint(
    constraintId: string,
    status: ConstraintAssessment['status'],
    rationale: string,
  ): Promise<void> {
    if (!this.constraints.some((i) => i.id === constraintId))
      throw new Error('Unbekannte körperliche Prüfung.');
    if (!rationale.trim()) throw new Error('Bitte die Einschätzung begründen.');
    const profile = this.currentProfile();
    await this.saveProfile({
      ...profile,
      constraints: [
        ...profile.constraints.filter((i) => i.constraintId !== constraintId),
        { constraintId, status, rationale: rationale.trim(), assessedAt: new Date().toISOString() },
      ],
    });
  }
  async saveSession(session: TrainingSession): Promise<void> {
    validateTrainingSession(session);
    if (session.systemId !== MITCHELL_SYSTEM_ID) throw new Error('Unbekanntes Trainingssystem.');
    await this.write(async () => {
      await this.ensureDog(session.dogId);
      await this.sessionsRepository.save(session);
      this.sessionsState.update((rows) => [
        ...rows.filter((row) => row.id !== session.id),
        session,
      ]);
    });
  }
  private requireDog() {
    const dog = this.dogs.selectedDog();
    if (!dog) throw new Error('Bitte zuerst einen Hund anlegen.');
    return dog;
  }
  private async ensureDog(id: Parameters<typeof this.dogRepository.findById>[0]): Promise<void> {
    if (!(await this.dogRepository.findById(id))) throw new Error('Hund existiert nicht.');
  }
  private currentProfile(): DogTrainingProfile {
    const dog = this.requireDog();
    return (
      this.profile() ?? {
        id: JSON.stringify([dog.id, MITCHELL_SYSTEM_ID]),
        dogId: dog.id,
        systemId: MITCHELL_SYSTEM_ID,
        focusSkills: [],
        indicators: [],
        constraints: [],
      }
    );
  }
  private async saveProfile(profile: DogTrainingProfile): Promise<void> {
    await this.write(async () => {
      await this.ensureDog(profile.dogId);
      await this.profilesRepository.save(profile);
      this.profilesState.update((rows) => [
        ...rows.filter((row) => row.id !== profile.id),
        profile,
      ]);
    });
  }
  private async write(action: () => Promise<void>): Promise<void> {
    if (this.busy()) throw new Error('Bitte den laufenden Speichervorgang abwarten.');
    this.busy.set(true);
    try {
      await action();
    } finally {
      this.busy.set(false);
    }
  }
}
