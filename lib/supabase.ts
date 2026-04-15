// Estados de pago para los servicios
export type EstadoPago = 'pendiente' | 'facturado' | 'pagado'

// Configuración de estados para UI
export const ESTADOS_PAGO = {
  pendiente: {
    label: 'Pendiente',
    color: 'destructive' as const
  },
  facturado: {
    label: 'Facturado',
    color: 'warning' as const
  },
  pagado: {
    label: 'Pagado',
    color: 'success' as const
  }
} as const

// Helper para obtener el estado de un servicio de forma segura
export function getEstadoFromServicio(servicio: { estado: EstadoPago }): EstadoPago {
  if (servicio.estado && servicio.estado in ESTADOS_PAGO) {
    return servicio.estado
  }
  return 'pendiente'
}

// Tipos para las tablas de Supabase
export type Instrumentadora = {
  id: string
  nombre: string
  telefono: string
  email: string
  ciudad: string
  created_at?: string
}

export type ServicioInstrumentadora = {
  id: string
  instrumentadora_id: string
  paciente: string
  institucion: string
  ciudad: string
  fecha: string
  valor: number
  observaciones: string | null
  estado: EstadoPago
  created_at?: string
  // Campo virtual para mostrar en la tabla
  instrumentadora?: string
}

export type Mensajero = {
  id: string
  nombre: string
  telefono: string
  email: string
  ciudad: string
  created_at?: string
}

export type ServicioMensajero = {
  id: string
  mensajero_id: string
  origen: string
  ciudad_origen: string
  destino: string
  ciudad_destino: string
  fecha: string
  valor: number
  observaciones: string | null
  estado: EstadoPago
  created_at?: string
  // Campo virtual para mostrar en la tabla
  mensajero?: string
}

