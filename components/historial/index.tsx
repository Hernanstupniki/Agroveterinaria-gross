"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  Activity,
  Calendar,
  CalendarDays,
  ChevronDown,
  ClipboardPlus,
  Download,
  FileText,
  FilterX,
  HeartPulse,
  MessageCircle,
  Pill,
  Scissors,
  Search,
  Stethoscope,
  Syringe,
  Weight,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { clientes, mascotas } from "@/lib/mock-data"
import {
  buildGlobalClinicalHistoryMock,
  createConsultationEvent,
  mergeClinicalHistoryEvents,
  readStoredClinicalHistoryEvents,
  writeStoredClinicalHistoryEvents,
  type ClinicalHistoryEvent,
  type ClinicalHistoryEventType,
  type ConsultationDraft,
} from "@/lib/clinical-history-mock"

const eventTypes: ClinicalHistoryEventType[] = [
  "Consulta",
  "Vacuna",
  "Tratamiento",
  "Cirugía",
  "Estudio",
  "Control",
  "Recordatorio",
]

const eventTypeIcons: Record<ClinicalHistoryEventType, typeof Activity> = {
  Consulta: Stethoscope,
  Vacuna: Syringe,
  Tratamiento: Pill,
  Cirugía: Scissors,
  Estudio: FileText,
  Control: HeartPulse,
  Recordatorio: MessageCircle,
}

const eventTypeStyles: Record<ClinicalHistoryEventType, string> = {
  Consulta: "border-primary/30 bg-primary text-primary-foreground",
  Vacuna: "border-success/30 bg-success text-success-foreground",
  Tratamiento: "border-warning/40 bg-warning text-warning-foreground",
  Cirugía: "border-destructive/30 bg-destructive text-destructive-foreground",
  Estudio: "border-secondary/40 bg-secondary text-secondary-foreground",
  Control: "border-primary/25 bg-primary/10 text-primary",
  Recordatorio: "border-secondary/50 bg-secondary/10 text-secondary-foreground",
}

const initialDraft: ConsultationDraft = {
  clientId: clientes[0]?.id || 1,
  petId: mascotas.find((pet) => pet.clienteId === clientes[0]?.id)?.id || mascotas[0]?.id || 1,
  date: "2026-05-30",
  veterinarian: "Dr. García",
  reason: "",
  symptoms: "",
  diagnosis: "",
  treatment: "",
  notes: "",
  weight: "",
  temperature: "",
  nextControlDate: "",
  status: "Registrada",
  attachmentName: "",
}

function formatDate(date?: string | null) {
  if (!date) return "-"
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

function normalize(value?: string | null) {
  return (value || "").toLowerCase().trim()
}

function matchesText(event: ClinicalHistoryEvent, term: string) {
  if (!term) return true
  const haystack = [
    event.petName,
    event.clientName,
    event.eventType,
    event.title,
    event.reason,
    event.symptoms,
    event.diagnosis,
    event.treatment,
    event.veterinarian,
    event.notes,
    event.status,
  ]
    .map((value) => normalize(value))
    .join(" ")

  return haystack.includes(term)
}

export function HistorialPage() {
  const baseEvents = useMemo(() => buildGlobalClinicalHistoryMock(), [])
  const [localEvents, setLocalEvents] = useState<ClinicalHistoryEvent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [petFilter, setPetFilter] = useState("todos")
  const [clientFilter, setClientFilter] = useState("todos")
  const [typeFilter, setTypeFilter] = useState("todos")
  const [vetFilter, setVetFilter] = useState("todos")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [draft, setDraft] = useState<ConsultationDraft>(initialDraft)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  useEffect(() => {
    setLocalEvents(readStoredClinicalHistoryEvents())
  }, [])

  const allEvents = useMemo(
    () => mergeClinicalHistoryEvents(baseEvents, localEvents),
    [baseEvents, localEvents],
  )

  const veterinarians = useMemo(
    () => Array.from(new Set(allEvents.map((event) => event.veterinarian).filter(Boolean))).sort(),
    [allEvents],
  )

  const statuses = useMemo(
    () => Array.from(new Set(allEvents.map((event) => event.status).filter(Boolean))).sort(),
    [allEvents],
  )

  const filteredPets = useMemo(() => {
    if (clientFilter === "todos") return mascotas
    return mascotas.filter((pet) => pet.clienteId === Number(clientFilter))
  }, [clientFilter])

  const filteredEvents = useMemo(() => {
    const term = normalize(searchTerm)
    return allEvents.filter((event) => {
      const matchesPet = petFilter === "todos" || event.petId === Number(petFilter)
      const matchesClient = clientFilter === "todos" || event.clientId === Number(clientFilter)
      const matchesType = typeFilter === "todos" || event.eventType === typeFilter
      const matchesVet = vetFilter === "todos" || event.veterinarian === vetFilter
      const matchesStatus = statusFilter === "todos" || event.status === statusFilter
      const matchesFrom = !dateFrom || event.date >= dateFrom
      const matchesTo = !dateTo || event.date <= dateTo

      return (
        matchesPet &&
        matchesClient &&
        matchesType &&
        matchesVet &&
        matchesStatus &&
        matchesFrom &&
        matchesTo &&
        matchesText(event, term)
      )
    })
  }, [allEvents, clientFilter, dateFrom, dateTo, petFilter, searchTerm, statusFilter, typeFilter, vetFilter])

  const draftPets = mascotas.filter((pet) => pet.clienteId === draft.clientId)

  const clearFilters = () => {
    setSearchTerm("")
    setPetFilter("todos")
    setClientFilter("todos")
    setTypeFilter("todos")
    setVetFilter("todos")
    setStatusFilter("todos")
    setDateFrom("")
    setDateTo("")
  }

  const updateDraft = <K extends keyof ConsultationDraft>(key: K, value: ConsultationDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const handleDraftClientChange = (clientId: string) => {
    const nextClientId = Number(clientId)
    const firstPet = mascotas.find((pet) => pet.clienteId === nextClientId)
    setDraft((current) => ({
      ...current,
      clientId: nextClientId,
      petId: firstPet?.id || current.petId,
    }))
  }

  const saveConsultation = () => {
    if (!draft.clientId || !draft.petId || !draft.reason.trim()) return

    const event = createConsultationEvent(draft)
    const nextLocalEvents = [event, ...localEvents]
    setLocalEvents(nextLocalEvents)
    writeStoredClinicalHistoryEvents(nextLocalEvents)
    setExpandedIds((current) => [event.id, ...current])
    setLastSaved(`Consulta agregada para ${event.petName}`)
    setDraft({
      ...initialDraft,
      clientId: draft.clientId,
      petId: draft.petId,
      veterinarian: draft.veterinarian,
    })
    setIsDialogOpen(false)
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-semibold text-primary">
              <Activity className="h-4 w-4" />
              Registro clínico global
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-normal">Historial Clínico</h1>
              <p className="mt-2 max-w-3xl text-muted-foreground">
                Registro completo de consultas, vacunas, tratamientos, estudios, cirugías y controles.
              </p>
            </div>
            {lastSaved && (
              <p className="rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-sm font-semibold text-success">
                {lastSaved}
              </p>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="min-h-16 rounded-2xl bg-primary px-7 py-4 text-lg font-bold leading-tight shadow-md shadow-primary/20 hover:bg-primary/90">
                <ClipboardPlus className="mr-3 h-6 w-6 shrink-0" />
                Agregar consulta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar consulta clínica</DialogTitle>
                <DialogDescription>
                  Registro mock/frontend. Al guardar se agrega al historial global y a la historia clínica de la mascota en esta sesión.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 py-2">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Cliente">
                    <Select value={String(draft.clientId)} onValueChange={handleDraftClientChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((client) => (
                          <SelectItem key={client.id} value={String(client.id)}>
                            {client.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Mascota">
                    <Select value={String(draft.petId)} onValueChange={(value) => updateDraft("petId", Number(value))}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar mascota" />
                      </SelectTrigger>
                      <SelectContent>
                        {draftPets.map((pet) => (
                          <SelectItem key={pet.id} value={String(pet.id)}>
                            {pet.nombre} · {pet.especie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Fecha de consulta">
                    <Input type="date" value={draft.date} onChange={(event) => updateDraft("date", event.target.value)} />
                  </Field>

                  <Field label="Veterinario/responsable">
                    <Input value={draft.veterinarian} onChange={(event) => updateDraft("veterinarian", event.target.value)} placeholder="Dr./Dra." />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Motivo de consulta">
                    <Input value={draft.reason} onChange={(event) => updateDraft("reason", event.target.value)} placeholder="Ej: control general, decaimiento, lesión..." />
                  </Field>
                  <Field label="Estado de la consulta">
                    <Select value={draft.status} onValueChange={(value) => updateDraft("status", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Registrada">Registrada</SelectItem>
                        <SelectItem value="En seguimiento">En seguimiento</SelectItem>
                        <SelectItem value="Resuelta">Resuelta</SelectItem>
                        <SelectItem value="Control pendiente">Control pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Síntomas">
                    <Textarea value={draft.symptoms} onChange={(event) => updateDraft("symptoms", event.target.value)} placeholder="Síntomas observados o relatados..." />
                  </Field>
                  <Field label="Diagnóstico">
                    <Textarea value={draft.diagnosis} onChange={(event) => updateDraft("diagnosis", event.target.value)} placeholder="Diagnóstico presuntivo o confirmado..." />
                  </Field>
                  <Field label="Tratamiento indicado">
                    <Textarea value={draft.treatment} onChange={(event) => updateDraft("treatment", event.target.value)} placeholder="Medicación, dosis, frecuencia, indicaciones..." />
                  </Field>
                  <Field label="Observaciones">
                    <Textarea value={draft.notes} onChange={(event) => updateDraft("notes", event.target.value)} placeholder="Notas clínicas, conducta en casa, evolución esperada..." />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Peso">
                    <Input value={draft.weight} onChange={(event) => updateDraft("weight", event.target.value)} placeholder="Kg" />
                  </Field>
                  <Field label="Temperatura">
                    <Input value={draft.temperature} onChange={(event) => updateDraft("temperature", event.target.value)} placeholder="°C" />
                  </Field>
                  <Field label="Próximo control">
                    <Input type="date" value={draft.nextControlDate} onChange={(event) => updateDraft("nextControlDate", event.target.value)} />
                  </Field>
                  <Field label="Archivo mock">
                    <Input value={draft.attachmentName} onChange={(event) => updateDraft("attachmentName", event.target.value)} placeholder="ej: informe.pdf" />
                  </Field>
                </div>

                <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
                  <Button variant="outline" className="h-12 rounded-xl px-5" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    className="h-12 rounded-xl bg-primary px-6 text-base font-bold hover:bg-primary/90"
                    onClick={saveConsultation}
                    disabled={!draft.reason.trim()}
                  >
                    Guardar consulta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Búsqueda y filtros
          </CardTitle>
          <CardDescription>Buscá por mascota, dueño, diagnóstico, tratamiento, veterinario u observaciones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(170px,1fr))]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-11 pl-10"
                placeholder="Buscar en historial..."
              />
            </div>

            <Select value={clientFilter} onValueChange={(value) => {
              setClientFilter(value)
              setPetFilter("todos")
            }}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los clientes</SelectItem>
                {clientes.map((client) => (
                  <SelectItem key={client.id} value={String(client.id)}>
                    {client.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={petFilter} onValueChange={setPetFilter}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Mascota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las mascotas</SelectItem>
                {filteredPets.map((pet) => (
                  <SelectItem key={pet.id} value={String(pet.id)}>
                    {pet.nombre} · {pet.especie}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
            <Select value={vetFilter} onValueChange={setVetFilter}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Veterinario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los veterinarios</SelectItem>
                {veterinarians.map((vet) => (
                  <SelectItem key={vet} value={vet}>
                    {vet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status || "sin-estado"}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="h-11" aria-label="Fecha desde" />
            <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="h-11" aria-label="Fecha hasta" />

            <Button variant="outline" className="h-11 rounded-xl px-4" onClick={clearFilters}>
              <FilterX className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-muted-foreground">
          {filteredEvents.length} registros encontrados
        </p>
        <p className="text-xs text-muted-foreground">
          Datos demo/mock: consultas locales + eventos clínicos generados desde vacunas, tratamientos, cirugías, estudios y recordatorios.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Línea de tiempo clínica
          </CardTitle>
          <CardDescription>Eventos de todas las mascotas, ordenados por fecha.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          {filteredEvents.length > 0 ? (
            <div className="relative">
              <div className="absolute bottom-0 left-4 top-0 w-px bg-border" />
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <HistoryTimelineItem
                    key={event.id}
                    event={event}
                    isExpanded={expandedIds.includes(event.id)}
                    onToggle={() => toggleExpanded(event.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <Activity className="mx-auto h-9 w-9 text-muted-foreground" />
              <p className="mt-3 font-bold">No hay registros con esos filtros</p>
              <p className="text-sm text-muted-foreground">Probá limpiar filtros o buscar por otro dato clínico.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function HistoryTimelineItem({
  event,
  isExpanded,
  onToggle,
}: {
  event: ClinicalHistoryEvent
  isExpanded: boolean
  onToggle: () => void
}) {
  const Icon = eventTypeIcons[event.eventType] || Activity
  const colorClass = eventTypeStyles[event.eventType]

  return (
    <article className="relative pl-11">
      <div className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={colorClass}>{event.eventType}</Badge>
              {event.status && <Badge variant="outline">{event.status}</Badge>}
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(event.date)}
              </span>
            </div>
            <h3 className="mt-2 text-base font-bold">{event.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {event.petName} · {event.clientName} · {event.veterinarian}
            </p>
            {(event.reason || event.diagnosis) && (
              <p className="mt-2 line-clamp-2 text-sm">
                {event.reason || event.diagnosis}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button variant="outline" className="h-10 rounded-xl" onClick={onToggle}>
              Ver detalle
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
            <Button className="h-10 rounded-xl bg-primary px-4 font-bold hover:bg-primary/90" asChild>
              <Link href={`/mascotas/${event.petId}`}>Ver ficha de mascota</Link>
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 border-t pt-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Detail label="Mascota" value={event.petName} />
              <Detail label="Cliente/dueño" value={event.clientName} />
              <Detail label="Veterinario" value={event.veterinarian} />
              {event.reason && <Detail label="Motivo" value={event.reason} />}
              {event.symptoms && <Detail label="Síntomas" value={event.symptoms} />}
              {event.diagnosis && <Detail label="Diagnóstico" value={event.diagnosis} />}
              {event.treatment && <Detail label="Tratamiento" value={event.treatment} />}
              {event.weight && <Detail label="Peso" value={`${event.weight} kg`} icon={Weight} />}
              {event.temperature && <Detail label="Temperatura" value={`${event.temperature} °C`} />}
              {event.nextControlDate && <Detail label="Próximo control" value={formatDate(event.nextControlDate)} />}
            </div>

            {event.notes && (
              <div className="mt-3 rounded-xl bg-muted/45 p-3 text-sm">
                <p className="font-semibold text-muted-foreground">Observaciones</p>
                <p className="mt-1">{event.notes}</p>
              </div>
            )}

            {event.attachmentName && (
              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Ver archivo mock
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function Detail({ label, value, icon: Icon }: { label: string; value?: string; icon?: typeof Activity }) {
  if (!value) return null

  return (
    <div className="rounded-xl bg-muted/35 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {value}
      </p>
    </div>
  )
}
