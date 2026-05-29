"use client"

import Link from "next/link"
import { Calendar, CheckCircle, Pill, Plus, Stethoscope } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ClinicalActionFlow } from "@/components/clinical/action-flow"
import { controlesPendientes, tratamientosActivos } from "@/lib/mock-data"

const estadoColors: Record<string, string> = {
  Activo: "bg-success text-success-foreground",
  Finalizado: "bg-muted text-muted-foreground",
  Suspendido: "bg-warning text-warning-foreground",
  "Requiere control": "bg-destructive text-destructive-foreground",
}

export function TratamientosPage() {
  return (
    <ClinicalActionFlow
      title="Tratamientos"
      description="Elegir cliente y mascota para cargar un tratamiento clinico como proceso con seguimiento."
      actionLabel="Cargar tratamiento"
      icon={Pill}
    >
      {({ client, pet }) => {
        const treatments = tratamientosActivos.filter((tratamiento) => tratamiento.mascotaId === pet.id)
        const controls = controlesPendientes.filter((control) => control.mascotaId === pet.id)

        return (
          <div className="space-y-5">
            <Card className="border-primary/30 bg-primary/5 shadow-sm">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Plus className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl">Nuevo tratamiento</CardTitle>
                <CardDescription>
                  El tratamiento queda preparado para historia clinica, actividad del dia y seguimiento activo.
                </CardDescription>
              </CardHeader>
              <CardContent className="mx-auto grid w-full max-w-5xl gap-4">
                <div className="rounded-lg border bg-background p-3 text-sm">
                  <p className="font-semibold">{client.nombre}</p>
                  <p className="text-muted-foreground">{pet.nombre} - {pet.especie}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Nombre del tratamiento" placeholder="Ej: Leishmaniasis" />
                  <Field label="Diagnostico / motivo" placeholder="Diagnostico clinico" />
                  <Field label="Fecha de inicio" placeholder="AAAA-MM-DD" />
                  <Field label="Proximo control" placeholder="AAAA-MM-DD" />
                  <Field label="Medicacion / indicacion" placeholder="Medicamento o pauta" />
                  <Field label="Responsable" placeholder="Dr./Dra." />
                </div>
                <div className="space-y-2">
                  <Label>Observaciones y seguimiento</Label>
                  <Textarea placeholder="Evolucion, controles, signos a vigilar, recordatorios o proximas acciones..." />
                </div>

                <Button className="h-14 w-full bg-primary text-base font-bold hover:bg-primary/90" asChild>
                  <Link href="/">Guardar tratamiento y volver al inicio</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Seguimiento clinico de {pet.nombre}
                  </CardTitle>
                  <CardDescription>
                    Tratamientos, controles y proximas acciones vinculadas a la historia clinica.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {treatments.length > 0 ? (
                    treatments.map((tratamiento) => (
                      <article key={tratamiento.id} className="rounded-lg border bg-card p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold">{tratamiento.diagnostico}</h3>
                              <Badge className={estadoColors[tratamiento.estado] || "bg-muted"}>
                                {tratamiento.estado}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {tratamiento.medicamento} - {tratamiento.dosis} - {tratamiento.frecuencia}
                            </p>
                          </div>
                          <Badge variant="outline">Control {tratamiento.proximoControl}</Badge>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                          <Info label="Inicio" value={tratamiento.fechaInicio} />
                          <Info label="Fin" value={tratamiento.fechaFinalizacion || "Indefinido"} />
                          <Info label="Indicaciones" value={tratamiento.indicaciones} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar control
                          </Button>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Finalizar
                          </Button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                      {pet.nombre} no tiene tratamientos activos cargados.
                    </div>
                  )}

                  {controls.length > 0 && (
                    <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
                      <h3 className="flex items-center gap-2 font-semibold">
                        <Calendar className="h-4 w-4 text-warning" />
                        Controles pendientes
                      </h3>
                      <div className="mt-3 space-y-2">
                        {controls.map((control) => (
                          <div key={control.id} className="rounded-md bg-background/80 p-3 text-sm">
                            <p className="font-medium">{control.tipo}</p>
                            <p className="text-muted-foreground">
                              {control.fechaSugerida} - {control.profesional} - Prioridad {control.prioridad}
                            </p>
                          </div>
                        ))}
                      </div>
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
