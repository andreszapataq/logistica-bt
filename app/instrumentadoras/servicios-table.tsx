"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash, CheckCircle, DollarSign, X, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getSupabaseBrowserClient, type ServicioInstrumentadora, type Instrumentadora } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function ServiciosTable() {
  const [servicios, setServicios] = useState<ServicioInstrumentadora[]>([])
  const [instrumentadoras, setInstrumentadoras] = useState<Instrumentadora[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroMes, setFiltroMes] = useState("todos")
  const [filtroPago, setFiltroPago] = useState("todos")
  const [filtroInstrumentadora, setFiltroInstrumentadora] = useState("todos")
  const [filtroGeneral, setFiltroGeneral] = useState("")
  const [isBulkPaying, setIsBulkPaying] = useState(false)
  const [showBulkPayModal, setShowBulkPayModal] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Leer filtros de la URL al cargar el componente
  useEffect(() => {
    const mes = searchParams.get('mes') || 'todos'
    const pago = searchParams.get('pago') || 'todos'
    const instrumentadora = searchParams.get('instrumentadora') || 'todos'
    const busqueda = searchParams.get('busqueda') || ''
    
    setFiltroMes(mes)
    setFiltroPago(pago)
    setFiltroInstrumentadora(instrumentadora)
    setFiltroGeneral(busqueda)
  }, [searchParams])

  // Función para actualizar la URL con los filtros
  const updateURL = (newFiltros: { mes?: string; pago?: string; instrumentadora?: string; busqueda?: string }) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (newFiltros.mes !== undefined) {
      if (newFiltros.mes === 'todos') {
        params.delete('mes')
      } else {
        params.set('mes', newFiltros.mes)
      }
    }
    
    if (newFiltros.pago !== undefined) {
      if (newFiltros.pago === 'todos') {
        params.delete('pago')
      } else {
        params.set('pago', newFiltros.pago)
      }
    }
    
    if (newFiltros.instrumentadora !== undefined) {
      if (newFiltros.instrumentadora === 'todos') {
        params.delete('instrumentadora')
      } else {
        params.set('instrumentadora', newFiltros.instrumentadora)
      }
    }
    
    if (newFiltros.busqueda !== undefined) {
      if (newFiltros.busqueda === '') {
        params.delete('busqueda')
      } else {
        params.set('busqueda', newFiltros.busqueda)
      }
    }
    
    const newURL = params.toString() ? `?${params.toString()}` : ''
    router.replace(`/instrumentadoras${newURL}`, { scroll: false })
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Cargar instrumentadoras
        const { data: instrumentadorasData, error: instrumentadorasError } = await supabase
          .from("instrumentadoras")
          .select("*")
          .order("nombre")

        if (instrumentadorasError) {
          throw instrumentadorasError
        }

        setInstrumentadoras(instrumentadorasData || [])

        // Obtener servicios con el nombre de la instrumentadora
        const { data, error } = await supabase
          .from("servicios_instrumentadoras")
          .select(`
            *,
            instrumentadora:instrumentadora_id(nombre)
          `)
          .order("fecha", { ascending: false })

        if (error) {
          throw error
        }

        // Transformar los datos para tener el nombre de la instrumentadora directamente
        const serviciosFormateados =
          data?.map((servicio) => ({
            ...servicio,
            instrumentadora: servicio.instrumentadora?.nombre || "Desconocida",
          })) || []

        setServicios(serviciosFormateados)
      } catch (error: any) {
        console.error("Error al cargar servicios:", error.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los servicios. Por favor, intenta de nuevo.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro que desea eliminar este servicio?")) {
      try {
        const { error } = await supabase.from("servicios_instrumentadoras").delete().eq("id", id)

        if (error) {
          throw error
        }

        setServicios(servicios.filter((item) => item.id !== id))
        toast({
          title: "Éxito",
          description: "Servicio eliminado correctamente.",
        })
      } catch (error: any) {
        console.error("Error al eliminar servicio:", error.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el servicio. Por favor, intenta de nuevo.",
        })
      }
    }
  }

  // Manejadores de cambio de filtros que actualizan la URL
  const handleFiltroMesChange = (value: string) => {
    setFiltroMes(value)
    updateURL({ mes: value })
  }

  const handleFiltroPagoChange = (value: string) => {
    setFiltroPago(value)
    updateURL({ pago: value })
  }

  const handleFiltroInstrumentadoraChange = (value: string) => {
    setFiltroInstrumentadora(value)
    updateURL({ instrumentadora: value })
  }

  const handleFiltroGeneralChange = (value: string) => {
    setFiltroGeneral(value)
    updateURL({ busqueda: value })
  }

  const handleClearSearch = () => {
    setFiltroGeneral("")
    updateURL({ busqueda: "" })
  }

  const handleClearAllFilters = () => {
    setFiltroMes("todos")
    setFiltroPago("todos")
    setFiltroInstrumentadora("todos")
    setFiltroGeneral("")
    updateURL({ mes: "todos", pago: "todos", instrumentadora: "todos", busqueda: "" })
  }

  // Filtrar servicios según los criterios seleccionados
  const serviciosFiltrados = servicios.filter((servicio) => {
    // Extraer el mes directamente de la fecha ISO string para evitar problemas de zona horaria
    const fechaISO = servicio.fecha.split('T')[0] // Obtener solo la parte de fecha (YYYY-MM-DD)
    const mesServicio = Number.parseInt(fechaISO.split('-')[1]) // Extraer el mes (MM)

    const cumpleFiltroMes = filtroMes === "todos" || Number.parseInt(filtroMes) === mesServicio
    const cumpleFiltroPago =
      filtroPago === "todos" ||
      (filtroPago === "pagados" && servicio.pagado) ||
      (filtroPago === "pendientes" && !servicio.pagado)
    
    const cumpleFiltroInstrumentadora = 
      filtroInstrumentadora === "todos" || 
      servicio.instrumentadora_id === filtroInstrumentadora

    // Búsqueda general en todos los campos
    const terminoBusqueda = filtroGeneral.toLowerCase()
    const cumpleBusquedaGeneral =
      terminoBusqueda === "" ||
      servicio.instrumentadora?.toLowerCase().includes(terminoBusqueda) ||
      servicio.paciente.toLowerCase().includes(terminoBusqueda) ||
      servicio.institucion.toLowerCase().includes(terminoBusqueda) ||
      servicio.ciudad.toLowerCase().includes(terminoBusqueda) ||
      (servicio.observaciones && servicio.observaciones.toLowerCase().includes(terminoBusqueda))

    return cumpleFiltroMes && cumpleFiltroPago && cumpleFiltroInstrumentadora && cumpleBusquedaGeneral
  })

  // Calcular servicios pendientes filtrados
  const serviciosPendientesFiltrados = serviciosFiltrados.filter(servicio => !servicio.pagado)
  const totalPendiente = serviciosPendientesFiltrados.reduce((sum, servicio) => sum + servicio.valor, 0)
  const hasActiveFilters = filtroMes !== "todos" || filtroPago !== "todos" || filtroInstrumentadora !== "todos" || filtroGeneral !== ""
  
  // Contar filtros activos para mostrar el botón de limpiar
  const activeFiltersCount = [
    filtroMes !== "todos",
    filtroPago !== "todos", 
    filtroInstrumentadora !== "todos",
    filtroGeneral !== ""
  ].filter(Boolean).length

  // Función para pagar en lote
  const handleBulkPay = async () => {
    if (serviciosPendientesFiltrados.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay servicios pendientes para pagar.",
      })
      return
    }

    try {
      setIsBulkPaying(true)
      
      // Obtener IDs de servicios pendientes
      const servicioIds = serviciosPendientesFiltrados.map(servicio => servicio.id)
      
      // Actualizar todos los servicios a pagado
      const { error } = await supabase
        .from("servicios_instrumentadoras")
        .update({ pagado: true })
        .in("id", servicioIds)

      if (error) {
        throw error
      }

      // Actualizar el estado local
      setServicios(servicios.map(servicio => 
        servicioIds.includes(servicio.id) 
          ? { ...servicio, pagado: true }
          : servicio
      ))

      toast({
        title: "Éxito",
        description: `${serviciosPendientesFiltrados.length} servicios marcados como pagados. Total: ${formatearValor(totalPendiente)}`,
      })

      setShowBulkPayModal(false)
    } catch (error: any) {
      console.error("Error al pagar en lote:", error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron marcar los servicios como pagados. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsBulkPaying(false)
    }
  }

  // Formatear fecha para mostrar - SOLUCIÓN CORREGIDA
  const formatearFecha = (fechaStr: string) => {
    // Dividir la fecha ISO en sus componentes
    const [fechaParte] = fechaStr.split("T")
    const [año, mes, dia] = fechaParte.split("-").map(Number)

    // Crear una fecha usando los componentes exactos sin conversión de zona horaria
    return `${dia.toString().padStart(2, "0")}/${mes.toString().padStart(2, "0")}/${año}`
  }

  // Formatear valor para mostrar
  const formatearValor = (valor: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Servicios de Instrumentación</CardTitle>
        <CardDescription>Lista de servicios de instrumentación quirúrgica registrados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="filtro-mes" className="text-sm font-medium">
              Filtrar por mes
            </label>
            <Select value={filtroMes} onValueChange={handleFiltroMesChange}>
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

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="filtro-instrumentadora" className="text-sm font-medium">
              Filtrar por instrumentadora
            </label>
            <Select value={filtroInstrumentadora} onValueChange={handleFiltroInstrumentadoraChange}>
              <SelectTrigger id="filtro-instrumentadora">
                <SelectValue placeholder="Seleccionar instrumentadora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las instrumentadoras</SelectItem>
                {instrumentadoras.map((instrumentadora) => (
                  <SelectItem key={instrumentadora.id} value={instrumentadora.id}>
                    {instrumentadora.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="filtro-pago" className="text-sm font-medium">
              Estado de pago
            </label>
            <Select value={filtroPago} onValueChange={handleFiltroPagoChange}>
              <SelectTrigger id="filtro-pago">
                <SelectValue placeholder="Estado de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pagados">Pagados</SelectItem>
                <SelectItem value="pendientes">Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="filtro-general" className="text-sm font-medium">
              Búsqueda general
            </label>
            <div className="relative">
              <Input
                id="filtro-general"
                placeholder="Buscar por instrumentadora, paciente, institución, ciudad..."
                value={filtroGeneral}
                onChange={(e) => handleFiltroGeneralChange(e.target.value)}
                className="pr-10"
              />
              {filtroGeneral && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Limpiar búsqueda</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Botón para limpiar filtros - solo visible cuando hay 2+ filtros activos */}
        {activeFiltersCount >= 2 && (
          <div className="mb-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpiar filtros ({activeFiltersCount})
            </Button>
          </div>
        )}

        {/* Botón de pago en lote - solo visible cuando hay filtros activos */}
        {hasActiveFilters && serviciosPendientesFiltrados.length > 0 && (
          <div className="mb-6 flex justify-end">
            <Dialog open={showBulkPayModal} onOpenChange={setShowBulkPayModal}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pagar Todo ({serviciosPendientesFiltrados.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirmar Pago en Lote</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de que quieres marcar como pagados todos los servicios pendientes con los filtros actuales?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <h4 className="font-medium mb-2">Resumen del Pago:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Servicios a pagar:</strong> {serviciosPendientesFiltrados.length}</p>
                      <p><strong>Total a pagar:</strong> {formatearValor(totalPendiente)}</p>
                      {filtroInstrumentadora !== "todos" && (
                        <p><strong>Instrumentadora:</strong> {instrumentadoras.find(i => i.id === filtroInstrumentadora)?.nombre}</p>
                      )}
                      {filtroMes !== "todos" && (
                        <p><strong>Mes:</strong> {
                          ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                           "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][Number.parseInt(filtroMes) - 1]
                        }</p>
                      )}
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <h4 className="font-medium mb-2 text-sm">Servicios incluidos:</h4>
                    <div className="space-y-1">
                      {serviciosPendientesFiltrados.slice(0, 10).map((servicio) => (
                        <div key={servicio.id} className="flex justify-between text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                          <span>{servicio.paciente} - {servicio.institucion}</span>
                          <span>{formatearValor(servicio.valor)}</span>
                        </div>
                      ))}
                      {serviciosPendientesFiltrados.length > 10 && (
                        <p className="text-xs text-gray-500">... y {serviciosPendientesFiltrados.length - 10} más</p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBulkPayModal(false)}
                    disabled={isBulkPaying}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleBulkPay}
                    disabled={isBulkPaying}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isBulkPaying ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Confirmar Pago
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p>Cargando servicios...</p>
          </div>
        ) : servicios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay servicios registrados.</p>
            <p className="mt-2">
              <Link href="/instrumentadoras/servicios/nuevo">
                <Button variant="link">Registrar un nuevo servicio</Button>
              </Link>
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instrumentadora</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Institución</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviciosFiltrados.map((servicio) => (
                <TableRow key={servicio.id}>
                  <TableCell className="font-medium">{servicio.instrumentadora}</TableCell>
                  <TableCell>{servicio.paciente}</TableCell>
                  <TableCell>{servicio.institucion}</TableCell>
                  <TableCell>{servicio.ciudad}</TableCell>
                  <TableCell>{formatearFecha(servicio.fecha)}</TableCell>
                  <TableCell>{formatearValor(servicio.valor)}</TableCell>
                  <TableCell>
                    <Badge variant={servicio.pagado ? "success" : "destructive"}>
                      {servicio.pagado ? "Pagado" : "Pendiente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/instrumentadoras/servicios/editar/${servicio.id}?${searchParams.toString()}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(servicio.id)}>
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
