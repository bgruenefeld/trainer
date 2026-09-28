import { describe, expect, it } from 'vitest';
import { Dog, DogId, validateDog } from './dog';
const dog: Dog = {
  id: 'test' as DogId,
  name: 'Test',
  breed: 'Labrador',
  dateOfBirth: '2022-04-12',
};
describe('Hundedaten', () => {
  it('validiert Name und echte vergangene Kalenderdaten', () => {
    expect(() => validateDog({ ...dog, name: ' ' })).toThrow();
    expect(() => validateDog({ ...dog, dateOfBirth: '2025-02-30' })).toThrow();
    expect(() => validateDog({ ...dog, dateOfBirth: '2999-01-01' })).toThrow();
    expect(() => validateDog(dog)).not.toThrow();
  });
});
