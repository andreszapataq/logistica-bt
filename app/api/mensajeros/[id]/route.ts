import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("mensajeros")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params
  const body = await request.json()
  const { nombre, telefono, email, ciudad } = body ?? {}

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from("mensajeros")
    .update({ nombre, telefono, email, ciudad })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from("mensajeros").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
