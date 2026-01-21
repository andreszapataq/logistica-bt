"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart2, Plus } from "lucide-react"

interface ActionButtonsProps {
  type: "instrumentadoras" | "mensajeros"
}

export function ActionButtons({ type }: ActionButtonsProps) {
  const searchParams = useSearchParams()
  const params = searchParams.toString()
  const queryString = params ? `?${params}` : ''

  if (type === "instrumentadoras") {
    return (
      <div className="flex gap-2">
        <Link href="/instrumentadoras/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Instrumentadora
          </Button>
        </Link>
        <Link href={`/instrumentadoras/servicios/nuevo${queryString}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Servicio
          </Button>
        </Link>
        <Link href="/instrumentadoras/totales">
          <Button variant="outline">
            <BarChart2 className="mr-2 h-4 w-4" />
            Ver Totales
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Link href="/mensajeros/nuevo-mensajero">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Mensajero
        </Button>
      </Link>
      <Link href={`/mensajeros/nuevo${queryString}`}>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Servicio
        </Button>
      </Link>
      <Link href="/mensajeros/totales">
        <Button variant="outline">
          <BarChart2 className="mr-2 h-4 w-4" />
          Ver Totales
        </Button>
      </Link>
    </div>
  )
}
