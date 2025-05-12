"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient, type Instrumentadora } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function EditarInstrumentadoraPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<Instrumentadora>({
    id: params.id,
    nombre: "",
    telefono: "",
    email: "",
    ciudad: "",
  })

  useEffect(() => {
    const fetchInstrumentadora = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("instrumentadoras").select("*").eq("id", params.id).single()

        if (error) {
          throw error
        }

        if (data) {
          setFormData(data)
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se encontró la instrumentadora solicitada.",
          })
          router.push("/instrumentadoras")
        }
      } catch (error: any) {
        console.error("Error al cargar instrumentadora:", error.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información de la instrumentadora.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstrumentadora()
  }, [params.id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      const { error } = await supabase
        .from("instrumentadoras")
        .update({
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email,
          ciudad: formData.ciudad,
        })
        .eq("id", params.id)

      if (error) {
        throw error
      }

      toast({
        title: "Éxito",
        description: "Instrumentadora actualizada correctamente.",
      })

      router.push("/instrumentadoras")
      router.refresh()
    } catch (error: any) {
      console.error("Error al actualizar instrumentadora:", error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la instrumentadora. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <p>Cargando información de la instrumentadora...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Editar Instrumentadora</h1>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Actualizar Instrumentadora</CardTitle>
            <CardDescription>Modifique los datos de la instrumentadora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                placeholder="Número de teléfono"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Correo electrónico"
                value={formData.email}
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
