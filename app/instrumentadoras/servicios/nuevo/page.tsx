"use client"

import Link from "next/link"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient, type Instrumentadora, type EstadoPago, ESTADOS_PAGO } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

function NuevoServicioForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [instrumentadoras, setInstrumentadoras] = useState<Instrumentadora[]>([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    instrumentadora_id: "",
    paciente: "",
    institucion: "",
    ciudad: "",
    fecha: "",
    hora: "",
    valor: "",
    observaciones: "",
    estado: "pendiente" as EstadoPago,
  })

  useEffect(() => {
    const fetchInstrumentadoras = async () => {
      try {
        const { data, error } = await supabase.from("instrumentadoras").select("*").order("nombre")

        if (error) {
          throw error
        }

        setInstrumentadoras(data || [])
      } catch (error: any) {
        console.error("Error al cargar instrumentadoras:", error.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las instrumentadoras. Por favor, intenta de nuevo.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInstrumentadoras()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEstadoChange = (value: EstadoPago) => {
    setFormData((prev) => ({ ...prev, estado: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Crear fecha en formato ISO sin manipulación de zona horaria
      const [year, month, day] = formData.fecha.split("-").map(Number)
      const [hours, minutes] = formData.hora.split(":").map(Number)

      // Crear fecha directamente con los componentes
      const fechaISO = `${formData.fecha}T${formData.hora}:00-05:00`

      const { data, error } = await supabase
        .from("servicios_instrumentadoras")
        .insert([
          {
            instrumentadora_id: formData.instrumentadora_id,
            paciente: formData.paciente,
            institucion: formData.institucion,
            ciudad: formData.ciudad,
            fecha: fechaISO,
            valor: Number.parseInt(formData.valor),
            observaciones: formData.observaciones || null,
            estado: formData.estado,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Éxito",
        description: "Servicio registrado correctamente.",
      })

      // Redirigir a la lista de servicios preservando los filtros
      const params = searchParams.toString()
      router.push(`/instrumentadoras${params ? `?${params}` : ''}`)
      router.refresh()
    } catch (error: any) {
      console.error("Error al registrar servicio:", error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar el servicio. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Registrar Servicio</CardTitle>
          <CardDescription>Ingrese los datos del nuevo servicio de instrumentación quirúrgica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="instrumentadora">Instrumentadora</Label>
            <Select
              onValueChange={(value) => handleSelectChange("instrumentadora_id", value)}
              value={formData.instrumentadora_id}
              disabled={loading || instrumentadoras.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loading
                      ? "Cargando instrumentadoras..."
                      : instrumentadoras.length === 0
                        ? "No hay instrumentadoras registradas"
                        : "Seleccionar instrumentadora"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {instrumentadoras.map((instrumentadora) => (
                  <SelectItem key={instrumentadora.id} value={instrumentadora.id}>
                    {instrumentadora.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {instrumentadoras.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground mt-1">
                <Link href="/instrumentadoras/nueva" className="text-primary hover:underline">
                  Registrar una nueva instrumentadora
                </Link>
              </p>
            )}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="paciente">Nombre del paciente</Label>
            <Input
              id="paciente"
              name="paciente"
              placeholder="Nombre del paciente"
              value={formData.paciente}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="institucion">Institución</Label>
            <Input
              id="institucion"
              name="institucion"
              placeholder="Clínica u hospital"
              value={formData.institucion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input
              id="ciudad"
              name="ciudad"
              placeholder="Ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" name="hora" type="time" value={formData.hora} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="valor">Valor del servicio</Label>
            <Input
              id="valor"
              name="valor"
              type="number"
              placeholder="Valor en pesos"
              value={formData.valor}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              name="observaciones"
              placeholder="Observaciones adicionales"
              value={formData.observaciones}
              onChange={handleChange}
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="estado">Estado del servicio</Label>
            <Select
              onValueChange={(value) => handleEstadoChange(value as EstadoPago)}
              value={formData.estado}
            >
              <SelectTrigger id="estado">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ESTADOS_PAGO) as EstadoPago[]).map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {ESTADOS_PAGO[estado].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || loading || instrumentadoras.length === 0}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function NuevoServicioPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Nuevo Servicio de Instrumentación</h1>
      <Suspense fallback={<div className="flex justify-center items-center py-8"><p>Cargando...</p></div>}>
        <NuevoServicioForm />
      </Suspense>
    </div>
  )
}
