import {
  TrainingProblem,
  ProblemCause,
  ProblemAdjustment,
} from '../../../core/domain/problems/training-problem';
import { entityId } from '../../../core/domain/shared/identity';
import { MitchellSkillCode, mitchellSkillId } from '../skills/skills';
import { MITCHELL_SYSTEM_ID } from '../sources/source';
import { HEELWORK_SOURCE } from './guidance';
interface SeedProblem {
  readonly id: string;
  readonly title: string;
  readonly observedBehaviour: string;
  readonly skills: readonly MitchellSkillCode[];
  readonly causes: readonly Omit<ProblemCause, 'source'>[];
  readonly adjustments: readonly Omit<ProblemAdjustment, 'source'>[];
}
const definitions = [
  {
    id: 'heelwork_nose_down',
    title: 'Dog puts nose down or hunts at heel',
    observedBehaviour:
      'Der Hund senkt beim Heelwork wiederholt die Nase und beginnt zu suchen oder zu schnüffeln.',
    skills: ['heelwork'],
    causes: [
      {
        id: 'heelwork_nose_environment',
        description: 'Umgebung enthält zu viele interessante Gerüche oder Suchreize.',
        area: 'environment',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'heelwork_nose_early_hunting',
        description:
          'Hunting wurde früh oder stark gefördert, bevor Heelwork stabil aufgebaut war.',
        area: 'training',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'heelwork_nose_cover',
        description: 'Deckung oder Gelände fördert Suchverhalten.',
        area: 'environment',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
    ],
    adjustments: [
      {
        id: 'heelwork_nose_reduce_scent',
        description: 'Auf reizärmeren Untergrund wechseln.',
        possibleCauseIds: ['heelwork_nose_environment', 'heelwork_nose_cover'],
      },
      {
        id: 'heelwork_nose_reduce_complexity',
        description: 'Umweltkomplexität reduzieren.',
        possibleCauseIds: ['heelwork_nose_environment', 'heelwork_nose_cover'],
      },
      {
        id: 'heelwork_nose_refocus',
        description: 'Aufmerksamkeit wieder auf den Handler und die Heelwork-Aufgabe lenken.',
        possibleCauseIds: [
          'heelwork_nose_environment',
          'heelwork_nose_early_hunting',
          'heelwork_nose_cover',
        ],
      },
    ],
  },
  {
    id: 'heelwork_pulling_forward',
    title: 'Dog pulls forward at heel',
    observedBehaviour: 'Der Hund läuft dauerhaft oder wiederholt zu weit vor dem Handler.',
    skills: ['heelwork'],
    causes: [
      {
        id: 'heelwork_forward_position',
        description: 'Hund hat die gewünschte Heelwork-Position noch nicht ausreichend verstanden.',
        area: 'dog',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'heelwork_forward_handler_timing',
        description: 'Handler korrigiert Positionsverlust zu spät.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'heelwork_forward_turn_pattern',
        description:
          'Training enthält zu viele Richtungswechsel vom Hund weg und zu wenig positionskorrigierende Turns.',
        area: 'training',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'heelwork_forward_attention',
        description: 'Hund ist nicht ausreichend am Handler orientiert.',
        area: 'dog',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
    ],
    adjustments: [
      {
        id: 'heelwork_forward_turn_into',
        description: 'Häufiger gezielt in Richtung des Hundes drehen.',
        possibleCauseIds: ['heelwork_forward_position', 'heelwork_forward_turn_pattern'],
      },
      {
        id: 'heelwork_forward_correct_earlier',
        description: 'Positionsverlust früher erkennen und korrigieren.',
        possibleCauseIds: ['heelwork_forward_handler_timing', 'heelwork_forward_position'],
      },
      {
        id: 'heelwork_forward_restore_lead',
        description: 'Vorübergehend wieder mit Leinenunterstützung arbeiten.',
        possibleCauseIds: ['heelwork_forward_position', 'heelwork_forward_attention'],
      },
      {
        id: 'heelwork_forward_refocus',
        description: 'Orientierung zum Handler wieder stärker herstellen.',
        possibleCauseIds: ['heelwork_forward_attention'],
      },
    ],
  },
  {
    id: 'heelwork_too_far_side',
    title: 'Dog stays too far away at the side',
    observedBehaviour: 'Der Hund hält beim Heelwork seitlich zu großen Abstand zum Handler.',
    skills: ['heelwork', 'engagement'],
    causes: [
      {
        id: 'heelwork_side_handler_pressure',
        description: 'Handler erzeugt zu viel sozialen oder körpersprachlichen Druck.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'heelwork_side_unpleasant_training',
        description: 'Hund erlebt die Nähe zum Handler im Heelwork als unangenehm.',
        area: 'training',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'heelwork_side_handler_mood',
        description: 'Handlerverhalten oder Stimmung beeinträchtigt die Zusammenarbeit.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'heelwork_side_low_social_reward',
        description: 'Positive soziale Interaktion während des Heelworks ist zu gering.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
    ],
    adjustments: [
      {
        id: 'heelwork_side_reduce_pressure',
        description: 'Sozialen und körpersprachlichen Druck reduzieren.',
        possibleCauseIds: ['heelwork_side_handler_pressure', 'heelwork_side_unpleasant_training'],
      },
      {
        id: 'heelwork_side_positive_interaction',
        description: 'Positive soziale Interaktion verstärken.',
        possibleCauseIds: ['heelwork_side_low_social_reward', 'heelwork_side_unpleasant_training'],
      },
      {
        id: 'heelwork_side_review_handler',
        description: 'Eigenes Handlerverhalten und Stimmung überprüfen.',
        possibleCauseIds: ['heelwork_side_handler_mood', 'heelwork_side_handler_pressure'],
      },
      {
        id: 'heelwork_side_find_cause',
        description: 'Ursache dafür analysieren, warum der Hund ungern nah beim Handler arbeitet.',
        possibleCauseIds: [
          'heelwork_side_handler_pressure',
          'heelwork_side_unpleasant_training',
          'heelwork_side_handler_mood',
          'heelwork_side_low_social_reward',
        ],
      },
    ],
  },
  {
    id: 'heelwork_lagging',
    title: 'Dog continually lags behind',
    observedBehaviour:
      'Der Hund bleibt beim Heelwork wiederholt hinter der gewünschten Position zurück.',
    skills: ['heelwork', 'confidence', 'engagement', 'retrieve_desire'],
    causes: [
      {
        id: 'heelwork_lagging_timidity',
        description: 'Hund ist unsicher oder sensibel.',
        area: 'dog',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'heelwork_lagging_handler_pressure',
        description: 'Handler war im Heelwork zu streng oder körpersprachlich zu stark.',
        area: 'handler',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
      {
        id: 'heelwork_lagging_low_motivation',
        description: 'Motivation und Vorwärtsdrang sind zu gering.',
        area: 'dog',
        relatedSkills: [],
        handlerSkills: [],
        factors: [],
      },
    ],
    adjustments: [
      {
        id: 'heelwork_lagging_encourage',
        description: 'Hund aktiv und positiv zum Aufschließen ermuntern.',
        possibleCauseIds: ['heelwork_lagging_timidity', 'heelwork_lagging_low_motivation'],
      },
      {
        id: 'heelwork_lagging_reduce_pressure',
        description: 'Handlerdruck reduzieren.',
        possibleCauseIds: ['heelwork_lagging_handler_pressure', 'heelwork_lagging_timidity'],
      },
      {
        id: 'heelwork_lagging_add_forward_motivation',
        description: 'Geeigneten Retrieve-/Markierungsreiz nutzen, um Vorwärtsbewegung zu fördern.',
        possibleCauseIds: ['heelwork_lagging_low_motivation'],
      },
    ],
  },
] as const satisfies readonly SeedProblem[];
export const HEELWORK_PROBLEMS: readonly TrainingProblem[] = definitions.map((item) => ({
  id: entityId<'TrainingProblem'>(item.id),
  systemId: MITCHELL_SYSTEM_ID,
  title: item.title,
  observedBehaviour: item.observedBehaviour,
  relatedSkills: item.skills.map(mitchellSkillId),
  possibleCauses: item.causes.map((cause) => ({ ...cause, source: HEELWORK_SOURCE })),
  adjustments: item.adjustments.map((adjustment) => ({ ...adjustment, source: HEELWORK_SOURCE })),
  source: HEELWORK_SOURCE,
}));
