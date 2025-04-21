import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  
  const requiredRoles = route.data['roles'] as string[];
  
  if (authService.hasRole(requiredRoles)) {
    return true;
  }
  
  toastService.show({
    type: 'error',
    message: 'You do not have permission to access this page'
  });
  
  router.navigate(['/dashboard']);
  return false;
};