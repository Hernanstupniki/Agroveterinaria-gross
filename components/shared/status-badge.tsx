import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusTone = "success" | "warning" | "critical" | "info" | "neutral" | "primary"

const toneClasses: Record<StatusTone, string> = {
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  critical: "bg-destructive text-destructive-foreground",
  info: "bg-secondary text-secondary-foreground",
  primary: "bg-primary text-primary-foreground",
  neutral: "bg-muted text-muted-foreground",
}

/** Maps common Spanish clinical statuses to a semantic tone. */
export function statusTone(status: string): StatusTone {
  const s = status.toLowerCase()
  if (/(vencid|cancel|suspend|fallid|crítico|critico|urgente|alta)/.test(s)) return "critical"
  if (/(próxim|proxim|pendiente|en espera|preparación|preparacion|reprogram|media)/.test(s)) return "warning"
  if (/(aplicad|finalizad|confirmad|realizad|enviad|activo|saludable|completad|baja)/.test(s)) return "success"
  if (/(en atención|en atencion|en progreso|programad|en tratamiento)/.test(s)) return "info"
  return "neutral"
}

interface StatusBadgeProps {
  status: string
  /** Force a tone instead of inferring it from the label. */
  tone?: StatusTone
  className?: string
}

/** Consistent status pill used across clinical modules. */
export function StatusBadge({ status, tone, className }: StatusBadgeProps) {
  const resolved = tone ?? statusTone(status)
  return <Badge className={cn(toneClasses[resolved], "font-medium", className)}>{status}</Badge>
}
