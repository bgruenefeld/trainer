import 'fake-indexeddb/auto';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../../app.routes';
import {
  DOG_REPOSITORY,
  INITIALIZE_DATA,
  TRAINING_ARCHIVE,
} from '../../core/application/providers';
import {
  SKILL_ASSESSMENTS,
  SYSTEM_SESSIONS,
  TRAINING_PROFILES,
} from '../../core/application/mitchell-providers';
import { TrainerDatabase } from '../../core/infrastructure/persistence/indexed-db';
import {
  IndexedDbDogRepository,
  IndexedDbTrainingArchive,
} from '../../core/infrastructure/persistence/repositories';
import {
  IndexedDbSkillAssessmentRepository,
  IndexedDbSystemSessionRepository,
  IndexedDbTrainingProfileRepository,
} from '../../core/infrastructure/persistence/mitchell-repositories';
import { initializeMitchell } from '../../core/infrastructure/persistence/initialize-mitchell';
import { TrainerStore } from '../../core/application/trainer-store';
import { MitchellStore } from '../../core/application/mitchell-store';
import { mitchellSkillId } from '../../data/mitchell/catalog';
import { PuppyTraining } from './puppy-training';
import { SkillDetail } from '../skill-detail/skill-detail';
let db: TrainerDatabase;
let name: string;
let dogs: TrainerStore;
let store: MitchellStore;
let assessments: IndexedDbSkillAssessmentRepository;
let sessions: IndexedDbSystemSessionRepository;
beforeEach(async () => {
  name = crypto.randomUUID();
  db = new TrainerDatabase(name);
  assessments = new IndexedDbSkillAssessmentRepository(db);
  sessions = new IndexedDbSystemSessionRepository(db);
  await TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: DOG_REPOSITORY, useValue: new IndexedDbDogRepository(db) },
      { provide: TRAINING_ARCHIVE, useValue: new IndexedDbTrainingArchive(db) },
      { provide: INITIALIZE_DATA, useValue: () => initializeMitchell(db) },
      { provide: SKILL_ASSESSMENTS, useValue: assessments },
      { provide: SYSTEM_SESSIONS, useValue: sessions },
      { provide: TRAINING_PROFILES, useValue: new IndexedDbTrainingProfileRepository(db) },
    ],
  }).compileComponents();
  dogs = TestBed.inject(TrainerStore);
  store = TestBed.inject(MitchellStore);
  await dogs.load();
  await store.load();
});
afterEach(async () => {
  await db.close();
  indexedDB.deleteDatabase(name);
  vi.restoreAllMocks();
});
function click(harness: RouterTestingHarness, text: string): void {
  const buttons = Array.from(harness.routeNativeElement!.querySelectorAll('button'));
  const button = buttons.find((b) => b.textContent?.includes(text));
  expect(button, `Button ${text}`).toBeDefined();
  button!.click();
  harness.detectChanges();
}
describe('Mitchell-UI mit IndexedDB', () => {
  it('zeigt Roadmap, Übungsdetails, Quellen und offene Inhaltslücken', async () => {
    const harness = await RouterTestingHarness.create('/skills');
    expect(harness.routeNativeElement!.textContent).toContain('Noch nicht beurteilt');
    await harness.navigateByUrl('/exercises/puppy_intro_sit_stay');
    expect(harness.routeNativeElement!.textContent).toContain('keine konkrete Durchführung');
    expect(harness.routeNativeElement!.textContent).toContain(
      'aus bereitgestellten Buchseiten extrahierte',
    );
    await harness.navigateByUrl('/skills/unknown');
    expect(harness.routeNativeElement!.textContent).toContain('Skill nicht gefunden');
    await harness.navigateByUrl('/exercises/unknown');
    expect(harness.routeNativeElement!.textContent).toContain('Übung nicht gefunden');
  });
  it('dokumentiert einen Skill, lädt den Verlauf wieder und trennt Hunde', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      '/skills/mitchell:handler_orientation',
      SkillDetail,
    );
    component.competence = 'learning';
    component.context = 'Wiese';
    component.rationale = 'Orientiert sich freiwillig';
    component.save();
    await expect
      .poll(() => store.latest().get(mitchellSkillId('handler_orientation'))?.competence)
      .toBe('learning');
    await store.toggleFocus(mitchellSkillId('handler_orientation'));
    await db.close();
    await store.load();
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('Orientiert sich freiwillig');
    expect(store.focused()).toHaveLength(1);
    const firstDog = dogs.selectedDog()!.id;
    await dogs.addDog({ name: 'Zweiter Hund', breed: 'Labrador', dateOfBirth: '2024-01-01' });
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(store.latest().size).toBe(0);
    expect(store.focused()).toHaveLength(0);
    expect(component.rationale).toBe('');
    dogs.selectDog(firstDog);
    harness.detectChanges();
    expect(store.latest().get(mitchellSkillId('handler_orientation'))?.competence).toBe('learning');
  });
  it('erhält Eingaben und alten Stand bei einem Schreibfehler', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/skills/mitchell:confidence', SkillDetail);
    vi.spyOn(assessments, 'append').mockRejectedValueOnce(new Error('Speicher voll'));
    component.competence = 'introduced';
    component.context = 'Bekannte Wiese';
    component.rationale = 'Erkundet';
    component.save();
    await expect.poll(() => component.error()).toBe('Speicher voll');
    harness.detectChanges();
    expect(component.context).toBe('Bekannte Wiese');
    expect(store.latest().size).toBe(0);
    component.save();
    await expect.poll(() => store.latest().size).toBe(1);
  });
  it('speichert alle Puppy-Schritte mit Kriterien und Snapshot ohne Skill-Status zu ändern', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      '/training?exercise=puppy_informal_retrieve',
      PuppyTraining,
    );
    click(harness, 'Übung vorbereiten');
    expect(component.draft()!.startedAt()).toBeUndefined();
    expect(() => component.draft()!.session()).toThrow('Training beginnen');
    expect(harness.routeNativeElement!.textContent).toContain(
      'keine vollständige Schritt-für-Schritt-Anleitung',
    );
    click(harness, 'Bedingungen erfassen');
    expect(component.draft()).toBeDefined();
    component.draft()!.environment = 'Ruhige Wiese';
    component.draft()!.distance = 8;
    click(harness, 'Training beginnen');
    click(harness, 'Training abschließen');
    click(harness, 'Beobachtet');
    click(harness, 'Weiter');
    component.draft()!.notes = 'Freiwillige Rückkehr';
    click(harness, 'Training speichern');
    await expect.poll(() => component.saved()).toBe(true);
    expect(store.latest().size).toBe(0);
    await db.close();
    await store.load();
    expect(store.sessions()).toHaveLength(1);
    expect(store.sessions()[0].executions[0].criteria).toHaveLength(1);
    expect(store.sessions()[0].executions[0].exerciseSnapshot?.title).toBe(
      'Informal Puppy Retrieve',
    );
    await harness.navigateByUrl('/history');
    expect(harness.routeNativeElement!.textContent).toContain('Freiwillige Rückkehr');
    expect(harness.routeNativeElement!.textContent).toContain('8 m');
  });
  it('hält einen begonnenen Trainingsentwurf beim ursprünglichen Hund und verhindert Doppelspeichern', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      '/training?exercise=puppy_handler_orientation',
      PuppyTraining,
    );
    component.start();
    component.draft()!.begin();
    const first = component.draft()!.dogId;
    await dogs.addDog({ name: 'Andere', breed: 'Labrador', dateOfBirth: '2024-01-01' });
    await component.save();
    await component.save();
    expect(await sessions.findAll()).toHaveLength(1);
    expect((await sessions.findAll())[0].dogId).toBe(first);
  });
  it('persistiert qualitative Readiness und körperliche Einschätzungen', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/skills/mitchell:heelwork', SkillDetail);
    for (const indicator of store.indicators) {
      await store.saveIndicator(indicator.id, 'met', 'Individuell beobachtet');
    }
    await db.close();
    await store.load();
    expect(store.rows().find((r) => r.skill.code === 'heelwork')?.readiness?.status).toBe('ready');
    await harness.navigateByUrl('/skills/mitchell:jumping');
    expect(store.constraints).toEqual([]);
    expect(store.rows().find((r) => r.skill.code === 'jumping')?.readiness?.status).toBe('ready');
    expect(component).toBeDefined();
  });
});

describe('Mehrdeutige alte Einschätzungen in der UI', () => {
  it.each(['maintenance', 'regressed'])(
    'verlangt bei %s eine neue Einschätzung statt auf früheren Stand zurückzufallen',
    async (state) => {
      const skillId = mitchellSkillId('directions');
      await store.assess(skillId, 'stable', 'Wiese', 'Alter Stand');
      const previous = store.latest().get(skillId)!;
      const raw = {
        ...previous,
        id: 'old-ambiguous',
        competence: undefined,
        condition: undefined,
        state,
        assessedAt: new Date(Date.parse(previous.assessedAt) + 1000).toISOString(),
      };
      await db.write('skillAssessments', raw);
      await store.load();
      expect(store.latest().has(skillId)).toBe(false);
      expect(store.effective()).toEqual([]);
      expect(store.rows().find((r) => r.skill.id === skillId)?.competence).toBeUndefined();
      expect(store.rows().find((r) => r.skill.code === 'blind_handling')?.readiness?.status).toBe(
        'needs_review',
      );
      const harness = await RouterTestingHarness.create();
      const component = await harness.navigateByUrl('/skills/mitchell:directions', SkillDetail);
      expect(harness.routeNativeElement!.textContent).toContain('Neue Einschätzung erforderlich');
      expect(component.competence).toBe('');
      component.competence = 'generalised';
      component.condition = 'maintenance';
      component.context = 'Neue Beobachtung';
      component.rationale = 'Bewusst erneut beurteilt';
      component.save();
      await expect.poll(() => store.pendingReassessments().length).toBe(0);
      expect(store.latest().get(skillId)).toMatchObject({
        competence: 'generalised',
        condition: 'maintenance',
      });
      await db.close();
      await store.load();
      expect(store.pendingReassessments()).toEqual([]);
      expect(await db.read('skillAssessments', (s) => s.get(raw.id))).toEqual(raw);
    },
  );
});

describe('Historische Skills nach dem Katalogwechsel', () => {
  it('zeigt alte Einschätzungen im Archiv, ohne Readiness oder aktive Skills zu beeinflussen', async () => {
    await db.write('skillAssessments', {
      id: 'retired',
      dogId: dogs.selectedDog()!.id,
      systemId: 'mitchell',
      skillId: 'mitchell:early_delivery_foundation',
      state: 'regressed',
      assessedAt: '2026-09-27T10:00:00Z',
      assessedBy: 'local-handler',
      context: 'Historischer Kontext',
      rationale: 'Unveränderte alte Beobachtung',
      observationIds: [],
    });
    await dogs.load();
    await store.load();
    expect(store.rows()).toHaveLength(38);
    expect(store.pendingReassessments()).toEqual([]);
    expect(store.latest().size).toBe(0);
    const harness = await RouterTestingHarness.create('/history');
    expect(harness.routeNativeElement!.textContent).toContain('Unveränderte alte Beobachtung');
    expect(harness.routeNativeElement!.textContent).toContain('Rückschritt');
    await harness.navigateByUrl('/skills');
    expect(harness.routeNativeElement!.textContent).not.toContain('Frühe Abgabegrundlage');
  });
});

describe('Heelwork in den bestehenden Ansichten', () => {
  it('zeigt weiterhin exakt sieben Puppy Exercises und sechs Heelwork-Übungen beim Skill', async () => {
    const harness = await RouterTestingHarness.create('/puppy-foundation');
    const links = Array.from(harness.routeNativeElement!.querySelectorAll('a.roadmap-card'));
    expect(links).toHaveLength(7);
    expect(links.every((link) => link.getAttribute('href')?.includes('/exercises/puppy_'))).toBe(
      true,
    );
    await harness.navigateByUrl('/skills/mitchell:heelwork');
    const exerciseLinks = Array.from(harness.routeNativeElement!.querySelectorAll('a')).filter(
      (a) => a.getAttribute('href')?.startsWith('/exercises/heelwork_'),
    );
    expect(exerciseLinks).toHaveLength(6);
    expect(harness.routeNativeElement!.textContent).toContain(
      'Mitchell-spezifische Heelwork-Guidance',
    );
    expect(harness.routeNativeElement!.textContent).toContain(
      'ungefähr ab 6–7 Monaten oder später',
    );
    expect(harness.routeNativeElement!.textContent).toContain(
      'Dog puts nose down or hunts at heel',
    );
  });
  it('zeigt methodische Voraussetzungen ohne die Erfassung oder Readiness zu sperren', async () => {
    const before = store.rows().find((r) => r.skill.code === 'heelwork')!.readiness;
    const harness = await RouterTestingHarness.create('/exercises/heelwork_triangles');
    expect(harness.routeNativeElement!.textContent).toContain('Mixed Squares and Rectangles');
    expect(harness.routeNativeElement!.textContent).toContain('keine automatische Trainingssperre');
    const component = await harness.navigateByUrl(
      '/training?exercise=heelwork_triangles',
      PuppyTraining,
    );
    component.start();
    expect(component.draft()).toBeDefined();
    expect(store.rows().find((r) => r.skill.code === 'heelwork')!.readiness).toEqual(before);
  });
  it('dokumentiert Off-lead ohne frühere Trainings oder Kompetenzen zu verändern', async () => {
    const harness = await RouterTestingHarness.create();
    const basic = await harness.navigateByUrl(
      '/training?exercise=heelwork_basic_square',
      PuppyTraining,
    );
    basic.start();
    basic.draft()!.begin();
    await basic.save();
    const previous = (await sessions.findAll())[0];
    await harness.navigateByUrl('/history');
    const offlead = await harness.navigateByUrl(
      '/training?exercise=heelwork_off_lead_transition',
      PuppyTraining,
    );
    offlead.start();
    offlead.draft()!.begin();
    await offlead.save();
    expect(await sessions.findAll()).toHaveLength(2);
    expect(await sessions.findById(previous.id)).toEqual(previous);
    expect(store.latest().size).toBe(0);
    await db.close();
    await store.load();
    expect(store.sessions()).toHaveLength(2);
  });
});

describe('Trainingsplan und Profilpersistenz', () => {
  it('zeigt 25 Stages, nur 13 vorhandene Übungen und getrennte Skills', async () => {
    const harness = await RouterTestingHarness.create('/roadmap');
    const element = harness.routeNativeElement!;
    expect(element.querySelectorAll('.training-roadmap > li')).toHaveLength(25);
    expect(element.querySelectorAll('a[href^="/exercises/"]')).toHaveLength(13);
    expect(element.textContent).toContain('Aktueller Schwerpunkt');
    expect(element.textContent).not.toContain('%');
    expect(element.textContent).not.toContain('bereit für Steadiness');
    await harness.navigateByUrl('/skills');
    expect(harness.routeNativeElement!.textContent).toContain('Skill-Übersicht');
    expect(harness.routeNativeElement!.textContent).not.toContain('Skill Roadmap');
  });
  it('speichert beliebigen geplanten Fokus im Profil und bewahrt Historie sowie persönliche Roadmaps', async () => {
    const roadmap = store.roadmapCatalog.getRoadmap();
    const stage = roadmap.stages[24];
    const historicalRoadmap = {
      id: 'old-roadmap',
      dogId: dogs.selectedDog()!.id,
      systemId: roadmap.systemId,
      notes: 'Original',
    };
    await db.write('roadmaps', historicalRoadmap);
    const before = await db.read('systemSessions', (s) => s.getAll());
    const assessmentsBefore = await db.read('skillAssessments', (s) => s.getAll());
    const harness = await RouterTestingHarness.create('/roadmap');
    const buttons = Array.from(
      harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('.training-roadmap button'),
    );
    buttons[24].click();
    await vi.waitFor(() => expect(store.profile()?.roadmapFocus?.currentStageId).toBe(stage.id));
    await harness.fixture.whenStable();
    harness.detectChanges();
    await store.load();
    expect(store.roadmap()?.currentStage?.id).toBe(stage.id);
    expect(store.profile()?.roadmapFocus?.currentStageId).toBe(stage.id);
    expect(store.roadmap()?.establishedStages).toEqual([]);
    expect(await db.read('systemSessions', (s) => s.getAll())).toEqual(before);
    expect(await db.read('skillAssessments', (s) => s.getAll())).toEqual(assessmentsBefore);
    expect(await db.read('roadmaps', (s) => s.get('old-roadmap'))).toEqual(historicalRoadmap);
    await store.toggleFocus(mitchellSkillId('heelwork'));
    expect(store.profile()?.roadmapFocus?.currentStageId).toBe(stage.id);
    await store.setRoadmapFocus();
    expect(store.profile()?.focusSkills).toContain(mitchellSkillId('heelwork'));
    expect(store.profile()?.roadmapFocus?.currentStageId).toBeUndefined();
    await harness.navigateByUrl('/');
    expect(harness.routeNativeElement!.textContent).toContain('Nächster vorgesehener Abschnitt');
  });
});

describe('Handlungsorientierter Trainingsflow', () => {
  it('zeigt vier Dashboard-Bereiche und filtert Skills initial nach Relevanz', async () => {
    const harness = await RouterTestingHarness.create('/');
    for (const title of ['Heute', 'Euer Trainingsweg', 'Trainingslage', 'Letztes Training'])
      expect(harness.routeNativeElement!.textContent).toContain(title);
    expect(harness.routeNativeElement!.textContent).toContain('Puppy Foundation');
    expect(harness.routeNativeElement!.textContent).toContain('Heelwork');
    expect(harness.routeNativeElement!.textContent).not.toContain('von 38');
    expect(
      harness.routeNativeElement!.querySelector('a[href^="/training"]')?.textContent,
    ).toContain('Training starten');
    await harness.navigateByUrl('/skills');
    expect(
      harness.routeNativeElement!.querySelector<HTMLSelectElement>('#skill-filter')?.value,
    ).toBe('relevant');
    expect(harness.routeNativeElement!.querySelectorAll('a.roadmap-card')).toHaveLength(9);
    expect(harness.routeNativeElement!.textContent).not.toContain('Blind Handling');
  });
  it('trennt Pflege und Regression auch bei stabiler Kompetenz', async () => {
    await store.assess(mitchellSkillId('heelwork'), 'stable', 'Wiese', 'Pflege', 'maintenance');
    await store.assess(
      mitchellSkillId('informal_recall'),
      'stable',
      'Wiese',
      'Rückschritt',
      'regressed',
    );
    const groups = store.trainingSituation();
    expect(groups.find((g) => g.title === 'Stabil')?.rows).toEqual([]);
    expect(groups.find((g) => g.title === 'Pflege')?.rows.map((r) => r.skill.id)).toEqual([
      mitchellSkillId('heelwork'),
    ]);
    expect(groups.find((g) => g.title === 'Rückschritte')?.rows.map((r) => r.skill.id)).toEqual([
      mitchellSkillId('informal_recall'),
    ]);
  });
  it('zeigt historische Snapshot-Titel und Kriterien statt heutiger Definitionen', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      '/training?exercise=heelwork_basic_square',
      PuppyTraining,
    );
    component.start();
    component.draft()!.begin();
    const raw = component.draft()!.session();
    const historical = {
      ...raw,
      roadmapId: 'personal-old' as NonNullable<typeof raw.roadmapId>,
      executions: raw.executions.map((e) => ({
        ...e,
        exerciseSnapshot: {
          ...e.exerciseSnapshot,
          title: 'Historischer Titel',
          successCriteria: e.exerciseSnapshot.successCriteria.map((c) => ({
            ...c,
            description: 'Historisches Kriterium',
          })),
        },
        criteria: [
          {
            criterionId: e.exerciseSnapshot.successCriteria[0].id,
            result: 'partly_observed' as const,
          },
        ],
      })),
    };
    await store.saveSession(historical);
    await harness.navigateByUrl('/history');
    const text = harness.routeNativeElement!.textContent;
    expect(text).toContain('Historischer Titel');
    expect(text).toContain('Historisches Kriterium');
    expect(text).toContain('Aktueller Roadmap-Kontext');
    expect(text).not.toContain('Basic Heelwork Square');
    expect((await sessions.findAll())[0].roadmapId).toBe('personal-old');
  });
});

it('behält die Hauptaktionen im kompakten Ablauf und zeigt nur belegte Folgeschritte', async () => {
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(
    '/training?exercise=heelwork_basic_square',
    PuppyTraining,
  );
  click(harness, 'Übung vorbereiten');
  expect(component.draft()!.startedAt()).toBeUndefined();
  click(harness, 'Bedingungen erfassen');
  expect(harness.routeNativeElement!.querySelector('.flow-actions')?.textContent).toContain(
    'Training beginnen',
  );
  expect(harness.routeNativeElement!.querySelector('#factor-turn_angle')).toBeNull();
  click(harness, 'Training beginnen');
  expect(harness.routeNativeElement!.querySelector('.flow-actions')?.textContent).toContain(
    'Training abschließen',
  );
  expect(harness.routeNativeElement!.querySelector('.rating-options')).toBeNull();
  click(harness, 'Training abschließen');
  click(harness, 'Teilweise');
  click(harness, 'Weiter');
  click(harness, 'Training speichern');
  await expect.poll(() => component.saved()).toBe(true);
  harness.detectChanges();
  expect(harness.routeNativeElement!.textContent).toContain('Diese Übung weiter festigen');
  expect(harness.routeNativeElement!.textContent).toContain(
    'Nächster methodischer Schritt im Aufbau',
  );
  expect(harness.routeNativeElement!.textContent).not.toContain('Du bist bereit');
  expect(store.latest().size).toBe(0);
  click(harness, 'Gleiche Übung erneut trainieren');
  expect(component.draft()!.startedAt()).toBeUndefined();
  expect(store.sessions()).toHaveLength(1);
});
