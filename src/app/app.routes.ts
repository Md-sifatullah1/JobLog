import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Applications } from './pages/applications/applications';
import { Interviews } from './pages/interviews/interviews';
import { Documents } from './pages/documents/documents';
import { Analytics } from './pages/analytics/analytics';
import { ApplicationDetails } from './pages/application-details/application-details';


export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'dashboard', component: Dashboard },

  { path: 'applications', component: Applications },
  { path: 'applications/:id', component: ApplicationDetails },

  { path: 'interviews', component: Interviews },
  { path: 'documents', component: Documents },
  { path: 'analytics', component: Analytics }
];