import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const withJoin = searchParams.get("join") === "instrumentadora"

  const supabase = getSupabaseServerClient()
  const query = withJoin
    ? supabase
        .from("servicios_instrumentadoras")
        .select("*, instrumentadora:instrumentadora_id(nombre)")
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false })
    : supabase.from("servicios_instrumentadoras").select("*")

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const body = await request.json()
  const {
    instrumentadora_id,
    paciente,
    institucion,
    ciudad,
    fecha,
    valor,
    observaciones,
    estado,
  } = body ?? {}

  if (!instrumentadora_id || !paciente || !institucion || !ciudad || !fecha || valor == null) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 })
  }

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("servicios_instrumentadoras")
    .insert([
      {
        instrumentadora_id,
        paciente,
        institucion,
        ciudad,
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
    .from("servicios_instrumentadoras")
    .update({ estado })
    .in("id", ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, count: ids.length })
}
