"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient, type Instrumentadora, type EstadoPago, ESTADOS_PAGO, getEstadoFromServicio } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function EditarServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [instrumentadoras, setInstrumentadoras] = useState<Instrumentadora[]>([])
  const [formData, setFormData] = useState({
    id: resolvedParams.id,
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
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Cargar instrumentadoras
        const { data: instrumentadorasData, error: instrumentadorasError } = await supabase
          .from("instrumentadoras")
          .select("*")
          .order("nombre")

        if (instrumentadorasError) {
          throw instrumentadorasError
        }

        setInstrumentadoras(instrumentadorasData || [])

        // Cargar servicio
        const { data: servicio, error: servicioError } = await supabase
          .from("servicios_instrumentadoras")
          .select("*")
          .eq("id", resolvedParams.id)
          .single()

        if (servicioError) {
          throw servicioError
        }

        if (servicio) {
          // Convertir la fecha UTC a zona horaria de Colombia
          const fechaUTC = new Date(servicio.fecha)
          
          // Obtener fecha y hora en zona horaria de Colombia (America/Bogota)
          const fechaColombia = fechaUTC.toLocaleDateString('en-CA', { 
            timeZone: 'America/Bogota',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) // Formato: YYYY-MM-DD
          
          const horaColombia = fechaUTC.toLocaleTimeString('en-GB', {
            timeZone: 'America/Bogota',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) // Formato: HH:MM

          setFormData({
            id: servicio.id,
            instrumentadora_id: servicio.instrumentadora_id,
            paciente: servicio.paciente,
            institucion: servicio.institucion,
            ciudad: servicio.ciudad,
            fecha: fechaColombia,
            hora: horaColombia,
            valor: servicio.valor.toString(),
            observaciones: servicio.observaciones || "",
            estado: getEstadoFromServicio(servicio),
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se encontró el servicio solicitado.",
          })
          router.push("/instrumentadoras")
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
  }, [resolvedParams.id, router, toast])

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
      const fechaISO = `${formData.fecha}T${formData.hora}:00-05:00`

      const { error } = await supabase
        .from("servicios_instrumentadoras")
        .update({
          instrumentadora_id: formData.instrumentadora_id,
          paciente: formData.paciente,
          institucion: formData.institucion,
          ciudad: formData.ciudad,
          fecha: fechaISO,
          valor: Number.parseInt(formData.valor),
          observaciones: formData.observaciones || null,
          estado: formData.estado,
        })
        .eq("id", resolvedParams.id)

      if (error) {
        throw error
      }

      toast({
        title: "Éxito",
        description: "Servicio actualizado correctamente.",
      })

      // Preservar los filtros al volver
      const filters = searchParams.toString()
      const returnUrl = filters ? `/instrumentadoras?${filters}` : "/instrumentadoras"
      router.push(returnUrl)
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
      <h1 className="text-3xl font-bold tracking-tight mb-6">Editar Servicio de Instrumentación</h1>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Actualizar Servicio</CardTitle>
            <CardDescription>Modifique los datos del servicio de instrumentación quirúrgica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="instrumentadora">Instrumentadora</Label>
              <Select
                onValueChange={(value) => handleSelectChange("instrumentadora_id", value)}
                value={formData.instrumentadora_id}
                disabled={instrumentadoras.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      instrumentadoras.length === 0
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
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                const filters = searchParams.toString()
                const returnUrl = filters ? `/instrumentadoras?${filters}` : "/instrumentadoras"
                router.push(returnUrl)
              }} 
              disabled={isSubmitting}
            >
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
