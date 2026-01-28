"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash, CheckCircle, DollarSign, X, RotateCcw, FileText } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getSupabaseBrowserClient, type ServicioInstrumentadora, type Instrumentadora, type EstadoPago, ESTADOS_PAGO, getEstadoFromServicio } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MultiMonthFilter, type MonthYearSelection, filterByMonthYear, getMonthYearDescription, MESES } from "@/components/multi-month-filter"

export function ServiciosTable() {
  const [servicios, setServicios] = useState<ServicioInstrumentadora[]>([])
  const [instrumentadoras, setInstrumentadoras] = useState<Instrumentadora[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroPeriodo, setFiltroPeriodo] = useState<MonthYearSelection>({
    months: [],
    year: new Date().getFullYear()
  })
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroInstrumentadora, setFiltroInstrumentadora] = useState("todos")
  const [filtroGeneral, setFiltroGeneral] = useState("")
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const [showBulkFacturarModal, setShowBulkFacturarModal] = useState(false)
  const [showBulkPayModal, setShowBulkPayModal] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Leer filtros de la URL al cargar el componente
  useEffect(() => {
    const mesesParam = searchParams.get('meses')
    const anioParam = searchParams.get('anio')
    const estado = searchParams.get('estado') || 'todos'
    const instrumentadora = searchParams.get('instrumentadora') || 'todos'
    const busqueda = searchParams.get('busqueda') || ''
    
    // Parsear meses desde URL (formato: "1,2,3" o vacío para todos)
    const meses = mesesParam ? mesesParam.split(',').map(Number).filter(n => !isNaN(n)) : []
    const anio = anioParam === 'todos' ? 'todos' as const : (anioParam ? Number(anioParam) : new Date().getFullYear())
    
    setFiltroPeriodo({ months: meses, year: anio })
    setFiltroEstado(estado)
    setFiltroInstrumentadora(instrumentadora)
    setFiltroGeneral(busqueda)
  }, [searchParams])

  // Función para actualizar la URL con los filtros
  const updateURL = (newFiltros: { periodo?: MonthYearSelection; estado?: string; instrumentadora?: string; busqueda?: string }) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (newFiltros.periodo !== undefined) {
      if (newFiltros.periodo.months.length === 0) {
        params.delete('meses')
      } else {
        params.set('meses', newFiltros.periodo.months.join(','))
      }
      
      if (newFiltros.periodo.year === new Date().getFullYear()) {
        params.delete('anio')
      } else {
        params.set('anio', newFiltros.periodo.year.toString())
      }
    }
    
    if (newFiltros.estado !== undefined) {
      if (newFiltros.estado === 'todos') {
        params.delete('estado')
      } else {
        params.set('estado', newFiltros.estado)
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
          .order("created_at", { ascending: false })

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
  const handleFiltroPeriodoChange = (value: MonthYearSelection) => {
    setFiltroPeriodo(value)
    updateURL({ periodo: value })
  }

  const handleFiltroEstadoChange = (value: string) => {
    setFiltroEstado(value)
    updateURL({ estado: value })
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
    const defaultPeriodo = { months: [], year: new Date().getFullYear() as number | "todos" }
    setFiltroPeriodo(defaultPeriodo)
    setFiltroEstado("todos")
    setFiltroInstrumentadora("todos")
    setFiltroGeneral("")
    updateURL({ periodo: defaultPeriodo, estado: "todos", instrumentadora: "todos", busqueda: "" })
  }

  // Filtrar servicios según los criterios seleccionados
  const serviciosFiltrados = servicios.filter((servicio) => {
    // Filtrar por período (año y meses)
    const fechaISO = servicio.fecha.split('T')[0]
    const [año, mes] = fechaISO.split('-').map(Number)
    
    // Filtrar por año
    const cumpleFiltroAnio = filtroPeriodo.year === "todos" || año === filtroPeriodo.year
    
    // Filtrar por mes (si no hay meses específicos, incluir todos)
    const cumpleFiltroMes = filtroPeriodo.months.length === 0 || filtroPeriodo.months.includes(mes)
    
    const estadoServicio = getEstadoFromServicio(servicio)
    const cumpleFiltroEstado =
      filtroEstado === "todos" || estadoServicio === filtroEstado
    
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

    return cumpleFiltroAnio && cumpleFiltroMes && cumpleFiltroEstado && cumpleFiltroInstrumentadora && cumpleBusquedaGeneral
  })

  // Calcular servicios por estado
  const serviciosPendientes = serviciosFiltrados.filter(s => getEstadoFromServicio(s) === 'pendiente')
  const serviciosFacturados = serviciosFiltrados.filter(s => getEstadoFromServicio(s) === 'facturado')
  const serviciosPagados = serviciosFiltrados.filter(s => getEstadoFromServicio(s) === 'pagado')
  
  const totalPendiente = serviciosPendientes.reduce((sum, s) => sum + s.valor, 0)
  const totalFacturado = serviciosFacturados.reduce((sum, s) => sum + s.valor, 0)
  const totalPagado = serviciosPagados.reduce((sum, s) => sum + s.valor, 0)
  
  // Calcular totales generales
  const totalServicios = serviciosFiltrados.length
  const totalValor = serviciosFiltrados.reduce((sum, servicio) => sum + servicio.valor, 0)
  
  const hasActiveFilters = filtroPeriodo.months.length > 0 || filtroPeriodo.year !== new Date().getFullYear() || filtroEstado !== "todos" || filtroInstrumentadora !== "todos" || filtroGeneral !== ""
  
  // Contar filtros activos para mostrar el botón de limpiar
  const activeFiltersCount = [
    filtroPeriodo.months.length > 0 || filtroPeriodo.year !== new Date().getFullYear(),
    filtroEstado !== "todos", 
    filtroInstrumentadora !== "todos",
    filtroGeneral !== ""
  ].filter(Boolean).length

  // Función para facturar en lote (pendientes -> facturados)
  const handleBulkFacturar = async () => {
    if (serviciosPendientes.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay servicios pendientes para facturar.",
      })
      return
    }

    try {
      setIsBulkUpdating(true)
      
      const servicioIds = serviciosPendientes.map(servicio => servicio.id)
      
      const { error } = await supabase
        .from("servicios_instrumentadoras")
        .update({ estado: 'facturado' })
        .in("id", servicioIds)

      if (error) {
        throw error
      }

      // Actualizar el estado local
      setServicios(servicios.map(servicio => 
        servicioIds.includes(servicio.id) 
          ? { ...servicio, estado: 'facturado' as EstadoPago }
          : servicio
      ))

      toast({
        title: "Éxito",
        description: `${serviciosPendientes.length} servicios marcados como facturados. Total: ${formatearValor(totalPendiente)}`,
      })

      setShowBulkFacturarModal(false)
    } catch (error: any) {
      console.error("Error al facturar en lote:", error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron marcar los servicios como facturados. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsBulkUpdating(false)
    }
  }

  // Función para pagar en lote (facturados -> pagados)
  const handleBulkPay = async () => {
    if (serviciosFacturados.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay servicios facturados para pagar.",
      })
      return
    }

    try {
      setIsBulkUpdating(true)
      
      const servicioIds = serviciosFacturados.map(servicio => servicio.id)
      
      const { error } = await supabase
        .from("servicios_instrumentadoras")
        .update({ estado: 'pagado' })
        .in("id", servicioIds)

      if (error) {
        throw error
      }

      // Actualizar el estado local
      setServicios(servicios.map(servicio => 
        servicioIds.includes(servicio.id) 
          ? { ...servicio, estado: 'pagado' as EstadoPago }
          : servicio
      ))

      toast({
        title: "Éxito",
        description: `${serviciosFacturados.length} servicios marcados como pagados. Total: ${formatearValor(totalFacturado)}`,
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
      setIsBulkUpdating(false)
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
          <MultiMonthFilter
            value={filtroPeriodo}
            onChange={handleFiltroPeriodoChange}
            className="w-full max-w-sm"
          />

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
            <label htmlFor="filtro-estado" className="text-sm font-medium">
              Estado
            </label>
            <Select value={filtroEstado} onValueChange={handleFiltroEstadoChange}>
              <SelectTrigger id="filtro-estado">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="facturado">Facturado</SelectItem>
                <SelectItem value="pagado">Pagado</SelectItem>
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

        {/* Resumen de totales */}
        {totalServicios > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-muted/50 border">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Período:</span>
                <span className="ml-2 font-medium">{getMonthYearDescription(filtroPeriodo)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Servicios:</span>
                <span className="ml-2 font-medium">{totalServicios}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>
                <span className="ml-2 font-medium">{formatearValor(totalValor)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pendiente:</span>
                <span className="ml-2 font-medium text-red-600">{formatearValor(totalPendiente)} ({serviciosPendientes.length})</span>
              </div>
              <div>
                <span className="text-muted-foreground">Facturado:</span>
                <span className="ml-2 font-medium text-amber-600">{formatearValor(totalFacturado)} ({serviciosFacturados.length})</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pagado:</span>
                <span className="ml-2 font-medium text-green-600">{formatearValor(totalPagado)} ({serviciosPagados.length})</span>
              </div>
            </div>
          </div>
        )}

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

        {/* Botones de acción masiva - solo visibles cuando hay filtros activos */}
        {hasActiveFilters && (serviciosPendientes.length > 0 || serviciosFacturados.length > 0) && (
          <div className="mb-6 flex justify-end gap-3">
            {/* Botón para facturar servicios pendientes */}
            {serviciosPendientes.length > 0 && (
              <Dialog open={showBulkFacturarModal} onOpenChange={setShowBulkFacturarModal}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    <FileText className="mr-2 h-4 w-4" />
                    Marcar Facturado ({serviciosPendientes.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Confirmar Facturación en Lote</DialogTitle>
                    <DialogDescription>
                      ¿Estás seguro de que quieres marcar como facturados todos los servicios pendientes? Esto indica que el prestador ya incluyó estos servicios en su factura.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <h4 className="font-medium mb-2">Resumen:</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Servicios a facturar:</strong> {serviciosPendientes.length}</p>
                        <p><strong>Total facturado:</strong> {formatearValor(totalPendiente)}</p>
                        {filtroInstrumentadora !== "todos" && (
                          <p><strong>Instrumentadora:</strong> {instrumentadoras.find(i => i.id === filtroInstrumentadora)?.nombre}</p>
                        )}
                        <p><strong>Período:</strong> {getMonthYearDescription(filtroPeriodo)}</p>
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      <h4 className="font-medium mb-2 text-sm">Servicios incluidos:</h4>
                      <div className="space-y-1">
                        {serviciosPendientes.slice(0, 10).map((servicio) => (
                          <div key={servicio.id} className="flex justify-between text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                            <span>{servicio.paciente} - {servicio.institucion}</span>
                            <span>{formatearValor(servicio.valor)}</span>
                          </div>
                        ))}
                        {serviciosPendientes.length > 10 && (
                          <p className="text-xs text-gray-500">... y {serviciosPendientes.length - 10} más</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowBulkFacturarModal(false)}
                      disabled={isBulkUpdating}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleBulkFacturar}
                      disabled={isBulkUpdating}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      {isBulkUpdating ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Confirmar Facturación
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Botón para pagar servicios facturados */}
            {serviciosFacturados.length > 0 && (
              <Dialog open={showBulkPayModal} onOpenChange={setShowBulkPayModal}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Pagar Facturados ({serviciosFacturados.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Confirmar Pago en Lote</DialogTitle>
                    <DialogDescription>
                      ¿Estás seguro de que quieres marcar como pagados todos los servicios facturados? Esto indica que ya se realizó el pago de la factura.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <h4 className="font-medium mb-2">Resumen del Pago:</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Servicios a pagar:</strong> {serviciosFacturados.length}</p>
                        <p><strong>Total a pagar:</strong> {formatearValor(totalFacturado)}</p>
                        {filtroInstrumentadora !== "todos" && (
                          <p><strong>Instrumentadora:</strong> {instrumentadoras.find(i => i.id === filtroInstrumentadora)?.nombre}</p>
                        )}
                        <p><strong>Período:</strong> {getMonthYearDescription(filtroPeriodo)}</p>
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      <h4 className="font-medium mb-2 text-sm">Servicios incluidos:</h4>
                      <div className="space-y-1">
                        {serviciosFacturados.slice(0, 10).map((servicio) => (
                          <div key={servicio.id} className="flex justify-between text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                            <span>{servicio.paciente} - {servicio.institucion}</span>
                            <span>{formatearValor(servicio.valor)}</span>
                          </div>
                        ))}
                        {serviciosFacturados.length > 10 && (
                          <p className="text-xs text-gray-500">... y {serviciosFacturados.length - 10} más</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowBulkPayModal(false)}
                      disabled={isBulkUpdating}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleBulkPay}
                      disabled={isBulkUpdating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isBulkUpdating ? (
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
            )}
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
                    <Badge variant={ESTADOS_PAGO[getEstadoFromServicio(servicio)].color}>
                      {ESTADOS_PAGO[getEstadoFromServicio(servicio)].label}
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
