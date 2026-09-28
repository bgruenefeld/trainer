import { TrainingRoadmap, RoadmapStage } from '../../domain/training-plan/training-roadmap';
import { RoadmapStageId, requireText } from '../../domain/shared/identity';
import { TrainingSource, validateSource } from '../../domain/sources/training-source';
import { ExerciseCatalogService } from '../exercises/exercise-catalog-service';
import { SkillGraph } from '../../domain/skills/skill-graph';
/** Referenzprüfung für Methodenwissen; Voraussetzungen erzeugen keine UI-Sperren. */
export class RoadmapCatalogService {
  private readonly data: TrainingRoadmap;
  constructor(roadmap: TrainingRoadmap, graph: SkillGraph, exercises: ExerciseCatalogService) {
    this.data = structuredClone(roadmap);
    const unique = (ids: readonly string[]) => {
      if (new Set(ids).size !== ids.length) throw new Error('Doppelte Roadmap-Referenz.');
    };
    const source = (value: TrainingSource) => {
      validateSource(value);
      if (value.systemId !== roadmap.systemId) throw new Error('Fremdes Quellensystem.');
    };
    requireText(roadmap.id, 'Roadmap-ID');
    requireText(roadmap.title, 'Roadmap-Titel');
    if (graph.systemId !== roadmap.systemId) throw new Error('Fremdes Roadmap-System.');
    source(roadmap.source);
    if (!roadmap.stages.length) throw new Error('Roadmap benötigt Stages.');
    unique(roadmap.stages.map((s) => s.id));
    for (const stage of roadmap.stages) {
      requireText(stage.id, 'Stage-ID');
      requireText(stage.title, 'Stage-Titel');
      source(stage.source);
      unique(stage.skillIds);
      unique(stage.exerciseIds);
      unique(stage.prerequisiteStageIds ?? []);
      for (const id of stage.skillIds) graph.getSkill(id);
      for (const id of stage.exerciseIds) {
        const exercise = exercises.findExercise(id);
        if (!exercise || exercise.systemId !== roadmap.systemId)
          throw new Error('Unbekannte oder fremde Übung.');
      }
      for (const id of stage.prerequisiteStageIds ?? []) this.getStage(id);
      if (
        stage.contentStatus === 'planned' &&
        (stage.exerciseIds.length ||
          stage.readinessGuidance?.length ||
          stage.completionGuidance?.length)
      )
        throw new Error('Geplante Stages dürfen keine Detailinhalte vorwegnehmen.');
      for (const statement of [
        ...(stage.readinessGuidance ?? []),
        ...(stage.completionGuidance ?? []),
      ]) {
        requireText(statement.text, 'Guidance');
        source(statement.source);
      }
    }
    const visiting = new Set<RoadmapStageId>();
    const visited = new Set<RoadmapStageId>();
    const visit = (id: RoadmapStageId) => {
      if (visiting.has(id)) throw new Error('Zyklische Stage-Abhängigkeit.');
      if (visited.has(id)) return;
      visiting.add(id);
      for (const prerequisite of this.getStage(id).prerequisiteStageIds ?? []) visit(prerequisite);
      visiting.delete(id);
      visited.add(id);
    };
    for (const stage of roadmap.stages) visit(stage.id);
  }
  getRoadmap(): TrainingRoadmap {
    return structuredClone(this.data);
  }
  getStage(id: RoadmapStageId): RoadmapStage {
    const stage = this.data.stages.find((s) => s.id === id);
    if (!stage) throw new Error('Unbekannte Roadmap-Stage.');
    return structuredClone(stage);
  }
}
