import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiError, ContactoEnUso, GuardarRegistro, Nacionalidad, RegistroEstatus } from './registro.models';

@Injectable({ providedIn: 'root' })
export class RegistroService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/registros`;

  /** Estado del usuario en sesión (resultado de la pantalla 1). */
  readonly actual = signal<RegistroEstatus | null>(null);

  consultar(nacionalidad: Nacionalidad, cedula: string): Observable<RegistroEstatus> {
    return this.http
      .get<RegistroEstatus>(`${this.base}/${nacionalidad}/${cedula}`)
      .pipe(catchError(this.manejarError));
  }

  guardar(datos: GuardarRegistro): Observable<RegistroEstatus> {
    return this.http.post<RegistroEstatus>(this.base, datos).pipe(catchError(this.manejarError));
  }

  /** Al salir del campo: si el teléfono o el email ya los usa otra cédula. Guardar lo vuelve a validar. */
  verificarContacto(nacionalidad: Nacionalidad, cedula: string, telefono: string | null, email: string | null): Observable<ContactoEnUso> {
    return this.http
      .post<ContactoEnUso>(`${this.base}/verificar-contacto`, { nacionalidad, cedula, telefono, email })
      .pipe(catchError(this.manejarError));
  }

  limpiar(): void {
    this.actual.set(null);
  }

  private manejarError = (err: HttpErrorResponse) => {
    let mensaje = 'No fue posible comunicarse con el servidor. Intenta nuevamente.';
    const cuerpo = err.error as Partial<ApiError> & { errors?: Record<string, string[]> };

    if (cuerpo?.mensaje) {
      mensaje = cuerpo.mensaje;
    } else if (cuerpo?.errors) {
      mensaje = Object.values(cuerpo.errors).flat().join(' ');
    }
    return throwError(() => ({ codigo: cuerpo?.codigo ?? String(err.status), mensaje } as ApiError));
  };
}
