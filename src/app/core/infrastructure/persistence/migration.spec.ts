import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TrainerDatabase } from './indexed-db';
import { DEMO_DOG } from './demo-dog';
import { DEMO_SESSIONS } from './legacy-fixtures.spec-helper';
import { initializeMitchell } from './initialize-mitchell';
import { IndexedDbDogRepository, IndexedDbTrainingArchive } from './repositories';
import {
  IndexedDbSkillAssessmentRepository,
  IndexedDbSystemSessionRepository,
  IndexedDbTrainingProfileRepository,
  IndexedDbTrainingPlanRepository,
} from './mitchell-repositories';
import { DogId } from '../../domain/dog/dog';
import { entityId } from '../../domain/shared/identity';
import { DogSkillAssessment } from '../../domain/skills/skill-assessment';
import {
  MITCHELL_SYSTEM_ID,
  mitchellSkillId,
  PUPPY_EXERCISES,
} from '../../../data/mitchell/catalog';
import { PuppyDraft } from '../../application/training/puppy-draft';
let name: string;
let db: TrainerDatabase;
beforeEach(() => {
  name = crypto.randomUUID();
  db = new TrainerDatabase(name);
});
afterEach(async () => {
  await db.close();
  indexedDB.deleteDatabase(name);
});
async function createVersionOne(): Promise<void> {
  const connection = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('dogs', { keyPath: 'id' });
      request.result.createObjectStore('sessions', { keyPath: 'id' }).createIndex('dogId', 'dogId');
      request.result.createObjectStore('meta');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise<void>((resolve, reject) => {
    const tx = connection.transaction(['dogs', 'sessions', 'meta'], 'readwrite');
    tx.objectStore('dogs').put({ ...DEMO_DOG, name: 'Mein Reggae' });
    for (const session of DEMO_SESSIONS) tx.objectStore('sessions').put(session);
    tx.objectStore('meta').put(true, 'demo-v1');
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
  });
  connection.close();
}
const assessment: DogSkillAssessment = {
  id: entityId<'Assessment'>('assessment-1'),
  dogId: DEMO_DOG.id,
  systemId: MITCHELL_SYSTEM_ID,
  skillId: mitchellSkillId('handler_orientation'),
  competence: 'learning',
  condition: 'normal',
  assessedAt: '2026-09-27T10:00:00Z',
  assessedBy: entityId<'Handler'>('local-handler'),
  context: 'Wiese',
  rationale: 'Beobachtet',
  observationIds: [],
};
describe('Migration von IndexedDB v1 nach v2', () => {
  it('erhält Hunde, sämtliche alten Sessions und Marker ohne fachliche Umdeutung', async () => {
    await createVersionOne();
    await initializeMitchell(db);
    expect((await db.open()).version).toBe(2);
    expect((await new IndexedDbDogRepository(db).findById(DEMO_DOG.id))?.name).toBe('Mein Reggae');
    expect(await db.read('sessions', (store) => store.getAll())).toEqual(
      [...DEMO_SESSIONS].sort((a, b) => a.id.localeCompare(b.id)),
    );
    expect(
      (await new IndexedDbTrainingArchive(db).findAll()).flatMap((row) => row.details).join(' '),
    ).toContain('Voran');
    expect(await db.read('meta', (store) => store.get('demo-v1'))).toBe(true);
    expect(await new IndexedDbSkillAssessmentRepository(db).findAll()).toEqual([]);
    expect(await new IndexedDbSystemSessionRepository(db).findAll()).toEqual([]);
    await db.close();
    await initializeMitchell(db);
    expect(await new IndexedDbDogRepository(db).findAll()).toHaveLength(1);
  });
  it('legt bei frischer Installation nur einen Demo-Hund und keine alten Trainings an', async () => {
    await Promise.all([initializeMitchell(db), initializeMitchell(db)]);
    expect(await new IndexedDbDogRepository(db).findAll()).toHaveLength(1);
    expect(await new IndexedDbTrainingArchive(db).findAll()).toEqual([]);
  });
  it('erhält bestehende Hunde und ergänzt keine fremden Demo-Hunde', async () => {
    await new IndexedDbDogRepository(db).save({
      ...DEMO_DOG,
      id: 'my-dog' as DogId,
      name: 'Mein Hund',
    });
    await initializeMitchell(db);
    expect((await new IndexedDbDogRepository(db).findAll()).map((d) => d.name)).toEqual([
      'Mein Hund',
    ]);
  });
  it('erhält die Assessment-Historie und verhindert Überschreiben gleicher IDs', async () => {
    const repository = new IndexedDbSkillAssessmentRepository(db);
    await repository.append(assessment);
    await expect(
      repository.append({ ...assessment, condition: 'regressed' }),
    ).rejects.toBeDefined();
    await repository.append({
      ...assessment,
      id: entityId<'Assessment'>('assessment-2'),
      condition: 'regressed',
      assessedAt: '2026-09-28T10:00:00Z',
    });
    await db.close();
    expect(
      (await repository.findHistory(DEMO_DOG.id, MITCHELL_SYSTEM_ID, assessment.skillId)).map(
        (a) => a.condition,
      ),
    ).toEqual(['normal', 'regressed']);
    expect(
      await repository.findHistory('other' as DogId, MITCHELL_SYSTEM_ID, assessment.skillId),
    ).toEqual([]);
  });
  it('speichert Übungssnapshots und trennt Sessions nach Hund und System', async () => {
    const repository = new IndexedDbSystemSessionRepository(db);
    const draft = new PuppyDraft(DEMO_DOG.id, PUPPY_EXERCISES[4]);
    draft.begin();
    draft.notes = 'Beobachtung';
    const session = draft.session();
    await repository.save(session);
    await db.close();
    expect(await repository.findById(session.id)).toEqual(session);
    expect(
      (await repository.findByDogId(DEMO_DOG.id, MITCHELL_SYSTEM_ID))[0].executions[0]
        .exerciseSnapshot?.successCriteria,
    ).toHaveLength(3);
    expect(await repository.findByDogId('other' as DogId, MITCHELL_SYSTEM_ID)).toEqual([]);
    expect(await repository.findByDogId(DEMO_DOG.id, entityId<'TrainingSystem'>('other'))).toEqual(
      [],
    );
  });
  it('speichert individuelle Schwerpunkte und Readiness getrennt von Skills', async () => {
    const repository = new IndexedDbTrainingProfileRepository(db);
    const profile = {
      id: JSON.stringify([DEMO_DOG.id, MITCHELL_SYSTEM_ID]),
      dogId: DEMO_DOG.id,
      systemId: MITCHELL_SYSTEM_ID,
      focusSkills: [assessment.skillId],
      indicators: [],
      constraints: [],
    };
    await repository.save(profile);
    await db.close();
    expect(await repository.findAll()).toEqual([profile]);
    expect(await new IndexedDbSkillAssessmentRepository(db).findAll()).toEqual([]);
  });
});

describe('Kompatibilität ohne fachliche Annahmen', () => {
  it.each(['maintenance', 'regressed'])(
    'hält %s außerhalb des Domainmodells und bewahrt Originaldaten',
    async (state) => {
      const { competence, condition, ...base } = assessment;
      expect(competence).toBe('learning');
      expect(condition).toBe('normal');
      const raw = { ...base, state };
      await db.write('skillAssessments', raw);
      const repository = new IndexedDbSkillAssessmentRepository(db);
      expect(await repository.findAll()).toEqual([]);
      const issues = await repository.findReassessmentRequired();
      expect(issues).toHaveLength(1);
      expect(issues[0].status).toBe('reassessment_required');
      expect(issues[0]).not.toHaveProperty('competence');
      expect(await db.read('skillAssessments', (store) => store.get(raw.id))).toEqual(raw);
      await db.close();
      expect(await repository.findReassessmentRequired()).toEqual(issues);
    },
  );
  it.each(['not_started', 'introduced', 'learning', 'stable', 'generalised'])(
    'übernimmt eindeutige alte Kompetenz %s',
    async (state) => {
      const raw = { ...assessment, competence: undefined, condition: undefined, state };
      await db.write('skillAssessments', raw);
      expect(await new IndexedDbSkillAssessmentRepository(db).findAll()).toEqual([
        { ...assessment, competence: state, condition: 'normal' },
      ]);
    },
  );
  it('übernimmt historische vollständige Snapshots ohne aktuellen Katalog', async () => {
    const exercise = { ...PUPPY_EXERCISES[4], version: 'historical', title: 'Historischer Titel' };
    const session = startedSession(exercise);
    const raw = {
      ...session,
      schemaVersion: 2,
      executions: [
        {
          ...session.executions[0],
          exerciseSnapshot: exercise,
          exerciseId: exercise.id,
          exerciseVersion: exercise.version,
          exerciseTitle: exercise.title,
          source: exercise.source,
        },
      ],
    };
    await db.write('systemSessions', raw);
    expect(await new IndexedDbSystemSessionRepository(db).findById(session.id)).toEqual(session);
    expect(await db.read('systemSessions', (store) => store.get(session.id))).toEqual(raw);
  });
  it.each(['missing', 'conflicting', 'effect', 'skills', 'handlers', 'source'])(
    'meldet %s Snapshot und erfindet keine Katalogdaten',
    async (kind) => {
      const session = startedSession(PUPPY_EXERCISES[4]);
      const raw = {
        ...session,
        schemaVersion: 2,
        executions: [
          {
            ...session.executions[0],
            ...(kind === 'missing'
              ? { exerciseSnapshot: undefined }
              : kind === 'effect'
                ? { trainingEffect: 'neutral' }
                : kind === 'skills'
                  ? { skills: [] }
                  : kind === 'handlers'
                    ? { handlerSkills: ['different'] }
                    : kind === 'source'
                      ? { source: { ...PUPPY_EXERCISES[4].source, title: 'Different' } }
                      : { exerciseVersion: 'conflict' }),
          },
        ],
      };
      await db.write('systemSessions', raw);
      const repository = new IndexedDbSystemSessionRepository(db);
      expect(await repository.findAll()).toEqual([]);
      expect(await repository.findCompatibilityIssues()).toHaveLength(1);
      expect(await db.read('systemSessions', (store) => store.get(session.id))).toEqual(raw);
    },
  );
});

describe('Quellen und persönliche Pläne', () => {
  it('projiziert Ziele und Roadmaps ohne Methodenquelle und bewahrt alte Originale', async () => {
    const repository = new IndexedDbTrainingPlanRepository(db);
    const goal = {
      id: entityId<'Goal'>('goal'),
      dogId: DEMO_DOG.id,
      handlerId: assessment.assessedBy,
      systemId: MITCHELL_SYSTEM_ID,
      aspiration: 'Mein Ziel',
      type: 'working_test' as const,
      description: 'Persönlich gewählt',
    };
    const roadmap = {
      id: entityId<'Roadmap'>('roadmap'),
      dogId: DEMO_DOG.id,
      goalId: goal.id,
      systemId: MITCHELL_SYSTEM_ID,
      focusSkills: [assessment.skillId],
      indicatorAssessments: [],
      physicalAssessments: [],
      notes: 'Persönlich',
    };
    const rawGoal = { ...goal, source: PUPPY_EXERCISES[0].source };
    const rawRoadmap = { ...roadmap, source: PUPPY_EXERCISES[0].source };
    await db.write('goals', rawGoal);
    await db.write('roadmaps', rawRoadmap);
    expect(await repository.findGoals(DEMO_DOG.id, MITCHELL_SYSTEM_ID)).toEqual([goal]);
    expect(await repository.findRoadmaps(DEMO_DOG.id, MITCHELL_SYSTEM_ID)).toEqual([roadmap]);
    expect(await db.read('goals', (store) => store.get(goal.id))).toEqual(rawGoal);
    expect(await db.read('roadmaps', (store) => store.get(roadmap.id))).toEqual(rawRoadmap);
    await repository.saveGoal(rawGoal);
    await repository.saveRoadmap(rawRoadmap);
    expect(await db.read('goals', (store) => store.get(goal.id))).toEqual(goal);
    expect(await db.read('roadmaps', (store) => store.get(roadmap.id))).toEqual(roadmap);
  });
});

describe('Archivierte Mitchell-Skills', () => {
  it.each(['mitchell:return_to_handler', 'mitchell:early_delivery_foundation'])(
    'bewahrt %s unverändert im Archiv und verhindert neue Assessments',
    async (skillId) => {
      const repository = new IndexedDbSkillAssessmentRepository(db);
      const raw = { ...assessment, skillId: entityId<'Skill'>(skillId) };
      await db.write('skillAssessments', raw);
      await db.write('skillAssessments', {
        ...raw,
        id: 'ambiguous',
        competence: undefined,
        condition: undefined,
        state: 'maintenance',
      });
      expect(await repository.findAll()).toEqual([]);
      expect(await repository.findReassessmentRequired()).toEqual([]);
      expect(() => repository.append({ ...raw, id: entityId<'Assessment'>('new') })).toThrow(
        'historisch',
      );
      await db.close();
      const archive = await new IndexedDbTrainingArchive(db).findAll();
      expect(archive).toHaveLength(2);
      expect(archive.flatMap((a) => a.details).join(' ')).toContain('In Pflege');
      expect(archive.flatMap((a) => a.details).join(' ')).toContain(assessment.rationale);
      expect(await db.read('skillAssessments', (s) => s.get(raw.id))).toEqual(raw);
    },
  );
  it('zeigt alte Übungssnapshots mit archivierten Skills ohne neue Katalogzuordnung', async () => {
    const draft = startedSession(PUPPY_EXERCISES[4]);
    const old = {
      ...draft,
      executions: [
        {
          ...draft.executions[0],
          exerciseSnapshot: {
            ...draft.executions[0].exerciseSnapshot,
            exerciseId: entityId<'Exercise'>('mitchell:puppy:informal-puppy-retrieve'),
            version: '1.0.0',
            secondarySkills: [entityId<'Skill'>('mitchell:return_to_handler')],
          },
        },
      ],
    };
    await db.write('systemSessions', old);
    const repository = new IndexedDbSystemSessionRepository(db);
    expect(await repository.findById(old.id)).toEqual(old);
    await expect(
      repository.save({ ...old, id: entityId<'TrainingSession'>('new') }),
    ).rejects.toThrow('archivierten');
    expect(await db.read('systemSessions', (s) => s.get(old.id))).toEqual(old);
  });
});

function startedSession(exercise: (typeof PUPPY_EXERCISES)[number]) {
  const draft = new PuppyDraft(DEMO_DOG.id, exercise);
  draft.begin();
  return draft.session();
}
