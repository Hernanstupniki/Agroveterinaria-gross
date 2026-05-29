"use client"

import Link from "next/link"
import { AlertTriangle, Clock, Plus, Scissors, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ClinicalActionFlow } from "@/components/clinical/action-flow"
import { cirugias, profesionales } from "@/lib/mock-data"

const scheduledStates = ["Programada", "Pendiente confirmaciÃ³n", "En preparacion", "En preparaciÃ³n"]

const estadoColors: Record<string, string> = {
  Programada: "bg-primary text-primary-foreground",
  "Pendiente confirmaciÃ³n": "bg-warning text-warning-foreground",
  "En preparacion": "bg-secondary text-secondary-foreground",
  "En preparaciÃ³n": "bg-secondary text-secondary-foreground",
  Realizada: "bg-success text-success-foreground",
  Cancelada: "bg-destructive text-destructive-foreground",
  Reprogramada: "bg-muted text-muted-foreground",
}

export default function CirugiasScreen() {
  return (
    <ClinicalActionFlow
      title="Cirugias"
      description="Agendar, validar y registrar procedimientos quirurgicos vinculados a agenda e historia clinica."
      actionLabel="Agendar o registrar"
      icon={Scissors}
    >
      {({ client, pet }) => {
        const petSurgeries = cirugias.filter((cirugia) => cirugia.mascotaId === pet.id)
        const scheduledSurgeries = petSurgeries.filter((cirugia) => scheduledStates.includes(cirugia.estado))
        const veterinarios = profesionales.filter((profesional) => profesional.rol === "Veterinario")

        return (
          <div className="space-y-5">
            <Card className="border-primary/30 bg-primary/5 shadow-sm">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Plus className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl">Agendar cirugia</CardTitle>
                <CardDescription>
                  Crea el evento de agenda antes de permitir el registro quirurgico.
                </CardDescription>
              </CardHeader>
              <CardContent className="mx-auto grid w-full max-w-5xl gap-4">
                <div className="rounded-lg border bg-background p-3 text-sm">
                  <p className="font-semibold">{client.nombre}</p>
                  <p className="text-muted-foreground">{pet.nombre} - {pet.especie}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Tipo de cirugia" placeholder="Ej: Castracion, extirpacion, limpieza dental" />
                  <Field
                    label="Veterinario"
                    placeholder={veterinarios.map((veterinario) => veterinario.nombre).join(" / ")}
                  />
                  <Field label="Fecha" placeholder="AAAA-MM-DD" />
                  <Field label="Hora" placeholder="HH:MM" />
                  <Field label="Duracion estimada" placeholder="Ej: 45 minutos" />
                  <Field label="Riesgo" placeholder="Bajo / Moderado / Alto" />
                </div>
                <div className="space-y-2">
                  <Label>Notas preoperatorias</Label>
                  <Textarea placeholder="Ayuno, estudios requeridos, consentimiento, observaciones..." />
                </div>

                <div className="rounded-lg border border-primary/20 bg-background p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium text-primary">
                    <Clock className="h-4 w-4" />
                    Estado inicial: agendada
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    Luego se podra pasar a en preparacion, realizada, cancelada o reprogramada.
                  </p>
                </div>

                <Button className="h-14 w-full bg-primary text-base font-bold hover:bg-primary/90" asChild>
                  <Link href="/">Agendar cirugia y volver al inicio</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-primary" />
                    Cirugias de {pet.nombre}
                  </CardTitle>
                  <CardDescription>
                    Toda cirugia realizada debe estar asociada a una agenda/turno quirurgico.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {petSurgeries.length > 0 ? (
                    petSurgeries.map((cirugia) => (
                      <article key={cirugia.id} className="rounded-lg border bg-card p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold">{cirugia.tipo}</h3>
                              <Badge className={estadoColors[cirugia.estado] || "bg-muted"}>
                                {cirugia.estado}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {cirugia.fecha} - {cirugia.hora} - {cirugia.veterinario}
                            </p>
                          </div>
                          <Badge variant="outline">
                            Riesgo {cirugia.prequirurgico?.riesgoQuirurgico || "A definir"}
                          </Badge>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                          <Info label="Consentimiento" value={cirugia.consentimiento.firmado ? "Firmado" : "Pendiente"} />
                          <Info label="Prequirurgico" value={cirugia.prequirurgico ? "Cargado" : "Pendiente"} />
                          <Info label="Registro" value={cirugia.registroCirugia ? "Realizado" : "Sin registrar"} />
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                      {pet.nombre} no tiene cirugias cargadas.
                    </div>
                  )}
                </CardContent>
            </Card>

            <Card className={scheduledSurgeries.length ? "border-success/25 bg-success/5" : "border-destructive/30 bg-destructive/5"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {scheduledSurgeries.length ? (
                      <ShieldCheck className="h-5 w-5 text-success" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    )}
                    Registrar cirugia ya agendada
                  </CardTitle>
                  <CardDescription>
                    Validacion obligatoria antes de marcar una cirugia como realizada.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scheduledSurgeries.length > 0 ? (
                    scheduledSurgeries.map((cirugia) => (
                      <div key={cirugia.id} className="rounded-lg border bg-card p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold">{cirugia.tipo}</p>
                            <p className="text-sm text-muted-foreground">
                              Turno quirurgico: {cirugia.fecha} - {cirugia.hora}
                            </p>
                          </div>
                          <Button className="bg-primary hover:bg-primary/90" asChild>
                            <Link href="/">Registrar realizada y volver al inicio</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-destructive/30 bg-background p-4">
                      <p className="font-semibold text-destructive">
                        Para registrar una cirugia primero debe estar agendada.
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Usa el formulario de agenda para crear el turno quirurgico de {pet.nombre}.
                      </p>
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
