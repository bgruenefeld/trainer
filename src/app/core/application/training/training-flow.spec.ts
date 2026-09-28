import { describe, expect, it, vi, afterEach } from 'vitest';
import { recommendExercise, exerciseHistory, nextExercises } from './training-flow';
import { PuppyDraft } from './puppy-draft';
import { MITCHELL_MAIN_ROADMAP } from '../../../data/mitchell/roadmap/roadmap';
import {
  HEELWORK_EXERCISES,
  PUPPY_EXERCISES,
  mitchellSkillId,
  MITCHELL_SYSTEM_ID,
} from '../../../data/mitchell/catalog';
import { DEMO_DOG } from '../../infrastructure/persistence/demo-dog';
import { DogSkillAssessment } from '../../domain/skills/skill-assessment';
import { entityId } from '../../domain/shared/identity';
const exercises = [...PUPPY_EXERCISES, ...HEELWORK_EXERCISES];
const heel = MITCHELL_MAIN_ROADMAP.stages[1];
function trained(exercise = HEELWORK_EXERCISES[1]) {
  const draft = new PuppyDraft(DEMO_DOG.id, exercise);
  draft.begin();
  return draft.session();
}
function assessment(
  code: Parameters<typeof mitchellSkillId>[0],
  condition: DogSkillAssessment['condition'],
): DogSkillAssessment {
  return {
    id: entityId<'Assessment'>(code),
    dogId: DEMO_DOG.id,
    systemId: MITCHELL_SYSTEM_ID,
    skillId: mitchellSkillId(code),
    competence: 'learning',
    condition,
    assessedAt: '2026-09-28T10:00:00Z',
    assessedBy: entityId<'Handler'>('handler'),
    context: 'Wiese',
    rationale: 'Beobachtet',
    observationIds: [],
  };
}
afterEach(() => vi.useRealTimers());
describe('Deterministische Trainingsführung', () => {
  it('setzt Startzeit erst beim Beginn, einmalig und unabhängig vom Speichern', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-28T10:00:00Z'));
    const draft = new PuppyDraft(DEMO_DOG.id, HEELWORK_EXERCISES[0]);
    expect(draft.startedAt()).toBeUndefined();
    expect(() => draft.session()).toThrow('Training beginnen');
    vi.setSystemTime(new Date('2026-09-28T10:05:00Z'));
    draft.begin();
    vi.setSystemTime(new Date('2026-09-28T10:15:00Z'));
    draft.begin();
    expect(draft.session().startedAt).toBe('2026-09-28T10:05:00.000Z');
    expect(draft.session().executions[0].criteria).toEqual([]);
  });
  it('empfiehlt zuletzt trainierte Übung erneut mit stabiler Erklärung ohne Completion', () => {
    const session = trained();
    const before = structuredClone(session);
    const args = [heel, exercises, [], new Map(), [session]] as const;
    const a = recommendExercise(...args);
    expect(a).toEqual(recommendExercise(...args));
    expect(a?.exercise.id).toBe(HEELWORK_EXERCISES[1].id);
    expect(a?.reasons).toContain(
      'Diese Übung wurde bereits trainiert und kann weiter gefestigt werden.',
    );
    expect(a?.reasons).toContain('Baut auf Basic Heelwork Square auf.');
    expect(session).toEqual(before);
    expect(JSON.stringify(a)).not.toMatch(/completed|score|percent|Voraussetzung erfüllt|%/i);
  });
  it('empfiehlt keine Übung eines geplanten Stage oder ohne aktuellen Stage', () => {
    for (const stage of MITCHELL_MAIN_ROADMAP.stages.slice(2))
      expect(
        recommendExercise(stage, exercises, [mitchellSkillId('heelwork')], new Map(), [trained()]),
      ).toBeUndefined();
    expect(recommendExercise(undefined, exercises, [], new Map(), [])).toBeUndefined();
  });
  it('hält Stage vor Fokus, Regression vor Pflege und Katalogreihenfolge bei Gleichstand', () => {
    const puppy = MITCHELL_MAIN_ROADMAP.stages[0];
    const recall = assessment('informal_recall', 'regressed');
    const lead = assessment('leash_introduction', 'maintenance');
    const states = new Map([
      [recall.skillId, recall],
      [lead.skillId, lead],
    ]);
    expect(recommendExercise(heel, exercises, [lead.skillId], states, [])?.exercise.id).toBe(
      HEELWORK_EXERCISES[0].id,
    );
    expect(recommendExercise(puppy, exercises, [], states, [])?.exercise.primarySkill).toBe(
      recall.skillId,
    );
    expect(
      recommendExercise(puppy, exercises, [lead.skillId], states, [])?.exercise.primarySkill,
    ).toBe(lead.skillId);
    expect(recommendExercise(puppy, exercises, [], new Map(), [])?.exercise.id).toBe(
      PUPPY_EXERCISES[0].id,
    );
  });
  it('zeigt nur explizite nächste Übung und keinen erfundenen Puppy-Schritt', () => {
    for (const exercise of PUPPY_EXERCISES) expect(nextExercises(exercise, exercises)).toEqual([]);
    expect(nextExercises(HEELWORK_EXERCISES[0], exercises).map((e) => e.id)).toEqual([
      'heelwork_mixed_rectangles',
    ]);
  });
  it('Voraussetzungen sperren nicht und fehlende Schritte werden nicht erzeugt', () => {
    const draft = new PuppyDraft(DEMO_DOG.id, HEELWORK_EXERCISES[2]);
    draft.begin();
    expect(draft.exercise.steps).toEqual([]);
    expect(draft.session().executions).toHaveLength(1);
  });
  it('erfasst nur deklarierte Faktoren ohne neue qualitative Skala', () => {
    const draft = new PuppyDraft(DEMO_DOG.id, HEELWORK_EXERCISES[2]);
    draft.distance = 999;
    draft.factorValues.turn_angle = 'Spitzere Winkel';
    draft.factorValues.pace_variation = 'Ignorieren';
    draft.begin();
    expect(draft.session().executions[0].setup.factors).toEqual([
      { factor: 'turn_angle', description: 'Spitzere Winkel' },
    ]);
  });
  it('findet letzte Aktivität unabhängig von Eingabereihenfolge', () => {
    const session = trained();
    const old = { ...session, startedAt: '2020-01-01T10:00:00Z' };
    expect(exerciseHistory([session, old]).get(HEELWORK_EXERCISES[1].id)).toBe(session.startedAt);
  });
});
