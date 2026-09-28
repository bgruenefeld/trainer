import {
  TrainingProblem,
  ProblemCause,
  ProblemAdjustment,
} from '../../../core/domain/problems/training-problem';
import { entityId } from '../../../core/domain/shared/identity';
import { MitchellSkillCode, mitchellSkillId } from '../skills/skills';
import { MITCHELL_SYSTEM_ID, mitchellSource } from '../sources/source';
interface SeedProblem {
  readonly id: string;
  readonly title: string;
  readonly observedBehaviour: string;
  readonly skills: readonly MitchellSkillCode[];
  readonly possibleCauses: readonly Omit<ProblemCause, 'source'>[];
  readonly adjustments: readonly Omit<ProblemAdjustment, 'source'>[];
}
const definitions = [
  {
    id: 'puppy_timidity',
    title: 'Puppy seems timid or shy',
    observedBehaviour:
      'Der Welpe wirkt in Trainings- oder Umweltsituationen zurückhaltend oder unsicher.',
    skills: ['confidence', 'environmental_confidence', 'socialisation', 'engagement'],
    possibleCauses: [
      {
        id: 'timidity_environment_too_difficult',
        description: 'Umgebung ist für den aktuellen Entwicklungsstand zu schwierig.',
        area: 'environment',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'timidity_insufficient_exposure',
        description: 'Passende positive Umweltgewöhnung fehlt oder reicht noch nicht aus.',
        area: 'environment',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'timidity_handler_pressure',
        description: 'Sozialer oder körpersprachlicher Druck ist zu hoch.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'timidity_handler_tension',
        description: 'Handler wirkt angespannt.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'timidity_insufficient_exploration',
        description: 'Der Welpe erhält zu wenig Möglichkeit zur selbstständigen Exploration.',
        area: 'environment',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'timidity_overload',
        description: 'Gesamtsituation überfordert den Welpen.',
        area: 'environment',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
    ],
    adjustments: [
      {
        id: 'timidity_simplify_environment',
        description: 'Umgebung vereinfachen.',
        possibleCauseIds: ['timidity_environment_too_difficult', 'timidity_overload'],
      },
      {
        id: 'timidity_increase_distance',
        description: 'Distanz zu belastenden Reizen erhöhen.',
        possibleCauseIds: ['timidity_environment_too_difficult', 'timidity_overload'],
      },
      {
        id: 'timidity_allow_exploration',
        description: 'Selbstständige Exploration ermöglichen.',
        possibleCauseIds: ['timidity_insufficient_exploration'],
      },
      {
        id: 'timidity_reduce_handler_pressure',
        description: 'Handlerdruck reduzieren.',
        possibleCauseIds: ['timidity_handler_pressure', 'timidity_handler_tension'],
      },
      {
        id: 'timidity_create_positive_experiences',
        description: 'Positive und überschaubare Erfahrungen schaffen.',
        possibleCauseIds: ['timidity_insufficient_exposure', 'timidity_overload'],
      },
    ],
  },
  {
    id: 'puppy_reluctant_to_return',
    title: 'Puppy reluctant to come to handler',
    observedBehaviour: 'Der Welpe zögert, zum Handler zurückzukehren.',
    skills: ['handler_orientation', 'informal_recall', 'engagement'],
    possibleCauses: [
      {
        id: 'return_frontal_body_language',
        description: 'Körpersprache des Handlers ist zu frontal oder zu stark.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'return_bad_timing',
        description: 'Timing des Signals ist ungünstig.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'return_handler_chasing',
        description: 'Handler verfolgt den Welpen.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'return_competing_motivation',
        description: 'Gegenstand oder Umgebung ist aktuell attraktiver als der Handler.',
        area: 'environment',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'return_environment_too_difficult',
        description: 'Umgebung ist zu schwierig.',
        area: 'environment',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'return_social_pressure',
        description: 'Sozialer Druck ist zu hoch.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
    ],
    adjustments: [
      {
        id: 'return_inviting_body_language',
        description: 'Körpersprache einladender gestalten.',
        possibleCauseIds: ['return_frontal_body_language'],
      },
      {
        id: 'return_use_favourable_moment',
        description: 'Günstigen Moment für die Kontaktaufnahme nutzen.',
        possibleCauseIds: ['return_bad_timing'],
      },
      {
        id: 'return_do_not_chase',
        description: 'Welpen nicht verfolgen.',
        possibleCauseIds: ['return_handler_chasing'],
      },
      {
        id: 'return_reduce_distractions',
        description: 'Ablenkungen reduzieren.',
        possibleCauseIds: ['return_competing_motivation', 'return_environment_too_difficult'],
      },
      {
        id: 'return_simplify_environment',
        description: 'Umgebung vereinfachen.',
        possibleCauseIds: ['return_environment_too_difficult'],
      },
      {
        id: 'return_reduce_social_pressure',
        description: 'Sozialen Druck reduzieren.',
        possibleCauseIds: ['return_social_pressure', 'return_frontal_body_language'],
      },
    ],
  },
  {
    id: 'puppy_retrieve_release_problem',
    title: 'Puppy does not want to give up retrieve',
    observedBehaviour:
      'Der Welpe möchte den Apportiergegenstand beim Handler nicht freiwillig abgeben.',
    skills: ['retrieve_desire', 'engagement', 'delivery'],
    possibleCauses: [
      {
        id: 'release_object_removed_too_quickly',
        description: 'Gegenstand wird regelmäßig zu schnell weggenommen.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'release_return_becomes_unattractive',
        description: 'Rückkehr zum Handler wird dadurch unattraktiv.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'release_missing_exchange',
        description: 'Sinnvoller Tausch fehlt.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'release_food_promotes_dropping',
        description: 'Ungünstiger Futtereinsatz fördert vorzeitiges Fallenlassen.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'release_handler_pressure',
        description: 'Handler erzeugt unnötigen Druck.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
    ],
    adjustments: [
      {
        id: 'release_make_return_positive',
        description: 'Rückkehr positiv gestalten.',
        possibleCauseIds: ['release_return_becomes_unattractive'],
      },
      {
        id: 'release_do_not_remove_immediately',
        description: 'Gegenstand nicht unmittelbar nach Ankunft wegnehmen.',
        possibleCauseIds: ['release_object_removed_too_quickly'],
      },
      {
        id: 'release_offer_calm_exchange',
        description: 'Ruhigen Tausch ermöglichen.',
        possibleCauseIds: ['release_missing_exchange'],
      },
      {
        id: 'release_reduce_pressure',
        description: 'Druck reduzieren.',
        possibleCauseIds: ['release_handler_pressure'],
      },
      {
        id: 'release_adjust_food_use',
        description: 'Futter nicht so einsetzen, dass vorzeitiges Fallenlassen gefördert wird.',
        possibleCauseIds: ['release_food_promotes_dropping'],
      },
    ],
  },
] as const satisfies readonly SeedProblem[];
export type PuppyProblemCode = (typeof definitions)[number]['id'];
export const puppyProblemId = (code: PuppyProblemCode) => entityId<'TrainingProblem'>(code);
export const PUPPY_PROBLEMS: readonly TrainingProblem[] = definitions.map((input) => {
  const source = mitchellSource('Puppy Informal Play Training');
  return {
    id: puppyProblemId(input.id),
    systemId: MITCHELL_SYSTEM_ID,
    title: input.title,
    observedBehaviour: input.observedBehaviour,
    relatedSkills: input.skills.map(mitchellSkillId),
    possibleCauses: input.possibleCauses.map((cause) => ({ ...cause, source })),
    adjustments: input.adjustments.map((adjustment) => ({ ...adjustment, source })),
    source,
  };
});
