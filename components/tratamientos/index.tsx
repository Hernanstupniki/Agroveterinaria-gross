"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Calendar, CheckCircle, ClipboardList, Pause, Pill, Plus, Settings, Stethoscope, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { controlFrequencyPresets, durationPresets, reminderPresets } from "@/lib/clinical-presets"
import { clientes, mascotas } from "@/lib/mock-data"
import {
  activeTreatmentsSeed,
  buildActiveTreatmentView,
  calculateTreatmentEndDate,
  calculateNextTreatmentControl,
  formatControlFrequency,
  generateTreatmentControls,
  getTreatmentDurationPreset,
  getTreatmentFrequencyPreset,
  getTreatmentProtocolsForPet,
  getTreatmentReminderPreset,
  treatmentProtocols,
  type TreatmentStatus,
} from "@/lib/treatment-workflow"

const statusStyles: Record<TreatmentStatus, string> = {
  activo: "bg-success text-success-foreground",
  pausado: "bg-warning text-warning-foreground",
  finalizado: "bg-muted text-muted-foreground",
  cancelado: "bg-destructive text-destructive-foreground",
}

function formatDate(date?: string | null) {
  if (!date) return "-"
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

export function TratamientosPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            <Pill className="h-4 w-4" />
            Tratamientos
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-normal">Que queres hacer con tratamientos?</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Registro diario, seguimiento de activos y protocolos del sistema quedan separados para que el uso sea directo.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <ActionCard
          icon={Pill}
          title="Registrar tratamiento"
          description="Seleccionar cliente, mascota, protocolo, fecha de inicio y controles."
          buttonLabel="Registrar tratamiento"
          href="/tratamientos/registrar"
        />
        <ActionCard
          icon={ClipboardList}
          title="Tratamientos activos"
          description="Ver procesos en curso, proximo control y acciones de seguimiento."
          buttonLabel="Ver activos"
          href="/tratamientos/activos"
        />
        <ActionCard
          icon={ClipboardList}
          title="Ver protocolos creados"
          description="Consultar los protocolos de tratamiento ya configurados en el sistema."
          buttonLabel="Ver protocolos"
          href="/tratamientos/protocolos"
        />
        <ActionCard
          icon={Settings}
          title="Crear protocolo"
          description="Configurar un nuevo protocolo de tratamiento con frecuencia de control y recordatorios."
          buttonLabel="Crear protocolo"
          href="/tratamientos/protocolos/crear"
        />
      </div>
    </div>
  )
}

export function TreatmentRegistrationFlow() {
  return (
    <ClinicalActionFlow
      title="Registrar tratamiento"
      description="Primero elegi cliente y mascota; despues carga protocolo, inicio, observaciones y controles."
      actionLabel="Registrar tratamiento"
      icon={Pill}
    >
      {({ client, pet }) => <TreatmentRegistrationForm key={pet.id} client={client} pet={pet} />}
    </ClinicalActionFlow>
  )
}

function TreatmentRegistrationForm({
  client,
  pet,
}: {
  client: { id: number; nombre: string }
  pet: { id: number; nombre: string; especie: string; raza?: string; edad?: string; animalTypeId?: string; breedId?: string | null; lifeStage?: any }
}) {
  const petTaxonomy = useMemo(() => getPetTaxonomy(pet), [pet])
  const availableProtocols = useMemo(() => getTreatmentProtocolsForPet(pet), [pet])
  const compatibleCount = availableProtocols.filter((protocol) => protocolMatchesPet(protocol, petTaxonomy)).length
  const firstProtocolId = availableProtocols[0]?.id || ""
  const [selectedProtocolId, setSelectedProtocolId] = useState(firstProtocolId)
  const [startedAt, setStartedAt] = useState("2026-06-01")
  const selectedProtocol = treatmentProtocols.find((protocol) => protocol.id === selectedProtocolId)
  const nextControl = useMemo(
    () => calculateNextTreatmentControl(startedAt, selectedProtocolId),
    [startedAt, selectedProtocolId],
  )
  const estimatedEndDate = useMemo(
    () => calculateTreatmentEndDate(startedAt, selectedProtocolId),
    [startedAt, selectedProtocolId],
  )
  const generatedControls = useMemo(
    () => generateTreatmentControls(startedAt, selectedProtocolId),
    [startedAt, selectedProtocolId],
  )
  const canSave = Boolean(client.id && pet.id && selectedProtocol && startedAt)

  return (
    <Card className="border-primary/30 bg-primary/5 shadow-sm">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Plus className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl">Registrar tratamiento</CardTitle>
        <CardDescription>
          El tratamiento queda preparado para historia clinica, actividad del dia y seguimiento activo.
        </CardDescription>
      </CardHeader>
      <CardContent className="mx-auto grid w-full max-w-5xl gap-5">
        <div className="rounded-lg border bg-background p-3 text-sm">
          <p className="font-semibold">{client.nombre}</p>
          <p className="text-muted-foreground">
            {pet.nombre} - {pet.especie}
          </p>
        </div>
        <PetTaxonomySummary pet={pet} />
        {compatibleCount === 0 && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
            No hay protocolos compatibles para esta mascota. Podés crear uno desde Protocolos de tratamiento o elegir uno no compatible como demo.
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>Tratamiento / protocolo</Label>
            <Select value={selectedProtocolId} onValueChange={setSelectedProtocolId}>
              <SelectTrigger className="h-12 bg-background">
                <SelectValue placeholder="Seleccionar protocolo" />
              </SelectTrigger>
              <SelectContent>
                {availableProtocols.map((protocol) => (
                  <SelectItem key={protocol.id} value={protocol.id}>
                    {protocol.name} - {protocolMatchesPet(protocol, petTaxonomy) ? "compatible" : "no compatible"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field label="Fecha de inicio" value={startedAt} onChange={setStartedAt} placeholder="AAAA-MM-DD" />
          <Field label="Diagnostico / motivo" placeholder="Diagnostico clinico" />
          <Field label="Responsable" placeholder="Dr./Dra." />
        </div>
        <CompatibilityNotice protocol={selectedProtocol} pet={pet} />

        <Card className="border-primary/25 bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-5 w-5 text-primary" />
              Medicacion indicada
            </CardTitle>
            <CardDescription>Detalle de medicacion, dosis y cada cuanto se administra.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-4">
            <Field label="Medicamento" placeholder="Ej: Miltefosina" />
            <Field label="Dosis" placeholder="Ej: 2 mg/kg" />
            <Field label="Cada cuanto" placeholder="Ej: cada 24 hs" />
            <Field label="Duracion / indicacion" placeholder="Ej: 28 dias o segun control" />
          </CardContent>
        </Card>

        {selectedProtocol && (
          <Card className="border-primary/25 bg-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5 text-primary" />
                Seguimiento preparado
              </CardTitle>
              <CardDescription>Basado en el protocolo {selectedProtocol.name}.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <Info label="Duracion estimada" value={getTreatmentDurationPreset(selectedProtocol).label} />
              <Info
                label="Fecha final"
                value={selectedProtocol.durationType === "lifetime" ? "Sin fecha final automatica" : formatDate(estimatedEndDate)}
              />
              <Info label="Frecuencia de control" value={formatControlFrequency(selectedProtocol)} />
              <Info label="Recordatorio" value={getTreatmentReminderPreset(selectedProtocol).label} />
              <Info label="Proximo control" value={formatDate(nextControl)} />
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 md:col-span-3">
                <p className="font-medium text-primary">Historia clinica y seguimiento activo</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Al guardar, el registro queda preparado para la historia clinica de {pet.nombre}, actividad del dia y controles futuros.
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {generatedControls.slice(0, 6).map((control) => (
                    <Info
                      key={control.id}
                      label={control.title}
                      value={`Control ${formatDate(control.dueDate)} / aviso ${formatDate(control.reminderDate)}`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <Label>Observaciones y seguimiento</Label>
          <Textarea
            className="bg-background"
            placeholder="Evolucion, indicaciones, signos a vigilar, controles o proximas acciones..."
          />
        </div>

        {canSave ? (
          <Button className="h-14 w-full bg-primary text-base font-bold hover:bg-primary/90" asChild>
            <Link href="/">Guardar tratamiento y volver al inicio</Link>
          </Button>
        ) : (
          <Button className="h-14 w-full text-base font-bold" disabled>
            Completar datos para guardar
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function ActiveTreatments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          Tratamientos activos
        </CardTitle>
        <CardDescription>
          Procesos clinicos en curso por cliente y mascota, con acciones directas de seguimiento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 xl:grid-cols-2">
          {activeTreatmentsSeed.map((treatment) => {
            const treatmentView = buildActiveTreatmentView(treatment)
            const client = clientes.find((item) => item.id === treatment.clientId)
            const pet = mascotas.find((item) => item.id === treatment.petId)
            const protocol = treatmentView.protocol

            return (
              <article key={treatment.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{treatment.name}</h3>
                      <Badge className={statusStyles[treatment.status]}>{treatment.status}</Badge>
                      {protocol && <Badge variant="outline">{protocol.name}</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {client?.nombre} - {pet?.nombre}
                    </p>
                  </div>
                  <Badge variant="outline">Control {formatDate(treatmentView.nextControlAt)}</Badge>
                </div>

                <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
                  <Info label="Cliente" value={client?.nombre || "-"} />
                  <Info label="Mascota" value={pet?.nombre || "-"} />
                  <Info label="Inicio" value={formatDate(treatment.startedAt)} />
                  <Info label="Estado" value={treatment.status} />
                  <Info label="Proximo control" value={formatDate(treatmentView.nextControlAt)} />
                  <Info label="Recordatorio" value={formatDate(treatmentView.generatedReminders[0]?.reminderDate)} />
                  <Info label="Observaciones" value={treatment.observations} />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
                  <Button className="min-h-12 rounded-xl bg-primary px-3 py-3 text-center font-bold leading-tight hover:bg-primary/90 whitespace-normal">
                    <Plus className="mr-2 h-4 w-4" />
                    Actualizar avance
                  </Button>
                  <Button className="min-h-12 rounded-xl bg-primary px-3 py-3 text-center font-bold leading-tight hover:bg-primary/90 whitespace-normal">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalizar
                  </Button>
                  <Button className="min-h-12 rounded-xl bg-primary px-3 py-3 text-center font-bold leading-tight hover:bg-primary/90 whitespace-normal">
                    <Pause className="mr-2 h-4 w-4" />
                    Pausar
                  </Button>
                  <Button variant="destructive" className="min-h-12 rounded-xl px-3 py-3 text-center font-bold leading-tight whitespace-normal">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function TreatmentProtocols() {
  return <TreatmentProtocolsList />
}

export function TreatmentProtocolsList() {
  const [filter, setFilter] = useState<ProtocolSearchFilterState>(defaultFilterState())
  const filtered = useMemo(() => filterProtocols(treatmentProtocols, filter), [filter])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Protocolos de tratamiento creados
            </CardTitle>
            <CardDescription>
              Protocolos configurados en el sistema con frecuencia de control, duracion y recordatorios.
            </CardDescription>
          </div>
          <Button className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90" asChild>
            <Link href="/tratamientos/protocolos/crear">
              <Plus className="mr-2 h-4 w-4" />
              Crear protocolo
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProtocolSearchFilter
          filter={filter}
          onFilterChange={setFilter}
          totalCount={treatmentProtocols.length}
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
            {filtered.map((protocol) => (
              <article key={protocol.id} className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{protocol.name}</h3>
                  <Badge className={protocol.active ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                    {protocol.active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{protocol.description}</p>
                <ApplicabilityBadges protocol={protocol} />
                <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                  <Info label="Duracion" value={getTreatmentDurationPreset(protocol).label} />
                  <Info label="Controles" value={getTreatmentFrequencyPreset(protocol).label} />
                  <Info label="Recordatorios" value={getTreatmentReminderPreset(protocol).label} />
                  <Info label="Estados" value={protocol.possibleStates.join(", ")} />
                </div>
                <p className="mt-3 rounded-md bg-muted/35 p-3 text-sm text-muted-foreground">{protocol.indications}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" className="h-11 rounded-xl px-4 font-bold">
                    Desactivar
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function TreatmentProtocolCreator() {
  const [editingProtocolId, setEditingProtocolId] = useState<string | null>(null)
  const editingProtocol = treatmentProtocols.find((protocol) => protocol.id === editingProtocolId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Crear protocolo de tratamiento
        </CardTitle>
        <CardDescription>
          Configuracion del sistema: no depende de cliente ni mascota. Define tratamientos comunes y controles sugeridos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          {editingProtocol && (
            <div className="mb-4 rounded-lg border border-primary/30 bg-background p-3 text-sm">
              Editando protocolo mock: <span className="font-semibold">{editingProtocol.name}</span>.
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Nombre del protocolo" placeholder="Ej: Leishmaniasis" value={editingProtocol?.name} />
            <PresetSelect label="Duracion estimada" placeholder="Seleccionar duracion" items={durationPresets} />
            <PresetSelect label="Frecuencia de controles" placeholder="Seleccionar frecuencia" items={controlFrequencyPresets} />
            <PresetSelect label="Recordatorio" placeholder="Seleccionar recordatorio" items={reminderPresets} />
          </div>
          <div className="mt-4">
            <TaxonomyApplicabilityEditor initial={editingProtocol} />
          </div>
          <div className="mt-4 space-y-2">
            <Label>Indicaciones</Label>
            <Textarea className="bg-background" placeholder="Indicaciones clinicas, controles, estudios o criterios de avance..." />
          </div>
          <Button className="mt-4 h-14 rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            {editingProtocol ? "Guardar cambios del protocolo" : "Crear protocolo de tratamiento"}
          </Button>
          {editingProtocol && (
            <Button variant="outline" className="ml-2 mt-4 h-14 rounded-xl px-6 text-base font-bold" onClick={() => setEditingProtocolId(null)}>
              Cancelar edición
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
        <CardContent className="flex h-full flex-col gap-5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:h-14 sm:w-14">
              <Icon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold leading-tight sm:text-xl">{title}</h2>
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
