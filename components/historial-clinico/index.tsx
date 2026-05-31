"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ClipboardList, Plus, Search, Stethoscope, X, ArrowLeft, ShieldAlert, HeartPulse } from "lucide-react"
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
import { ClinicalActionFlow, type ClinicalActionSelection } from "@/components/clinical/action-flow"
import { ClinicalTimelineItem } from "@/components/clinical/timeline-item"
import {
  addConsultationFromDraft,
  buildClinicalTimeline,
  searchClinicalTimeline,
  type ConsultationDraft,
  CLINICAL_HISTORY_EVENT_TYPES,
  VETERINARIANS,
} from "@/lib/clinical-history-builder"
import { updateMascotaData, getMascotaData } from "@/lib/mascota-store"

function ActionCard({ icon: Icon, title, description, buttonLabel, href }: { icon: LucideIcon; title: string; description: string; buttonLabel: string; href: string }) {
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

const estadoColors: Record<string, string> = {
  Saludable: "bg-success text-success-foreground",
  "En tratamiento": "bg-warning text-warning-foreground",
  "Vacuna vencida": "bg-destructive text-destructive-foreground",
  "Control pendiente": "bg-secondary text-secondary-foreground",
  "Cirugía programada": "bg-primary text-primary-foreground",
}

function PatientHeader({ pet, client }: { pet: ClinicalActionSelection["pet"]; client: ClinicalActionSelection["client"] }) {
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
            {(pet.alergias.length > 0 || pet.antecedentes.length > 0 || (pet.condicionesCronicas && pet.condicionesCronicas.length > 0)) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {pet.alergias.length > 0 && `Alergias: ${pet.alergias.join(", ")}`}
                {pet.alergias.length > 0 && (pet.antecedentes.length > 0 || (pet.condicionesCronicas && pet.condicionesCronicas.length > 0)) && " · "}
                {pet.antecedentes.length > 0 && `Antecedentes: ${pet.antecedentes.join(", ")}`}
                {pet.antecedentes.length > 0 && pet.condicionesCronicas && pet.condicionesCronicas.length > 0 && " · "}
                {pet.condicionesCronicas && pet.condicionesCronicas.length > 0 && `Condiciones cronicas: ${pet.condicionesCronicas.join(", ")}`}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type HistorialMode = "timeline" | "consulta"

function HistorialContent({ client, pet, initialMode = "timeline" }: { client: ClinicalActionSelection["client"]; pet: ClinicalActionSelection["pet"]; initialMode?: HistorialMode }) {
  const [mode, setMode] = useState<HistorialMode>(initialMode)
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
              Registrar atencion clinica
            </CardTitle>
            <CardDescription>
              Registrar una nueva atencion clinica para {pet.nombre} ({pet.especie} · {pet.raza}).
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
      <Button className="h-14 w-full rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90" asChild>
        <Link href={`/atencion/nueva?clienteId=${client.id}&mascotaId=${pet.id}`}>
          <HeartPulse className="mr-2 h-5 w-5" />
          Nueva atención
        </Link>
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
  pet: ClinicalActionSelection["pet"]
  client: ClinicalActionSelection["client"]
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

  const [newAlergias, setNewAlergias] = useState<string[]>([])
  const [newAntecedentes, setNewAntecedentes] = useState<string[]>([])
  const [alergiaInput, setAlergiaInput] = useState("")
  const [antecedenteInput, setAntecedenteInput] = useState("")

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

    if (newAlergias.length > 0 || newAntecedentes.length > 0) {
      const currentData = getMascotaData(pet.id)
      const updates: Record<string, unknown> = {}
      if (newAlergias.length > 0) {
        updates.alergias = [...(currentData.alergias || []), ...newAlergias]
      }
      if (newAntecedentes.length > 0) {
        updates.antecedentes = [...(currentData.antecedentes || []), ...newAntecedentes]
      }
      updateMascotaData(pet.id, updates as Record<string, unknown> !== undefined ? updates as import("@/lib/mascota-store").MascotaOverride : {})
    }

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
          <Label>Fecha</Label>
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
        <Label>Motivo de atencion *</Label>
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

      <details className="rounded-xl border p-4">
        <summary className="cursor-pointer font-semibold">
          <ShieldAlert className="mr-2 inline h-4 w-4 text-warning" />
          Datos clinicos importantes detectados (opcional)
        </summary>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Agregar alergia detectada
            </Label>
            <div className="flex gap-2">
              <Input className="h-10 flex-1" placeholder="Ej: Penicilina, Pollo..." value={alergiaInput} onChange={(e) => setAlergiaInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = alergiaInput.trim(); if (v) { setNewAlergias((a) => [...a, v]); setAlergiaInput("") } } }} />
              <Button type="button" variant="outline" className="h-10 px-3" onClick={() => { const v = alergiaInput.trim(); if (v) { setNewAlergias((a) => [...a, v]); setAlergiaInput("") } }}>
                <Plus className="mr-1 h-4 w-4" />
                Agregar
              </Button>
            </div>
            {newAlergias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newAlergias.map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                    {a}
                    <button onClick={() => setNewAlergias((arr) => arr.filter((_, idx) => idx !== i))} className="ml-1 rounded-full p-0.5 hover:bg-black/10"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-warning" />
              Agregar antecedente detectado
            </Label>
            <div className="flex gap-2">
              <Input className="h-10 flex-1" placeholder="Ej: Convulsiones anteriores, Cirugía previa..." value={antecedenteInput} onChange={(e) => setAntecedenteInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = antecedenteInput.trim(); if (v) { setNewAntecedentes((a) => [...a, v]); setAntecedenteInput("") } } }} />
              <Button type="button" variant="outline" className="h-10 px-3" onClick={() => { const v = antecedenteInput.trim(); if (v) { setNewAntecedentes((a) => [...a, v]); setAntecedenteInput("") } }}>
                <Plus className="mr-1 h-4 w-4" />
                Agregar
              </Button>
            </div>
            {newAntecedentes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newAntecedentes.map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-sm font-medium text-warning">
                    {a}
                    <button onClick={() => setNewAntecedentes((arr) => arr.filter((_, idx) => idx !== i))} className="ml-1 rounded-full p-0.5 hover:bg-black/10"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Las alergias y antecedentes detectados se agregaran a la ficha de la mascota y se registraran como eventos en la historia clinica.
          </p>
        </div>
      </details>

      <Button
        className="h-14 w-full rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90"
        onClick={handleSubmit}
        disabled={!form.reason.trim()}
      >
        <Plus className="mr-2 h-4 w-4" />
        Guardar atencion
      </Button>
    </div>
  )
}

export function HistorialClinicoPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            <ClipboardList className="h-4 w-4" />
            Historial Clinico
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-normal">Historial Clinico</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Consulta la historia clinica de una mascota o registra una nueva atencion clinica.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActionCard
          icon={ClipboardList}
          title="Ver historial clinico"
          description="Selecciona cliente y mascota para consultar su historia clinica, eventos y evolucion."
          buttonLabel="Ver historial"
          href="/historial-clinico/ver"
        />
        <ActionCard
          icon={Stethoscope}
          title="Registrar atencion clinica"
          description="Selecciona cliente y mascota para registrar una nueva atencion, consulta, control o evento clinico."
          buttonLabel="Registrar atencion"
          href="/historial-clinico/agregar-consulta"
        />
      </div>
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

export function ConsultaRegistrationFlow() {
  return (
    <ClinicalActionFlow
      title="Registrar atencion clinica"
      description="Selecciona cliente y mascota para registrar una nueva atencion clinica."
      actionLabel="Registrar atencion"
      icon={Stethoscope}
    >
      {({ client, pet }) => <HistorialContent client={client} pet={pet} initialMode="consulta" />}
    </ClinicalActionFlow>
  )
}
