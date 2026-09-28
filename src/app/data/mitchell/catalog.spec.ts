import { describe, expect, it } from 'vitest';
import { SkillGraph } from '../../core/domain/skills/skill-graph';
import { entityId } from '../../core/domain/shared/identity';
import { validateSource } from '../../core/domain/sources/training-source';
import { SkillDependency } from '../../core/domain/skills/skill';
import {
  MITCHELL_SKILLS,
  MITCHELL_SYSTEM_ID,
  MITCHELL_DEPENDENCIES,
  MITCHELL_HANDLER_SKILLS,
  MITCHELL_RETRIEVE_COMPONENTS,
  PUPPY_HEELWORK_INDICATORS,
  mitchellSkillId as id,
} from './catalog';
const graph = () => new SkillGraph(MITCHELL_SYSTEM_ID, MITCHELL_SKILLS, MITCHELL_DEPENDENCIES);
const edge = (
  from: Parameters<typeof id>[0],
  to: Parameters<typeof id>[0],
  type: SkillDependency['requirement']['type'],
): SkillDependency => ({
  ...MITCHELL_DEPENDENCIES[0],
  id: `test:${from}:${to}:${type}`,
  targetSkillId: id(to),
  requirement: { ...MITCHELL_DEPENDENCIES[0].requirement, skillId: id(from), type },
});
describe('Mitchell-Katalog', () => {
  it('enthält genau die 38 kanonischen Skills', () => {
    expect(MITCHELL_SKILLS).toHaveLength(38);
    expect(new Set(MITCHELL_SKILLS.map((skill) => skill.category)).size).toBe(7);
    expect(graph().getSkill(id('leash_introduction')).id).not.toBe(id('heelwork'));
  });
  it('deklariert Zusammenfassungen statt erfundener Buchstellen und Schwellen', () => {
    const sources = [
      ...MITCHELL_SKILLS,
      ...MITCHELL_HANDLER_SKILLS,
      ...PUPPY_HEELWORK_INDICATORS,
      MITCHELL_RETRIEVE_COMPONENTS,
    ].map((item) => item.source);
    for (const source of sources) {
      expect(() => validateSource(source)).not.toThrow();
      expect(source.evidence.kind).toBe('provided_summary');
      expect(source.chapter).toBeUndefined();
    }
    expect(
      MITCHELL_DEPENDENCIES.every((edge) => edge.requirement.acceptedCompetences === undefined),
    ).toBe(true);
    expect(MITCHELL_HANDLER_SKILLS).toHaveLength(11);
    expect(new Set(MITCHELL_HANDLER_SKILLS.map((skill) => skill.id)).size).toBe(11);
  });
  it('hat auflösbare Retrieve-, Readiness- und Constraint-Referenzen', () => {
    const g = graph();
    for (const phase of MITCHELL_RETRIEVE_COMPONENTS.phases)
      for (const skill of phase.skills) expect(g.getSkill(skill)).toBeDefined();
    for (const indicator of PUPPY_HEELWORK_INDICATORS)
      for (const skill of indicator.relatedSkills) expect(g.getSkill(skill)).toBeDefined();
    expect(MITCHELL_RETRIEVE_COMPONENTS.phases.map((phase) => phase.phase)).toEqual([
      'preparation',
      'outbound',
      'acquisition',
      'inbound',
    ]);
  });
});
describe('Skill-Graph', () => {
  it('unterscheidet direkte Voraussetzungen, Vorfahren und gerichtete Erklärungspfade', () => {
    const g = graph();
    expect(
      g.prerequisites(id('directions'), ['hard']).map((edge) => edge.requirement.skillId),
    ).toEqual([id('stop'), id('go_back')]);
    expect(g.ancestors(id('blind_handling'), ['hard'])).toEqual([
      id('directions'),
      id('stop'),
      id('go_back'),
    ]);
    expect(g.path(id('go_back'), id('blind_handling'))?.map((edge) => edge.targetSkillId)).toEqual([
      id('directions'),
      id('blind_handling'),
    ]);
    expect(g.path(id('blind_handling'), id('go_back'))).toBeUndefined();
    expect(g.path(id('go_back'), id('go_back'))).toEqual([]);
  });
  it('filtert Soft-Einflüsse und gibt jeden Nachfolger einmal aus', () => {
    const g = graph();
    expect(g.descendants(id('heelwork'), ['soft'])).toEqual([id('setup'), id('outrun')]);
    expect(g.descendants(id('heelwork'), ['hard'])).toEqual([id('steadiness'), id('walk_up')]);
    expect(g.descendants(id('heelwork'), [])).toEqual([]);
    const diamond = new SkillGraph(MITCHELL_SYSTEM_ID, MITCHELL_SKILLS, [
      edge('stop', 'left', 'soft'),
      edge('stop', 'right', 'soft'),
      edge('left', 'directions', 'soft'),
      edge('right', 'directions', 'soft'),
    ]);
    expect(diamond.descendants(id('stop'))).toEqual([id('left'), id('right'), id('directions')]);
  });
  it('erlaubt Maintenance-Rückbezüge und terminiert bei gemischten Zyklen', () => {
    // Synthetische Kante: keine zusätzliche Mitchell-Behauptung.
    const g = new SkillGraph(MITCHELL_SYSTEM_ID, MITCHELL_SKILLS, [
      ...MITCHELL_DEPENDENCIES,
      edge('blind_handling', 'go_back', 'maintenance'),
    ]);
    expect(g.descendants(id('go_back'))).not.toContain(id('go_back'));
    expect(g.dependents(id('blind_handling'), ['maintenance'])).toHaveLength(1);
    expect(g.path(id('blind_handling'), id('directions'))).toHaveLength(2);
  });
  it('weist harte Zyklen und Selbstbezüge zurück', () => {
    expect(
      () =>
        new SkillGraph(MITCHELL_SYSTEM_ID, MITCHELL_SKILLS, [
          ...MITCHELL_DEPENDENCIES,
          edge('blind_handling', 'go_back', 'hard'),
        ]),
    ).toThrow('Zyklus');
    expect(
      () => new SkillGraph(MITCHELL_SYSTEM_ID, MITCHELL_SKILLS, [edge('stop', 'stop', 'soft')]),
    ).toThrow('selbst');
  });
  it('weist unbekannte Referenzen, doppelte IDs und doppelte Beziehungen zurück', () => {
    expect(
      () =>
        new SkillGraph(MITCHELL_SYSTEM_ID, MITCHELL_SKILLS, [
          { ...MITCHELL_DEPENDENCIES[0], targetSkillId: entityId<'Skill'>('unknown') },
        ]),
    ).toThrow('Referenz');
    expect(
      () => new SkillGraph(MITCHELL_SYSTEM_ID, [...MITCHELL_SKILLS, MITCHELL_SKILLS[0]], []),
    ).toThrow('eindeutig');
    expect(
      () =>
        new SkillGraph(MITCHELL_SYSTEM_ID, MITCHELL_SKILLS, [
          MITCHELL_DEPENDENCIES[0],
          { ...MITCHELL_DEPENDENCIES[0], id: 'another' },
        ]),
    ).toThrow('Doppelte');
    expect(() => graph().getSkill(entityId<'Skill'>('unknown'))).toThrow('Unbekannter');
  });
  it('verhindert fremde Systeme und zyklische Subskills ohne Abhängigkeiten zu erfinden', () => {
    expect(() => new SkillGraph(entityId<'TrainingSystem'>('other'), MITCHELL_SKILLS, [])).toThrow(
      'System',
    );
    const skills = MITCHELL_SKILLS.map((skill) =>
      skill.id === id('left')
        ? { ...skill, subskills: [id('right')] }
        : skill.id === id('right')
          ? { ...skill, subskills: [id('left')] }
          : skill,
    );
    expect(() => new SkillGraph(MITCHELL_SYSTEM_ID, skills, [])).toThrow('Subskills');
  });
  it('isoliert den Graph vor nachträglichen Änderungen an Eingaben und Rückgaben', () => {
    const skills = structuredClone(MITCHELL_SKILLS);
    const edges = structuredClone(MITCHELL_DEPENDENCIES);
    const g = new SkillGraph(MITCHELL_SYSTEM_ID, skills, edges);
    Object.assign(skills[0], { name: 'Manipuliert' });
    Object.assign(edges[0], { targetSkillId: id('stop') });
    Object.assign(g.getSkill(skills[0].id), { name: 'Manipuliert' });
    expect(g.getSkill(skills[0].id).name).not.toBe('Manipuliert');
    expect(g.prerequisites(id('setup'))).toHaveLength(1);
  });
});
