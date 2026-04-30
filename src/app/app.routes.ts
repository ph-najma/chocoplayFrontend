import { Routes } from '@angular/router';
import { AccessComponent } from './features/access/access.component';

export const routes: Routes = [
  { path: '', component: AccessComponent },
  { path: 'access', component: AccessComponent },
  { path: '**', redirectTo: '' },
];
