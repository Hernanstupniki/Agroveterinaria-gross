"use client"

import Link from "next/link"
import {
  ClipboardPlus,
  HeartPulse,
  Pill,
  Scissors,
  Syringe,
  UserPlus,
  Users,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { NewClientDialog } from "@/components/clientes/new-client-dialog"

const primaryActions = [
  {
    title: "Ingresar cliente",
    description: "Buscar cliente, elegir mascota y cargar una accion frecuente.",
    href: "/clientes",
    icon: Users,
    className: "border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90",
  },
  {
    title: "Nuevo cliente",
    description: "Alta rapida con una o mas mascotas vinculadas.",
    href: null,
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
    title: "Cirugías",
    description: "Agendar o registrar una cirugia ya programada.",
    href: "/cirugias",
    icon: Scissors,
    className: "border-primary/20 bg-card hover:border-primary/50 hover:bg-primary/5",
  },
]

export function Dashboard() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl flex-col justify-center gap-8 py-6">
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
          <HeartPulse className="h-4 w-4" />
          Centro de atencion clinica
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-normal sm:text-4xl">
            Que queres hacer ahora?
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Elegi una accion, selecciona cliente y mascota, carga lo ocurrido y volve al inicio para seguir atendiendo.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {primaryActions.map((action) => {
          const card = (
            <Card className={`h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${action.className}`}>
              <CardContent className="flex h-full flex-col justify-between gap-6 p-5">
                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-background/90 text-primary shadow-sm">
                    <action.icon className="h-7 w-7" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold leading-tight">{action.title}</h2>
                    <p className="text-sm leading-relaxed opacity-80">{action.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  Abrir
                  <ClipboardPlus className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          )

          if (!action.href) {
            return (
              <NewClientDialog
                key={action.title}
                trigger={
                  <button type="button" className="group block min-h-[210px] text-left">
                    {card}
                  </button>
                }
              />
            )
          }

          return (
            <Link key={action.title} href={action.href} className="group block min-h-[210px]">
              {card}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
