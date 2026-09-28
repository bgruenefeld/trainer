import { describe, expect, it } from 'vitest';
import {
  PUPPY_EXERCISES,
  PUPPY_PROBLEMS,
  MITCHELL_SKILLS,
  MITCHELL_HANDLER_SKILLS,
  MITCHELL_DEPENDENCIES,
  MITCHELL_TRAINING_PRINCIPLES,
  MITCHELL_TRAINING_EFFECTS,
  MITCHELL_RETRIEVE_COMPONENTS,
  PUPPY_HEELWORK_INDICATORS,
} from '../catalog';
import {
  createExerciseSnapshot,
  validateExerciseSnapshot,
} from '../../../core/domain/training-session/exercise-snapshot';
import { MITCHELL_VERIFICATION_CANDIDATES } from '../../verification/mitchell-statements';
const byId = (id: string) => PUPPY_EXERCISES.find((e) => e.id === id)!;
describe('Kanonischer Mitchell-Seed', () => {
  it('enthält genau die freigegebenen Skill- und Handler-Codes ohne Duplikate', () => {
    expect(MITCHELL_SKILLS.map((s) => s.code)).toEqual([
      'environmental_confidence',
      'socialisation',
      'handler_orientation',
      'informal_recall',
      'leash_introduction',
      'retrieve_desire',
      'confidence',
      'engagement',
      'heelwork',
      'steadiness',
      'sit_stay',
      'recall',
      'stop',
      'stop_whistle',
      'setup',
      'outrun',
      'inrun',
      'collection',
      'delivery',
      'return_to_heel',
      'go_back',
      'straight_line',
      'directions',
      'left',
      'right',
      'blind_handling',
      'handler_tolerance',
      'marking',
      'hunting',
      'diversions',
      'shot',
      'water',
      'jumping',
      'obstacles',
      'cover',
      'walk_up',
      'picking_up',
      'advanced_training',
    ]);
    expect(new Set(MITCHELL_SKILLS.map((s) => s.id)).size).toBe(38);
    expect(MITCHELL_HANDLER_SKILLS.map((s) => s.code)).toEqual([
      'timing',
      'body_language',
      'positioning',
      'observation',
      'consistency',
      'cue_clarity',
      'pressure_control',
      'training_planning',
      'difficulty_management',
      'emotional_self_control',
      'active_handling',
    ]);
    expect(new Set(MITCHELL_HANDLER_SKILLS.map((s) => s.id)).size).toBe(11);
  });
  it('enthält exakt elf gerichtete Beziehungen mit vorgegebenen Typen und ohne Kompetenzschwellen', () => {
    expect(
      MITCHELL_DEPENDENCIES.map((e) => [
        e.requirement.skillId.replace('mitchell:', ''),
        e.targetSkillId.replace('mitchell:', ''),
        e.requirement.type,
      ]),
    ).toEqual([
      ['heelwork', 'setup', 'soft'],
      ['setup', 'outrun', 'soft'],
      ['go_back', 'stop_whistle', 'soft'],
      ['recall', 'directions', 'soft'],
      ['stop', 'directions', 'hard'],
      ['go_back', 'directions', 'hard'],
      ['directions', 'blind_handling', 'hard'],
      ['heelwork', 'return_to_heel', 'maintenance'],
      ['steadiness', 'walk_up', 'hard'],
      ['handler_orientation', 'informal_recall', 'soft'],
      ['heelwork', 'steadiness', 'hard'],
    ]);
    const skills = new Set(MITCHELL_SKILLS.map((s) => s.id));
    for (const edge of MITCHELL_DEPENDENCIES) {
      expect(skills.has(edge.targetSkillId)).toBe(true);
      expect(skills.has(edge.requirement.skillId)).toBe(true);
      expect(edge.requirement.acceptedCompetences).toBeUndefined();
    }
  });
  it('löst alle Übungs-, Handler-, Problem- und Retrieve-Referenzen auf', () => {
    const skills = new Set(MITCHELL_SKILLS.map((s) => s.id));
    const handlers = new Set(MITCHELL_HANDLER_SKILLS.map((s) => s.id));
    for (const exercise of PUPPY_EXERCISES) {
      for (const skill of [exercise.primarySkill, ...exercise.secondarySkills])
        expect(skills.has(skill)).toBe(true);
      for (const handler of exercise.handlerSkills) expect(handlers.has(handler)).toBe(true);
      for (const adjustment of [...exercise.progression, ...exercise.regression])
        for (const change of adjustment.changes)
          expect(exercise.difficultyFactors).toContain(change.factor);
    }
    for (const problem of PUPPY_PROBLEMS)
      for (const skill of problem.relatedSkills) expect(skills.has(skill)).toBe(true);
    for (const phase of MITCHELL_RETRIEVE_COMPONENTS.phases)
      for (const skill of phase.skills) expect(skills.has(skill)).toBe(true);
    expect(
      MITCHELL_RETRIEVE_COMPONENTS.phases.map((p) => [
        p.phase,
        p.skills.map((s) => s.replace('mitchell:', '')),
      ]),
    ).toEqual([
      ['preparation', ['heelwork', 'setup']],
      ['outbound', ['outrun', 'stop', 'directions']],
      ['acquisition', ['hunting', 'collection']],
      ['inbound', ['inrun', 'delivery', 'return_to_heel']],
    ]);
  });
  it('enthält ausschließlich die sieben Puppy-Übungen mit vorgegebenen Effekten', () => {
    expect(PUPPY_EXERCISES.map((e) => [e.id, e.trainingEffect])).toEqual([
      ['puppy_environmental_exposure', 'neutral'],
      ['puppy_handler_orientation', 'neutral'],
      ['puppy_informal_recall', 'mixed'],
      ['puppy_leash_introduction', 'neutral'],
      ['puppy_informal_retrieve', 'drive_building'],
      ['puppy_intro_sit_stay', 'control_building'],
      ['puppy_terrain_exploration', 'neutral'],
    ]);
    expect(PUPPY_EXERCISES.map((e) => e.successCriteria.length)).toEqual([3, 2, 2, 2, 3, 1, 2]);
    expect(byId('puppy_leash_introduction').primarySkill).toBe('mitchell:leash_introduction');
    expect(byId('puppy_terrain_exploration').secondarySkills).toEqual(['mitchell:confidence']);
    expect(byId('puppy_informal_retrieve').secondarySkills).toEqual([
      'mitchell:handler_orientation',
      'mitchell:engagement',
      'mitchell:informal_recall',
    ]);
    expect(byId('puppy_handler_orientation').steps.map((s) => s.instruction)).toEqual([
      'Handler bewegt sich.',
      'Welpe erhält Raum zur Exploration.',
      'Welpe orientiert sich von sich aus zurück.',
      'Handler reagiert einladend.',
    ]);
  });
  it('bewahrt gerichtete Retrieve-Anpassungen und trennt Handler-Guidance', () => {
    const exercise = byId('puppy_informal_retrieve');
    expect(exercise.progression.map((a) => a.changes.map((c) => [c.factor, c.direction]))).toEqual([
      [['novelty', 'increase']],
      [['novelty', 'increase']],
      [['distractions', 'increase']],
    ]);
    expect(exercise.regression.map((a) => a.changes.map((c) => [c.factor, c.direction]))).toEqual([
      [['distractions', 'decrease']],
      [['distance', 'decrease']],
      [],
    ]);
    expect(exercise.regression[2].description).toBe('Umgebung vereinfachen.');
    expect(exercise.guidance?.notes).toContain(
      'Handler-Anpassung bei Regression: Handlerverhalten stärker einladend gestalten.',
    );
  });
  it.each(PUPPY_EXERCISES)(
    'erzeugt einen unabhängigen historischen Snapshot für $id',
    (exercise) => {
      const definition = structuredClone(exercise);
      const snapshot = createExerciseSnapshot(definition);
      const before = structuredClone(snapshot);
      validateExerciseSnapshot(snapshot);
      Object.assign(definition, { title: 'Späterer Titel' });
      Object.assign(definition.successCriteria[0], { description: 'Spätere Bewertung' });
      Object.assign(definition.source.evidence, { reference: 'Spätere Herkunft' });
      expect(snapshot).toEqual(before);
    },
  );
  it('ergänzt keine Alters-/Zahlenregeln oder Effekte nicht genannter Skills', () => {
    expect(PUPPY_HEELWORK_INDICATORS).toHaveLength(7);
    for (const e of PUPPY_EXERCISES) {
      expect(e.prerequisites).toEqual([]);
      expect(e.physicalConstraints).toEqual([]);
      expect(e.guidance?.recommendedAge).toBeUndefined();
      expect(e.guidance?.initialTrainingDuration).toBeUndefined();
      expect(e.source.evidence.kind).toBe('provided_summary');
      expect(e.source.section).toBe('Puppy Informal Play Training');
      expect(e.source.evidence).not.toHaveProperty('edition');
      expect(
        [e.objective, ...e.setup.instructions, ...e.successCriteria.map((c) => c.description)].join(
          ' ',
        ),
      ).not.toMatch(/\d|%/);
    }
    expect(Object.keys(MITCHELL_TRAINING_EFFECTS)).toHaveLength(15);
    expect(MITCHELL_TRAINING_EFFECTS.confidence).toBeUndefined();
    expect(MITCHELL_TRAINING_PRINCIPLES).toHaveLength(15);
    expect(MITCHELL_VERIFICATION_CANDIDATES).toHaveLength(2);
    expect(
      MITCHELL_VERIFICATION_CANDIDATES.every(
        (s) => s.source.evidence.kind === 'needs_verification',
      ),
    ).toBe(true);
    expect(
      MITCHELL_TRAINING_PRINCIPLES.every((s) => s.source.evidence.kind === 'provided_summary'),
    ).toBe(true);
  });
});
