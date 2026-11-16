import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistroService } from '../../core/registro.service';
import { ApiError, Nacionalidad, TIPOS_DOCUMENTO } from '../../core/registro.models';

@Component({
  selector: 'app-cedula',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cedula.component.html',
  styleUrl: './cedula.component.scss'
})
export class CedulaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly servicio = inject(RegistroService);

  /** V, E y P: persona natural; J: persona jurídica. */
  readonly tiposDocumento = TIPOS_DOCUMENTO;

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nacionalidad: this.fb.nonNullable.control<Nacionalidad>('V', Validators.required),
    cedula: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^\d{6,9}$/)])
  });

  constructor() {
    this.servicio.limpiar();
  }

  soloDigitos(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const limpio = input.value.replace(/\D/g, '').slice(0, 12);
    if (limpio !== input.value) {
      this.form.controls.cedula.setValue(limpio);
    }
  }

  validar(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nacionalidad, cedula } = this.form.getRawValue();
    this.cargando.set(true);

    this.servicio.consultar(nacionalidad, cedula).subscribe({
      next: estatus => {
        this.cargando.set(false);
        this.servicio.actual.set(estatus);
        this.router.navigate(['/registro']);
      },
      error: (e: ApiError) => {
        this.cargando.set(false);
        this.error.set(e.mensaje);
      }
    });
  }

  get cedulaInvalida(): boolean {
    const c = this.form.controls.cedula;
    return c.touched && c.invalid;
  }
}
