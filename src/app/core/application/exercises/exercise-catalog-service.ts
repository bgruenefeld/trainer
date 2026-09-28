import { reviewDifficultyChanges } from '../../domain/exercises/difficulty';
import { TrainingExercise, TrainingModule } from '../../domain/exercises/training-exercise';
import { TrainingProblem } from '../../domain/problems/training-problem';
import {
  ExerciseId,
  HandlerSkillId,
  SkillId,
  TrainingProblemId,
  TrainingSystemId,
  requireText,
} from '../../domain/shared/identity';
import { TrainingSource, validateSource } from '../../domain/sources/training-source';
import { validateGuidance } from '../../domain/exercises/guidance';
import { SkillDefinition } from '../../domain/skills/skill';
import { HandlerSkillDefinition } from '../../domain/handler/handler-skill';
export interface ExerciseCatalog {
  readonly systemId: TrainingSystemId;
  readonly skills: readonly SkillDefinition[];
  readonly handlerSkills: readonly HandlerSkillDefinition[];
  readonly exercises: readonly TrainingExercise[];
  readonly modules: readonly TrainingModule[];
  readonly problems: readonly TrainingProblem[];
}
/** Prüft den gesamten Katalog vor der Nutzung. Keine Trainingsbewertung oder Empfehlung. */
export class ExerciseCatalogService {
  private readonly catalog: ExerciseCatalog;
  constructor(catalog: ExerciseCatalog) {
    this.catalog = structuredClone(catalog);
    this.validate();
  }
  getExercises(): readonly TrainingExercise[] {
    return structuredClone(this.catalog.exercises);
  }
  getModules(): readonly TrainingModule[] {
    return structuredClone(this.catalog.modules);
  }
  getProblems(): readonly TrainingProblem[] {
    return structuredClone(this.catalog.problems);
  }
  findExercise(id: ExerciseId): TrainingExercise | undefined {
    return structuredClone(this.catalog.exercises.find((exercise) => exercise.id === id));
  }
  findProblem(id: TrainingProblemId): TrainingProblem | undefined {
    return structuredClone(this.catalog.problems.find((problem) => problem.id === id));
  }
  forSkill(id: SkillId): readonly TrainingExercise[] {
    return structuredClone(
      this.catalog.exercises.filter(
        (exercise) => exercise.primarySkill === id || exercise.secondarySkills.includes(id),
      ),
    );
  }
  forHandlerSkill(id: HandlerSkillId): readonly TrainingExercise[] {
    return structuredClone(
      this.catalog.exercises.filter((exercise) => exercise.handlerSkills.includes(id)),
    );
  }
  problemsForExercise(id: ExerciseId): readonly TrainingProblem[] {
    const exercise = this.findExercise(id);
    if (!exercise) throw new Error('Unbekannte Übung.');
    return structuredClone(
      this.catalog.problems.filter((problem) => exercise.commonProblems.includes(problem.id)),
    );
  }
  private validate(): void {
    const { systemId, skills, handlerSkills, exercises, modules, problems } = this.catalog;
    for (const entries of [skills, handlerSkills, exercises, modules, problems]) {
      this.unique(entries.map((entry) => entry.id));
      for (const entry of entries) {
        requireText(entry.id, 'Katalog-ID');
        this.source(entry.source);
        if (entry.systemId !== systemId) throw new Error('Katalog enthält ein fremdes System.');
      }
    }
    const skillIds = new Set(skills.map((skill) => skill.id));
    const handlerIds = new Set(handlerSkills.map((skill) => skill.id));
    const exerciseIds = new Set(exercises.map((exercise) => exercise.id));
    const problemIds = new Set(problems.map((problem) => problem.id));
    for (const exercise of exercises) {
      requireText(exercise.title, 'Übungstitel');
      requireText(exercise.objective, 'Übungsziel');
      requireText(exercise.version, 'Übungsversion');
      const involvedSkills = [exercise.primarySkill, ...exercise.secondarySkills];
      this.references(involvedSkills, skillIds);
      this.references(exercise.handlerSkills, handlerIds);
      this.references(exercise.commonProblems, problemIds);
      this.references(exercise.prerequisiteExerciseIds ?? [], exerciseIds);
      this.unique(exercise.difficultyFactors);
      this.unique(exercise.steps.map((step) => step.id));
      this.unique(exercise.successCriteria.map((criterion) => criterion.id));
      for (const requirement of exercise.prerequisites) {
        this.references([requirement.skillId], skillIds);
        this.source(requirement.source);
      }
      for (const step of exercise.steps) {
        requireText(step.id, 'Schritt-ID');
        requireText(step.instruction, 'Schrittbeschreibung');
        this.references(step.relatedHandlerSkills, new Set(exercise.handlerSkills));
      }
      for (const criterion of exercise.successCriteria) {
        requireText(criterion.description, 'Erfolgskriterium');
        this.references(criterion.relatedSkills, new Set(involvedSkills));
      }
      for (const adjustments of [exercise.progression, exercise.regression]) {
        this.unique(adjustments.map((adjustment) => adjustment.id));
        for (const adjustment of adjustments) {
          this.source(adjustment.source);
          reviewDifficultyChanges(adjustment.changes);
          this.references(
            adjustment.changes.map((change) => change.factor),
            new Set(exercise.difficultyFactors),
          );
        }
      }
      if (exercise.guidance) {
        validateGuidance(exercise.guidance);
        this.source(exercise.guidance.source);
      }
      for (const constraint of exercise.physicalConstraints) {
        this.source(constraint.source);
        this.references(constraint.affectedSkills, skillIds);
      }
      this.unique((exercise.contentGaps ?? []).map((gap) => gap.field));
      for (const gap of exercise.contentGaps ?? []) {
        this.source(gap.source);
        requireText(gap.reason, 'Begründung der Inhaltslücke');
      }
      for (const field of ['steps', 'successCriteria', 'progression', 'regression'] as const) {
        if (!exercise[field].length && !exercise.contentGaps?.some((gap) => gap.field === field))
          throw new Error(`Leeres Feld ${field} benötigt eine gekennzeichnete Inhaltslücke.`);
      }
    }
    for (const module of modules) {
      requireText(module.title, 'Modultitel');
      if (!module.exercises.length) throw new Error('Modul enthält keine Übungen.');
      this.references(module.exercises, exerciseIds);
    }
    for (const problem of problems) {
      requireText(problem.title, 'Problemtitel');
      requireText(problem.observedBehaviour, 'Beobachtetes Verhalten');
      this.references(problem.relatedSkills, skillIds);
      this.unique(problem.possibleCauses.map((cause) => cause.id));
      this.unique(problem.adjustments.map((adjustment) => adjustment.id));
      const causeIds = new Set(problem.possibleCauses.map((cause) => cause.id));
      for (const cause of problem.possibleCauses) {
        this.source(cause.source);
        requireText(cause.description, 'Mögliche Ursache');
        this.references(cause.relatedSkills, skillIds);
        this.references(cause.handlerSkills, handlerIds);
      }
      for (const adjustment of problem.adjustments) {
        this.source(adjustment.source);
        requireText(adjustment.description, 'Problemanpassung');
        if (!adjustment.possibleCauseIds.length)
          throw new Error('Problemanpassung benötigt einen Ursachenbezug.');
        this.references(adjustment.possibleCauseIds, causeIds);
      }
    }
  }
  private source(source: TrainingSource): void {
    validateSource(source);
    if (source.systemId !== this.catalog.systemId)
      throw new Error('Quelle gehört zu einem anderen System.');
  }
  private unique(ids: readonly string[]): void {
    if (new Set(ids).size !== ids.length) throw new Error('Doppelte Katalogreferenz oder ID.');
  }
  private references(ids: readonly string[], known: ReadonlySet<string>): void {
    this.unique(ids);
    for (const id of ids) if (!known.has(id)) throw new Error(`Unbekannte Katalogreferenz: ${id}`);
  }
}
