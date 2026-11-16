import { Routes } from '@angular/router';
import { registroGuard } from './core/registro.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cedula/cedula.component').then(m => m.CedulaComponent),
    title: 'Meritop · Validación de cédula'
  },
  {
    path: 'registro',
    canActivate: [registroGuard],
    loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent),
    title: 'Meritop · Registro de datos'
  },
  { path: '**', redirectTo: '' }
];
