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
  Trash2,
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
import { ProtocolSearchFilter, defaultFilterState, filterProtocols, type ProtocolSearchFilterState } from "@/components/clinical/protocol-search-filter"
import { ApplicabilityBadges, CompatibilityNotice, PetTaxonomySummary, TaxonomyApplicabilityEditor } from "@/components/clinical/taxonomy-controls"
import { getPetTaxonomy, protocolMatchesPet } from "@/lib/animal-taxonomy"
import { durationPresets, reminderPresets } from "@/lib/clinical-presets"
import { clientes, mascotas } from "@/lib/mock-data"
import {
  buildPetVaccinationHistory,
  buildVaccineDisplayList,
  calculateNextDose,
  formatInterval,
  formatOverdueText,
  getDoseIntervalPreset,
  getDosesForVaccine,
  getSchemeReminderPreset,
  getVaccineDisplayGroups,
  getVaccineGroupLabel,
  getVaccineStatusBadgeStyle,
  getVaccinesForPet,
  type VaccineDisplayItem,
  type VaccineDisplayStatus,
  vaccineDoses,
  vaccineSchemes,
} from "@/lib/vaccine-workflow"

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          icon={ClipboardList}
          title="Ver esquemas creados"
          description="Consultar los esquemas de vacunacion ya configurados en el sistema."
          buttonLabel="Ver esquemas"
          href="/vacunas/esquemas"
        />
        <ActionCard
          icon={Settings}
          title="Crear esquema"
          description="Configurar un nuevo esquema de vacunacion con dosis, intervalos y refuerzos."
          buttonLabel="Crear esquema"
          href="/vacunas/esquemas/crear"
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
  pet: { id: number; nombre: string; especie: string; raza: string; edad?: string; animalTypeId?: string; breedId?: string | null; lifeStage?: any }
}) {
  const petTaxonomy = useMemo(() => getPetTaxonomy(pet), [pet])
  const availableVaccines = useMemo(() => getVaccinesForPet(pet), [pet])
  const compatibleCount = availableVaccines.filter((scheme) => protocolMatchesPet(scheme, petTaxonomy)).length
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
          <PetTaxonomySummary pet={pet} />
          {compatibleCount === 0 && (
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              No hay esquemas compatibles para esta mascota. Podés crear uno desde Esquemas de vacunación o elegir uno no compatible como demo.
            </div>
          )}

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
                      {scheme.name} - {protocolMatchesPet(scheme, petTaxonomy) ? "compatible" : "no compatible"}
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
          <CompatibilityNotice protocol={selectedVaccine} pet={pet} />

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
  const allItems = mascotas.flatMap((pet) =>
    buildVaccineDisplayList(pet.id).map((item) => ({
      ...item,
      pet,
      client: clientes.find((cliente) => cliente.id === pet.clienteId),
    })),
  )

  const pendingItems = allItems.filter((item) => item.status !== "aplicada")

  const statusLabelMap: Record<VaccineDisplayStatus, string> = {
    aplicada: "Aplicada",
    proxima: "Proxima",
    pendiente: "Pendiente",
    vencida: "Vencida",
    historial_desconocido: "Historial desconocido",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Vacunas pendientes
        </CardTitle>
        <CardDescription>
          Vencidas, pendientes, proximas e historial desconocido calculadas desde esquemas y registros. Desde aca se puede registrar directamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingItems.length > 0 ? (
          <div className="space-y-6">
            {getVaccineDisplayGroups()
              .filter((status) => status !== "aplicada")
              .map((status) => {
                const itemsByStatus = pendingItems.filter((item) => item.status === status)
                if (itemsByStatus.length === 0) return null
                return (
                  <div key={status} className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">{getVaccineGroupLabel(status)}</h3>
                      <Badge variant="outline">{itemsByStatus.length}</Badge>
                    </div>
                    <div className="grid gap-3 xl:grid-cols-2">
                      {itemsByStatus.map((item) => {
                        const style = getVaccineStatusBadgeStyle(item.status)
                        const overdueText = formatOverdueText(item.overdueDays)
                        return (
                          <article key={item.id} className={`rounded-xl border p-4 ${style.card}`}>
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-bold">{item.vaccineName}</h3>
                                  <Badge className={style.badge}>{statusLabelMap[item.status]}</Badge>
                                  {item.doseName && <Badge variant="outline">{item.doseName}</Badge>}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {item.client?.nombre} - {item.pet.nombre}
                                </p>
                                {overdueText && (
                                  <p className="mt-1 text-sm font-semibold text-destructive">{overdueText}</p>
                                )}
                                {item.blockedByPreviousDose && (
                                  <p className="mt-1 text-sm font-medium text-warning">Dosis anterior no registrada.</p>
                                )}
                              </div>
                              <div className="flex shrink-0 flex-wrap gap-2">
                                {item.canRegister ? (
                                  <Button className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90" asChild>
                                    <Link href={`/vacunas/registrar?clienteId=${item.client?.id || ""}&mascotaId=${item.pet.id}`}>
                                      {item.actionLabel}
                                    </Link>
                                  </Button>
                                ) : (
                                  <Button className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90" asChild>
                                    <Link href={`/vacunas/registrar?clienteId=${item.client?.id || ""}&mascotaId=${item.pet.id}`}>
                                      {item.actionLabel}
                                    </Link>
                                  </Button>
                                )}
                                {item.secondaryActionLabel && (
                                  <Button variant="outline" className="h-12 rounded-xl">
                                    {item.secondaryActionLabel}
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
                              <Info label="Cliente" value={item.client?.nombre || "-"} />
                              <Info label="Mascota" value={item.pet.nombre} />
                              {item.estimatedAt && <Info label="Fecha esperada" value={formatDate(item.estimatedAt)} />}
                              {item.appliedAt && <Info label="Aplicada" value={formatDate(item.appliedAt)} />}
                              {item.reminderDate && <Info label="Recordatorio" value={formatDate(item.reminderDate)} />}
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <EmptyState text="No hay vacunas pendientes calculadas con los datos demo actuales." />
        )}
      </CardContent>
    </Card>
  )
}

export function VaccineSchemes() {
  return <VaccineSchemesList />
}

export function VaccineSchemesList() {
  const [filter, setFilter] = useState<ProtocolSearchFilterState>(defaultFilterState())
  const filtered = useMemo(() => filterProtocols(vaccineSchemes, filter), [filter])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Esquemas de vacunacion creados
            </CardTitle>
            <CardDescription>
              Esquemas configurados en el sistema con dosis, intervalos y refuerzos por especie.
            </CardDescription>
          </div>
          <Button className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90" asChild>
            <Link href="/vacunas/esquemas/crear">
              <Plus className="mr-2 h-4 w-4" />
              Crear esquema
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProtocolSearchFilter
          filter={filter}
          onFilterChange={setFilter}
          totalCount={vaccineSchemes.length}
          filteredCount={filtered.length}
        />
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">No se encontraron protocolos con esos filtros.</p>
            <Button variant="outline" className="mt-3 h-10 rounded-xl" onClick={() => setFilter(defaultFilterState())}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {filtered.map((scheme) => {
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
                  <ApplicabilityBadges protocol={scheme} />
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
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" className="h-11 rounded-xl px-4 font-bold">
                      Desactivar
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function VaccineSchemeCreator() {
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null)
  const editingScheme = vaccineSchemes.find((scheme) => scheme.id === editingSchemeId)
  const [doseRows, setDoseRows] = useState([
    { id: "dose-form-1", name: "Dosis 1", intervalPresetId: "1-day", recurrent: false, nameEdited: false },
    { id: "dose-form-2", name: "Dosis 2", intervalPresetId: "2-weeks", recurrent: false, nameEdited: false },
    { id: "dose-form-3", name: "Dosis 3", intervalPresetId: "6-weeks", recurrent: false, nameEdited: false },
  ])

  function addDose() {
    setDoseRows((rows) => {
      const nextOrder = rows.length + 1
      return [
        ...rows,
        { id: `dose-form-${nextOrder}`, name: `Dosis ${nextOrder}`, intervalPresetId: "2-weeks", recurrent: false, nameEdited: false },
      ]
    })
  }

  function removeDose(id: string) {
    setDoseRows((rows) => {
      const filtered = rows.filter((r) => r.id !== id)
      return filtered.map((row, index) => {
        const defaultName = `Dosis ${index + 1}`
        const newName = row.nameEdited ? row.name : defaultName
        return { ...row, name: newName }
      })
    })
  }

  function updateDoseName(id: string, value: string, wasEdited: boolean) {
    setDoseRows((rows) =>
      rows.map((item) => (item.id === id ? { ...item, name: value, nameEdited: value !== "" && wasEdited } : item)),
    )
  }

  function reorderDoseNames() {
    setDoseRows((rows) =>
      rows.map((row, index) => {
        const defaultName = `Dosis ${index + 1}`
        const newName = row.nameEdited ? row.name : defaultName
        return { ...row, name: newName }
      }),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Crear esquema de vacunacion
        </CardTitle>
        <CardDescription>
          Configuracion del sistema: no depende de cliente ni mascota. Define vacunas, dosis, intervalos y refuerzos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          {editingScheme && (
            <div className="mb-4 rounded-lg border border-primary/30 bg-background p-3 text-sm">
              Editando esquema mock: <span className="font-semibold">{editingScheme.name}</span>. Los cambios quedan como demo visual de esta sesion.
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Nombre de vacuna" placeholder="Ej: Vacuna X" value={editingScheme?.name} />
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
          <div className="mt-4">
            <TaxonomyApplicabilityEditor initial={editingScheme} />
          </div>

          <div className="mt-6 rounded-xl border bg-background p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Dosis e intervalos del esquema</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Agrega las dosis del esquema. Cada dosis puede tener su propio intervalo. Si una dosis se repite en el tiempo, marcala como refuerzo recurrente.
              </p>
            </div>

            <div className="space-y-3">
              {doseRows.map((row, index) => {
                const isFirst = index === 0
                const defaultName = `Dosis ${index + 1}`
                return (
                  <div key={row.id} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                          {index + 1}
                        </div>
                        <h4 className="font-semibold">{row.nameEdited ? row.name : defaultName}</h4>
                      </div>
                      {doseRows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            removeDose(row.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Nombre"
                        placeholder={defaultName}
                        value={row.nameEdited ? row.name : ""}
                        onChange={(value) => updateDoseName(row.id, value, true)}
                      />
                      {isFirst ? (
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <div className="flex h-12 items-center rounded-md border bg-muted/50 px-3 text-sm font-medium text-muted-foreground">
                            Primera aplicacion — sin intervalo previo
                          </div>
                          <p className="text-xs text-muted-foreground">
                            La primera dosis se aplica en la fecha de inicio del esquema.
                          </p>
                        </div>
                      ) : (
                        <PresetSelect
                          label={`Intervalo desde ${index === 1 ? "Dosis 1" : `Dosis ${index}`}`}
                          placeholder="Seleccionar intervalo"
                          value={row.intervalPresetId}
                          onValueChange={(value) =>
                            setDoseRows((rows) => rows.map((item) => (item.id === row.id ? { ...item, intervalPresetId: value } : item)))
                          }
                          items={durationPresets.filter((preset) => preset.unit !== "lifetime")}
                        />
                      )}
                    </div>

                    <div className="mt-3 rounded-lg border bg-muted/30 p-3">
                      <label className="flex items-start gap-3 text-sm">
                        <Checkbox
                          checked={row.recurrent}
                          onCheckedChange={(checked) =>
                            setDoseRows((rows) => rows.map((item) => (item.id === row.id ? { ...item, recurrent: Boolean(checked) } : item)))
                          }
                        />
                        <div>
                          <span className="font-medium">Es refuerzo recurrente</span>
                          <p className="mt-0.5 text-muted-foreground">
                            Usalo para refuerzos que se repiten en el tiempo, por ejemplo una vacuna anual.
                          </p>
                          {row.recurrent && (
                            <div className="mt-2">
                              <PresetSelect
                                label="Repetir cada"
                                placeholder="Seleccionar intervalo de repeticion"
                                value={row.intervalPresetId}
                                onValueChange={(value) =>
                                  setDoseRows((rows) => rows.map((item) => (item.id === row.id ? { ...item, intervalPresetId: value } : item)))
                                }
                                items={durationPresets.filter((preset) => preset.unit === "months" || preset.unit === "years")}
                              />
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-4 h-11 w-full rounded-xl border-dashed font-bold"
              onClick={addDose}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar dosis
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            <Label>Observaciones</Label>
            <Textarea className="bg-background" placeholder="Indicaciones generales del esquema..." />
          </div>
          <Button className="mt-4 h-14 rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            {editingScheme ? "Guardar cambios del esquema" : "Crear esquema de vacunacion"}
          </Button>
          {editingScheme && (
            <Button variant="outline" className="ml-2 mt-4 h-14 rounded-xl px-6 text-base font-bold" onClick={() => setEditingSchemeId(null)}>
              Cancelar edicion
            </Button>
          )}
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
    <Link href={href} className="group block min-w-0">
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
        <CardContent className="flex h-full flex-col gap-5 p-5 xl:p-4 2xl:p-5">
          <div className="flex flex-col gap-4 sm:flex-row xl:flex-col 2xl:flex-row">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:h-14 sm:w-14">
              <Icon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold leading-tight 2xl:text-xl">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="mt-auto inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 py-3 text-center text-base font-bold leading-tight text-primary-foreground group-hover:bg-primary/90 whitespace-normal">
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
      <Input
        className="bg-background"
        value={onChange ? value || "" : undefined}
        defaultValue={!onChange ? value : undefined}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function PresetSelect({
  label,
  placeholder,
  value,
  onValueChange,
  items,
}: {
  label: string
  placeholder: string
  value?: string
  onValueChange?: (value: string) => void
  items: { id: string; label: string }[]
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} defaultValue={items[0]?.id} onValueChange={onValueChange}>
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
