export type DogId = string & { readonly __brand: 'DogId' };
export interface Dog {
  readonly id: DogId;
  readonly name: string;
  readonly dateOfBirth: string;
  readonly breed: string;
  readonly sex?: 'MALE' | 'FEMALE';
  readonly photoUrl?: string;
}
export function validateDog(dog: Dog): void {
  if (!dog.id || !dog.name.trim() || !dog.breed.trim())
    throw new Error('Name und Rasse sind erforderlich.');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dog.dateOfBirth) ||
    !Number.isFinite(Date.parse(dog.dateOfBirth)) ||
    new Date(dog.dateOfBirth).toISOString().slice(0, 10) !== dog.dateOfBirth ||
    dog.dateOfBirth > new Date().toISOString().slice(0, 10)
  )
    throw new Error('Bitte ein gültiges Geburtsdatum in der Vergangenheit angeben.');
}
