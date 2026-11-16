/** Tipo de documento: V, E y P (persona natural) y J (persona jurídica). */
export type Nacionalidad = 'V' | 'E' | 'J' | 'P';

export const TIPOS_DOCUMENTO: { valor: Nacionalidad; nombre: string }[] = [
  { valor: 'V', nombre: 'Venezolano' },
  { valor: 'E', nombre: 'Extranjero' },
  { valor: 'J', nombre: 'Jurídico' },
  { valor: 'P', nombre: 'Pasaporte' }
];

/** Operadoras móviles permitidas (misma lista que el API y el WebAdmin). */
export const OPERADORAS_MOVILES = ['0412', '0414', '0416', '0422', '0424', '0426'];

/** Estatus de cridx_PreRegistrationStatus (base del WebAdmin). */
export type EstatusCodigo =
  | 'PRECARGADO'
  | 'PENDIENTE_REGISTRO'
  | 'POR_CREAR'
  | 'EXPORTADO'
  | 'CREADO'
  | 'RECHAZADO_CORREGIBLE'
  | 'RECHAZADO_DEFINITIVO'
  | 'ERROR_TECNICO'
  | 'DESINCORPORADO';

/** Texto amigable para el beneficiario. */
export const ETIQUETA_ESTATUS: Record<EstatusCodigo, string> = {
  PRECARGADO: 'Pendiente',
  PENDIENTE_REGISTRO: 'Pendiente',
  POR_CREAR: 'Registrado',
  EXPORTADO: 'Exportado',
  CREADO: 'Producto creado',
  RECHAZADO_CORREGIBLE: 'Requiere corrección',
  RECHAZADO_DEFINITIVO: 'Rechazado',
  ERROR_TECNICO: 'En revisión',
  DESINCORPORADO: 'Desincorporado'
};

/** Un pre-registro (producto) de la persona: la misma cédula puede tener varios, uno por BIN. */
export interface ProductoPreRegistro {
  tipo: 'CREDITO' | 'PREPAGADA';
  tipoNombre: string | null;
  bin: string | null;
  empresa: string | null;
  estatusCodigo: EstatusCodigo;
  estatusDescripcion: string;
  permiteEdicion: boolean;
  /** URL de la imagen de la tarjeta (cridx_Product.product_image); null si el producto no tiene. */
  imagen: string | null;
}

/** Respuesta del API (GET /registros/{nac}/{cedula} y POST /registros). */
export interface RegistroEstatus {
  nacionalidad: Nacionalidad;
  cedula: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  email: string | null;
  /** Estatus que resume a la persona (el que requiere su acción primero). */
  estatusId: number;
  estatusCodigo: EstatusCodigo;
  estatusDescripcion: string;
  permiteEdicion: boolean;
  fechaInicio: string | null;
  fechaRegistro: string | null;
  fechaActualizacion: string | null;
  productos: ProductoPreRegistro[];
}

/** Lo que captura el usuario: se guarda en todos sus pre-registros editables. BIN, tipo y límite vienen de la precarga. */
export interface GuardarRegistro {
  nacionalidad: Nacionalidad;
  cedula: string;
  /** Nombre (persona natural) o razón social (jurídico). */
  nombre: string;
  /** Solo persona natural; null para jurídico. */
  apellido: string | null;
  telefono: string;
  email: string;
}

export interface ApiError {
  codigo: string;
  mensaje: string;
}

/** RN-009 / RN-010: si el teléfono o el email ya los usa otra cédula (no trae datos del otro titular). */
export interface ContactoEnUso {
  telefonoEnUso: boolean;
  emailEnUso: boolean;
}
