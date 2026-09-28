import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    title: 'Übersicht · Feldfreund',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'dogs',
    title: 'Meine Hunde · Feldfreund',
    loadComponent: () => import('./features/dogs/dogs').then((m) => m.Dogs),
  },
  {
    path: 'training',
    title: 'Training · Feldfreund',
    loadComponent: () => import('./features/training/puppy-training').then((m) => m.PuppyTraining),
  },
  {
    path: 'history',
    title: 'Historie · Feldfreund',
    loadComponent: () => import('./features/history/history').then((m) => m.History),
  },
  {
    path: 'skills',
    title: 'Skill-Übersicht · Feldfreund',
    loadComponent: () =>
      import('./features/skill-roadmap/skill-roadmap').then((m) => m.SkillRoadmap),
  },
  {
    path: 'skills/:id',
    title: 'Skill · Feldfreund',
    loadComponent: () => import('./features/skill-detail/skill-detail').then((m) => m.SkillDetail),
  },
  {
    path: 'exercises/:id',
    title: 'Übung · Feldfreund',
    loadComponent: () =>
      import('./features/exercise-detail/exercise-detail').then((m) => m.ExerciseDetail),
  },
  {
    path: 'puppy-foundation',
    title: 'Puppy Foundation · Feldfreund',
    loadComponent: () =>
      import('./features/puppy-foundation/puppy-foundation').then((m) => m.PuppyFoundation),
  },
  {
    path: 'roadmap',
    title: 'Trainingsplan · Feldfreund',
    loadComponent: () =>
      import('./features/training-roadmap/training-roadmap').then(
        (m) => m.TrainingRoadmapComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
