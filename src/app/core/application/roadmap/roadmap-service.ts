import { DogId } from '../../domain/dog/dog';
import { RoadmapStageId, SkillId } from '../../domain/shared/identity';
import { DogSkillAssessment } from '../../domain/skills/skill-assessment';
import { TrainingSession } from '../../domain/training-session/training-session';
import { DogTrainingProfile } from '../../domain/training-plan/dog-training-profile';
import {
  DogRoadmapProgress,
  RoadmapStage,
  RoadmapStageStatus,
  RoadmapFindingDetail,
} from '../../domain/training-plan/training-roadmap';
import { SkillReadinessService } from '../readiness/skill-readiness-service';
import { RoadmapCatalogService } from './roadmap-catalog-service';
import { effectiveAssessments, ReassessmentRequired } from '../persistence-read-models';
import { PUPPY_HEELWORK_INDICATORS } from '../../../data/mitchell/puppy/heelwork-readiness';
import { MITCHELL_MAIN_ROADMAP, roadmapStageId } from '../../../data/mitchell/roadmap/roadmap';
import { mitchellSkillId } from '../../../data/mitchell/skills/skills';
export interface RoadmapInput {
  readonly dogId: DogId;
  readonly assessments: readonly DogSkillAssessment[];
  readonly assessmentIssues: readonly ReassessmentRequired[];
  readonly sessions: readonly TrainingSession[];
  readonly profile?: DogTrainingProfile;
}
export interface StageView {
  readonly stage: RoadmapStage;
  readonly status: RoadmapStageStatus;
  readonly findings: readonly RoadmapFindingDetail[];
  readonly explanations: readonly string[];
  readonly trainedExerciseIds: readonly string[];
}
/** Reine Leseprojektion. Die beiden Statusregeln gelten nur für Mitchells Hauptroadmap. */
export class RoadmapService {
  constructor(
    private readonly catalog: RoadmapCatalogService,
    private readonly readiness: SkillReadinessService,
  ) {}
  getRoadmapForDog(input: RoadmapInput) {
    const roadmap = this.catalog.getRoadmap();
    const { dogId, profile } = input;
    if (roadmap.id !== MITCHELL_MAIN_ROADMAP.id)
      throw new Error('Keine Statuspolicy für diese Roadmap.');
    if (profile && (profile.dogId !== dogId || profile.systemId !== roadmap.systemId))
      throw new Error('Fremdes Trainingsprofil.');
    const assessments = effectiveAssessments(
      input.assessments.filter((a) => a.dogId === dogId && a.systemId === roadmap.systemId),
      input.assessmentIssues,
    );
    const sessions = input.sessions.filter(
      (s) => s.dogId === dogId && s.systemId === roadmap.systemId,
    );
    const readinessProfile = {
      dogId,
      systemId: roadmap.systemId,
      skillAssessments: assessments,
      indicators: profile?.indicators ?? [],
      constraints: profile?.constraints ?? [],
    };
    // Der Readiness-Service validiert auch widersprüchliche zeitgleiche Assessments.
    const puppyReadiness = this.readiness.assess(mitchellSkillId('heelwork'), readinessProfile);
    const latest = new Map<SkillId, DogSkillAssessment>();
    for (const assessment of assessments) {
      const previous = latest.get(assessment.skillId);
      if (!previous || Date.parse(previous.assessedAt) < Date.parse(assessment.assessedAt))
        latest.set(assessment.skillId, assessment);
    }
    const puppyId = roadmapStageId('puppy_foundation');
    const heelworkId = roadmapStageId('heelwork');
    const executions = sessions.flatMap((s) => s.executions);
    const hasActivity = (stage: RoadmapStage) =>
      stage.skillIds.some((id) => latest.has(id) && latest.get(id)!.competence !== 'not_started') ||
      executions.some((e) => stage.exerciseIds.includes(e.exerciseSnapshot.exerciseId));
    const statusFor = (stage: RoadmapStage): RoadmapStageStatus => {
      const states = stage.skillIds.flatMap((id) => (latest.has(id) ? [latest.get(id)!] : []));
      if (states.some((a) => a.condition === 'regressed')) return 'needs_attention';
      if (stage.id === puppyId && puppyReadiness.status === 'ready') return 'ready_to_progress';
      if (
        stage.id === heelworkId &&
        states.some((a) => ['stable', 'generalised'].includes(a.competence))
      )
        return 'established';
      return hasActivity(stage) ? 'active' : 'not_started';
    };
    const statuses = new Map(roadmap.stages.map((s) => [s.id, statusFor(s)]));
    // Frühere Belege dienen nur der Fokus-Kontinuität, niemals dem aktuellen Kompetenzstatus.
    const focusStatus = (stage: RoadmapStage): RoadmapStageStatus => {
      const status = statuses.get(stage.id)!;
      if (status !== 'needs_attention') return status;
      if (stage.id === puppyId && puppyReadiness.status === 'ready') return 'ready_to_progress';
      if (
        stage.id === heelworkId &&
        assessments.some(
          (a) =>
            a.skillId === mitchellSkillId('heelwork') &&
            ['stable', 'generalised'].includes(a.competence) &&
            a.condition !== 'regressed',
        )
      )
        return 'established';
      return 'needs_attention';
    };
    let currentStage: RoadmapStage | undefined;
    const selected = profile?.roadmapFocus;
    if (selected?.roadmapId === roadmap.id && selected.currentStageId)
      currentStage = this.catalog.getStage(selected.currentStageId);
    const userSelected = !!currentStage;
    if (!currentStage) {
      const available = roadmap.stages.filter((s) => s.contentStatus === 'available');
      currentStage = available.find((s) => focusStatus(s) === 'active');
      if (!currentStage) {
        const transition = available.find(
          (s) =>
            focusStatus(s) === 'ready_to_progress' &&
            focusStatus(roadmap.stages[roadmap.stages.indexOf(s) + 1]) !== 'established',
        );
        if (transition) {
          const following = roadmap.stages[roadmap.stages.indexOf(transition) + 1];
          if (following.contentStatus === 'available') currentStage = following;
        }
      }
      if (!currentStage) {
        const reachedIndex = Math.max(
          -1,
          ...roadmap.stages.map((s, i) => (hasActivity(s) ? i : -1)),
        );
        currentStage = available.find(
          (s) =>
            !['established', 'ready_to_progress'].includes(focusStatus(s)) &&
            !(focusStatus(s) === 'needs_attention' && roadmap.stages.indexOf(s) < reachedIndex),
        );
      }
    }
    const currentIndex = currentStage
      ? roadmap.stages.indexOf(currentStage)
      : roadmap.stages.findIndex((s) => s.contentStatus === 'planned') - 1;
    // Katalogzugriff liefert Kopien; IDs bestimmen die Position bei Nutzerwahl.
    const position = currentStage
      ? roadmap.stages.findIndex((s) => s.id === currentStage.id)
      : currentIndex;
    const nextStage = roadmap.stages[position + 1];
    const stages: StageView[] = roadmap.stages.map((stage, index) => {
      const findings: RoadmapFindingDetail[] = [];
      const add = (kind: RoadmapFindingDetail['kind'], explanation: string, skillId?: SkillId) =>
        findings.push({ kind, explanation, stageId: stage.id, ...(skillId ? { skillId } : {}) });
      if (stage.id === currentStage?.id)
        add(
          'current_focus',
          userSelected
            ? 'Von dir als Schwerpunkt gewählt; keine Kompetenzbehauptung.'
            : 'Aus dokumentiertem Aufbau und Übergangsprüfung vorgeschlagen.',
        );
      for (const id of stage.skillIds) {
        const state = latest.get(id);
        if (state?.condition === 'regressed') add('regression', 'Als Rückschritt beurteilt.', id);
        else if (state?.condition === 'maintenance')
          add(
            'maintenance_due',
            'Als Pflegebedarf beurteilt; kein berechneter Fälligkeitstermin.',
            id,
          );
        else if (index > position && (!state || state.competence === 'not_started'))
          add('not_yet_relevant', 'Späterer Abschnitt; fehlendes Training ist kein Defizit.', id);
      }
      if (stage.id === puppyId && (index <= position || hasActivity(stage))) {
        for (const indicator of puppyReadiness.indicators.filter((i) => i.result === 'not_met')) {
          const definition = PUPPY_HEELWORK_INDICATORS.find((i) => i.id === indicator.indicatorId)!;
          add(
            'needs_attention',
            `${definition.description} – als noch nicht erfüllt beurteilt: ${indicator.rationale}`,
            definition.relatedSkills[0],
          );
        }
      }
      const explanations: string[] = [];
      if (index > 0)
        explanations.push(
          `In Mitchells Hauptlinie folgt dieser Abschnitt auf ${roadmap.stages[index - 1].title}. Die Reihenfolge ist keine Trainingssperre.`,
        );
      if (stage.contentStatus === 'planned')
        explanations.push(
          'Als nächster Abschnitt vorgesehen. Detaillierte Trainingsinhalte werden noch ergänzt.',
        );
      for (const id of stage.prerequisiteStageIds ?? []) {
        if (!['established', 'ready_to_progress'].includes(statuses.get(id)!))
          explanations.push(
            `Vorheriger Abschnitt ${this.catalog.getStage(id).title}: Übergang noch ungeklärt.`,
          );
      }
      for (const id of stage.skillIds) {
        const review = this.readiness.assess(id, readinessProfile);
        if (review.status !== 'ready')
          explanations.push(
            `Voraussetzungen für ${id}: ${review.status === 'not_ready' ? 'nicht erfüllt' : 'noch zu prüfen'}.`,
          );
      }
      if (stage.id === roadmapStageId('steadiness'))
        explanations.push(
          'Die Übergangsprüfung Heelwork → Steadiness ist noch nicht vollständig definiert. Keine automatische Bereitschaftsaussage.',
        );
      return {
        stage,
        status: statuses.get(stage.id)!,
        findings,
        explanations,
        trainedExerciseIds: [
          ...new Set(
            executions
              .filter((e) => stage.exerciseIds.includes(e.exerciseSnapshot.exerciseId))
              .map((e) => e.exerciseSnapshot.exerciseId),
          ),
        ],
      };
    });
    const attention = stages
      .flatMap((s) => s.findings)
      .filter((f) => ['regression', 'maintenance_due', 'needs_attention'].includes(f.kind))
      .filter(
        (f, i, all) =>
          all.findIndex((other) => other.skillId === f.skillId && other.kind === f.kind) === i,
      );
    const progress: DogRoadmapProgress = {
      dogId,
      roadmapId: roadmap.id,
      currentStageId: selected?.roadmapId === roadmap.id ? selected.currentStageId : undefined,
      focusedSkillIds: [...(profile?.focusSkills ?? [])],
    };
    return {
      roadmap,
      progress,
      stages,
      currentStage,
      userSelected,
      nextStage,
      attention,
      establishedStages: stages.filter((s) => s.status === 'established'),
      stableSkills: [...latest.values()].filter(
        (a) => ['stable', 'generalised'].includes(a.competence) && a.condition !== 'regressed',
      ),
      buildingSkills: [...latest.values()].filter((a) =>
        ['introduced', 'learning'].includes(a.competence),
      ),
    };
  }
  getStageStatus(input: RoadmapInput, id: RoadmapStageId) {
    this.catalog.getStage(id);
    return this.getRoadmapForDog(input).stages.find((s) => s.stage.id === id)!.status;
  }
  getStageFindings(input: RoadmapInput, id: RoadmapStageId) {
    this.catalog.getStage(id);
    return this.getRoadmapForDog(input).stages.find((s) => s.stage.id === id)!.findings;
  }
  getCurrentRecommendedStage(input: RoadmapInput) {
    return this.getRoadmapForDog(input).currentStage;
  }
  getNextStage(input: RoadmapInput) {
    return this.getRoadmapForDog(input).nextStage;
  }
  getEstablishedStages(input: RoadmapInput) {
    return this.getRoadmapForDog(input).establishedStages;
  }
  getSkillsNeedingAttention(input: RoadmapInput) {
    return this.getRoadmapForDog(input).attention;
  }
}
