"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient, type Mensajero } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function EditarServicioMensajeroPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mensajeros, setMensajeros] = useState<Mensajero[]>([])
  const [formData, setFormData] = useState({
    id: params.id,
    mensajero_id: "",
    origen: "",
    ciudad_origen: "",
    destino: "",
    ciudad_destino: "",
    fecha: "",
    valor: "",
    observaciones: "",
    pagado: false,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Cargar mensajeros
        const { data: mensajerosData, error: mensajerosError } = await supabase
          .from("mensajeros")
          .select("*")
          .order("nombre")

        if (mensajerosError) {
          throw mensajerosError
        }

        setMensajeros(mensajerosData || [])

        // Cargar servicio
        const { data: servicio, error: servicioError } = await supabase
          .from("servicios_mensajeros")
          .select("*")
          .eq("id", params.id)
          .single()

        if (servicioError) {
          throw servicioError
        }

        if (servicio) {
          // Formatear fecha para Colombia (UTC-5)
          const fecha = new Date(servicio.fecha)

          // Obtener fecha en formato YYYY-MM-DD
          const fechaStr = fecha.toLocaleDateString("en-CA") // en-CA usa formato YYYY-MM-DD

          setFormData({
            id: servicio.id,
            mensajero_id: servicio.mensajero_id,
            origen: servicio.origen,
            ciudad_origen: servicio.ciudad_origen,
            destino: servicio.destino,
            ciudad_destino: servicio.ciudad_destino,
            fecha: fechaStr,
            valor: servicio.valor.toString(),
            observaciones: servicio.observaciones || "",
            pagado: servicio.pagado,
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se encontró el servicio solicitado.",
          })
          router.push("/mensajeros")
        }
      } catch (error: any) {
        console.error("Error al cargar datos:", error.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos necesarios.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, pagado: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Crear fecha en formato ISO con zona horaria de Colombia
      const fechaISO = `${formData.fecha}T12:00:00-05:00`

      const { error } = await supabase
        .from("servicios_mensajeros")
        .update({
          mensajero_id: formData.mensajero_id,
          origen: formData.origen,
          ciudad_origen: formData.ciudad_origen,
          destino: formData.destino,
          ciudad_destino: formData.ciudad_destino,
          fecha: fechaISO,
          valor: Number.parseInt(formData.valor),
          observaciones: formData.observaciones || null,
          pagado: formData.pagado,
        })
        .eq("id", params.id)

      if (error) {
        throw error
      }

      toast({
        title: "Éxito",
        description: "Servicio actualizado correctamente.",
      })

      router.push("/mensajeros")
      router.refresh()
    } catch (error: any) {
      console.error("Error al actualizar servicio:", error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el servicio. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <p>Cargando información del servicio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Editar Servicio de Mensajería</h1>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Actualizar Servicio</CardTitle>
            <CardDescription>Modifique los datos del servicio de mensajería</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="mensajero">Mensajero</Label>
              <Select
                onValueChange={(value) => handleSelectChange("mensajero_id", value)}
                value={formData.mensajero_id}
                disabled={mensajeros.length === 0}
              >
                <SelectTrigger id="mensajero">
                  <SelectValue
                    placeholder={mensajeros.length === 0 ? "No hay mensajeros registrados" : "Seleccionar mensajero"}
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

            <div className="flex items-center space-x-2">
              <Switch id="pagado" checked={formData.pagado} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="pagado">Servicio pagado</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
