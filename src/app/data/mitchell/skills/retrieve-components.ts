import { RetrieveComponentModel } from '../../../core/domain/training-session/retrieve';
import { MITCHELL_SYSTEM_ID, mitchellSource } from '../sources/source';
import { mitchellSkillId } from './skills';
export const MITCHELL_RETRIEVE_COMPONENTS: RetrieveComponentModel = {
  systemId: MITCHELL_SYSTEM_ID,
  source: mitchellSource(),
  phases: [
    { phase: 'preparation', skills: [mitchellSkillId('heelwork'), mitchellSkillId('setup')] },
    {
      phase: 'outbound',
      skills: [mitchellSkillId('outrun'), mitchellSkillId('stop'), mitchellSkillId('directions')],
    },
    { phase: 'acquisition', skills: [mitchellSkillId('hunting'), mitchellSkillId('collection')] },
    {
      phase: 'inbound',
      skills: [
        mitchellSkillId('inrun'),
        mitchellSkillId('delivery'),
        mitchellSkillId('return_to_heel'),
      ],
    },
  ],
};
