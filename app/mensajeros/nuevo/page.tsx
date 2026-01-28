"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient, type Mensajero, type EstadoPago, ESTADOS_PAGO } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

function NuevoServicioMensajeroForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mensajeros, setMensajeros] = useState<Mensajero[]>([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    mensajero_id: "",
    origen: "",
    ciudad_origen: "",
    destino: "",
    ciudad_destino: "",
    fecha: "",
    valor: "",
    observaciones: "",
    estado: "pendiente" as EstadoPago,
  })

  useEffect(() => {
    const fetchMensajeros = async () => {
      try {
        const { data, error } = await supabase.from("mensajeros").select("*").order("nombre")

        if (error) {
          throw error
        }

        setMensajeros(data || [])
      } catch (error: any) {
        console.error("Error al cargar mensajeros:", error.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los mensajeros. Por favor, intenta de nuevo.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMensajeros()
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

      // Crear fecha en formato ISO con zona horaria de Colombia
      const fechaISO = `${formData.fecha}T12:00:00-05:00`

      const { data, error } = await supabase
        .from("servicios_mensajeros")
        .insert([
          {
            mensajero_id: formData.mensajero_id,
            origen: formData.origen,
            ciudad_origen: formData.ciudad_origen,
            destino: formData.destino,
            ciudad_destino: formData.ciudad_destino,
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
      router.push(`/mensajeros${params ? `?${params}` : ''}`)
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
          <CardDescription>Ingrese los datos del nuevo servicio de mensajería</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="mensajero">Mensajero</Label>
            <Select
              onValueChange={(value) => handleSelectChange("mensajero_id", value)}
              value={formData.mensajero_id}
              disabled={loading || mensajeros.length === 0}
            >
              <SelectTrigger id="mensajero">
                <SelectValue
                  placeholder={
                    loading
                      ? "Cargando mensajeros..."
                      : mensajeros.length === 0
                        ? "No hay mensajeros registrados"
                        : "Seleccionar mensajero"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {mensajeros.map((mensajero) => (
                  <SelectItem key={mensajero.id} value={mensajero.id}>
                    {mensajero.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {mensajeros.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground mt-1">
                <Link href="/mensajeros/nuevo-mensajero" className="text-primary hover:underline">
                  Registrar un nuevo mensajero
                </Link>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="origen">Punto de partida</Label>
              <Input
                id="origen"
                name="origen"
                placeholder="Lugar de origen"
                value={formData.origen}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="ciudad_origen">Ciudad de origen</Label>
              <Input
                id="ciudad_origen"
                name="ciudad_origen"
                placeholder="Ciudad de origen"
                value={formData.ciudad_origen}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="destino">Punto de destino</Label>
              <Input
                id="destino"
                name="destino"
                placeholder="Lugar de destino"
                value={formData.destino}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="ciudad_destino">Ciudad de destino</Label>
              <Input
                id="ciudad_destino"
                name="ciudad_destino"
                placeholder="Ciudad de destino"
                value={formData.ciudad_destino}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
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
          <Button type="submit" disabled={isSubmitting || loading || mensajeros.length === 0}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function NuevoServicioMensajeroPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Nuevo Servicio de Mensajería</h1>
      <Suspense fallback={<div className="flex justify-center items-center py-8"><p>Cargando...</p></div>}>
        <NuevoServicioMensajeroForm />
      </Suspense>
    </div>
  )
}
