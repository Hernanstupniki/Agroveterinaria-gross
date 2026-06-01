import { PrincipalActions } from "./principal-actions"

const hoy = new Date().toLocaleDateString("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

export function Principal() {
  return (
    <div className="animate-section-in mx-auto max-w-[1600px] space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="capitalize">{hoy}</span>
          <span className="hidden sm:inline">·</span>
          <span>Dr. García</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Principal</h1>
        <p className="text-muted-foreground">
          Elegí un módulo para ver información o cargar datos clínicos.
        </p>
      </header>

      {/* Actions hub */}
      <PrincipalActions />
    </div>
  )
}
