import { Routes } from '@angular/router';

import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'partners',
        loadChildren: () => import('./partners/partners.routes').then((m) => m.PARTNERS_ROUTES),
      },
      {
        path: 'projects',
        loadChildren: () => import('./projects/projects.routes').then((m) => m.PROJECTS_ROUTES),
      },
    ],
  },
];
