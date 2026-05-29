"use client"

import Link from "next/link"
import { Calendar, MessageCircle, Plus, Syringe } from "lucide-react"
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
        return (
          <div className="space-y-5">
            <Card className="border-primary/30 bg-primary/5 shadow-sm">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Plus className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl">Registrar vacuna</CardTitle>
                <CardDescription>
                  La carga queda preparada para impactar en historia clinica, actividad diaria y recordatorio.
                </CardDescription>
              </CardHeader>
              <CardContent className="mx-auto grid w-full max-w-5xl gap-4">
                <div className="rounded-lg border bg-background p-3 text-sm">
                  <p className="font-semibold">{client.nombre}</p>
                  <p className="text-muted-foreground">{pet.nombre} - {pet.especie}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Vacuna" placeholder="Ej: Antirrabica, Quintuple, Bordetella" />
                  <Field label="Veterinario responsable" placeholder="Dr./Dra." />
                  <Field label="Fecha aplicada" placeholder="AAAA-MM-DD" />
                  <Field label="Proxima fecha" placeholder="AAAA-MM-DD" />
                </div>
                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Textarea placeholder="Lote, laboratorio, reaccion, indicaciones..." />
                </div>

                <div className="rounded-lg border border-primary/20 bg-background p-3 text-sm">
                  <p className="font-medium text-primary">Recordatorio preparado</p>
                  <p className="mt-1 text-muted-foreground">
                    Si hay proxima fecha, el sistema deja listo el seguimiento por WhatsApp.
                  </p>
                </div>

                <Button className="h-14 w-full bg-primary text-base font-bold hover:bg-primary/90" asChild>
                  <Link href="/">Guardar vacuna y volver al inicio</Link>
                </Button>
              </CardContent>
            </Card>

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
