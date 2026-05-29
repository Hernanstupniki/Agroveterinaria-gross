"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  ClipboardList,
  History,
  Plus,
  Settings,
  Syringe,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ClinicalActionFlow } from "@/components/clinical/action-flow"
import {
  buildPetVaccinationHistory,
  buildPetVaccineSchedule,
  buildReminderForSchedule,
  calculateNextDose,
  formatInterval,
  getActiveVaccinesForSpecies,
  getDosesForVaccine,
  vaccineDoses,
  vaccineSchemes,
} from "@/lib/vaccine-workflow"

type VaccineMode = "registrar" | "pendientes" | "esquemas"

const scheduleStatusStyles: Record<string, string> = {
  pendiente: "bg-primary text-primary-foreground",
  vencida: "bg-destructive text-destructive-foreground",
  aplicada: "bg-success text-success-foreground",
  cancelada: "bg-muted text-muted-foreground",
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
      description="Elegir cliente y mascota para registrar dosis, revisar pendientes o configurar esquemas por especie."
      actionLabel="Gestionar vacunas"
      icon={Syringe}
    >
      {({ client, pet }) => <VaccineWorkspace key={pet.id} client={client} pet={pet} />}
    </ClinicalActionFlow>
  )
}

function VaccineWorkspace({
  client,
  pet,
}: {
  client: { id: number; nombre: string }
  pet: { id: number; nombre: string; especie: string; raza: string }
}) {
  const speciesVaccines = useMemo(() => getActiveVaccinesForSpecies(pet.especie), [pet.especie])
  const firstVaccineId = speciesVaccines[0]?.id || vaccineSchemes[0]?.id || ""
  const [mode, setMode] = useState<VaccineMode>("registrar")
  const [selectedVaccineId, setSelectedVaccineId] = useState(firstVaccineId)
  const selectedDoses = getDosesForVaccine(selectedVaccineId)
  const [selectedDoseId, setSelectedDoseId] = useState(selectedDoses[0]?.id || "")
  const [appliedAt, setAppliedAt] = useState("2026-06-01")
  const [origin, setOrigin] = useState<"aplicada_hoy" | "carga_historica">("aplicada_hoy")
  const [manualConfirm, setManualConfirm] = useState(false)

  const effectiveDoseId = selectedDoses.some((dose) => dose.id === selectedDoseId)
    ? selectedDoseId
    : selectedDoses[0]?.id || ""
  const selectedVaccine = vaccineSchemes.find((scheme) => scheme.id === selectedVaccineId)
  const selectedDose = vaccineDoses.find((dose) => dose.id === effectiveDoseId)
  const history = buildPetVaccinationHistory(pet.id)
  const schedule = buildPetVaccineSchedule(pet.id)
  const nextDose = selectedVaccine && selectedDose ? calculateNextDose(selectedVaccine.id, selectedDose.id, appliedAt) : null
  const previousDose = selectedDoses.find((dose) => selectedDose && dose.order === selectedDose.order - 1)
  const hasPreviousDose = previousDose ? history.some((record) => record.doseId === previousDose.id) : true
  const duplicateDose = history.some(
    (record) => record.vaccineId === selectedVaccineId && record.doseId === effectiveDoseId && record.appliedAt === appliedAt,
  )
  const outOfOrder = Boolean(previousDose && !hasPreviousDose)
  const canSave = Boolean(selectedVaccine && selectedDose && appliedAt && !duplicateDose && (!outOfOrder || origin === "carga_historica" || manualConfirm))

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-3">
        <ModeButton
          active={mode === "registrar"}
          icon={Syringe}
          title="Registrar vacuna aplicada"
          description="Cargar dosis, fecha y calcular proxima aplicacion."
          onClick={() => setMode("registrar")}
        />
        <ModeButton
          active={mode === "pendientes"}
          icon={ClipboardList}
          title="Ver vacunas pendientes"
          description="Revisar calendario, vencidas y recordatorios preparados."
          onClick={() => setMode("pendientes")}
        />
        <ModeButton
          active={mode === "esquemas"}
          icon={Settings}
          title="Configurar esquemas"
          description="Definir vacunas, dosis, intervalos y estado del esquema."
          onClick={() => setMode("esquemas")}
        />
      </div>

      {mode === "registrar" && (
        <Card className="border-primary/30 bg-primary/5 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Plus className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl">Registrar vacuna aplicada</CardTitle>
            <CardDescription>
              Al guardar se prepara historia clinica, dosis aplicada, proxima aplicacion y recordatorio.
            </CardDescription>
          </CardHeader>
          <CardContent className="mx-auto grid w-full max-w-5xl gap-5">
            <PatientSummary client={client} pet={pet} />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>Vacuna</Label>
                <Select
                  value={selectedVaccineId}
                  onValueChange={(value) => {
                    setSelectedVaccineId(value)
                    setSelectedDoseId(getDosesForVaccine(value)[0]?.id || "")
                  }}
                >
                  <SelectTrigger className="h-12 bg-background">
                    <SelectValue placeholder="Seleccionar vacuna" />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesVaccines.map((scheme) => (
                      <SelectItem key={scheme.id} value={scheme.id}>
                        {scheme.name} - {scheme.species}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dosis aplicada</Label>
                <Select value={effectiveDoseId} onValueChange={setSelectedDoseId}>
                  <SelectTrigger className="h-12 bg-background">
                    <SelectValue placeholder="Seleccionar dosis" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDoses.map((dose) => (
                      <SelectItem key={dose.id} value={dose.id}>
                        {dose.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Field label="Fecha de aplicacion" value={appliedAt} onChange={setAppliedAt} placeholder="AAAA-MM-DD" />
              <Field label="Aplicada por" placeholder="Veterinario/responsable" />
            </div>

            <div className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-2">
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={origin === "carga_historica"}
                  onCheckedChange={(checked) => setOrigin(checked ? "carga_historica" : "aplicada_hoy")}
                />
                <span>
                  <span className="block font-medium">Cargar como registro historico</span>
                  <span className="text-muted-foreground">Usar si la dosis ya estaba aplicada anteriormente.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <Checkbox checked={manualConfirm} onCheckedChange={(checked) => setManualConfirm(Boolean(checked))} />
                <span>
                  <span className="block font-medium">Confirmar dosis fuera de orden</span>
                  <span className="text-muted-foreground">Permite continuar si falta una dosis previa en el sistema.</span>
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea className="bg-background" placeholder="Lote, laboratorio, reaccion, indicaciones o notas clinicas..." />
            </div>

            <ValidationPanel duplicate={duplicateDose} outOfOrder={outOfOrder} canSave={canSave} />

            {selectedVaccine && selectedDose && (
              <Card className="border-primary/25 bg-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-5 w-5 text-primary" />
                    Calculo automatico del esquema
                  </CardTitle>
                  <CardDescription>Basado en la configuracion de dosis de {selectedVaccine.name}.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  <Info label="Dosis guardada" value={selectedDose.name} />
                  <Info label="Origen" value={origin === "carga_historica" ? "Carga historica" : "Aplicada hoy"} />
                  <Info
                    label="Proxima dosis"
                    value={nextDose ? `${nextDose.dose.name} - ${formatDate(nextDose.estimatedAt)}` : "Esquema completo"}
                  />
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 md:col-span-3">
                    <div className="flex items-center gap-2 font-medium text-primary">
                      <Bell className="h-4 w-4" />
                      Recordatorio preparado
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {nextDose
                        ? `Cliente: ${client.nombre}. Mascota: ${pet.nombre}. Vacuna: ${selectedVaccine.name}. Dosis: ${nextDose.dose.name}. Fecha estimada: ${formatDate(nextDose.estimatedAt)}.`
                        : "No se genera recordatorio porque no hay proxima dosis configurada."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button className="h-14 w-full bg-primary text-base font-bold hover:bg-primary/90" disabled={!canSave} asChild={canSave}>
              {canSave ? <Link href="/">Guardar vacuna y volver al inicio</Link> : <span>Completar validaciones para guardar</span>}
            </Button>
          </CardContent>
        </Card>
      )}

      {mode === "pendientes" && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Vacunas pendientes de {pet.nombre}
              </CardTitle>
              <CardDescription>Dosis calculadas desde los esquemas configurables y aplicaciones registradas.</CardDescription>
            </CardHeader>
            <CardContent>
              {schedule.length > 0 ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {schedule.map((item) => {
                    const scheme = vaccineSchemes.find((vaccine) => vaccine.id === item.vaccineId)
                    const dose = vaccineDoses.find((vaccineDose) => vaccineDose.id === item.doseId)
                    const reminder = buildReminderForSchedule(item)

                    return (
                      <article key={item.id} className={`rounded-lg border p-4 ${item.status === "vencida" ? "border-destructive/40 bg-destructive/5" : "bg-card"}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{scheme?.name}</h3>
                          <Badge className={scheduleStatusStyles[item.status]}>{item.status}</Badge>
                          <Badge variant="outline">{dose?.name}</Badge>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                          <Info label="Fecha estimada" value={formatDate(item.estimatedAt)} />
                          <Info label="Recordatorio" value={reminder.status === "preparado" ? "Preparado" : reminder.status} />
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <EmptyState text="No hay proximas dosis calculadas para esta mascota." />
              )}
            </CardContent>
          </Card>

          <VaccinationHistory petId={pet.id} />
        </div>
      )}

      {mode === "esquemas" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Configurar esquemas de vacunacion
            </CardTitle>
            <CardDescription>
              Semilla demo editable a futuro: vacunas por especie, dosis, intervalos y refuerzos recurrentes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="Nombre de vacuna" placeholder="Ej: Vacuna X" />
                <Field label="Especie / tipo animal" placeholder="Perro, gato u otro" />
                <Field label="Cantidad de dosis" placeholder="Ej: 2" />
                <Field label="Estado del esquema" placeholder="Activo / Inactivo" />
              </div>
              <div className="mt-4 space-y-2">
                <Label>Observaciones</Label>
                <Textarea className="bg-background" placeholder="Indicaciones generales del esquema..." />
              </div>
              <Button className="mt-4 h-12 bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Crear esquema
              </Button>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {vaccineSchemes.map((scheme) => {
                const doses = getDosesForVaccine(scheme.id)
                return (
                  <article key={scheme.id} className="rounded-lg border bg-card p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{scheme.name}</h3>
                      <Badge variant="outline">{scheme.species}</Badge>
                      <Badge className={scheme.active ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                        {scheme.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{scheme.description}</p>
                    <div className="mt-3 space-y-2">
                      {doses.map((dose) => (
                        <div key={dose.id} className="rounded-md bg-muted/35 p-3 text-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{dose.name}</span>
                            <Badge variant="outline">Orden {dose.order}</Badge>
                            {dose.recurrent && <Badge className="bg-primary text-primary-foreground">Recurrente</Badge>}
                          </div>
                          <p className="mt-1 text-muted-foreground">
                            Intervalo: {formatInterval(dose.intervalValue, dose.intervalUnit)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ModeButton({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean
  icon: typeof Syringe
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-colors ${
        active ? "border-primary/40 bg-primary text-primary-foreground shadow-md shadow-primary/15" : "bg-card hover:border-primary/40 hover:bg-primary/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${active ? "bg-white/15" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold">{title}</p>
          <p className={`mt-1 text-sm ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{description}</p>
        </div>
      </div>
    </button>
  )
}

function PatientSummary({ client, pet }: { client: { nombre: string }; pet: { nombre: string; especie: string; raza: string } }) {
  return (
    <div className="rounded-lg border bg-background p-3 text-sm">
      <p className="font-semibold">{client.nombre}</p>
      <p className="text-muted-foreground">{pet.nombre} - {pet.especie} - {pet.raza}</p>
    </div>
  )
}

function ValidationPanel({ duplicate, outOfOrder, canSave }: { duplicate: boolean; outOfOrder: boolean; canSave: boolean }) {
  if (!duplicate && !outOfOrder) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-success/25 bg-success/10 p-3 text-sm text-success">
        <CheckCircle2 className="h-4 w-4" />
        Validacion lista: cliente, mascota, vacuna y dosis seleccionadas.
      </div>
    )
  }

  return (
    <div className={`rounded-lg border p-3 text-sm ${canSave ? "border-warning/30 bg-warning/10" : "border-destructive/30 bg-destructive/10"}`}>
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="h-4 w-4" />
        Revisar antes de guardar
      </div>
      <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
        {duplicate && <li>Ya existe un registro demo con esta vacuna, dosis, mascota y fecha.</li>}
        {outOfOrder && <li>La dosis seleccionada parece fuera de orden. Marcar carga historica o confirmar manualmente.</li>}
      </ul>
    </div>
  )
}

function VaccinationHistory({ petId }: { petId: number }) {
  const history = buildPetVaccinationHistory(petId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Historial de vacunas
        </CardTitle>
        <CardDescription>Registros demo vinculados a la historia clinica de la mascota.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((record) => (
              <div key={record.id} className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{record.vaccine?.name}</h3>
                  <Badge variant="outline">{record.dose?.name}</Badge>
                  <Badge variant="secondary">{record.origin === "carga_historica" ? "Historico" : "Aplicada hoy"}</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                  <Info label="Aplicada" value={formatDate(record.appliedAt)} />
                  <Info label="Responsable" value={record.appliedBy} />
                  <Info label="Proxima" value={record.next ? `${record.next.dose.name} - ${formatDate(record.next.estimatedAt)}` : "Sin proxima dosis"} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Sin vacunas aplicadas cargadas para esta mascota." />
        )}
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value?: string
  onChange?: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input className="bg-background" value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} />
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
      {text}
    </div>
  )
}
