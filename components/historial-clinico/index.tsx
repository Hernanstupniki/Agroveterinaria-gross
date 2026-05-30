"use client"

import { useCallback, useMemo, useState } from "react"
import { ClipboardList, Clock, Download, FileText, MessageCircle, Pill, Plus, Scissors, Search, Stethoscope, Syringe, X, Activity, ArrowLeft } from "lucide-react"
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
import {
  addConsultationFromDraft,
  buildClinicalTimeline,
  searchClinicalTimeline,
  type ClinicalTimelineEvent,
  type ConsultationDraft,
  CLINICAL_HISTORY_EVENT_TYPES,
  VETERINARIANS,
} from "@/lib/clinical-history-builder"

const estadoColors: Record<string, string> = {
  Saludable: "bg-success text-success-foreground",
  "En tratamiento": "bg-warning text-warning-foreground",
  "Vacuna vencida": "bg-destructive text-destructive-foreground",
  "Control pendiente": "bg-secondary text-secondary-foreground",
  "Cirugía programada": "bg-primary text-primary-foreground",
}

const tipoEventoIcons: Record<string, typeof Activity> = {
  Consulta: Stethoscope,
  Vacuna: Syringe,
  Estudio: FileText,
  Cirugía: Scissors,
  Tratamiento: Pill,
  Control: Clock,
  Recordatorio: MessageCircle,
}

const tipoEventoColors: Record<string, string> = {
  Consulta: "border-primary/30 bg-primary text-primary-foreground",
  Vacuna: "border-success/30 bg-success text-success-foreground",
  Estudio: "border-secondary/40 bg-secondary text-secondary-foreground",
  Cirugía: "border-destructive/30 bg-destructive text-destructive-foreground",
  Tratamiento: "border-warning/40 bg-warning text-warning-foreground",
  Control: "border-primary/20 bg-primary/5 text-primary",
  Recordatorio: "border-secondary/40 bg-secondary text-secondary-foreground",
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-"
  const [year, month, day] = dateStr.split("-")
  if (!year || !month || !day) return dateStr
  return `${day}/${month}/${year}`
}

function ClinicalTimelineItem({
  event,
  isExpanded,
  onToggle,
}: {
  event: ClinicalTimelineEvent
  isExpanded: boolean
  onToggle: () => void
}) {
  const Icon = tipoEventoIcons[event.tipo] || Activity
  const colorClass = tipoEventoColors[event.tipo] || "border-muted bg-muted text-muted-foreground"

  return (
    <article className="relative pl-11">
      <div className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{event.tipo}</Badge>
              {event.estado && <Badge variant="outline">{event.estado}</Badge>}
              <span className="text-sm text-muted-foreground">{formatDate(event.fecha)}</span>
              <span className="text-sm text-muted-foreground">· {event.veterinario}</span>
            </div>
            <h3 className="mt-2 font-bold">{event.motivo || event.procedimiento || event.tipo}</h3>
            {(event.diagnostico || event.tratamiento) && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {event.diagnostico || event.tratamiento}
              </p>
            )}
          </div>
          <Button variant="outline" className="h-10 rounded-xl" onClick={onToggle}>
            Ver detalle
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 border-t pt-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {event.diagnostico && <TimelineDetail label="Diagnostico" value={event.diagnostico} />}
              {event.sintomas && event.sintomas !== "-" && <TimelineDetail label="Sintomas" value={event.sintomas} />}
              {event.tratamiento && event.tratamiento !== "-" && <TimelineDetail label="Tratamiento" value={event.tratamiento} />}
              {event.vacuna && <TimelineDetail label="Vacuna" value={`${event.vacuna} · ${event.laboratorio || "-"}`} />}
              {event.peso && <TimelineDetail label="Peso" value={`${event.peso} kg`} />}
              {event.temperatura && <TimelineDetail label="Temperatura" value={`${event.temperatura} °C`} />}
              {event.procedimiento && <TimelineDetail label="Procedimiento" value={event.procedimiento} />}
              {event.proximoControl && <TimelineDetail label="Proximo control" value={formatDate(event.proximoControl)} />}
            </div>
            {event.observaciones && (
              <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">{event.observaciones}</div>
            )}
            {event.archivo && (
              <div className="mt-3 flex justify-end border-t pt-3">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Ver archivo
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function TimelineDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

function PatientHeader({ pet, client }: { pet: NonNullable<Parameters<typeof ClinicalActionFlow>[0]["children"]>["pet"]; client: NonNullable<Parameters<typeof ClinicalActionFlow>[0]["children"]>["client"] }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{pet.nombre}</h2>
              <Badge variant="outline">{pet.especie}</Badge>
              <Badge variant="outline">{pet.raza}</Badge>
              <Badge className={estadoColors[pet.estadoGeneral] || "bg-muted text-muted-foreground"}>
                {pet.estadoGeneral}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {pet.edad} · {pet.sexo} · {pet.peso} kg · {pet.esterilizado ? "Esterilizado" : "No esterilizado"}
            </p>
            <p className="text-sm text-muted-foreground">
              Dueno: {client.nombre} · {client.telefono} · {client.email}
            </p>
            {(pet.alergias.length > 0 || pet.antecedentes) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {pet.alergias.length > 0 && `Alergias: ${pet.alergias.join(", ")}`}
                {pet.alergias.length > 0 && pet.antecedentes && " · "}
                {pet.antecedentes && `Antecedentes: ${pet.antecedentes}`}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type HistorialMode = "timeline" | "consulta"

function HistorialContent({ client, pet }: { client: NonNullable<Parameters<typeof ClinicalActionFlow>[0]["children"]>["client"]; pet: NonNullable<Parameters<typeof ClinicalActionFlow>[0]["children"]>["pet"] }) {
  const [mode, setMode] = useState<HistorialMode>("timeline")
  const [refreshKey, setRefreshKey] = useState(0)
  const [expandedEvent, setExpandedEvent] = useState<string | number | null>(null)

  const [search, setSearch] = useState("")
  const [eventType, setEventType] = useState("todos")
  const [vetName, setVetName] = useState("todos")
  const [status, setStatus] = useState("todos")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const timeline = useMemo(() => buildClinicalTimeline(pet.id), [pet.id, refreshKey])
  const filteredTimeline = useMemo(() => {
    return searchClinicalTimeline(timeline, search, eventType, vetName, status, dateFrom, dateTo)
  }, [timeline, search, eventType, vetName, status, dateFrom, dateTo])

  const uniqueVets = useMemo(() => {
    const vets = new Set<string>()
    timeline.forEach((e) => { if (e.veterinario) vets.add(e.veterinario) })
    return Array.from(vets).sort()
  }, [timeline])

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>()
    timeline.forEach((e) => { if (e.estado) statuses.add(e.estado) })
    return Array.from(statuses).sort()
  }, [timeline])

  const hasActiveFilters = search || eventType !== "todos" || vetName !== "todos" || status !== "todos" || dateFrom || dateTo

  function clearFilters() {
    setSearch("")
    setEventType("todos")
    setVetName("todos")
    setStatus("todos")
    setDateFrom("")
    setDateTo("")
  }

  const handleConsultationSaved = useCallback(() => {
    setRefreshKey((k) => k + 1)
    setMode("timeline")
  }, [])

  if (mode === "consulta") {
    return (
      <div className="space-y-4">
        <Button variant="outline" className="h-11 rounded-xl px-4 font-bold" onClick={() => setMode("timeline")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al historial
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Agregar consulta
            </CardTitle>
            <CardDescription>
              Registrar una nueva consulta clinica para {pet.nombre} ({pet.especie} · {pet.raza}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConsultationForm pet={pet} client={client} onSaved={handleConsultationSaved} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PatientHeader pet={pet} client={client} />

      <Button
        className="h-14 w-full rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90"
        onClick={() => setMode("consulta")}
      >
        <Plus className="mr-2 h-5 w-5" />
        Agregar consulta
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Historial de {pet.nombre}
          </CardTitle>
          <CardDescription>
            {filteredTimeline.length === timeline.length
              ? `${timeline.length} registro${timeline.length !== 1 ? "s" : ""} encontrado${timeline.length !== 1 ? "s" : ""}`
              : `${filteredTimeline.length} de ${timeline.length} registro${timeline.length !== 1 ? "s" : ""} encontrado${timeline.length !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-12 rounded-xl pl-10 text-base"
              placeholder="Buscar por diagnostico, motivo, tratamiento, vacuna, cirugia, estudio, veterinario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearch("")}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="h-10 w-[160px] rounded-lg">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {CLINICAL_HISTORY_EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={vetName} onValueChange={setVetName}>
              <SelectTrigger className="h-10 w-[160px] rounded-lg">
                <SelectValue placeholder="Veterinario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {uniqueVets.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 w-[140px] rounded-lg">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {uniqueStatuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input type="date" className="h-10 rounded-lg" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <span className="text-sm text-muted-foreground">—</span>
              <Input type="date" className="h-10 rounded-lg" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-10 rounded-lg text-muted-foreground" onClick={clearFilters}>
                <X className="mr-1 h-3 w-3" />
                Limpiar filtros
              </Button>
            )}
          </div>

          {filteredTimeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium text-muted-foreground">No se encontraron registros con esos filtros.</p>
              <Button variant="outline" className="mt-3 h-10 rounded-xl" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTimeline.map((event) => (
                <ClinicalTimelineItem
                  key={event.id}
                  event={event}
                  isExpanded={expandedEvent === event.id}
                  onToggle={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ConsultationForm({
  pet,
  client,
  onSaved,
}: {
  pet: NonNullable<Parameters<typeof ClinicalActionFlow>[0]["children"]>["pet"]
  client: NonNullable<Parameters<typeof ClinicalActionFlow>[0]["children"]>["client"]
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    veterinarian: VETERINARIANS[0] || "",
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
  })

  function handleSubmit() {
    if (!form.reason.trim()) return
    const draft: ConsultationDraft = {
      clientId: client.id,
      petId: pet.id,
      date: form.date,
      veterinarian: form.veterinarian,
      reason: form.reason,
      symptoms: form.symptoms,
      diagnosis: form.diagnosis,
      treatment: form.treatment,
      notes: form.notes,
      weight: form.weight,
      temperature: form.temperature,
      nextControlDate: form.nextControlDate,
      status: form.status,
      attachmentName: form.attachmentName,
    }
    addConsultationFromDraft(draft)
    onSaved()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-primary/5 p-3">
        <p className="text-sm font-medium">
          {pet.nombre} · {pet.especie} · {pet.raza}
        </p>
        <p className="text-sm text-muted-foreground">
          Dueno: {client.nombre} · {client.telefono}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Fecha de consulta</Label>
          <Input type="date" className="h-11 rounded-xl" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Veterinario</Label>
          <Select value={form.veterinarian} onValueChange={(v) => setForm((f) => ({ ...f, veterinarian: v }))}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {VETERINARIANS.map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Registrada">Registrada</SelectItem>
              <SelectItem value="En seguimiento">En seguimiento</SelectItem>
              <SelectItem value="Resuelta">Resuelta</SelectItem>
              <SelectItem value="Control pendiente">Control pendiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Peso (kg)</Label>
          <Input className="h-11 rounded-xl" placeholder="Ej: 28.5" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Motivo de consulta *</Label>
        <Input className="h-11 rounded-xl" placeholder="Ej: Control postratamiento, vacunacion, enfermedad..." value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
      </div>

      <div className="space-y-2">
        <Label>Sintomas</Label>
        <Textarea className="rounded-xl" rows={2} placeholder="Descripcion de sintomas observados..." value={form.symptoms} onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))} />
      </div>

      <div className="space-y-2">
        <Label>Diagnostico</Label>
        <Textarea className="rounded-xl" rows={2} placeholder="Diagnostico clinico..." value={form.diagnosis} onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))} />
      </div>

      <div className="space-y-2">
        <Label>Tratamiento indicado</Label>
        <Textarea className="rounded-xl" rows={2} placeholder="Medicacion, indicaciones, dieta..." value={form.treatment} onChange={(e) => setForm((f) => ({ ...f, treatment: e.target.value }))} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Temperatura (°C)</Label>
          <Input className="h-11 rounded-xl" placeholder="Ej: 38.5" value={form.temperature} onChange={(e) => setForm((f) => ({ ...f, temperature: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Proximo control</Label>
          <Input type="date" className="h-11 rounded-xl" value={form.nextControlDate} onChange={(e) => setForm((f) => ({ ...f, nextControlDate: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Observaciones</Label>
        <Textarea className="rounded-xl" rows={2} placeholder="Notas adicionales..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
      </div>

      <Button
        className="h-14 w-full rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90"
        onClick={handleSubmit}
        disabled={!form.reason.trim()}
      >
        <Plus className="mr-2 h-4 w-4" />
        Guardar consulta
      </Button>
    </div>
  )
}

export function HistorialClinico() {
  return (
    <ClinicalActionFlow
      title="Historial Clinico"
      description="Selecciona un cliente y una mascota para consultar y registrar eventos clinicos."
      actionLabel="Ver historial"
      icon={ClipboardList}
    >
      {({ client, pet }) => <HistorialContent client={client} pet={pet} />}
    </ClinicalActionFlow>
  )
}