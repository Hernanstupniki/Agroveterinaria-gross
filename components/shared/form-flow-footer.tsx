"use client"

import type { ComponentType } from "react"
import { useRouter } from "next/navigation"
import { Home, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FlowAction {
  label: string
  icon?: ComponentType<{ className?: string }>
  onClick?: () => void
  href?: string
  tone?: "primary" | "outline"
}

/**
 * Shown after a clinical entity is saved. Confirms the save and offers the
 * natural next steps in the flow, always including "Volver a Principal".
 * (Flows A/B/C in AGENTS.md.)
 */
export function FormFlowFooter({
  title = "Guardado correctamente",
  description,
  actions,
  showBackToPrincipal = true,
  onNavigate,
}: {
  title?: string
  description?: string
  actions: FlowAction[]
  showBackToPrincipal?: boolean
  /** Called before navigation (e.g. to close the parent dialog). */
  onNavigate?: () => void
}) {
  const router = useRouter()

  const run = (action: FlowAction) => {
    onNavigate?.()
    action.onClick?.()
    if (action.href) router.push(action.href)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-success/10 p-3 text-success">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">{title}</p>
          {description && <p className="text-sm text-success/80">{description}</p>}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.tone === "outline" ? "outline" : "default"}
            className={cn("h-11 justify-start gap-2 rounded-xl")}
            onClick={() => run(action)}
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </Button>
        ))}
        {showBackToPrincipal && (
          <Button
            variant="ghost"
            className="h-11 justify-start gap-2 rounded-xl text-muted-foreground"
            onClick={() => run({ label: "Principal", href: "/" })}
          >
            <Home className="h-4 w-4" />
            Volver a Principal
          </Button>
        )}
      </div>
    </div>
  )
}
