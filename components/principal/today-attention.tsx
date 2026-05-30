import type { ComponentType } from "react"
import Link from "next/link"
import { Scissors, Syringe, ClipboardList, Clock, MessageCircle, Stethoscope, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import {
  cirugiasProgramadas,
  vacunasPendientes,
  tratamientosActivos,
  controlesPendientes,
  recordatoriosProgramados,
  turnosHoy,
} from "@/lib/mock-data"

interface AttentionCardProps {
  icon: ComponentType<{ className?: string }>
  title: string
  count: number
  href: string
  /** Highlight the count when there is something urgent to do. */
  urgent?: boolean
  children: React.ReactNode
}

function AttentionCard({ icon: Icon, title, count, href, urgent, children }: AttentionCardProps) {
  return (
    <Card className="flex flex-col rounded-2xl border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </CardTitle>
        <Badge
          className={cn(
            "rounded-full",
            urgent && count > 0
              ? "bg-destructive text-destructive-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {count}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <div className="flex-1 space-y-2">{children}</div>
        <Button variant="ghost" size="sm" className="mt-1 w-full justify-between text-primary" asChild>
          <Link href={href}>
            Ver todo
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function Row({
  title,
  subtitle,
  status,
  actionLabel,
  href,
}: {
  title: string
  subtitle: string
  status?: string
  actionLabel: string
  href: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{title}</p>
          {status && <StatusBadge status={status} className="shrink-0 text-[10px]" />}
        </div>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <Button size="sm" variant="outline" className="h-7 shrink-0 text-xs" asChild>
        <Link href={href}>{actionLabel}</Link>
      </Button>
    </div>
  )
}

export function TodayAttention() {
  const turnosActivos = turnosHoy.filter((t) => t.estado !== "Finalizado" && t.estado !== "Cancelado")
  const vacunasUrgentes = vacunasPendientes.filter((v) => v.estado === "Vencida")
  const recordatoriosPend = recordatoriosProgramados.filter((r) => r.estado === "Programado")

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <AttentionCard icon={Scissors} title="Cirugías agendadas" count={cirugiasProgramadas.length} href="/cirugias">
        {cirugiasProgramadas.map((c) => (
          <Row
            key={c.id}
            title={c.mascota}
            subtitle={`${c.tipo} · ${c.fecha} ${c.hora}`}
            status={c.estado}
            actionLabel="Abrir"
            href={`/mascotas/${c.mascotaId}`}
          />
        ))}
      </AttentionCard>

      <AttentionCard icon={Syringe} title="Vacunas próximas / vencidas" count={vacunasPendientes.length} href="/vacunas" urgent>
        {vacunasPendientes.map((v) => (
          <Row
            key={v.id}
            title={v.mascota}
            subtitle={`${v.vacuna} · ${v.dueno}`}
            status={v.estado}
            actionLabel="Ver"
            href="/vacunas"
          />
        ))}
      </AttentionCard>

      <AttentionCard icon={ClipboardList} title="Tratamientos activos" count={tratamientosActivos.length} href="/tratamientos">
        {tratamientosActivos.map((t) => (
          <Row
            key={t.id}
            title={t.mascota}
            subtitle={`${t.medicamento} · ${t.frecuencia}`}
            status={t.estado}
            actionLabel="Evolución"
            href={`/mascotas/${t.mascotaId}`}
          />
        ))}
      </AttentionCard>

      <AttentionCard icon={Clock} title="Controles pendientes" count={controlesPendientes.length} href="/historial">
        {controlesPendientes.map((c) => (
          <Row
            key={c.id}
            title={c.mascota}
            subtitle={`${c.tipo} · ${c.fechaSugerida}`}
            status={c.prioridad}
            actionLabel="Abrir"
            href={`/mascotas/${c.mascotaId}`}
          />
        ))}
      </AttentionCard>

      <AttentionCard icon={MessageCircle} title="Recordatorios WhatsApp" count={recordatoriosPend.length} href="/recordatorios" urgent>
        {recordatoriosProgramados.map((r) => (
          <Row
            key={r.id}
            title={r.destinatario}
            subtitle={`${r.mascota} · ${r.tipo}`}
            status={r.estado}
            actionLabel="Enviar"
            href="/recordatorios"
          />
        ))}
      </AttentionCard>

      <AttentionCard icon={Stethoscope} title="Turnos de hoy" count={turnosActivos.length} href="/turnos">
        {turnosHoy.slice(0, 4).map((t) => (
          <Row
            key={t.id}
            title={`${t.hora} · ${t.mascota}`}
            subtitle={`${t.motivo} · ${t.profesional}`}
            status={t.estado}
            actionLabel="Abrir"
            href={`/mascotas/${t.mascotaId}`}
          />
        ))}
      </AttentionCard>
    </div>
  )
}
