"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { getSupabaseBrowserClient, type Instrumentadora } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export function InstrumentadorasTable() {
  const [instrumentadoras, setInstrumentadoras] = useState<Instrumentadora[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchInstrumentadoras = async () => {
      try {
        setLoading(true)
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

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro que desea eliminar esta instrumentadora?")) {
      try {
        const { error } = await supabase.from("instrumentadoras").delete().eq("id", id)

        if (error) {
          throw error
        }

        setInstrumentadoras(instrumentadoras.filter((item) => item.id !== id))
        toast({
          title: "Éxito",
          description: "Instrumentadora eliminada correctamente.",
        })
      } catch (error: any) {
        console.error("Error al eliminar instrumentadora:", error.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar la instrumentadora. Por favor, intenta de nuevo.",
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instrumentadoras Registradas</CardTitle>
        <CardDescription>Lista de instrumentadoras quirúrgicas registradas en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="buscar-instrumentadora" className="text-sm font-medium">
              Buscar instrumentadora
            </label>
            <Input
              id="buscar-instrumentadora"
              placeholder="Buscar por nombre, teléfono o correo"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p>Cargando instrumentadoras...</p>
          </div>
        ) : instrumentadoras.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay instrumentadoras registradas.</p>
            <p className="mt-2">
              <Link href="/instrumentadoras/nueva">
                <Button variant="link">Registrar una nueva instrumentadora</Button>
              </Link>
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instrumentadoras
                .filter(
                  (instrumentadora) =>
                    busqueda === "" ||
                    instrumentadora.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                    instrumentadora.telefono.includes(busqueda) ||
                    instrumentadora.email.toLowerCase().includes(busqueda.toLowerCase()) ||
                    instrumentadora.ciudad.toLowerCase().includes(busqueda.toLowerCase()),
                )
                .map((instrumentadora) => (
                  <TableRow key={instrumentadora.id}>
                    <TableCell className="font-medium">{instrumentadora.nombre}</TableCell>
                    <TableCell>{instrumentadora.telefono}</TableCell>
                    <TableCell>{instrumentadora.email}</TableCell>
                    <TableCell>{instrumentadora.ciudad}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/instrumentadoras/editar/${instrumentadora.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(instrumentadora.id)}>
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
