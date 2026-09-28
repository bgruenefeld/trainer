import { ArchivedTraining } from '../../application/training-archive';
import { DogId } from '../../domain/dog/dog';
/** Nur Persistenzkompatibilität, keine aktiven Katalogdefinitionen. */
export const RETIRED_MITCHELL_SKILLS: Readonly<Record<string, string>> = {
  'mitchell:return_to_handler': 'Freiwillige Rückkehr (früherer Skill)',
  'mitchell:early_delivery_foundation': 'Frühe Abgabegrundlage (früherer Skill)',
};
export function isRetiredMitchellSkill(systemId: string, skillId: string): boolean {
  return systemId === 'mitchell' && Object.hasOwn(RETIRED_MITCHELL_SKILLS, skillId);
}
export function archiveRetiredAssessment(value: unknown): ArchivedTraining | undefined {
  const row = value as {
    id: string;
    dogId: DogId;
    systemId: string;
    skillId: string;
    assessedAt: string;
    state?: string;
    competence?: string;
    condition?: string;
    context: string;
    rationale: string;
  };
  if (!isRetiredMitchellSkill(row.systemId, row.skillId)) return undefined;
  const labels: Readonly<Record<string, string>> = {
    not_started: 'Noch nicht begonnen',
    introduced: 'Eingeführt',
    learning: 'Im Aufbau',
    stable: 'Stabil',
    generalised: 'Generalisiert',
    normal: 'Normal',
    maintenance: 'In Pflege',
    regressed: 'Rückschritt',
  };
  const label = (value: string | undefined) =>
    value === undefined ? 'Nicht dokumentiert' : (labels[value] ?? value);
  return {
    id: `assessment:${row.id}`,
    dogId: row.dogId,
    date: row.assessedAt,
    notes: RETIRED_MITCHELL_SKILLS[row.skillId],
    details: [
      row.state !== undefined
        ? `Frühere Einschätzung: ${label(row.state)}`
        : `Kompetenz: ${label(row.competence)} · Zustand: ${label(row.condition)}`,
      row.context,
      row.rationale,
    ],
  };
}
