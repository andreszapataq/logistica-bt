import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const withJoin = searchParams.get("join") === "mensajero"

  const supabase = getSupabaseServerClient()
  const query = withJoin
    ? supabase
        .from("servicios_mensajeros")
        .select("*, mensajero:mensajero_id(nombre)")
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false })
    : supabase.from("servicios_mensajeros").select("*")

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
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

  if (
    !mensajero_id ||
    !origen ||
    !ciudad_origen ||
    !destino ||
    !ciudad_destino ||
    !fecha ||
    valor == null
  ) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 })
  }

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("servicios_mensajeros")
    .insert([
      {
        mensajero_id,
        origen,
        ciudad_origen,
        destino,
        ciudad_destino,
        fecha,
        valor: Number(valor),
        observaciones: observaciones || null,
        estado: estado ?? "pendiente",
      },
    ])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { ids, estado } = body ?? {}

  if (!Array.isArray(ids) || ids.length === 0 || !estado) {
    return NextResponse.json({ error: "ids y estado son obligatorios." }, { status: 400 })
  }

  const supabase = getSupabaseServerClient()
  const { error } = await supabase
    .from("servicios_mensajeros")
    .update({ estado })
    .in("id", ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, count: ids.length })
}
