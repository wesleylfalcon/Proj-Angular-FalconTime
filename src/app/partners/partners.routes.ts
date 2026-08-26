import { Routes } from '@angular/router';

export const PARTNERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./partner-list/partner-list').then((m) => m.PartnerList),
  },
];
