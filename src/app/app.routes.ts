import { Routes } from '@angular/router';
import { AccessComponent } from './features/access/access.component';
import { LandingPageComponent } from './features/landing/landing.component';
import { HomePageComponent } from './features/home/home.component';

export const routes: Routes = [
  { path: '', component: AccessComponent },
  { path: 'access', component: AccessComponent },
  { path: 'landing', component: LandingPageComponent },
  { path: 'home', component: HomePageComponent },
  // Backward-compatible paths from previous static file URLs.
  { path: 'landingPage.html', component: LandingPageComponent },
  { path: 'index.html', component: HomePageComponent },
  { path: '**', redirectTo: '' },
];
