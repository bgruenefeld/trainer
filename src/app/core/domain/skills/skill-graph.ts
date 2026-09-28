import { SkillId, TrainingSystemId, requireText } from '../shared/identity';
import { validateSource } from '../sources/training-source';
import { DependencyType, SKILL_COMPETENCES, SkillDefinition, SkillDependency } from './skill';
/** Unveränderlicher Graph-Snapshot. Maintenance-/Soft-Rückbezüge sind zulässig. */
export class SkillGraph {
  private readonly skills: ReadonlyMap<SkillId, SkillDefinition>;
  private readonly edges: readonly SkillDependency[];
  constructor(
    readonly systemId: TrainingSystemId,
    skills: readonly SkillDefinition[],
    edges: readonly SkillDependency[],
  ) {
    const catalog = structuredClone(skills);
    const dependencies = structuredClone(edges);
    const ids = new Set(catalog.map((skill) => skill.id));
    if (
      ids.size !== catalog.length ||
      new Set(catalog.map((skill) => skill.code)).size !== catalog.length
    )
      throw new Error('Skill-IDs und Codes müssen eindeutig sein.');
    for (const skill of catalog) {
      requireText(skill.id, 'Skill-ID');
      requireText(skill.code, 'Skill-Code');
      validateSource(skill.source);
      if (skill.systemId !== systemId || skill.source.systemId !== systemId)
        throw new Error('Skill und Quelle müssen zum Graph-System gehören.');
      if (
        new Set(skill.subskills).size !== skill.subskills.length ||
        skill.subskills.some((id) => !ids.has(id) || id === skill.id)
      )
        throw new Error('Ungültige Subskill-Referenz.');
    }
    const relations = new Set<string>();
    if (new Set(dependencies.map((edge) => edge.id)).size !== dependencies.length)
      throw new Error('Kanten-IDs müssen eindeutig sein.');
    for (const edge of dependencies) {
      requireText(edge.id, 'Kanten-ID');
      validateSource(edge.requirement.source);
      if (!ids.has(edge.targetSkillId) || !ids.has(edge.requirement.skillId))
        throw new Error('Unbekannte Skill-Referenz in Abhängigkeit.');
      if (edge.targetSkillId === edge.requirement.skillId)
        throw new Error('Eine Abhängigkeit darf nicht auf sich selbst zeigen.');
      if (edge.requirement.source.systemId !== systemId)
        throw new Error('Abhängigkeit gehört zu einem anderen System.');
      const key = JSON.stringify([
        edge.requirement.skillId,
        edge.targetSkillId,
        edge.requirement.type,
      ]);
      if (relations.has(key)) throw new Error('Doppelte fachliche Abhängigkeit.');
      relations.add(key);
      if (edge.requirement.acceptedCompetences?.some((state) => !SKILL_COMPETENCES.includes(state)))
        throw new Error('Ungültige erforderliche Skill-Kompetenz.');
    }
    this.skills = new Map(catalog.map((skill) => [skill.id, skill]));
    this.edges = dependencies;
    this.assertAcyclic(
      (id) => this.dependents(id, ['hard']).map((edge) => edge.targetSkillId),
      'Harte Voraussetzungen enthalten einen Zyklus.',
    );
    this.assertAcyclic((id) => this.skills.get(id)!.subskills, 'Subskills enthalten einen Zyklus.');
  }
  getSkill(id: SkillId): SkillDefinition {
    const skill = this.skills.get(id);
    if (!skill) throw new Error(`Unbekannter Skill: ${id}`);
    return structuredClone(skill);
  }
  prerequisites(
    id: SkillId,
    types: readonly DependencyType[] = ['hard', 'soft', 'maintenance'],
  ): readonly SkillDependency[] {
    this.requireSkill(id);
    return structuredClone(
      this.edges.filter(
        (edge) => edge.targetSkillId === id && types.includes(edge.requirement.type),
      ),
    );
  }
  dependents(
    id: SkillId,
    types: readonly DependencyType[] = ['hard', 'soft', 'maintenance'],
  ): readonly SkillDependency[] {
    this.requireSkill(id);
    return structuredClone(
      this.edges.filter(
        (edge) => edge.requirement.skillId === id && types.includes(edge.requirement.type),
      ),
    );
  }
  ancestors(
    id: SkillId,
    types: readonly DependencyType[] = ['hard', 'soft', 'maintenance'],
  ): readonly SkillId[] {
    return this.traverse(id, (current) =>
      this.prerequisites(current, types).map((edge) => edge.requirement.skillId),
    );
  }
  descendants(
    id: SkillId,
    types: readonly DependencyType[] = ['hard', 'soft', 'maintenance'],
  ): readonly SkillId[] {
    return this.traverse(id, (current) =>
      this.dependents(current, types).map((edge) => edge.targetSkillId),
    );
  }
  /** Kürzester gerichteter Erklärungspfad; keine empfohlene Trainingsreihenfolge. */
  path(
    from: SkillId,
    to: SkillId,
    types: readonly DependencyType[] = ['hard', 'soft', 'maintenance'],
  ): readonly SkillDependency[] | undefined {
    this.requireSkill(from);
    this.requireSkill(to);
    const visited = new Set<SkillId>([from]);
    const queue: { id: SkillId; edges: readonly SkillDependency[] }[] = [{ id: from, edges: [] }];
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const current = queue[cursor];
      if (current.id === to) return current.edges;
      for (const edge of this.dependents(current.id, types)) {
        if (visited.has(edge.targetSkillId)) continue;
        visited.add(edge.targetSkillId);
        queue.push({ id: edge.targetSkillId, edges: [...current.edges, edge] });
      }
    }
    return undefined;
  }
  private requireSkill(id: SkillId): void {
    if (!this.skills.has(id)) throw new Error(`Unbekannter Skill: ${id}`);
  }
  private traverse(id: SkillId, next: (id: SkillId) => readonly SkillId[]): readonly SkillId[] {
    this.requireSkill(id);
    const visited = new Set<SkillId>([id]);
    const queue = [id];
    for (let cursor = 0; cursor < queue.length; cursor++)
      for (const target of next(queue[cursor])) {
        if (!visited.has(target)) {
          visited.add(target);
          queue.push(target);
        }
      }
    return queue.slice(1);
  }
  private assertAcyclic(next: (id: SkillId) => readonly SkillId[], message: string): void {
    const visiting = new Set<SkillId>();
    const finished = new Set<SkillId>();
    const visit = (id: SkillId): void => {
      if (visiting.has(id)) throw new Error(message);
      if (finished.has(id)) return;
      visiting.add(id);
      for (const target of next(id)) visit(target);
      visiting.delete(id);
      finished.add(id);
    };
    for (const id of this.skills.keys()) visit(id);
  }
}
