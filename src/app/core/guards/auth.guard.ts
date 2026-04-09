import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loggedIn()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};

export const clientGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loggedIn() && authService.isClient()) {
    return true;
  }

  if (!authService.loggedIn()) {
    router.navigate(['/auth/login']);
  } else {
    router.navigate(['/']);
  }
  return false;
};

export const supplierGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loggedIn() && authService.isSupplier()) {
    return true;
  }

  if (!authService.loggedIn()) {
    router.navigate(['/auth/login']);
  } else {
    router.navigate(['/']);
  }
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.loggedIn()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
