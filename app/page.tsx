import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BriefcaseMedicalIcon as MedicalBag, Truck } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Gestión de Servicios Médicos</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema de gestión para servicios de instrumentadoras quirúrgicas y mensajeros
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MedicalBag className="w-8 h-8 text-slate-600 dark:text-slate-300" />
              </div>
              <CardTitle className="text-2xl">Instrumentadoras</CardTitle>
              <CardDescription>Gestión de instrumentadoras quirúrgicas y sus servicios</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">Registre instrumentadoras, cree servicios, gestione pagos y visualice reportes.</p>
              <ul className="text-sm text-muted-foreground text-left list-disc list-inside mb-4">
                <li>Registro de instrumentadoras</li>
                <li>Creación de servicios</li>
                <li>Seguimiento de pagos</li>
                <li>Filtros por mes y estado</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/instrumentadoras" className="w-full">
                <Button className="w-full">Acceder al módulo</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-slate-600 dark:text-slate-300" />
              </div>
              <CardTitle className="text-2xl">Mensajeros</CardTitle>
              <CardDescription>Gestión de servicios de mensajería</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">Registre servicios de mensajería, gestione pagos y visualice reportes.</p>
              <ul className="text-sm text-muted-foreground text-left list-disc list-inside mb-4">
                <li>Registro de servicios</li>
                <li>Seguimiento de rutas</li>
                <li>Control de pagos</li>
                <li>Filtros por mes y estado</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/mensajeros" className="w-full">
                <Button className="w-full">Acceder al módulo</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
