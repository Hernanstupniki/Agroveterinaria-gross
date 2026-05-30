import type { ComponentType } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface ActionCardProps {
  href: string
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  /** Visual category — magenta (clinical core) or green (agro/secondary). */
  tone?: "magenta" | "green"
  /** Stagger index for the entrance animation. */
  index?: number
}

/**
 * Large, touch-friendly action button for the Principal screen.
 * Big icon, clear title, supporting description, soft hover lift and press feedback.
 */
export function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  tone = "magenta",
  index = 0,
}: ActionCardProps) {
  const isGreen = tone === "green"
  return (
    <Link
      href={href}
      style={{ "--i": index } as React.CSSProperties}
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-5 shadow-sm",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isGreen
          ? "border-secondary/30 hover:border-secondary/60"
          : "border-primary/15 hover:border-primary/40",
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
          isGreen
            ? "bg-secondary/15 text-secondary-foreground group-hover:bg-secondary/25"
            : "bg-primary/10 text-primary group-hover:bg-primary/15",
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold leading-tight text-foreground">{title}</p>
        <p className="text-sm leading-snug text-muted-foreground">{description}</p>
      </div>
      <span
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
          isGreen ? "bg-secondary/20" : "bg-primary/15",
        )}
      />
    </Link>
  )
}
