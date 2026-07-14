import { Routes } from '@angular/router';

export const CARD_DETAIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./card-detail.page').then((m) => m.CardDetailPage),
  },
];
