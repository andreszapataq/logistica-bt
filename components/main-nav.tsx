"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BriefcaseMedicalIcon as MedicalBag, Home, Truck } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">Logística BT</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/"
          className={cn(
            "transition-colors hover:text-primary flex items-center gap-1",
            pathname === "/" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Home className="h-4 w-4" />
          <span>Inicio</span>
        </Link>
        <Link
          href="/instrumentadoras"
          className={cn(
            "transition-colors hover:text-primary flex items-center gap-1",
            pathname.includes("/instrumentadoras") ? "text-primary" : "text-muted-foreground",
          )}
        >
          <MedicalBag className="h-4 w-4" />
          <span>Instrumentadoras</span>
        </Link>
        <Link
          href="/mensajeros"
          className={cn(
            "transition-colors hover:text-primary flex items-center gap-1",
            pathname.includes("/mensajeros") ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Truck className="h-4 w-4" />
          <span>Mensajeros</span>
        </Link>
      </nav>
    </div>
  )
}
