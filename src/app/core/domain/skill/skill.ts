export type SkillId = 'LINE_OUT';
export interface Skill {
  readonly id: SkillId;
  readonly name: string;
  readonly description: string;
  readonly category: 'HANDLING' | 'RETRIEVING' | 'SEARCH' | 'FOUNDATION';
}
export const LINE_OUT: Skill = {
  id: 'LINE_OUT',
  name: 'Voran',
  category: 'HANDLING',
  description: 'Auf einer geraden Linie selbstständig zum Zielbereich laufen.',
};
