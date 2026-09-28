import { TrainingRoadmap, RoadmapStage } from '../../../core/domain/training-plan/training-roadmap';
import { entityId } from '../../../core/domain/shared/identity';
import { MITCHELL_SYSTEM_ID, mitchellSource } from '../sources/source';
import { MitchellSkillCode, mitchellSkillId } from '../skills/skills';
import { PUPPY_EXERCISES } from '../puppy/exercises';
import { PUPPY_HEELWORK_INDICATORS } from '../puppy/heelwork-readiness';
import { HEELWORK_EXERCISES } from '../heelwork/exercises';
import {
  HEELWORK_SOURCE,
  HEELWORK_READINESS_GUIDANCE,
  HEELWORK_STEADINESS_GUIDANCE,
  HEELWORK_COMPETENCE_GUIDANCE,
} from '../heelwork/guidance';
export const roadmapStageId = (code: string) => entityId<'RoadmapStage'>(`roadmap_${code}`);
const source = mitchellSource('The Plan – Your Plan To Turn Your Aspiration Into A Reality');
const planned = [
  ['steadiness', 'Steadiness', ['steadiness']],
  ['setup', 'Setup', ['setup']],
  ['delivery', 'Delivery', ['delivery']],
  ['outrun_part_1', 'Outrun Part 1', ['outrun']],
  ['outrun_part_2', 'Outrun Part 2', ['outrun']],
  ['inrun_and_recall', 'Inrun and Recall', ['inrun', 'recall']],
  ['stopping_and_return', 'Training Tool – Stopping and Return on Voice/Body Language Only', []],
  ['collection', 'Collection', ['collection']],
  ['returning_to_heel', 'Returning to Heel', ['return_to_heel']],
  ['diversions', 'Diversions', ['diversions']],
  ['go_back', 'Go-Back Command', ['go_back']],
  ['stop_whistle', 'Stop Whistle', ['stop_whistle']],
  ['pulling_straight_line', 'Pulling the Dog About in a Straight Line', []],
  ['directions_part_1', 'Directions Part 1', ['directions']],
  ['directions_part_2', 'Directions Part 2', ['directions']],
  ['collecting_blinds', 'Collecting Blinds by Handling', ['blind_handling']],
  ['hunting', 'Hunting', ['hunting']],
  ['shot', 'Training for Shot', ['shot']],
  ['marking', 'Marking', ['marking']],
  ['walk_up', 'Walk-Up', ['walk_up']],
  ['jumping', 'Full Jumping', ['jumping']],
  ['water', 'Water Work', ['water']],
  ['advanced_training', 'Advanced Training', ['advanced_training']],
] as const satisfies readonly (readonly [string, string, readonly MitchellSkillCode[]])[];
const puppyGuidance = PUPPY_HEELWORK_INDICATORS.map((i) => ({
  text: i.description,
  source: i.source,
}));
export const MITCHELL_MAIN_ROADMAP: TrainingRoadmap = {
  id: entityId<'Roadmap'>('mitchell_main_roadmap'),
  title: 'Mitchell Retriever Training Roadmap',
  systemId: MITCHELL_SYSTEM_ID,
  source,
  stages: [
    {
      id: roadmapStageId('puppy_foundation'),
      title: 'Puppy Foundation',
      contentStatus: 'available',
      skillIds: [
        ...new Set(PUPPY_EXERCISES.flatMap((e) => [e.primarySkill, ...e.secondarySkills])),
      ],
      exerciseIds: PUPPY_EXERCISES.map((e) => e.id),
      completionGuidance: puppyGuidance,
      source: mitchellSource('Puppy Informal Play Training'),
    },
    {
      id: roadmapStageId('heelwork'),
      title: 'Heelwork',
      contentStatus: 'available',
      skillIds: [mitchellSkillId('heelwork')],
      exerciseIds: HEELWORK_EXERCISES.map((e) => e.id),
      prerequisiteStageIds: [roadmapStageId('puppy_foundation')],
      readinessGuidance: HEELWORK_READINESS_GUIDANCE,
      completionGuidance: [
        HEELWORK_COMPETENCE_GUIDANCE.stable!,
        HEELWORK_COMPETENCE_GUIDANCE.generalised!,
        ...HEELWORK_STEADINESS_GUIDANCE,
      ],
      source: HEELWORK_SOURCE,
    },
    ...planned.map(([code, title, skills]): RoadmapStage => ({
      id: roadmapStageId(code),
      title,
      contentStatus: 'planned',
      skillIds: skills.map(mitchellSkillId),
      exerciseIds: [],
      source,
    })),
  ],
};
