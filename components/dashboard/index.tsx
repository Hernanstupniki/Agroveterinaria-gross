"use client"

import Link from "next/link"
import {
  FileText,
  HeartPulse,
  Pill,
  Syringe,
  UserPlus,
  Users,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const primaryActions = [
  {
    title: "Nueva atención",
    description: "Cargá una atención completa: consulta, vacuna, tratamiento, cirugía, estudio o recordatorio.",
    href: "/atencion/nueva",
    icon: HeartPulse,
    className: "border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90",
  },
  {
    title: "Ingresar cliente",
    description: "Buscar cliente, elegir mascota y cargar una acción frecuente.",
    href: "/clientes",
    icon: Users,
    className: "border-primary/20 bg-card hover:border-primary/50 hover:bg-primary/5",
  },
  {
    title: "Agregar cliente",
    description: "Alta rapida con una o mas mascotas vinculadas.",
    href: "/clientes/agregar",
    icon: UserPlus,
    className: "border-primary/20 bg-card hover:border-primary/50 hover:bg-primary/5",
  },
  {
    title: "Vacunas",
    description: "Registrar, ver pendientes o configurar esquemas.",
    href: "/vacunas",
    icon: Syringe,
    className: "border-primary/20 bg-card hover:border-primary/50 hover:bg-primary/5",
  },
  {
    title: "Tratamientos",
    description: "Registrar, revisar activos o configurar protocolos.",
    href: "/tratamientos",
    icon: Pill,
    className: "border-primary/20 bg-card hover:border-primary/50 hover:bg-primary/5",
  },
  {
    title: "Estudios y Archivos",
    description: "Cargar, ver o archivar estudios y documentos clinicos.",
    href: "/estudios",
    icon: FileText,
    className: "border-primary/20 bg-card hover:border-primary/50 hover:bg-primary/5",
  },
]

export function Dashboard() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl flex-col justify-center gap-8 py-6">
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
          <HeartPulse className="h-4 w-4" />
          Centro de atención clínica
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-normal sm:text-4xl">
            Que queres hacer ahora?
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Elegí una acción, seleccioná cliente y mascota, cargá lo ocurrido y volvé al inicio para seguir atendiendo.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {primaryActions.map((action) => (
          <Link key={action.title} href={action.href!} className="group block min-w-0">
            <Card className={`h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${action.className}`}>
              <CardContent className="flex h-full flex-col gap-5 p-5 xl:p-4 2xl:p-5">
                <div className="flex flex-col gap-4 sm:flex-row xl:flex-col 2xl:flex-row">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background/90 text-primary shadow-sm sm:h-14 sm:w-14">
                    <action.icon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold leading-tight 2xl:text-xl">{action.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed opacity-80">{action.description}</p>
                  </div>
                </div>
                <div className="mt-auto inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 py-3 text-center text-base font-bold leading-tight text-primary-foreground shadow-sm group-hover:bg-primary/90 whitespace-normal">
                  <span className="text-center leading-tight">{action.title}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
