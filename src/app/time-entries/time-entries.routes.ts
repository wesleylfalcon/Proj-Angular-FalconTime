import { Routes } from '@angular/router';

export const TIME_ENTRIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./time-entry-list/time-entry-list').then((m) => m.TimeEntryList),
  },
];
