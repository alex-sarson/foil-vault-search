import { Routes } from '@angular/router';

export const SYNTAX_GUIDE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./syntax-guide.page').then((m) => m.SyntaxGuidePage),
  },
];
