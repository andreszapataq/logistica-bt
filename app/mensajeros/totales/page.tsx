"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { getSupabaseBrowserClient, type Mensajero } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { MultiMonthFilter, type MonthYearSelection, getMonthYearDescription } from "@/components/multi-month-filter"

type MensajeroConTotales = Mensajero & {
  total_servicios: number
  total_valor: number
  total_pagado: number
  total_pendiente: number
}

export default function TotalesMensajerosPage() {
  const [mensajeros, setMensajeros] = useState<MensajeroConTotales[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroPeriodo, setFiltroPeriodo] = useState<MonthYearSelection>({
    months: [],
    year: new Date().getFullYear()
  })
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Obtener todos los mensajeros
        const { data: mensajerosData, error: mensajerosError } = await supabase
          .from("mensajeros")
          .select("*")
          .order("nombre")

        if (mensajerosError) throw mensajerosError

        // Obtener todos los servicios
        const { data: serviciosData, error: serviciosError } = await supabase.from("servicios_mensajeros").select("*")

        if (serviciosError) throw serviciosError

        // Filtrar servicios por período
        let serviciosFiltrados = serviciosData.filter((servicio) => {
          const fechaParte = servicio.fecha.split("T")[0]
          const [año, mes] = fechaParte.split("-").map(Number)
          
          // Filtrar por año
          if (filtroPeriodo.year !== "todos" && año !== filtroPeriodo.year) {
            return false
          }
          
          // Filtrar por meses (si hay meses específicos seleccionados)
          if (filtroPeriodo.months.length > 0 && !filtroPeriodo.months.includes(mes)) {
            return false
          }
          
          return true
        })

        // Calcular totales para cada mensajero
        const mensajerosConTotales = mensajerosData.map((mensajero) => {
          const serviciosMensajero = serviciosFiltrados.filter((servicio) => servicio.mensajero_id === mensajero.id)

          const total_servicios = serviciosMensajero.length
          const total_valor = serviciosMensajero.reduce((sum, servicio) => sum + servicio.valor, 0)
          const total_pagado = serviciosMensajero
            .filter((servicio) => servicio.pagado)
            .reduce((sum, servicio) => sum + servicio.valor, 0)
          const total_pendiente = total_valor - total_pagado

          return {
            ...mensajero,
            total_servicios,
            total_valor,
            total_pagado,
            total_pendiente,
          }
        })

        setMensajeros(mensajerosConTotales)
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
  }, [filtroPeriodo, toast])

  // Formatear valor para mostrar
  const formatearValor = (valor: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor)
  }

  // Calcular totales generales
  const totalesGenerales = {
    servicios: mensajeros.reduce((sum, m) => sum + m.total_servicios, 0),
    valor: mensajeros.reduce((sum, m) => sum + m.total_valor, 0),
    pagado: mensajeros.reduce((sum, m) => sum + m.total_pagado, 0),
    pendiente: mensajeros.reduce((sum, m) => sum + m.total_pendiente, 0),
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Totales por Mensajero</h1>

      <div className="mb-6">
        <MultiMonthFilter
          value={filtroPeriodo}
          onChange={setFiltroPeriodo}
          className="w-full max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Servicios por Mensajero</CardTitle>
          <CardDescription>
            {getMonthYearDescription(filtroPeriodo)}
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
                  <TableHead>Mensajero</TableHead>
                  <TableHead className="text-right">Total Servicios</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Pagado</TableHead>
                  <TableHead className="text-right">Pendiente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mensajeros.map((mensajero) => (
                  <TableRow key={mensajero.id}>
                    <TableCell className="font-medium">{mensajero.nombre}</TableCell>
                    <TableCell className="text-right">{mensajero.total_servicios}</TableCell>
                    <TableCell className="text-right">{formatearValor(mensajero.total_valor)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatearValor(mensajero.total_pagado)}</TableCell>
                    <TableCell className="text-right text-orange-600">{formatearValor(mensajero.total_pendiente)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>TOTALES</TableCell>
                  <TableCell className="text-right">{totalesGenerales.servicios}</TableCell>
                  <TableCell className="text-right">{formatearValor(totalesGenerales.valor)}</TableCell>
                  <TableCell className="text-right text-green-600">{formatearValor(totalesGenerales.pagado)}</TableCell>
                  <TableCell className="text-right text-orange-600">{formatearValor(totalesGenerales.pendiente)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
