import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RegistroService } from './registro.service';

/** Impide entrar a la pantalla 2 sin haber validado la cédula en la pantalla 1. */
export const registroGuard: CanActivateFn = () => {
  const servicio = inject(RegistroService);
  const router = inject(Router);
  return servicio.actual() ? true : router.createUrlTree(['/']);
};
