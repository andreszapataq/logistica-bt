import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InstrumentadorasTable } from "./instrumentadoras-table"
import { ServiciosTable } from "./servicios-table"
import { ActionButtons } from "@/components/action-buttons"
import { Suspense } from "react"

export default function InstrumentadorasPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Instrumentadoras</h1>
        <Suspense fallback={<div className="h-10" />}>
          <ActionButtons type="instrumentadoras" />
        </Suspense>
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
