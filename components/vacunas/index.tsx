"use client"

import Link from "next/link"
import { Calendar, Check, Clock, MessageCircle, Plus, Syringe, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ClinicalActionFlow } from "@/components/clinical/action-flow"
import { vacunasClinicas } from "@/lib/mock-data"

const estadoColors: Record<string, string> = {
  Aplicada: "bg-success text-success-foreground",
  Proxima: "bg-primary text-primary-foreground",
  "Próxima": "bg-primary text-primary-foreground",
  Pendiente: "bg-secondary text-secondary-foreground",
  Vencida: "bg-destructive text-destructive-foreground",
}

function formatDate(date?: string | null) {
  if (!date) return "-"
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

export function VacunasPage() {
  return (
    <ClinicalActionFlow
      title="Vacunas"
      description="Elegir cliente y mascota para revisar el plan, cargar una vacuna y preparar recordatorio."
      actionLabel="Cargar vacuna"
      icon={Syringe}
    >
      {({ client, pet }) => {
        const vaccines = vacunasClinicas.filter((vacuna) => vacuna.mascotaId === pet.id)
        const applied = vaccines.filter((vacuna) => vacuna.estado === "Aplicada").length
        const next = vaccines.filter((vacuna) => vacuna.estado === "Próxima" || vacuna.estado === "Pendiente").length
        const expired = vaccines.filter((vacuna) => vacuna.estado === "Vencida").length

        return (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                <StatCard icon={Check} label="Aplicadas" value={applied} />
                <StatCard icon={Clock} label="Proximas/Pendientes" value={next} />
                <StatCard icon={AlertTriangle} label="Vencidas" value={expired} danger />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Syringe className="h-5 w-5 text-primary" />
                    Plan de vacunas de {pet.nombre}
                  </CardTitle>
                  <CardDescription>
                    Lectura rapida de vacunas aplicadas, pendientes, proximas y vencidas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vaccines.length > 0 ? (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {vaccines.map((vacuna) => (
                        <article
                          key={vacuna.id}
                          className={`rounded-lg border p-4 ${
                            vacuna.estado === "Vencida" ? "border-destructive/40 bg-destructive/5" : "bg-card"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">{vacuna.vacuna}</h3>
                                <Badge className={estadoColors[vacuna.estado] || "bg-muted"}>{vacuna.estado}</Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{vacuna.observaciones}</p>
                            </div>
                          </div>

                          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                            <Info label="Aplicada" value={formatDate(vacuna.fechaAplicada)} />
                            <Info label="Proxima fecha" value={formatDate(vacuna.proximaFecha || vacuna.fechaRecomendada)} />
                            <Info label="Veterinario" value={vacuna.veterinario || "A definir"} />
                            <Info label="Recordatorio" value={formatDate(vacuna.proximoRecordatorio)} />
                          </div>

                          <div className="mt-3 rounded-lg border bg-muted/25 p-3 text-sm">
                            <div className="mb-1 flex items-center gap-2 font-medium text-primary">
                              <MessageCircle className="h-4 w-4" />
                              Vista previa WhatsApp
                            </div>
                            <p className="line-clamp-2 text-muted-foreground">{vacuna.mensajePreview}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                      Esta mascota todavia no tiene plan de vacunas cargado.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="h-fit border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Registrar vacuna
                </CardTitle>
                <CardDescription>
                  La carga queda preparada para impactar en historia clinica, actividad diaria y recordatorio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/25 p-3 text-sm">
                  <p className="font-semibold">{client.nombre}</p>
                  <p className="text-muted-foreground">{pet.nombre} - {pet.especie}</p>
                </div>

                <Field label="Vacuna" placeholder="Ej: Antirrabica, Quintuple, Bordetella" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Fecha aplicada" placeholder="AAAA-MM-DD" />
                  <Field label="Proxima fecha" placeholder="AAAA-MM-DD" />
                </div>
                <Field label="Veterinario responsable" placeholder="Dr./Dra." />
                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Textarea placeholder="Lote, laboratorio, reaccion, indicaciones..." />
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  <p className="font-medium text-primary">Recordatorio preparado</p>
                  <p className="mt-1 text-muted-foreground">
                    Si hay proxima fecha, el sistema deja listo el seguimiento por WhatsApp.
                  </p>
                </div>

                <Button className="h-11 w-full bg-primary hover:bg-primary/90" asChild>
                  <Link href="/">
                    Guardar vacuna y volver al inicio
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      }}
    </ClinicalActionFlow>
  )
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input placeholder={placeholder} />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/35 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, danger }: { icon: typeof Syringe; label: string; value: number; danger?: boolean }) {
  return (
    <Card className={danger ? "border-destructive/30 bg-destructive/5" : ""}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${danger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
