import { Routes } from '@angular/router';

import { AppShellComponent } from './shared/components/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'search' },
      {
        path: 'search',
        loadChildren: () =>
          import('./features/search/search.routes').then((m) => m.SEARCH_ROUTES),
      },
      {
        path: 'card/:id',
        loadChildren: () =>
          import('./features/card-detail/card-detail.routes').then((m) => m.CARD_DETAIL_ROUTES),
      },
      {
        path: 'syntax',
        loadChildren: () =>
          import('./features/syntax-guide/syntax-guide.routes').then((m) => m.SYNTAX_GUIDE_ROUTES),
      },
      { path: '**', redirectTo: 'search' },
    ],
  },
];
