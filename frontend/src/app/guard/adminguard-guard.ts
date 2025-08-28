import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/auth/authservice';

export const adminguardGuard: CanActivateFn = (route, state) => {
  const auth = inject(Authservice);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  router.navigateByUrl('/');
  return false;
};
