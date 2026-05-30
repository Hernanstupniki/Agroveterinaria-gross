import type { ComponentType, MouseEventHandler } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LargePrimaryActionProps {
  label: string
  icon?: ComponentType<{ className?: string }>
  href?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  /** Color category: magenta (default) or agro-green. */
  tone?: "magenta" | "green"
  className?: string
}

const toneClasses = {
  magenta: "bg-primary text-primary-foreground hover:bg-primary/90",
  green: "bg-secondary text-secondary-foreground hover:bg-secondary/85",
}

/**
 * The big, legible primary CTA each module must expose (e.g. "Nuevo cliente").
 * Large hit area, soft lift on hover, gentle press feedback.
 */
export function LargePrimaryAction({
  label,
  icon: Icon,
  href,
  onClick,
  tone = "magenta",
  className,
}: LargePrimaryActionProps) {
  const classes = cn(
    "h-12 gap-2 rounded-xl px-5 text-base font-semibold shadow-sm transition-all duration-200",
    "hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]",
    toneClasses[tone],
    className,
  )

  if (href) {
    return (
      <Button asChild className={classes}>
        <Link href={href}>
          {Icon && <Icon className="h-5 w-5" />}
          {label}
        </Link>
      </Button>
    )
  }

  return (
    <Button onClick={onClick} className={classes}>
      {Icon && <Icon className="h-5 w-5" />}
      {label}
    </Button>
  )
}
