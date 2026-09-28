import { Dog, DogId } from '../../domain/dog/dog';
export const DEMO_DOG: Dog = {
  id: 'demo-reggae' as DogId,
  name: 'Reggae',
  breed: 'Labrador Retriever',
  dateOfBirth: '2022-04-12',
  sex: 'MALE',
  photoUrl: '/images/labrador.jpg',
};
