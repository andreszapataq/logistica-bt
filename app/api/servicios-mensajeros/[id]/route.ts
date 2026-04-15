import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("servicios_mensajeros")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params
  const body = await request.json()
  const {
    mensajero_id,
    origen,
    ciudad_origen,
    destino,
    ciudad_destino,
    fecha,
    valor,
    observaciones,
    estado,
  } = body ?? {}

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("servicios_mensajeros")
    .update({
      mensajero_id,
      origen,
      ciudad_origen,
      destino,
      ciudad_destino,
      fecha,
      valor: valor != null ? Number(valor) : undefined,
      observaciones: observaciones ?? null,
      estado,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from("servicios_mensajeros").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
