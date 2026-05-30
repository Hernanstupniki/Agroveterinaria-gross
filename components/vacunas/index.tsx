"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
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
import { durationPresets, reminderPresets } from "@/lib/clinical-presets"
import { clientes, mascotas } from "@/lib/mock-data"
import {
  buildPetVaccinationHistory,
  buildPetVaccineSchedule,
  buildReminderForSchedule,
  calculateNextDose,
  formatInterval,
  getActiveVaccinesForSpecies,
  getDoseIntervalPreset,
  getDosesForVaccine,
  getSchemeReminderPreset,
  vaccineDoses,
  vaccineSchemes,
} from "@/lib/vaccine-workflow"

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
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            <Syringe className="h-4 w-4" />
            Vacunas
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-normal">Que queres hacer con vacunas?</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Registro clinico diario, control de pendientes y configuracion de esquemas quedan separados para que no se mezclen tareas.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ActionCard
          icon={Syringe}
          title="Registrar vacuna"
          description="Seleccionar cliente, mascota, vacuna, dosis y fecha de aplicacion."
          buttonLabel="Registrar vacuna"
          href="/vacunas/registrar"
        />
        <ActionCard
          icon={ClipboardList}
          title="Vacunas pendientes"
          description="Ver proximas dosis, pendientes y vencidas de todas las mascotas."
          buttonLabel="Ver pendientes"
          href="/vacunas/pendientes"
        />
        <ActionCard
          icon={Settings}
          title="Esquemas de vacunacion"
          description="Configurar vacunas, dosis, intervalos y refuerzos por especie."
          buttonLabel="Abrir esquemas"
          href="/vacunas/esquemas"
        />
      </div>
    </div>
  )
}

export function VaccineRegistrationFlow() {
  return (
    <ClinicalActionFlow
      title="Registrar vacuna"
      description="Primero elegi cliente y mascota; despues carga vacuna, dosis, fecha y origen del registro."
      actionLabel="Registrar vacuna"
      icon={Syringe}
    >
      {({ client, pet }) => <VaccineRegistrationForm key={pet.id} client={client} pet={pet} />}
    </ClinicalActionFlow>
  )
}

function VaccineRegistrationForm({
  client,
  pet,
}: {
  client: { id: number; nombre: string }
  pet: { id: number; nombre: string; especie: string; raza: string }
}) {
  const speciesVaccines = useMemo(() => getActiveVaccinesForSpecies(pet.especie), [pet.especie])
  const availableVaccines = speciesVaccines.length > 0 ? speciesVaccines : vaccineSchemes.filter((scheme) => scheme.active)
  const firstVaccineId = availableVaccines[0]?.id || ""
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
  const nextDose = selectedVaccine && selectedDose ? calculateNextDose(selectedVaccine.id, selectedDose.id, appliedAt) : null
  const previousDose = selectedDoses.find((dose) => selectedDose && dose.order === selectedDose.order - 1)
  const hasPreviousDose = previousDose ? history.some((record) => record.doseId === previousDose.id) : true
  const duplicateDose = history.some(
    (record) => record.vaccineId === selectedVaccineId && record.doseId === effectiveDoseId && record.appliedAt === appliedAt,
  )
  const outOfOrder = Boolean(previousDose && !hasPreviousDose)
  const canSave = Boolean(
    selectedVaccine &&
      selectedDose &&
      appliedAt &&
      !duplicateDose &&
      (!outOfOrder || origin === "carga_historica" || manualConfirm),
  )

  return (
    <div className="space-y-5">
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
                  {availableVaccines.map((scheme) => (
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
                <Info
                  label="Recordatorio"
                  value={nextDose?.reminder.reminderDate ? formatDate(nextDose.reminder.reminderDate) : "Sin fecha calculable"}
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

          {canSave ? (
            <Button className="h-14 w-full bg-primary text-base font-bold hover:bg-primary/90" asChild>
              <Link href="/">Guardar vacuna y volver al inicio</Link>
            </Button>
          ) : (
            <Button className="h-14 w-full text-base font-bold" disabled>
              Completar validaciones para guardar
            </Button>
          )}
        </CardContent>
      </Card>

      <VaccinationHistory petId={pet.id} />
    </div>
  )
}

export function PendingVaccines() {
  const pendingItems = mascotas.flatMap((pet) =>
    buildPetVaccineSchedule(pet.id).map((item) => ({
      ...item,
      pet,
      client: clientes.find((cliente) => cliente.id === pet.clienteId),
      scheme: vaccineSchemes.find((vaccine) => vaccine.id === item.vaccineId),
      dose: vaccineDoses.find((vaccineDose) => vaccineDose.id === item.doseId),
      reminder: buildReminderForSchedule(item),
    })),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Vacunas pendientes
        </CardTitle>
        <CardDescription>
          Pendientes, proximas y vencidas calculadas desde esquemas configurados. Desde aca se puede registrar directamente una dosis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingItems.length > 0 ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {pendingItems.map((item) => (
              <article
                key={item.id}
                className={`rounded-xl border p-4 ${
                  item.status === "vencida" ? "border-destructive/40 bg-destructive/5" : "bg-card"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{item.scheme?.name}</h3>
                      <Badge className={scheduleStatusStyles[item.status]}>{item.status}</Badge>
                      <Badge variant="outline">{item.dose?.name}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.client?.nombre} - {item.pet.nombre}
                    </p>
                  </div>
                  <Button className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90" asChild>
                    <Link href={`/vacunas/registrar?clienteId=${item.client?.id || ""}&mascotaId=${item.pet.id}`}>
                      Registrar esta dosis
                    </Link>
                  </Button>
                </div>
                <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
                  <Info label="Cliente" value={item.client?.nombre || "-"} />
                  <Info label="Mascota" value={item.pet.nombre} />
                  <Info label="Fecha estimada" value={formatDate(item.estimatedAt)} />
                  <Info label="Estado" value={item.status} />
                  <Info label="Recordatorio" value={item.reminder.reminderDate ? formatDate(item.reminder.reminderDate) : item.reminder.status} />
                  <Info label="Origen" value="Calendario demo" />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState text="No hay vacunas pendientes calculadas con los datos demo actuales." />
        )}
      </CardContent>
    </Card>
  )
}

export function VaccineSchemes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Esquemas de vacunacion
        </CardTitle>
        <CardDescription>
          Configuracion del sistema: no depende de cliente ni mascota. Define vacunas, dosis, intervalos y refuerzos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Nombre de vacuna" placeholder="Ej: Vacuna X" />
            <PresetSelect
              label="Especie / tipo animal"
              placeholder="Seleccionar especie"
              items={["Perro", "Gato", "Otro"].map((label) => ({ id: label, label }))}
            />
            <PresetSelect
              label="Intervalo entre dosis"
              placeholder="Seleccionar intervalo"
              items={durationPresets.filter((preset) => preset.unit !== "lifetime")}
            />
            <PresetSelect
              label="Recordatorio"
              placeholder="Seleccionar recordatorio"
              items={reminderPresets}
            />
            <PresetSelect
              label="Estado del esquema"
              placeholder="Seleccionar estado"
              items={[
                { id: "activo", label: "Activo" },
                { id: "inactivo", label: "Inactivo" },
              ]}
            />
          </div>
          <div className="mt-4 space-y-2">
            <Label>Observaciones</Label>
            <Textarea className="bg-background" placeholder="Indicaciones generales del esquema..." />
          </div>
          <Button className="mt-4 h-14 rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Crear esquema de vacunacion
          </Button>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {vaccineSchemes.map((scheme) => {
            const doses = getDosesForVaccine(scheme.id)
            const reminderPreset = getSchemeReminderPreset(scheme)
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
                <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                  <Info label="Recordatorio" value={reminderPreset.label} />
                  <Info label="Observaciones" value={scheme.observations} />
                </div>
                <div className="mt-3 space-y-2">
                  {doses.map((dose) => (
                    <div key={dose.id} className="rounded-md bg-muted/35 p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{dose.name}</span>
                        <Badge variant="outline">Orden {dose.order}</Badge>
                        {dose.recurrent && <Badge className="bg-primary text-primary-foreground">Recurrente</Badge>}
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        Intervalo: {formatInterval(getDoseIntervalPreset(dose))}
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
  )
}

function ActionCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  href,
}: {
  icon: LucideIcon
  title: string
  description: string
  buttonLabel: string
  href: string
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
        <CardContent className="flex h-full flex-col gap-5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="mt-auto flex h-14 items-center justify-center rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground group-hover:bg-primary/90">
            <span className="text-center leading-tight">{buttonLabel}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function PatientSummary({ client, pet }: { client: { nombre: string }; pet: { nombre: string; especie: string; raza: string } }) {
  return (
    <div className="rounded-lg border bg-background p-3 text-sm">
      <p className="font-semibold">{client.nombre}</p>
      <p className="text-muted-foreground">
        {pet.nombre} - {pet.especie} - {pet.raza}
      </p>
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

function PresetSelect({
  label,
  placeholder,
  items,
}: {
  label: string
  placeholder: string
  items: { id: string; label: string }[]
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select defaultValue={items[0]?.id}>
        <SelectTrigger className="h-12 bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/35 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-words font-medium leading-tight">{value}</p>
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
