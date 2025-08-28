import { HttpInterceptorFn } from '@angular/common/http';
import { Authservice } from '../services/auth/authservice';
import { inject } from '@angular/core';

export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Authservice);
  const token = auth.token;
  return next(
    token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req
  );
};
