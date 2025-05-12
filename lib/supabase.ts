import { createClient } from "@supabase/supabase-js"

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
  pagado: boolean
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
  pagado: boolean
  created_at?: string
  // Campo virtual para mostrar en la tabla
  mensajero?: string
}

// Crear cliente para el lado del servidor
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

// Crear cliente para el lado del cliente
export const createBrowserSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

// Singleton para el cliente del navegador
let browserClient: ReturnType<typeof createBrowserSupabaseClient> | null = null

export const getSupabaseBrowserClient = () => {
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient()
  }
  return browserClient
}
