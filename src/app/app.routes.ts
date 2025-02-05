// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'campaigns', pathMatch: 'full' },
  {
    path: 'campaigns',
    loadComponent: () =>
      import('./components/campaign-list/campaign-list.component').then(m => m.CampaignListComponent)
  },
  {
    path: 'campaigns/create',
    loadComponent: () =>
      import('./components/campaign-form/campaign-form.component').then(m => m.CampaignFormComponent)
  },
  {
    path: 'campaigns/edit/:id',
    loadComponent: () =>
      import('./components/campaign-form/campaign-form.component').then(m => m.CampaignFormComponent)
  },
  { path: '**', redirectTo: 'campaigns' }
];
