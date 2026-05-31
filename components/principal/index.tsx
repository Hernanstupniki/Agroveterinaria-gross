import { Calendar, Syringe, Clock, MessageCircle, ClipboardList, Scissors } from "lucide-react"
import { PrincipalActions } from "./principal-actions"
import { TodayAttention } from "./today-attention"
import { KpiStrip, type KpiItem } from "@/components/shared/kpi-strip"
import {
  turnosHoy,
  vacunasPendientes,
  controlesPendientes,
  recordatoriosProgramados,
  tratamientosActivos,
  cirugiasProgramadas,
} from "@/lib/mock-data"

const hoy = new Date().toLocaleDateString("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

export function Principal() {
  const kpis: KpiItem[] = [
    { label: "Turnos hoy", value: turnosHoy.length, icon: Calendar, href: "/turnos" },
    {
      label: "Vacunas vencidas",
      value: vacunasPendientes.filter((v) => v.estado === "Vencida").length,
      icon: Syringe,
      tone: "critical",
      href: "/vacunas",
    },
    { label: "Controles pendientes", value: controlesPendientes.length, icon: Clock, tone: "warning", href: "/historial" },
    {
      label: "WhatsApp pendientes",
      value: recordatoriosProgramados.filter((r) => r.estado === "Programado").length,
      icon: MessageCircle,
      href: "/recordatorios",
    },
    { label: "Tratamientos activos", value: tratamientosActivos.length, icon: ClipboardList, tone: "success", href: "/tratamientos" },
    { label: "Cirugías programadas", value: cirugiasProgramadas.length, icon: Scissors, href: "/cirugias" },
  ]

  return (
    <div className="animate-section-in mx-auto max-w-[1600px] space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="capitalize">{hoy}</span>
          <span className="hidden sm:inline">·</span>
          <span>Dr. García</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Principal</h1>
        <p className="text-muted-foreground">
          Elegí un módulo para ver información o cargar datos clínicos.
        </p>
      </header>

      {/* Actions hub — VER... and CREAR / CARGAR... */}
      <section className="space-y-4">
        <h2 className="text-base font-bold uppercase tracking-[0.12em] text-foreground">
          Acciones
        </h2>
        <PrincipalActions />
      </section>

      {/* Operative attention */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Hoy requiere atención</h2>
        <TodayAttention />
      </section>

      {/* Secondary metrics — intentionally last */}
      <section className="space-y-3 border-t border-border/70 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Resumen administrativo
        </h2>
        <KpiStrip items={kpis} />
      </section>
    </div>
  )
}
