import type { ComponentType, ReactNode } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type ModuleTone = "neutral" | "magenta" | "green"

const iconToneClasses: Record<ModuleTone, string> = {
  neutral: "bg-muted text-foreground/70 group-hover:bg-muted/80",
  magenta: "bg-primary/10 text-primary group-hover:bg-primary/15",
  green: "bg-secondary/25 text-secondary-foreground group-hover:bg-secondary/35",
}

const borderToneClasses: Record<ModuleTone, string> = {
  neutral: "hover:border-foreground/20",
  magenta: "hover:border-primary/40",
  green: "hover:border-secondary/60",
}

/**
 * A single operative module on the Principal hub: icon + title + description and
 * a footer with internal actions (Ver / Crear / Cargar / Agendar / Buscar).
 * One card per module — actions live inside, never as separate cards.
 */
export function ModuleCard({
  title,
  description,
  icon: Icon,
  tone = "neutral",
  index = 0,
  badge,
  footer,
}: {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  tone?: ModuleTone
  index?: number
  badge?: string
  footer: ReactNode
}) {
  return (
    <div
      style={{ "--i": index } as React.CSSProperties}
      className={cn(
        "group relative flex h-full flex-col gap-6 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        borderToneClasses[tone],
      )}
    >
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-colors",
            iconToneClasses[tone],
          )}
        >
          <Icon className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-lg font-semibold leading-tight text-foreground">{title}</p>
            {badge && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-2">{footer}</div>
    </div>
  )
}

/** Footer action button: neutral outline for both ver and action variants. */
export function ModuleButton({
  label,
  href,
  onClick,
  variant,
}: {
  label: string
  href?: string
  onClick?: () => void
  variant: "ver" | "action"
  tone?: ModuleTone
}) {
  const className = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "flex-1",
    "active:scale-[0.98]",
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  )
}
