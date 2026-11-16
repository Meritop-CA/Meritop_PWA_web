import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistroService } from '../../core/registro.service';
import { ApiError, OPERADORAS_MOVILES, RegistroEstatus } from '../../core/registro.models';

/** Persona natural: solo letras (con acentos, ñ y ü) y un espacio entre palabras. Igual que el API. */
const RX_NOMBRE_PERSONA = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+( [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;

/** Caracteres que no puede llevar el nombre de una persona natural (se eliminan al escribir o pegar). */
const RX_NO_LETRA_NI_ESPACIO = /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g;

/** Valida el patrón sobre el texto sin espacios al inicio o al final (se quitan al guardar). Error: 'pattern'. */
function nombrePersonaValidator(control: AbstractControl): ValidationErrors | null {
  const valor = (control.value ?? '').trim();
  return !valor || RX_NOMBRE_PERSONA.test(valor) ? null : { pattern: true };
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly servicio = inject(RegistroService);

  readonly operadoras = OPERADORAS_MOVILES;

  /** Estado que viene de la pantalla 1 (o del guardado). */
  readonly estatus = this.servicio.actual;
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly guardadoOk = signal(false);

  /** Imágenes de producto que no cargaron: en su lugar se muestra la empresa. */
  private readonly imagenesFallidas = signal<ReadonlySet<string>>(new Set());

  /**
   * Productos que se muestran: los que tienen imagen y la imagen cargó. Si ninguno, la pantalla muestra el logo
   * de xtracash una sola vez (nunca un logo por producto).
   */
  readonly productosConImagen = computed(() =>
    (this.estatus()?.productos ?? []).filter(p => !!p.imagen && !this.imagenesFallidas().has(p.imagen)));

  marcarImagenFallida(url: string): void {
    this.imagenesFallidas.update(s => new Set(s).add(url));
  }

  /** RN-009 / RN-010: el teléfono o el email ya los usa otra cédula (al salir del campo o al guardar). */
  readonly telefonoEnUso = signal(false);
  readonly emailEnUso = signal(false);

  /** Modo solo lectura cuando ningún pre-registro permite edición (ya registrado / en proceso / creado). */
  readonly soloLectura = computed(() => !(this.estatus()?.permiteEdicion ?? true));

  /** Persona jurídica (J): se pide la razón social y no el apellido; admite números. */
  readonly esJuridico = computed(() => this.estatus()?.nacionalidad === 'J');

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    // Teléfono = operadora (lista fija) + 7 dígitos.
    operadora: ['', [Validators.required]],
    numero: ['', [Validators.required, Validators.pattern(/^\d{7}$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]]
  });

  constructor() {
    effect(() => {
      const e = this.estatus();
      if (!e) return;

      this.aplicarReglasNombre(e.nacionalidad === 'J');

      // El teléfono guardado se separa en operadora + número (si no es de una operadora móvil, se deja vacío).
      const tel = e.telefono ?? '';
      const operadora = this.operadoras.find(o => tel.startsWith(o) && tel.length === 11);
      this.form.patchValue({
        nombre: e.nombre ?? '',
        apellido: e.apellido ?? '',
        operadora: operadora ?? '',
        numero: operadora ? tel.substring(4) : '',
        email: e.email ?? ''
      });
      this.soloLectura() ? this.form.disable() : this.form.enable();
    });

    // Al cambiar el teléfono o el email se descarta el aviso anterior hasta volver a verificar.
    const { operadora, numero, email } = this.form.controls;
    operadora.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.telefonoEnUso.set(false));
    numero.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.telefonoEnUso.set(false));
    email.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.emailEnUso.set(false));
  }

  /** Al salir del campo teléfono (o cambiar la operadora): verifica que no lo use otra cédula. */
  verificarTelefono(): void {
    const e = this.estatus();
    const { operadora, numero } = this.form.controls;
    if (!e || this.soloLectura() || operadora.invalid || numero.invalid) return;
    this.servicio.verificarContacto(e.nacionalidad, e.cedula, `${operadora.value}${numero.value}`, null)
      .subscribe({ next: r => this.telefonoEnUso.set(r.telefonoEnUso), error: () => { /* Guardar vuelve a validar */ } });
  }

  /** Al salir del campo email: verifica que no lo use otra cédula. */
  verificarEmail(): void {
    const e = this.estatus();
    const { email } = this.form.controls;
    if (!e || this.soloLectura() || email.invalid) return;
    this.servicio.verificarContacto(e.nacionalidad, e.cedula, null, email.value.trim())
      .subscribe({ next: r => this.emailEnUso.set(r.emailEnUso), error: () => { /* Guardar vuelve a validar */ } });
  }

  /** Natural: nombre y apellido sin números. Jurídico: razón social (admite números) y sin apellido. */
  private aplicarReglasNombre(juridico: boolean): void {
    const { nombre, apellido } = this.form.controls;
    if (juridico) {
      nombre.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(80)]);
      apellido.clearValidators();
    } else {
      nombre.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(80), nombrePersonaValidator]);
      apellido.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(80), nombrePersonaValidator]);
    }
    nombre.updateValueAndValidity({ emitEvent: false });
    apellido.updateValueAndValidity({ emitEvent: false });
  }

  campoInvalido(nombre: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[nombre];
    return c.touched && c.invalid;
  }

  /** El error del nombre/apellido distingue "tiene números" de "muy corto". */
  tienePatronInvalido(nombre: 'nombre' | 'apellido'): boolean {
    return !!this.form.controls[nombre].errors?.['pattern'];
  }

  /**
   * Persona natural: al escribir o pegar se eliminan números y símbolos, los espacios del inicio y los repetidos.
   * La razón social (J) no se filtra.
   */
  soloLetras(ev: Event, campo: 'nombre' | 'apellido'): void {
    if (this.esJuridico()) return;
    const input = ev.target as HTMLInputElement;
    const limpio = input.value.replace(RX_NO_LETRA_NI_ESPACIO, '').replace(/ {2,}/g, ' ').replace(/^ /, '');
    if (limpio !== input.value) this.form.controls[campo].setValue(limpio);
  }

  soloDigitos(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const limpio = input.value.replace(/\D/g, '').slice(0, 7);
    if (limpio !== input.value) this.form.controls.numero.setValue(limpio);
  }

  guardar(): void {
    this.error.set(null);
    const e = this.estatus();
    if (!e) { this.router.navigate(['/']); return; }

    if (this.form.invalid || this.telefonoEnUso() || this.emailEnUso()) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const v = this.form.getRawValue();

    this.servicio.guardar({
      nacionalidad: e.nacionalidad,
      cedula: e.cedula,
      nombre: v.nombre.trim(),
      apellido: this.esJuridico() ? null : v.apellido.trim(),
      telefono: `${v.operadora}${v.numero}`,
      email: v.email.trim()
    }).subscribe({
      next: (res: RegistroEstatus) => {
        this.guardando.set(false);
        this.guardadoOk.set(true);
        this.servicio.actual.set(res);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err: ApiError) => {
        this.guardando.set(false);
        // RN-009 / RN-010: el servidor rechazó el teléfono o el email; se marca el campo.
        if (err.codigo === 'TELEFONO_EN_USO' || err.codigo === 'TELEFONO_EMAIL_EN_USO') this.telefonoEnUso.set(true);
        if (err.codigo === 'EMAIL_EN_USO' || err.codigo === 'TELEFONO_EMAIL_EN_USO') this.emailEnUso.set(true);
        this.error.set(err.mensaje);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/']);
  }
}
