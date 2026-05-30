"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import {
  Activity,
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  FileText,
  MessageCircle,
  Pill,
  Plus,
  Scissors,
  Search,
  Stethoscope,
  Syringe,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { mascotas } from "@/lib/mock-data"
import {
  addConsultationFromDraft,
  buildClinicalTimeline,
  getPetWithClient,
  searchClinicalTimeline,
  type ClinicalTimelineEvent,
  type ConsultationDraft,
  type PetWithClient,
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

function TimelineItem({
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
            <ChevronRight className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
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

function ConsultationForm({
  pet,
  onSaved,
}: {
  pet: PetWithClient
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
      clientId: pet.clienteId,
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
          Dueno: {pet.dueno} · {pet.clienteTelefono}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Fecha de consulta</Label>
          <Input
            type="date"
            className="h-11 rounded-xl"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Veterinario</Label>
          <Select value={form.veterinarian} onValueChange={(v) => setForm((f) => ({ ...f, veterinarian: v }))}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
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
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
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
          <Input
            className="h-11 rounded-xl"
            placeholder="Ej: 28.5"
            value={form.weight}
            onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Motivo de consulta *</Label>
        <Input
          className="h-11 rounded-xl"
          placeholder="Ej: Control postratamiento, vacunacion, enfermedad..."
          value={form.reason}
          onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Sintomas</Label>
        <Textarea
          className="rounded-xl"
          rows={2}
          placeholder="Descripcion de sintomas observados..."
          value={form.symptoms}
          onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Diagnostico</Label>
        <Textarea
          className="rounded-xl"
          rows={2}
          placeholder="Diagnostico clinico..."
          value={form.diagnosis}
          onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Tratamiento indicado</Label>
        <Textarea
          className="rounded-xl"
          rows={2}
          placeholder="Medicacion, indicaciones, dieta..."
          value={form.treatment}
          onChange={(e) => setForm((f) => ({ ...f, treatment: e.target.value }))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Temperatura (°C)</Label>
          <Input
            className="h-11 rounded-xl"
            placeholder="Ej: 38.5"
            value={form.temperature}
            onChange={(e) => setForm((f) => ({ ...f, temperature: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Proximo control</Label>
          <Input
            type="date"
            className="h-11 rounded-xl"
            value={form.nextControlDate}
            onChange={(e) => setForm((f) => ({ ...f, nextControlDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Observaciones</Label>
        <Textarea
          className="rounded-xl"
          rows={2}
          placeholder="Notas adicionales..."
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
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
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null)
  const [petSearch, setPetSearch] = useState("")
  const [expandedEvent, setExpandedEvent] = useState<string | number | null>(null)
  const [showConsultation, setShowConsultation] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const [search, setSearch] = useState("")
  const [eventType, setEventType] = useState("todos")
  const [vetName, setVetName] = useState("todos")
  const [status, setStatus] = useState("todos")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const selectedPet = useMemo(() => (selectedPetId ? getPetWithClient(selectedPetId) : null), [selectedPetId])

  const timeline = useMemo(() => {
    if (!selectedPetId) return []
    return buildClinicalTimeline(selectedPetId)
  }, [selectedPetId, refreshKey])

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

  const filteredPets = useMemo(() => {
    if (!petSearch.trim()) return mascotas
    const q = petSearch.toLowerCase()
    return mascotas.filter((m) =>
      m.nombre.toLowerCase().includes(q) ||
      m.especie.toLowerCase().includes(q) ||
      m.raza.toLowerCase().includes(q) ||
      m.dueno.toLowerCase().includes(q)
    )
  }, [petSearch])

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
    setShowConsultation(false)
  }, [])

  const hasActiveFilters = search || eventType !== "todos" || vetName !== "todos" || status !== "todos" || dateFrom || dateTo

  function clearFilters() {
    setSearch("")
    setEventType("todos")
    setVetName("todos")
    setStatus("todos")
    setDateFrom("")
    setDateTo("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historial Clinico</h1>
          <p className="text-muted-foreground">Consulta y registra eventos clinicos de una mascota.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Seleccionar mascota
          </CardTitle>
          <CardDescription>Busca por nombre, especie, raza o dueno para ver su historial clinico.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-14 rounded-xl pl-12 text-base"
              placeholder="Buscar mascota, cliente o turno..."
              value={petSearch}
              onChange={(e) => setPetSearch(e.target.value)}
            />
            {petSearch && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setPetSearch("")}>
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPets.map((pet) => (
              <button
                key={pet.id}
                className={`rounded-xl border p-3 text-left transition-all hover:bg-primary/5 ${selectedPetId === pet.id ? "border-primary bg-primary/10 ring-2 ring-primary" : ""}`}
                onClick={() => { setSelectedPetId(pet.id); setExpandedEvent(null); clearFilters() }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{pet.nombre}</span>
                  <Badge variant="outline">{pet.especie}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{pet.raza} · {pet.edad}</p>
                <p className="text-sm text-muted-foreground">{pet.dueno}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPet ? (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold">{selectedPet.nombre}</h2>
                    <Badge variant="outline">{selectedPet.especie}</Badge>
                    <Badge variant="outline">{selectedPet.raza}</Badge>
                    <Badge className={estadoColors[selectedPet.estadoGeneral] || "bg-muted text-muted-foreground"}>
                      {selectedPet.estadoGeneral}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedPet.edad} · {selectedPet.sexo} · {selectedPet.peso} kg · {selectedPet.esterilizado ? "Esterilizado" : "No esterilizado"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dueno: {selectedPet.dueno} · {selectedPet.clienteTelefono} · {selectedPet.clienteEmail}
                  </p>
                  {(selectedPet.alergias.length > 0 || selectedPet.antecedentes) && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedPet.alergias.length > 0 && `Alergias: ${selectedPet.alergias.join(", ")}`}
                      {selectedPet.alergias.length > 0 && selectedPet.antecedentes && " · "}
                      {selectedPet.antecedentes && `Antecedentes: ${selectedPet.antecedentes}`}
                    </p>
                  )}
                </div>
                <Link href={`/mascotas/${selectedPet.id}`}>
                  <Button variant="outline" className="h-11 rounded-xl px-4 font-bold">
                    Ver ficha completa
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Button
            className="h-14 w-full rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90"
            onClick={() => setShowConsultation(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            Agregar consulta
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Historial de {selectedPet.nombre}
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
                  <Input
                    type="date"
                    className="h-10 rounded-lg"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground">—</span>
                  <Input
                    type="date"
                    className="h-10 rounded-lg"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
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
                    <TimelineItem
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
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="mb-4 h-16 w-16 text-muted-foreground/40" />
            <h3 className="text-xl font-semibold text-muted-foreground">Selecciona una mascota</h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Selecciona una mascota para ver su historial clinico completo. Podes buscar por nombre, especie, raza o dueno.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showConsultation} onOpenChange={setShowConsultation}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar consulta</DialogTitle>
            <DialogDescription>
              Registrar una nueva consulta clinica para {selectedPet?.nombre || "la mascota seleccionada"}.
            </DialogDescription>
          </DialogHeader>
          {selectedPet ? (
            <ConsultationForm pet={selectedPet} onSaved={handleRefresh} />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Selecciona una mascota primero para agregar una consulta.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}