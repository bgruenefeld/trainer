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
    loadComponent: () => import('./features/training/training').then((m) => m.Training),
  },
  {
    path: 'history',
    title: 'Historie · Feldfreund',
    loadComponent: () => import('./features/history/history').then((m) => m.History),
  },
  { path: '**', redirectTo: '' },
];
