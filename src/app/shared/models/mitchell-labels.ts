import { SkillCategory, SkillCompetence, SkillCondition } from '../../core/domain/skills/skill';
import { TrainingEffect } from '../../core/domain/exercises/training-exercise';
export const COMPETENCE_LABELS: Record<SkillCompetence, string> = {
  not_started: 'Noch nicht begonnen',
  introduced: 'Eingeführt',
  learning: 'Im Aufbau',
  stable: 'Stabil',
  generalised: 'Generalisiert',
};
export const COMPETENCE_ICONS: Record<SkillCompetence, string> = {
  not_started: '○',
  introduced: '○',
  learning: '◐',
  stable: '✓',
  generalised: '✓',
};
export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  FOUNDATION: 'Grundlagen',
  CONTROL: 'Kontrolle',
  RETRIEVE_COMPONENTS: 'Retrieve-Komponenten',
  HANDLING: 'Handling',
  INDEPENDENT_WORK: 'Selbstständige Arbeit',
  ENVIRONMENT: 'Umwelt',
  ADVANCED: 'Weiterführendes Training',
};
export const EFFECT_LABELS: Record<TrainingEffect, string> = {
  drive_building: 'Motivation fördern',
  control_building: 'Kontrolle aufbauen',
  mixed: 'Gemischter Schwerpunkt',
  neutral: 'Neutraler Schwerpunkt',
};

export const CONDITION_LABELS: Record<SkillCondition, string> = {
  normal: 'Normal',
  maintenance: 'In Pflege',
  regressed: 'Rückschritt',
};
