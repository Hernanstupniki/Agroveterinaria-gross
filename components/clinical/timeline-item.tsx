import { Activity, ChevronRight, Clock, Download, FileText, MessageCircle, Pill, Scissors, ShieldAlert, Stethoscope, Syringe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ClinicalTimelineEvent } from "@/lib/clinical-history-builder"

const tipoEventoIcons: Record<string, typeof Activity> = {
  Consulta: Stethoscope,
  Vacuna: Syringe,
  Estudio: FileText,
  "Cirugía": Scissors,
  Tratamiento: Pill,
  Control: Clock,
  Recordatorio: MessageCircle,
  "Alerta clínica": ShieldAlert,
}

const tipoEventoColors: Record<string, string> = {
  Consulta: "border-primary/30 bg-primary text-primary-foreground",
  Vacuna: "border-success/30 bg-success text-success-foreground",
  Estudio: "border-secondary/40 bg-secondary text-secondary-foreground",
  "Cirugía": "border-destructive/30 bg-destructive text-destructive-foreground",
  Tratamiento: "border-warning/40 bg-warning text-warning-foreground",
  Control: "border-primary/20 bg-primary/5 text-primary",
  Recordatorio: "border-secondary/40 bg-secondary text-secondary-foreground",
  "Alerta clínica": "border-warning/40 bg-warning text-warning-foreground",
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-"
  const [year, month, day] = dateStr.split("-")
  if (!year || !month || !day) return dateStr
  return `${day}/${month}/${year}`
}

function TimelineDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

interface ClinicalTimelineItemProps {
  event: ClinicalTimelineEvent
  isExpanded: boolean
  onToggle: () => void
}

export function ClinicalTimelineItem({ event, isExpanded, onToggle }: ClinicalTimelineItemProps) {
  const Icon = tipoEventoIcons[event.tipo] || Activity
  const colorClass = tipoEventoColors[event.tipo] || "border-muted bg-muted text-muted-foreground"

  return (
    <article className="relative pl-11">
      <div className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{event.tipo}</Badge>
              {event.estado && <Badge variant="outline">{event.estado}</Badge>}
              <span className="text-sm text-muted-foreground">{formatDate(event.fecha)}</span>
              <span className="text-sm text-muted-foreground">· {event.veterinario}</span>
            </div>
            <h3 className="mt-2 font-bold">{event.motivo || event.procedimiento || event.tipo}</h3>
            {(event.diagnostico || event.tratamiento) && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {event.diagnostico || event.tratamiento}
              </p>
            )}
          </div>
          <Button variant="outline" className="h-10 rounded-xl" onClick={onToggle}>
            Ver detalle
            <ChevronRight className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 border-t pt-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {event.diagnostico && <TimelineDetail label="Diagnostico" value={event.diagnostico} />}
              {event.sintomas && event.sintomas !== "-" && <TimelineDetail label="Sintomas" value={event.sintomas} />}
              {event.tratamiento && event.tratamiento !== "-" && <TimelineDetail label="Tratamiento" value={event.tratamiento} />}
              {event.vacuna && <TimelineDetail label="Vacuna" value={`${event.vacuna} · ${event.laboratorio || "-"}`} />}
              {event.peso && <TimelineDetail label="Peso" value={`${event.peso} kg`} />}
              {event.temperatura && <TimelineDetail label="Temperatura" value={`${event.temperatura} °C`} />}
              {event.procedimiento && <TimelineDetail label="Procedimiento" value={event.procedimiento} />}
              {event.proximoControl && <TimelineDetail label="Proximo control" value={formatDate(event.proximoControl)} />}
            </div>
            {event.observaciones && (
              <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">{event.observaciones}</div>
            )}
            {event.archivo && (
              <div className="mt-3 flex justify-end border-t pt-3">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Ver archivo
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}