import { describe, expect, it } from 'vitest';
import { PUPPY_PROBLEMS } from './puppy-problems';
// Verbindliche Zuordnungen aus der fachlichen Freigabe, keine abgeleiteten Kausalitäten.
const expectedLinks = {
  timidity_simplify_environment: ['timidity_environment_too_difficult', 'timidity_overload'],
  timidity_increase_distance: ['timidity_environment_too_difficult', 'timidity_overload'],
  timidity_allow_exploration: ['timidity_insufficient_exploration'],
  timidity_reduce_handler_pressure: ['timidity_handler_pressure', 'timidity_handler_tension'],
  timidity_create_positive_experiences: ['timidity_insufficient_exposure', 'timidity_overload'],
  return_inviting_body_language: ['return_frontal_body_language'],
  return_use_favourable_moment: ['return_bad_timing'],
  return_do_not_chase: ['return_handler_chasing'],
  return_reduce_distractions: ['return_competing_motivation', 'return_environment_too_difficult'],
  return_simplify_environment: ['return_environment_too_difficult'],
  return_reduce_social_pressure: ['return_social_pressure', 'return_frontal_body_language'],
  release_make_return_positive: ['release_return_becomes_unattractive'],
  release_do_not_remove_immediately: ['release_object_removed_too_quickly'],
  release_offer_calm_exchange: ['release_missing_exchange'],
  release_reduce_pressure: ['release_handler_pressure'],
  release_adjust_food_use: ['release_food_promotes_dropping'],
};
describe('Verbindliche Puppy-Probleme', () => {
  it('erhält alle 17 Ursachen und 16 Anpassungen mit exakt vorgegebenen Verknüpfungen', () => {
    expect(
      PUPPY_PROBLEMS.map((p) => [p.id, p.possibleCauses.length, p.adjustments.length]),
    ).toEqual([
      ['puppy_timidity', 6, 5],
      ['puppy_reluctant_to_return', 6, 6],
      ['puppy_retrieve_release_problem', 5, 5],
    ]);
    expect(
      Object.fromEntries(
        PUPPY_PROBLEMS.flatMap((p) => p.adjustments.map((a) => [a.id, a.possibleCauseIds])),
      ),
    ).toEqual(expectedLinks);
    expect(new Set(PUPPY_PROBLEMS.flatMap((p) => p.possibleCauses.map((c) => c.id))).size).toBe(17);
    expect(new Set(PUPPY_PROBLEMS.flatMap((p) => p.adjustments.map((a) => a.id))).size).toBe(16);
    for (const problem of PUPPY_PROBLEMS) {
      const causes = new Set(problem.possibleCauses.map((c) => c.id));
      for (const adjustment of problem.adjustments) {
        expect(adjustment.possibleCauseIds.length).toBeGreaterThan(0);
        for (const id of adjustment.possibleCauseIds) expect(causes.has(id)).toBe(true);
      }
      for (const cause of problem.possibleCauses)
        expect(['handler', 'environment']).toContain(cause.area);
    }
  });
  it('verwendet ausschließlich die freigegebenen Problem-Skill-Zuordnungen', () => {
    expect(PUPPY_PROBLEMS.map((p) => p.relatedSkills)).toEqual([
      [
        'mitchell:confidence',
        'mitchell:environmental_confidence',
        'mitchell:socialisation',
        'mitchell:engagement',
      ],
      ['mitchell:handler_orientation', 'mitchell:informal_recall', 'mitchell:engagement'],
      ['mitchell:retrieve_desire', 'mitchell:engagement', 'mitchell:delivery'],
    ]);
  });
});
