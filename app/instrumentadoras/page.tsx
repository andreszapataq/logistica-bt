import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InstrumentadorasTable } from "./instrumentadoras-table"
import { ServiciosTable } from "./servicios-table"
import { Button } from "@/components/ui/button"
import { BarChart2, Plus } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

export default function InstrumentadorasPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Instrumentadoras</h1>
        <div className="flex gap-2">
          <Link href="/instrumentadoras/nueva">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Instrumentadora
            </Button>
          </Link>
          <Link href="/instrumentadoras/servicios/nuevo">
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
      </div>

      <Tabs defaultValue="servicios" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
          <TabsTrigger value="instrumentadoras">Instrumentadoras</TabsTrigger>
        </TabsList>
        <TabsContent value="servicios">
          <Suspense fallback={<div className="flex justify-center items-center py-8"><p>Cargando servicios...</p></div>}>
            <ServiciosTable />
          </Suspense>
        </TabsContent>
        <TabsContent value="instrumentadoras">
          <InstrumentadorasTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
