"use client"

import type { ComponentType } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface FlowAction {
  label: string
  icon?: ComponentType<{ className?: string }>
  onClick?: () => void
  href?: string
}

/**
 * Shown after a clinical entity is saved. Confirms the save and offers the
 * natural next steps in priority order — stacked **vertically**, first one
 * highlighted, the rest secondary. The final `sectionLink` ("Ir a …") replaces
 * the old "Volver a Principal": creation now happens from Principal via dialogs,
 * so closing the dialog already returns there. (Flows A/B/C in AGENTS.md.)
 */
export function FormFlowFooter({
  title = "Guardado correctamente",
  description,
  actions,
  sectionLink,
  onNavigate,
}: {
  title?: string
  description?: string
  actions: FlowAction[]
  /** Low-emphasis link to the related section, e.g. "Ir a Vacunas". */
  sectionLink?: FlowAction
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

      {/* Priority order, stacked vertically: first action is primary. */}
      <div className="flex flex-col gap-2">
        {actions.map((action, i) => (
          <Button
            key={action.label}
            variant={i === 0 ? "default" : "outline"}
            className="h-12 w-full justify-start gap-2 rounded-xl text-base"
            onClick={() => run(action)}
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </Button>
        ))}

        {sectionLink && (
          <Button
            variant="ghost"
            className="h-11 w-full justify-start gap-2 rounded-xl text-muted-foreground"
            onClick={() => run(sectionLink)}
          >
            {sectionLink.icon ? <sectionLink.icon className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            {sectionLink.label}
          </Button>
        )}
      </div>
    </div>
  )
}
