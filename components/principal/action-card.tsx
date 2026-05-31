import type { ComponentType } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type ActionTone = "neutral" | "magenta" | "green"

export interface PrincipalActionItem {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  href?: string
  disabled?: boolean
  /** Replaces the description when the action is disabled. */
  disabledText?: string
  badge?: string
  tone?: ActionTone
}

const iconToneClasses: Record<ActionTone, string> = {
  neutral: "bg-muted text-foreground/70 group-hover:bg-muted/80",
  magenta: "bg-primary/10 text-primary group-hover:bg-primary/15",
  green: "bg-secondary/20 text-secondary-foreground group-hover:bg-secondary/30",
}

const borderToneClasses: Record<ActionTone, string> = {
  neutral: "border-border hover:border-foreground/20",
  magenta: "border-primary/15 hover:border-primary/40",
  green: "border-secondary/30 hover:border-secondary/60",
}

const glowToneClasses: Record<ActionTone, string> = {
  neutral: "bg-foreground/5",
  magenta: "bg-primary/15",
  green: "bg-secondary/20",
}

/**
 * Large, touch-friendly action block used across the Principal hub. Renders a
 * link, or a non-interactive disabled state with an explanatory message.
 */
export function ActionCard({ item, index = 0 }: { item: PrincipalActionItem; index?: number }) {
  const tone = item.tone ?? "neutral"

  const inner = (
    <>
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
            item.disabled ? "bg-muted text-muted-foreground/50" : iconToneClasses[tone],
          )}
        >
          <item.icon className="h-5 w-5" />
        </div>
        {item.badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            {item.badge}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className={cn("text-[15px] font-semibold leading-tight", item.disabled && "text-muted-foreground")}>
          {item.title}
        </p>
        <p className="text-sm leading-snug text-muted-foreground">
          {item.disabled ? item.disabledText ?? item.description : item.description}
        </p>
      </div>
    </>
  )

  const baseClasses = "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm"

  if (item.disabled || !item.href) {
    return (
      <div
        aria-disabled={Boolean(item.disabled)}
        style={{ "--i": index } as React.CSSProperties}
        className={cn(baseClasses, "cursor-not-allowed border-dashed border-border opacity-70")}
      >
        {inner}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      style={{ "--i": index } as React.CSSProperties}
      className={cn(
        baseClasses,
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        borderToneClasses[tone],
      )}
    >
      {inner}
      <span
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
          glowToneClasses[tone],
        )}
      />
    </Link>
  )
}
