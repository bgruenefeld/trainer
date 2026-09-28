import { describe, expect, it } from 'vitest';
import { createExerciseSnapshot } from './exercise-snapshot';
import { TrainingExercise } from '../exercises/training-exercise';
import { entityId } from '../shared/identity';
import { SourceEvidence } from '../sources/training-source';

const systemId = entityId<'TrainingSystem'>('test');
const skill = entityId<'Skill'>('skill');
function definition(evidence: SourceEvidence): TrainingExercise {
  return {
    id: entityId<'Exercise'>('exercise'),
    systemId,
    version: '1',
    title: 'Original',
    primarySkill: skill,
    secondarySkills: [skill],
    handlerSkills: [entityId<'HandlerSkill'>('handler')],
    trainingEffect: 'mixed',
    successCriteria: [
      {
        id: entityId<'Criterion'>('criterion'),
        description: 'Original criterion',
        relatedSkills: [skill],
      },
    ],
    source: {
      systemId,
      author: 'Author',
      title: 'Source',
      method: 'Method',
      section: 'Section',
      chapter: 'Chapter',
      evidence,
    },
    objective: 'Test',
    prerequisites: [],
    purpose: [],
    workingMode: 'mixed',
    difficultyFactors: [],
    optimalTriggers: [],
    setup: { instructions: [], equipment: [], conditions: [] },
    steps: [],
    expectedBehaviour: [],
    progression: [],
    regression: [],
    commonProblems: [],
    cautions: [],
    physicalConstraints: [],
  };
}
describe('Unabhängiger ExerciseSnapshot', () => {
  it.each<SourceEvidence>([
    { kind: 'provided_summary', reference: 'Reference' },
    { kind: 'book_verified', locator: 'Page', edition: 'Edition' },
    { kind: 'needs_verification', reason: 'Reason' },
  ])('kopiert alle verschachtelten Felder einschließlich $kind', (evidence) => {
    const exercise = definition(evidence);
    const snapshot = createExerciseSnapshot(exercise);
    const expected = structuredClone(snapshot);
    expect(snapshot.secondarySkills).not.toBe(exercise.secondarySkills);
    expect(snapshot.handlerSkills).not.toBe(exercise.handlerSkills);
    expect(snapshot.successCriteria).not.toBe(exercise.successCriteria);
    expect(snapshot.successCriteria[0]).not.toBe(exercise.successCriteria[0]);
    expect(snapshot.successCriteria[0].relatedSkills).not.toBe(
      exercise.successCriteria[0].relatedSkills,
    );
    expect(snapshot.source).not.toBe(exercise.source);
    expect(snapshot.source.evidence).not.toBe(exercise.source.evidence);
    Object.assign(exercise, { title: 'Changed', version: '2' });
    Object.assign(exercise.secondarySkills, { 0: entityId<'Skill'>('changed') });
    Object.assign(exercise.handlerSkills, { 0: entityId<'HandlerSkill'>('changed') });
    Object.assign(exercise.successCriteria[0], { description: 'Changed' });
    Object.assign(exercise.successCriteria[0].relatedSkills, { 0: entityId<'Skill'>('changed') });
    Object.assign(exercise.source, { title: 'Changed', section: 'Changed' });
    Object.assign(evidence, {
      reference: 'Changed',
      locator: 'Changed',
      edition: 'Changed',
      reason: 'Changed',
    });
    expect(snapshot).toEqual(expected);
    expect(snapshot).not.toHaveProperty('steps');
    expect(snapshot).not.toHaveProperty('prerequisites');
  });
});
