import type { ComponentType } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface KpiItem {
  label: string
  value: number | string
  hint?: string
  icon?: ComponentType<{ className?: string }>
  tone?: "default" | "critical" | "warning" | "success"
  href?: string
}

const toneText: Record<NonNullable<KpiItem["tone"]>, string> = {
  default: "text-foreground",
  critical: "text-destructive",
  warning: "text-warning",
  success: "text-success",
}

const toneIcon: Record<NonNullable<KpiItem["tone"]>, string> = {
  default: "text-primary",
  critical: "text-destructive",
  warning: "text-warning",
  success: "text-success",
}

/**
 * Secondary metrics row. Per the product rule, KPIs are NOT the protagonist:
 * render this at the bottom of a screen (or inside Resumen), never at the top.
 */
export function KpiStrip({ items, className }: { items: KpiItem[]; className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", className)}>
      {items.map((item) => {
        const tone = item.tone ?? "default"
        const Icon = item.icon
        const card = (
          <Card className="h-full rounded-2xl border-border/70 transition-shadow hover:shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              {Icon && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Icon className={cn("h-4 w-4", toneIcon[tone])} />
                </div>
              )}
              <div className="min-w-0">
                <p className={cn("text-xl font-semibold leading-tight", toneText[tone])}>
                  {item.value}
                </p>
                <p className="truncate text-xs font-medium text-foreground/80">{item.label}</p>
                {item.hint && <p className="truncate text-[11px] text-muted-foreground">{item.hint}</p>}
              </div>
            </CardContent>
          </Card>
        )
        return item.href ? (
          <Link key={item.label} href={item.href} className="block">
            {card}
          </Link>
        ) : (
          <div key={item.label}>{card}</div>
        )
      })}
    </div>
  )
}
