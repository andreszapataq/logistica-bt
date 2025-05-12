"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient, type Instrumentadora } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

type InstrumentadoraConTotales = Instrumentadora & {
  total_servicios: number
  total_valor: number
  total_pagado: number
  total_pendiente: number
}

export default function TotalesInstrumentadorasPage() {
  const [instrumentadoras, setInstrumentadoras] = useState<InstrumentadoraConTotales[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroMes, setFiltroMes] = useState("todos")
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Obtener todas las instrumentadoras
        const { data: instrumentadorasData, error: instrumentadorasError } = await supabase
          .from("instrumentadoras")
          .select("*")
          .order("nombre")

        if (instrumentadorasError) throw instrumentadorasError

        // Obtener todos los servicios
        const { data: serviciosData, error: serviciosError } = await supabase
          .from("servicios_instrumentadoras")
          .select("*")

        if (serviciosError) throw serviciosError

        // Filtrar servicios por mes si es necesario
        let serviciosFiltrados = [...serviciosData]
        if (filtroMes !== "todos") {
          const mes = Number.parseInt(filtroMes)
          serviciosFiltrados = serviciosData.filter((servicio) => {
            const fecha = new Date(servicio.fecha)
            return fecha.getMonth() + 1 === mes
          })
        }

        // Calcular totales para cada instrumentadora
        const instrumentadorasConTotales = instrumentadorasData.map((instrumentadora) => {
          const serviciosInstrumentadora = serviciosFiltrados.filter(
            (servicio) => servicio.instrumentadora_id === instrumentadora.id,
          )

          const total_servicios = serviciosInstrumentadora.length
          const total_valor = serviciosInstrumentadora.reduce((sum, servicio) => sum + servicio.valor, 0)
          const total_pagado = serviciosInstrumentadora
            .filter((servicio) => servicio.pagado)
            .reduce((sum, servicio) => sum + servicio.valor, 0)
          const total_pendiente = total_valor - total_pagado

          return {
            ...instrumentadora,
            total_servicios,
            total_valor,
            total_pagado,
            total_pendiente,
          }
        })

        setInstrumentadoras(instrumentadorasConTotales)
      } catch (error: any) {
        console.error("Error al cargar datos:", error.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos. Por favor, intenta de nuevo.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filtroMes, toast])

  // Formatear valor para mostrar
  const formatearValor = (valor: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Totales por Instrumentadora</h1>

      <div className="mb-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <label htmlFor="filtro-mes" className="text-sm font-medium">
            Filtrar por mes
          </label>
          <Select value={filtroMes} onValueChange={setFiltroMes}>
            <SelectTrigger id="filtro-mes">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los meses</SelectItem>
              <SelectItem value="1">Enero</SelectItem>
              <SelectItem value="2">Febrero</SelectItem>
              <SelectItem value="3">Marzo</SelectItem>
              <SelectItem value="4">Abril</SelectItem>
              <SelectItem value="5">Mayo</SelectItem>
              <SelectItem value="6">Junio</SelectItem>
              <SelectItem value="7">Julio</SelectItem>
              <SelectItem value="8">Agosto</SelectItem>
              <SelectItem value="9">Septiembre</SelectItem>
              <SelectItem value="10">Octubre</SelectItem>
              <SelectItem value="11">Noviembre</SelectItem>
              <SelectItem value="12">Diciembre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Servicios por Instrumentadora</CardTitle>
          <CardDescription>
            {filtroMes === "todos"
              ? "Totales de todos los servicios registrados"
              : `Totales de servicios del mes ${filtroMes}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p>Cargando datos...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instrumentadora</TableHead>
                  <TableHead>Total Servicios</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Pendiente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instrumentadoras.map((instrumentadora) => (
                  <TableRow key={instrumentadora.id}>
                    <TableCell className="font-medium">{instrumentadora.nombre}</TableCell>
                    <TableCell>{instrumentadora.total_servicios}</TableCell>
                    <TableCell>{formatearValor(instrumentadora.total_valor)}</TableCell>
                    <TableCell>{formatearValor(instrumentadora.total_pagado)}</TableCell>
                    <TableCell>{formatearValor(instrumentadora.total_pendiente)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
