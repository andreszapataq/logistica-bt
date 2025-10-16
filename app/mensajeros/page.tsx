import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart2, Plus } from "lucide-react"
import Link from "next/link"
import { MensajerosServiciosTable } from "./mensajeros-servicios-table"
import { MensajerosTable } from "./mensajeros-table"
import { Suspense } from "react"

export default function MensajerosPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mensajeros</h1>
        <div className="flex gap-2">
          <Link href="/mensajeros/nuevo-mensajero">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Mensajero
            </Button>
          </Link>
          <Link href="/mensajeros/nuevo">
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
      </div>

      <Tabs defaultValue="servicios" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
          <TabsTrigger value="mensajeros">Mensajeros</TabsTrigger>
        </TabsList>
        <TabsContent value="servicios">
          <Suspense fallback={<div className="flex justify-center items-center py-8"><p>Cargando servicios...</p></div>}>
            <MensajerosServiciosTable />
          </Suspense>
        </TabsContent>
        <TabsContent value="mensajeros">
          <MensajerosTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
