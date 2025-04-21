import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Navigate to login page with return url
  router.navigate(['/login'], { 
    queryParams: { returnUrl: router.routerState.snapshot.url } 
  });
  return false;
};