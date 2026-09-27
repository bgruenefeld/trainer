import { describe, expect, it } from 'vitest';
import { TrainingDraft } from './training-draft';
import { DEMO_DOG } from '../../infrastructure/persistence/demo';
describe('Trainingserfassung', () => {
  it('verhindert Weitergehen ohne Hund', () => {
    const draft = new TrainingDraft();
    draft.next();
    expect(draft.step()).toBe(0);
    expect(draft.error()).not.toBe('');
  });
  it('behält Eingaben bei Rücknavigation und erlaubt unabhängige Setup-Werte', () => {
    const draft = new TrainingDraft();
    draft.dogId.set(DEMO_DOG.id);
    draft.selectMethod('MEMORY');
    draft.setSetup('distanceMeters', 50);
    draft.setSetup('targetVisible', true);
    draft.next();
    draft.back();
    expect(draft.setup().distanceMeters).toBe(50);
    expect(draft.setup().targetVisible).toBe(true);
    expect(draft.method()).toBe('MEMORY');
  });
  it('verhindert ungültiges Setup im Schrittwechsel und beim Speichern', () => {
    const draft = new TrainingDraft();
    draft.dogId.set(DEMO_DOG.id);
    draft.step.set(3);
    draft.setSetup('distanceMeters', -1);
    draft.next();
    expect(draft.step()).toBe(3);
    expect(() => draft.toSession()).toThrow();
  });
  it('entfernt Bewertungen und hält die Session-ID für wiederholtes Speichern stabil', () => {
    const draft = new TrainingDraft();
    draft.dogId.set(DEMO_DOG.id);
    draft.rate('TAKES_LINE', 'RELIABLE');
    draft.rate('TAKES_LINE');
    expect(draft.toSession().runs[0].performance).toEqual({});
    expect(draft.toSession().id).toBe(draft.toSession().id);
  });
});
