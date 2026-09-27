import { describe, expect, it } from 'vitest';
import { validateSession, validateSetup } from './training';
import { DEFAULT_SETUP, DEMO_SESSIONS } from '../../infrastructure/persistence/demo';
import { validateDog } from '../dog/dog';
import { DEMO_DOG } from '../../infrastructure/persistence/demo';
describe('Trainingsregeln', () => {
  it('lässt Bedingungen unabhängig von Distanz und Methode variieren', () => {
    expect(() =>
      validateSetup({
        ...DEFAULT_SETUP,
        distanceMeters: 100,
        targetLocationKnown: true,
        terrainType: 'PATH',
      }),
    ).not.toThrow();
    expect(() =>
      validateSetup({
        ...DEFAULT_SETUP,
        distanceMeters: 40,
        targetLocationKnown: false,
        terrainType: 'HIGH_GRASS',
      }),
    ).not.toThrow();
  });
  it.each([0, -1, NaN, Infinity])('verwirft ungültige Distanz %s', (distanceMeters) => {
    expect(() => validateSetup({ ...DEFAULT_SETUP, distanceMeters })).toThrow();
  });
  it('verwirft negative Wartezeit, leere Sessions und ungültige Dauer', () => {
    expect(() => validateSetup({ ...DEFAULT_SETUP, delaySeconds: -1 })).toThrow();
    expect(() => validateSession({ ...DEMO_SESSIONS[0], runs: [] })).toThrow();
    expect(() => validateSession({ ...DEMO_SESSIONS[0], duration: 0 })).toThrow();
  });
  it('erlaubt unbewertete und teilweise bewertete Durchläufe ohne Score', () => {
    const session = DEMO_SESSIONS[0];
    expect(() =>
      validateSession({ ...session, runs: [{ ...session.runs[0], performance: {} }] }),
    ).not.toThrow();
    expect(() =>
      validateSession({
        ...session,
        runs: [{ ...session.runs[0], performance: { HOLDS_DIRECTION: 'RELIABLE' } }],
      }),
    ).not.toThrow();
  });
  it('erlaubt mehrere unterschiedliche Durchläufe und verhindert doppelte IDs', () => {
    expect(() =>
      validateSession({
        ...DEMO_SESSIONS[0],
        runs: [DEMO_SESSIONS[0].runs[0], DEMO_SESSIONS[1].runs[0]],
      }),
    ).not.toThrow();
    expect(() =>
      validateSession({
        ...DEMO_SESSIONS[0],
        runs: [DEMO_SESSIONS[0].runs[0], DEMO_SESSIONS[0].runs[0]],
      }),
    ).toThrow();
  });
  it('validiert Hundedaten und echte Kalenderdaten', () => {
    expect(() => validateDog({ ...DEMO_DOG, name: '   ' })).toThrow();
    expect(() => validateDog({ ...DEMO_DOG, dateOfBirth: '2025-02-30' })).toThrow();
    expect(() => validateDog({ ...DEMO_DOG, dateOfBirth: '2999-01-01' })).toThrow();
    expect(() => validateDog(DEMO_DOG)).not.toThrow();
  });
});
