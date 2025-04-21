import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'organizations',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
    loadComponent: () => import('./features/organizations/organizations-list/organizations-list.component')
      .then(m => m.OrganizationsListComponent)
  },
  {
    path: 'organizations/new',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
    loadComponent: () => import('./features/organizations/organization-form/organization-form.component')
      .then(m => m.OrganizationFormComponent)
  },
  {
    path: 'organizations/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
    loadComponent: () => import('./features/organizations/organization-detail/organization-detail.component')
      .then(m => m.OrganizationDetailComponent)
  },
  {
    path: 'organizations/:id/edit',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
    loadComponent: () => import('./features/organizations/organization-form/organization-form.component')
      .then(m => m.OrganizationFormComponent)
  },
  {
    path: 'organizations/:id/features',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
    loadComponent: () => import('./features/feature-toggles/feature-toggles.component')
      .then(m => m.FeatureTogglesComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/users-list/users-list.component')
      .then(m => m.UsersListComponent)
  },
  {
    path: 'users/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/user-form/user-form.component')
      .then(m => m.UserFormComponent)
  },
  {
    path: 'users/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/user-detail/user-detail.component')
      .then(m => m.UserDetailComponent)
  },
  {
    path: 'users/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/user-form/user-form.component')
      .then(m => m.UserFormComponent)
  },
  {
    path: 'features',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN'] },
    loadComponent: () => import('./features/feature-toggles/feature-toggles.component')
      .then(m => m.FeatureTogglesComponent)
  },
  {
    path: 'usage',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN'] },
    loadComponent: () => import('./features/usage/usage-dashboard.component')
      .then(m => m.UsageDashboardComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];