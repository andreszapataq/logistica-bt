import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.from("mensajeros").select("*").order("nombre")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const body = await request.json()
  const { nombre, telefono, email, ciudad } = body ?? {}

  if (!nombre || !telefono || !email || !ciudad) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 })
  }

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("mensajeros")
    .insert([{ nombre, telefono, email, ciudad }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
