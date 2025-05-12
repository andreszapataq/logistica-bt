"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { getSupabaseBrowserClient, type Mensajero } from "@/lib/supabase"

export function MensajerosTable() {
  const [mensajeros, setMensajeros] = useState<Mensajero[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchMensajeros = async () => {
      try {
        setLoading(true)
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

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro que desea eliminar este mensajero?")) {
      try {
        const { error } = await supabase.from("mensajeros").delete().eq("id", id)

        if (error) {
          throw error
        }

        setMensajeros(mensajeros.filter((mensajero) => mensajero.id !== id))
        toast({
          title: "Éxito",
          description: "Mensajero eliminado correctamente.",
        })
      } catch (error: any) {
        console.error("Error al eliminar mensajero:", error.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el mensajero. Por favor, intenta de nuevo.",
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mensajeros</CardTitle>
        <CardDescription>Lista de todos los mensajeros registrados en el sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="buscar-mensajero" className="text-sm font-medium">
              Buscar mensajero
            </label>
            <Input
              id="buscar-mensajero"
              placeholder="Buscar por nombre, teléfono o correo"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p>Cargando mensajeros...</p>
          </div>
        ) : mensajeros.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay mensajeros registrados.</p>
            <p className="mt-2">
              <Link href="/mensajeros/nuevo-mensajero">
                <Button variant="link">Registrar un nuevo mensajero</Button>
              </Link>
            </p>
          </div>
        ) : (
          <Table>
            <TableCaption>Una lista de tus mensajeros. Click en el nombre para ver detalles.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mensajeros
                .filter(
                  (mensajero) =>
                    busqueda === "" ||
                    mensajero.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                    mensajero.telefono.includes(busqueda) ||
                    mensajero.email.toLowerCase().includes(busqueda.toLowerCase()) ||
                    mensajero.ciudad.toLowerCase().includes(busqueda.toLowerCase()),
                )
                .map((mensajero) => (
                  <TableRow key={mensajero.id}>
                    <TableCell className="font-medium">{mensajero.nombre}</TableCell>
                    <TableCell>{mensajero.telefono}</TableCell>
                    <TableCell>{mensajero.email}</TableCell>
                    <TableCell>{mensajero.ciudad}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/mensajeros/editar-mensajero/${mensajero.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(mensajero.id)}>
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>Total {mensajeros.length} mensajeros</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
