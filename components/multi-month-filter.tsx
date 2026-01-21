"use client"

import * as React from "react"
import { Check, Calendar, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

const MESES = [
  { value: 1, label: "Enero", short: "Ene" },
  { value: 2, label: "Febrero", short: "Feb" },
  { value: 3, label: "Marzo", short: "Mar" },
  { value: 4, label: "Abril", short: "Abr" },
  { value: 5, label: "Mayo", short: "May" },
  { value: 6, label: "Junio", short: "Jun" },
  { value: 7, label: "Julio", short: "Jul" },
  { value: 8, label: "Agosto", short: "Ago" },
  { value: 9, label: "Septiembre", short: "Sep" },
  { value: 10, label: "Octubre", short: "Oct" },
  { value: 11, label: "Noviembre", short: "Nov" },
  { value: 12, label: "Diciembre", short: "Dic" },
]

export type MonthYearSelection = {
  months: number[] // Array de números de mes (1-12)
  year: number | "todos" // Año o "todos"
}

interface MultiMonthFilterProps {
  value: MonthYearSelection
  onChange: (value: MonthYearSelection) => void
  className?: string
  availableYears?: number[]
}

export function MultiMonthFilter({
  value,
  onChange,
  className,
  availableYears,
}: MultiMonthFilterProps) {
  const [open, setOpen] = React.useState(false)
  
  // Generar años disponibles (actual y 2 años atrás)
  const currentYear = new Date().getFullYear()
  const defaultYears = [currentYear, currentYear - 1, currentYear - 2]
  const years = availableYears || defaultYears

  const allMonthsSelected = value.months.length === 0 || value.months.length === 12
  
  const toggleMonth = (month: number) => {
    let newMonths: number[]
    if (value.months.includes(month)) {
      newMonths = value.months.filter(m => m !== month)
    } else {
      newMonths = [...value.months, month].sort((a, b) => a - b)
    }
    onChange({ ...value, months: newMonths })
  }

  const selectAllMonths = () => {
    onChange({ ...value, months: [] })
  }

  const clearAllMonths = () => {
    onChange({ ...value, months: [] })
  }

  const selectYear = (year: number | "todos") => {
    onChange({ ...value, year })
  }

  // Generar texto del botón
  const getButtonText = () => {
    const yearText = value.year === "todos" ? "Todos los años" : value.year.toString()
    
    if (value.months.length === 0) {
      return `Todos los meses - ${yearText}`
    }
    
    if (value.months.length === 1) {
      const mes = MESES.find(m => m.value === value.months[0])
      return `${mes?.label} ${value.year !== "todos" ? value.year : ""}`
    }
    
    if (value.months.length <= 3) {
      const nombresCortos = value.months.map(m => MESES.find(mes => mes.value === m)?.short).join(", ")
      return `${nombresCortos} ${value.year !== "todos" ? value.year : ""}`
    }
    
    return `${value.months.length} meses seleccionados ${value.year !== "todos" ? `- ${value.year}` : ""}`
  }

  // Meses seleccionados para mostrar como badges
  const selectedMonthLabels = value.months.length === 0 
    ? [] 
    : value.months.map(m => MESES.find(mes => mes.value === m))

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label className="text-sm font-medium">Filtrar por período</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between h-10 w-full"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{getButtonText()}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3">
            {/* Selector de Año */}
            <div className="mb-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Año
              </label>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <Button
                  variant={value.year === "todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => selectYear("todos")}
                  className="h-7 text-xs"
                >
                  Todos
                </Button>
                {years.map(year => (
                  <Button
                    key={year}
                    variant={value.year === year ? "default" : "outline"}
                    size="sm"
                    onClick={() => selectYear(year)}
                    className="h-7 text-xs"
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Selector de Meses */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Meses
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllMonths}
                    className="h-6 px-2 text-xs"
                  >
                    Todos
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-1">
                {MESES.map(mes => {
                  const isSelected = value.months.length === 0 || value.months.includes(mes.value)
                  const isExplicitlySelected = value.months.includes(mes.value)
                  
                  return (
                    <div
                      key={mes.value}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                        isExplicitlySelected 
                          ? "bg-primary/10 border border-primary/30" 
                          : value.months.length === 0 
                            ? "bg-muted/50 border border-transparent"
                            : "hover:bg-muted border border-transparent"
                      )}
                      onClick={() => toggleMonth(mes.value)}
                    >
                      <Checkbox
                        checked={isExplicitlySelected || value.months.length === 0}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-xs font-medium">{mes.short}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer con resumen */}
          <div className="border-t bg-muted/30 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {value.months.length === 0 
                  ? "12 meses seleccionados" 
                  : `${value.months.length} mes${value.months.length !== 1 ? "es" : ""} seleccionado${value.months.length !== 1 ? "s" : ""}`
                }
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-6 px-2 text-xs"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Badges de meses seleccionados */}
      {value.months.length > 0 && value.months.length <= 6 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selectedMonthLabels.map(mes => mes && (
            <Badge 
              key={mes.value} 
              variant="secondary" 
              className="h-5 text-xs px-2 gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => toggleMonth(mes.value)}
            >
              {mes.short}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// Función helper para filtrar por período
export function filterByMonthYear<T extends { fecha: string }>(
  items: T[],
  selection: MonthYearSelection
): T[] {
  return items.filter(item => {
    const fechaISO = item.fecha.split('T')[0]
    const [año, mes] = fechaISO.split('-').map(Number)
    
    // Filtrar por año
    if (selection.year !== "todos" && año !== selection.year) {
      return false
    }
    
    // Filtrar por mes (si no hay meses específicos, incluir todos)
    if (selection.months.length > 0 && !selection.months.includes(mes)) {
      return false
    }
    
    return true
  })
}

// Función helper para obtener texto descriptivo del período
export function getMonthYearDescription(selection: MonthYearSelection): string {
  const yearText = selection.year === "todos" ? "todos los años" : selection.year.toString()
  
  if (selection.months.length === 0) {
    return `Todos los meses de ${yearText}`
  }
  
  const monthNames = selection.months.map(m => MESES.find(mes => mes.value === m)?.label).join(", ")
  return `${monthNames} de ${yearText}`
}

export { MESES }
