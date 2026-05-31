"use client"

import { useState } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft, ArrowRight, Bell, Check, CheckCircle2, ChevronDown, ChevronUp, ClipboardList, FileText, HeartPulse,
  Pill, Plus, Scissors, ShieldAlert, Stethoscope, Syringe, AlertTriangle, X, Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ClinicalActionFlow, type ClinicalActionSelection } from "@/components/clinical/action-flow"
import { VacunaInlineForm } from "@/components/atencion/vacuna-inline-form"
import { TratamientoInlineForm } from "@/components/atencion/tratamiento-inline-form"
import {
  guardarAtencionCompleta, CLASIFICACIONES, ACCIONES_CLINICAS,
  type ClasificacionAtencion, type AtencionBase, type AccionesActivas,
} from "@/lib/atencion-store"
import { VETERINARIANS } from "@/lib/clinical-history-builder"

type AtencionMode = "breve" | "completa"
type FlowStep = "atencion" | "acciones" | "resumen" | "resultado"

const STEP_LABELS = [
  { key: "atencion", label: "Atención clínica", icon: Stethoscope },
  { key: "acciones", label: "Acciones clínicas", icon: HeartPulse },
  { key: "resumen", label: "Revisar y guardar", icon: CheckCircle2 },
] as const

const CLAS_ICON_MAP: Record<string, LucideIcon> = {
  Stethoscope, Syringe, ClipboardList, AlertTriangle, HeartPulse, FileText,
}
const ACCION_ICON_MAP: Record<string, LucideIcon> = {
  Syringe, Pill, Scissors, FileText, Bell,
}

function createEmptyAcciones(): AccionesActivas {
  return {
    vacuna: { activa: false, data: { vaccineName: "", doseLabel: "", observations: "" } },
    tratamiento: { activa: false, data: { diagnosis: "", medicamento: "", dosis: "", frecuencia: "", duracion: "", indicaciones: "", nextControlDate: "" } },
    cirugia: { activa: false, data: { surgeryType: "", status: "Programada", notes: "" } },
    estudio: { activa: false, data: { studyType: "", description: "" } },
    recordatorio: { activa: false, data: { date: "", reminderType: "Control", message: "" } },
  }
}

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

export function AtencionLandingPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            <HeartPulse className="h-4 w-4" />
            Centro de atención
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-normal">Nueva atención</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Cargá todo lo ocurrido en una atención real desde un solo lugar. Sin saltar entre secciones.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ActionCard icon={Stethoscope} title="Nueva atención" description="Seleccioná cliente y mascota para registrar una atención clínica." buttonLabel="Comenzar" href="/atencion/nueva" />
        <ActionCard icon={ClipboardList} title="Ver historial clínico" description="Consultá el historial completo de una mascota con todos los eventos clínicos." buttonLabel="Ver historial" href="/historial-clinico/ver" />
      </div>
    </div>
  )
}

function StepIndicator({ currentStep }: { currentStep: FlowStep }) {
  const stepIndex = currentStep === "resultado" ? 2 : currentStep === "atencion" ? 0 : currentStep === "acciones" ? 1 : 2
  return (
    <div className="grid grid-cols-3 gap-2">
      {STEP_LABELS.map((step, i) => {
        const Icon = step.icon
        const isActive = i === stepIndex
        const isDone = i < stepIndex
        return (
          <div
            key={step.key}
            className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
              isActive ? "border-primary/30 bg-primary/5" : isDone ? "border-success/30 bg-success/5" : "border-border bg-card"
            }`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              isActive ? "bg-primary text-primary-foreground" : isDone ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <span className={`text-sm font-medium ${isActive ? "text-primary" : isDone ? "text-success" : "text-muted-foreground"}`}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function CirugiaAccionForm({ acciones, setAcciones }: { acciones: AccionesActivas; setAcciones: (a: AccionesActivas) => void }) {
  const data = acciones.cirugia.data
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de cirugía *</Label>
        <Input className="h-11 rounded-xl" placeholder="Ej: Castración, Extracción..." value={data.surgeryType} onChange={(e) => setAcciones({ ...acciones, cirugia: { ...acciones.cirugia, data: { ...data, surgeryType: e.target.value } } })} />
      </div>
      <div className="space-y-2">
        <Label>Estado</Label>
        <Select value={data.status} onValueChange={(v) => setAcciones({ ...acciones, cirugia: { ...acciones.cirugia, data: { ...data, status: v } } })}>
          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Programada">Programada</SelectItem>
            <SelectItem value="Pendiente confirmacion">Pendiente confirmacion</SelectItem>
            <SelectItem value="Realizada">Realizada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Observaciones</Label>
        <Textarea className="rounded-xl" rows={2} placeholder="Detalles del procedimiento..." value={data.notes} onChange={(e) => setAcciones({ ...acciones, cirugia: { ...acciones.cirugia, data: { ...data, notes: e.target.value } } })} />
      </div>
    </div>
  )
}

function EstudioAccionForm({ acciones, setAcciones }: { acciones: AccionesActivas; setAcciones: (a: AccionesActivas) => void }) {
  const data = acciones.estudio.data
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de estudio *</Label>
        <Input className="h-11 rounded-xl" placeholder="Ej: Radiografía, Análisis sanguíneo, Ecografía..." value={data.studyType} onChange={(e) => setAcciones({ ...acciones, estudio: { ...acciones.estudio, data: { ...data, studyType: e.target.value } } })} />
      </div>
      <div className="space-y-2">
        <Label>Descripcion</Label>
        <Textarea className="rounded-xl" rows={2} placeholder="Descripción o detalle del estudio..." value={data.description} onChange={(e) => setAcciones({ ...acciones, estudio: { ...acciones.estudio, data: { ...data, description: e.target.value } } })} />
      </div>
    </div>
  )
}

function RecordatorioAccionForm({ acciones, setAcciones }: { acciones: AccionesActivas; setAcciones: (a: AccionesActivas) => void }) {
  const data = acciones.recordatorio.data
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Fecha del recordatorio *</Label>
          <Input type="date" className="h-11 rounded-xl" value={data.date} onChange={(e) => setAcciones({ ...acciones, recordatorio: { ...acciones.recordatorio, data: { ...data, date: e.target.value } } })} />
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={data.reminderType} onValueChange={(v) => setAcciones({ ...acciones, recordatorio: { ...acciones.recordatorio, data: { ...data, reminderType: v } } })}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Control">Control</SelectItem>
              <SelectItem value="Vacuna">Vacuna</SelectItem>
              <SelectItem value="Medicacion">Medicacion</SelectItem>
              <SelectItem value="Estudio">Estudio</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Mensaje *</Label>
        <Textarea className="rounded-xl" rows={2} placeholder="Descripción del recordatorio..." value={data.message} onChange={(e) => setAcciones({ ...acciones, recordatorio: { ...acciones.recordatorio, data: { ...data, message: e.target.value } } })} />
      </div>
    </div>
  )
}

function NuevaAtencionContent({ client, pet }: ClinicalActionSelection) {
  const [step, setStep] = useState<FlowStep>("atencion")
  const [savedResult, setSavedResult] = useState<{ eventIds: string[] } | null>(null)
  const [atencionMode, setAtencionMode] = useState<AtencionMode>("breve")
  const [showClinicalData, setShowClinicalData] = useState(false)
  const [alergiaInput, setAlergiaInput] = useState("")
  const [antecedenteInput, setAntecedenteInput] = useState("")
  const [condicionInput, setCondicionInput] = useState("")
  const [expandedAccion, setExpandedAccion] = useState<string | null>(null)

  const [base, setBase] = useState<AtencionBase>({
    clasificacion: "consulta_general",
    date: new Date().toISOString().slice(0, 10),
    veterinarian: VETERINARIANS[0] || "",
    reason: "",
    symptoms: "",
    diagnosis: "",
    weight: "",
    temperature: "",
    notes: "",
    nextControlDate: "",
    newAlergias: [],
    newAntecedentes: [],
    newCondicionesCronicas: [],
  })

  const [acciones, setAcciones] = useState<AccionesActivas>(createEmptyAcciones())

  const clasificacionLabel = CLASIFICACIONES.find((c) => c.key === base.clasificacion)?.label || ""

  function handleGuardar() {
    const result = guardarAtencionCompleta({ petId: pet.id, clientId: client.id, base, acciones })
    if (result.success) {
      setSavedResult({ eventIds: result.eventIds })
      setStep("resultado")
    }
  }

  if (step === "resultado" && savedResult) {
    return (
      <div className="mx-auto max-w-3xl">
        <StepIndicator currentStep="resultado" />
        <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Atención registrada</h2>
            <p className="max-w-md text-muted-foreground">
              {savedResult.eventIds.length} evento{savedResult.eventIds.length !== 1 ? "s" : ""} registrado{savedResult.eventIds.length !== 1 ? "s" : ""} en la historia clínica de {pet.nombre}.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2" style={{ maxWidth: 500 }}>
            <Button className="h-12 rounded-xl bg-primary px-6 font-bold hover:bg-primary/90" asChild>
              <Link href={`/mascotas/${pet.id}`}>Ver ficha de {pet.nombre}</Link>
            </Button>
            <Button variant="outline" className="h-12 rounded-xl px-6 font-bold" asChild>
              <Link href={`/historial-clinico/ver?clienteId=${client.id}&mascotaId=${pet.id}`}>Ver historia clínica</Link>
            </Button>
            <Button variant="outline" className="h-12 rounded-xl px-6 font-bold" onClick={() => {
              setStep("atencion"); setSavedResult(null)
              setBase({ clasificacion: "consulta_general", date: new Date().toISOString().slice(0, 10), veterinarian: VETERINARIANS[0] || "", reason: "", symptoms: "", diagnosis: "", weight: "", temperature: "", notes: "", nextControlDate: "", newAlergias: [], newAntecedentes: [], newCondicionesCronicas: [] })
              setAcciones(createEmptyAcciones())
            }}>
              <Plus className="mr-2 h-4 w-4" />Nueva atención para {pet.nombre}
            </Button>
            <Button variant="outline" className="h-12 rounded-xl px-6 font-bold" asChild>
              <Link href="/atencion/nueva">Otra mascota</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "resumen") {
    const accionesList = ACCIONES_CLINICAS.filter((a) => acciones[a.key as keyof AccionesActivas].activa)
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <StepIndicator currentStep="resumen" />
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl px-4 font-bold" onClick={() => setStep("acciones")}>
            <ArrowLeft className="mr-2 h-4 w-4" />Volver a acciones
          </Button>
        </div>
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-xl"><CheckCircle2 className="h-5 w-5 text-success" />Resumen de la atención</CardTitle>
            <CardDescription>Revisá los datos antes de guardar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-primary/5 px-3 py-1.5">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{pet.nombre}</p>
                  <p className="text-sm text-muted-foreground">{pet.especie} · {pet.raza}</p>
                  <p className="hidden text-sm text-muted-foreground sm:inline">· Dueño: {client.nombre}</p>
                </div>

                <p className="text-sm text-muted-foreground mt-0.5">{pet.edad} · {pet.sexo} · {pet.peso} kg{pet.esterilizado ? ' · Esterilizado' : ''}</p>

                <div className="flex flex-wrap items-center gap-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    <span>Alergia: {pet.alergias && pet.alergias.length > 0 ? pet.alergias[0] : "Pollo"}</span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
                    <HeartPulse className="h-3.5 w-3.5 text-warning" />
                    <span>Antecedente: {pet.antecedentes && pet.antecedentes.length > 0 ? pet.antecedentes[0] : "Displasia de cadera leve"}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-1">
                <Button variant="outline" size="sm" className="h-8 rounded-lg px-3 text-xs hover:text-[#7A004A] hover:border-[#7A004A]" asChild>
                  <Link href={`/historial-clinico/ver?clienteId=${client.id}&mascotaId=${pet.id}`} target="_blank" rel="noopener noreferrer">
                    <ClipboardList className="mr-1 h-3.5 w-3.5" />Historia clínica
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-8 rounded-lg px-3 text-xs hover:text-[#7A004A] hover:border-[#7A004A]" asChild>
                  <Link href={`/mascotas/${pet.id}`} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-1 h-3.5 w-3.5" />Ficha
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold">Datos de la atención</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground mb-1">Clasificacion</p><p className="font-medium">{clasificacionLabel}</p></div>
                <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground mb-1">Fecha</p><p className="font-medium">{base.date}</p></div>
                <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground mb-1">Veterinario</p><p className="font-medium">{base.veterinarian}</p></div>
                <div className="rounded-lg border p-4 sm:col-span-2 lg:col-span-3"><p className="text-xs text-muted-foreground mb-1">Motivo</p><p className="font-medium">{base.reason}</p></div>
              </div>
              {base.diagnosis && <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground mb-1">Diagnostico</p><p className="font-medium">{base.diagnosis}</p></div>}
              {(base.weight || base.temperature) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {base.weight && <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground mb-1">Peso</p><p className="font-medium">{base.weight} kg</p></div>}
                  {base.temperature && <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground mb-1">Temperatura</p><p className="font-medium">{base.temperature}  °C</p></div>}
                </div>
              )}
              {base.nextControlDate && <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground mb-1">Proximo control</p><p className="font-medium">{base.nextControlDate}</p></div>}
            </div>

            {accionesList.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Acciones clínicas</h3>
                <div className="flex flex-wrap gap-2">
                  {accionesList.map((a) => {
                    const Icon = ACCION_ICON_MAP[a.icon]
                    return (<Badge key={a.key} variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">{Icon && <Icon className="h-3.5 w-3.5" />}{a.label}</Badge>)
                  })}
                </div>
              </div>
            )}
            {base.newAlergias.length > 0 && (<div className="space-y-1"><p className="text-sm font-medium text-destructive">Alergias detectadas</p><div className="flex flex-wrap gap-2">{base.newAlergias.map((a, i) => <Badge key={i} variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">{a}</Badge>)}</div></div>)}
            {base.newAntecedentes.length > 0 && (<div className="space-y-1"><p className="text-sm font-medium text-warning">Antecedentes detectados</p><div className="flex flex-wrap gap-2">{base.newAntecedentes.map((a, i) => <Badge key={i} variant="outline" className="border-warning/30 bg-warning/10 text-warning">{a}</Badge>)}</div></div>)}
            {base.newCondicionesCronicas.length > 0 && (<div className="space-y-1"><p className="text-sm font-medium text-orange-600">Condiciones crónicas</p><div className="flex flex-wrap gap-2">{base.newCondicionesCronicas.map((a, i) => <Badge key={i} variant="outline" className="border-orange-300/30 bg-orange-50 text-orange-700">{a}</Badge>)}</div></div>)}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="h-14 flex-1 rounded-xl text-base font-bold" onClick={() => setStep("acciones")}>Volver</Button>
              <Button className="h-14 flex-1 rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90" onClick={handleGuardar}>
                <Check className="mr-2 h-5 w-5" />Guardar atención
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "acciones") {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <StepIndicator currentStep="acciones" />
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl px-4 font-bold" onClick={() => setStep("atencion")}>
            <ArrowLeft className="mr-2 h-4 w-4" />Volver a atención
          </Button>
          <span className="text-sm text-muted-foreground">{pet.nombre} · {pet.especie} · {client.nombre}</span>
        </div>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl">
              ¿Qué se realizó o indica durante esta atención?
            </CardTitle>
            <CardDescription>
              Activá las acciones clínicas que se realizaron. Podés activar ninguna, una o varias.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {ACCIONES_CLINICAS.map((accion) => {
              const key = accion.key as keyof AccionesActivas
              const isActive = acciones[key].activa
              const isExpanded = expandedAccion === key
              const Icon = ACCION_ICON_MAP[accion.icon]
              return (
                <div key={key} className={`rounded-xl border-2 transition-all ${isActive ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/20"}`}>
                  <button type="button" className="flex w-full items-center gap-4 p-5 text-left" onClick={() => {
                    setAcciones({ ...acciones, [key]: { ...acciones[key], activa: !isActive } } as AccionesActivas)
                    if (!isActive) setExpandedAccion(key)
                    else if (expandedAccion === key) setExpandedAccion(null)
                  }}>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {Icon && <Icon className="h-6 w-6" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-base font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>{accion.label}</p>
                      <p className="text-sm text-muted-foreground">{accion.description}</p>
                    </div>
                    <div className="shrink-0">
                      {isActive ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                  </button>
                  {isActive && isExpanded && (
                    <div className="border-t-2 border-primary/10 px-5 pb-5 pt-5">
                      {key === "vacuna" && <VacunaInlineForm petId={pet.id} clientId={client.id} onSaved={(draft) => { setAcciones((prev) => ({ ...prev, vacuna: { activa: true, data: { vaccineName: draft.vaccineName, doseLabel: draft.doseLabel || "", observations: draft.observations || "" } } })); setExpandedAccion(null) }} onCancel={() => setExpandedAccion(null)} />}
                      {key === "tratamiento" && <TratamientoInlineForm petId={pet.id} clientId={client.id} onSaved={(draft) => { setAcciones((prev) => ({ ...prev, tratamiento: { activa: true, data: { diagnosis: draft.diagnosis, medicamento: draft.medicamento, dosis: draft.dosis, frecuencia: draft.frecuencia, duracion: draft.duracion, indicaciones: draft.indicaciones || "", nextControlDate: draft.nextControlDate || "" } } })); setExpandedAccion(null) }} onCancel={() => setExpandedAccion(null)} />}
                      {key === "cirugia" && <CirugiaAccionForm acciones={acciones} setAcciones={setAcciones} />}
                      {key === "estudio" && <EstudioAccionForm acciones={acciones} setAcciones={setAcciones} />}
                      {key === "recordatorio" && <RecordatorioAccionForm acciones={acciones} setAcciones={setAcciones} />}
                    </div>
                  )}
                </div>
              )
            })}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="h-14 flex-1 rounded-xl text-base font-bold" onClick={() => setStep("atencion")}>Volver</Button>
              <Button className="h-14 flex-1 rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90" onClick={() => setStep("resumen")}>
                <ArrowRight className="mr-2 h-5 w-5" />Revisar y guardar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <StepIndicator currentStep="atencion" />

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Stethoscope className="h-5 w-5 text-primary" />
                Atención clínica
              </CardTitle>
              <CardDescription className="mt-1">
                Registrá los datos de la atención para {pet.nombre}. Motivo es obligatorio; el resto es opcional.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Registrando atención para {pet.nombre} · {client.nombre}</p>
          </div>

          <div>
            <Label className="text-base font-semibold">Modo de atención</Label>
            <p className="mt-1 text-sm text-muted-foreground">Breve para consultas rápidas. Completa para agregar síntomas, diagnóstico y más.</p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setAtencionMode("breve")}
                className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${atencionMode === "breve" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"}`}
              >
                <p className={`font-semibold ${atencionMode === "breve" ? "text-primary" : "text-foreground"}`}>Atención breve</p>
                <p className="mt-1 text-xs text-muted-foreground">Fecha, veterinario y motivo</p>
              </button>
              <button
                type="button"
                onClick={() => setAtencionMode("completa")}
                className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${atencionMode === "completa" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"}`}
              >
                <p className={`font-semibold ${atencionMode === "completa" ? "text-primary" : "text-foreground"}`}>Atención completa</p>
                <p className="mt-1 text-xs text-muted-foreground">Síntomas, diagnóstico, peso, temperatura y más</p>
              </button>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">Clasificación de la atención</Label>
            <p className="mt-1 text-sm text-muted-foreground mb-3">La clasificación solo ordena el registro. Las acciones clínicas se agregan en el siguiente paso.</p>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {CLASIFICACIONES.map((c) => {
                const Icon = CLAS_ICON_MAP[c.icon]
                const isSelected = base.clasificacion === c.key
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setBase((b) => ({ ...b, clasificacion: c.key }))}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                      isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    {Icon && <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />}
                    <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-muted-foreground"}`}>{c.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Fecha *</Label>
              <Input type="date" className="h-12 rounded-xl" value={base.date} onChange={(e) => setBase((b) => ({ ...b, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Veterinario *</Label>
              <Select value={base.veterinarian} onValueChange={(v) => setBase((b) => ({ ...b, veterinarian: v }))}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{VETERINARIANS.map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Motivo de atención *</Label>
            <Input className="h-12 rounded-xl text-base" placeholder="Ej: Vacunacion anual, Control de rutina, Consulta por vomitos..." value={base.reason} onChange={(e) => setBase((b) => ({ ...b, reason: e.target.value }))} />
          </div>

          {atencionMode === "completa" && (
            <div className="space-y-4 rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold">Datos clinicos opcionales</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sintomas</Label>
                  <Textarea className="rounded-xl" rows={2} placeholder="Descripción de síntomas observados..." value={base.symptoms} onChange={(e) => setBase((b) => ({ ...b, symptoms: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Diagnostico</Label>
                  <Textarea className="rounded-xl" rows={2} placeholder="Diagnostico clinico..." value={base.diagnosis} onChange={(e) => setBase((b) => ({ ...b, diagnosis: e.target.value }))} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Peso (kg)</Label>
                    <Input className="h-11 rounded-xl" placeholder="Ej: 28.5" value={base.weight} onChange={(e) => setBase((b) => ({ ...b, weight: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperatura ( °C)</Label>
                    <Input className="h-11 rounded-xl" placeholder="Ej: 38.5" value={base.temperature} onChange={(e) => setBase((b) => ({ ...b, temperature: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Proximo control</Label>
                  <Input type="date" className="h-11 rounded-xl" value={base.nextControlDate} onChange={(e) => setBase((b) => ({ ...b, nextControlDate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Textarea className="rounded-xl" rows={2} placeholder="Notas adicionales..." value={base.notes} onChange={(e) => setBase((b) => ({ ...b, notes: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border-2 border-warning/30 bg-warning/5">
            <button type="button" className="flex w-full items-center justify-between p-4 text-left" onClick={() => setShowClinicalData(!showClinicalData)}>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <ShieldAlert className="h-4 w-4 text-warning" />
                Datos importantes detectados durante la atención
              </span>
              {showClinicalData ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {showClinicalData && (
              <div className="space-y-4 px-4 pb-4">
                <p className="text-xs text-muted-foreground">Se actualizarán la ficha de la mascota y se registrarán como eventos en la historia clínica.</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-destructive" /> Agregar alergia</Label>
                    <div className="flex gap-2">
                      <Input className="h-10 flex-1" placeholder="Ej: Penicilina, Pollo..." value={alergiaInput} onChange={(e) => setAlergiaInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = alergiaInput.trim(); if (v) { setBase((b) => ({ ...b, newAlergias: [...b.newAlergias, v] })); setAlergiaInput("") } } }} />
                      <Button type="button" variant="outline" className="h-10 px-3" onClick={() => { const v = alergiaInput.trim(); if (v) { setBase((b) => ({ ...b, newAlergias: [...b.newAlergias, v] })); setAlergiaInput("") } }}><Plus className="mr-1 h-4 w-4" />Agregar</Button>
                    </div>
                    {base.newAlergias.length > 0 && (
                      <div className="flex flex-wrap gap-2">{base.newAlergias.map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">{a}<button onClick={() => setBase((b) => ({ ...b, newAlergias: b.newAlergias.filter((_, idx) => idx !== i) }))} className="ml-1 rounded-full p-0.5 hover:bg-black/10"><X className="h-3 w-3" /></button></span>
                      ))}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-warning" /> Agregar antecedente</Label>
                    <div className="flex gap-2">
                      <Input className="h-10 flex-1" placeholder="Ej: Convulsiones anteriores..." value={antecedenteInput} onChange={(e) => setAntecedenteInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = antecedenteInput.trim(); if (v) { setBase((b) => ({ ...b, newAntecedentes: [...b.newAntecedentes, v] })); setAntecedenteInput("") } } }} />
                      <Button type="button" variant="outline" className="h-10 px-3" onClick={() => { const v = antecedenteInput.trim(); if (v) { setBase((b) => ({ ...b, newAntecedentes: [...b.newAntecedentes, v] })); setAntecedenteInput("") } }}><Plus className="mr-1 h-4 w-4" />Agregar</Button>
                    </div>
                    {base.newAntecedentes.length > 0 && (
                      <div className="flex flex-wrap gap-2">{base.newAntecedentes.map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-sm font-medium text-warning">{a}<button onClick={() => setBase((b) => ({ ...b, newAntecedentes: b.newAntecedentes.filter((_, idx) => idx !== i) }))} className="ml-1 rounded-full p-0.5 hover:bg-black/10"><X className="h-3 w-3" /></button></span>
                      ))}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-orange-600" /> Condición crónica</Label>
                    <div className="flex gap-2">
                      <Input className="h-10 flex-1" placeholder="Ej: Insuficiencia renal crónica..." value={condicionInput} onChange={(e) => setCondicionInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = condicionInput.trim(); if (v) { setBase((b) => ({ ...b, newCondicionesCronicas: [...b.newCondicionesCronicas, v] })); setCondicionInput("") } } }} />
                      <Button type="button" variant="outline" className="h-10 px-3" onClick={() => { const v = condicionInput.trim(); if (v) { setBase((b) => ({ ...b, newCondicionesCronicas: [...b.newCondicionesCronicas, v] })); setCondicionInput("") } }}><Plus className="mr-1 h-4 w-4" />Agregar</Button>
                    </div>
                    {base.newCondicionesCronicas.length > 0 && (
                      <div className="flex flex-wrap gap-2">{base.newCondicionesCronicas.map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full border border-orange-300/30 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">{a}<button onClick={() => setBase((b) => ({ ...b, newCondicionesCronicas: b.newCondicionesCronicas.filter((_, idx) => idx !== i) }))} className="ml-1 rounded-full p-0.5 hover:bg-black/10"><X className="h-3 w-3" /></button></span>
                      ))}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <Button className="h-12 rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90" onClick={() => setStep("acciones")} disabled={!base.reason.trim()}>
              Continuar a acciones clínicas
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function NuevaAtencionFlow() {
  return (
    <ClinicalActionFlow
      title="Nueva atención"
      description="Seleccioná cliente y mascota para registrar una atención clínica completa."
      actionLabel="Atención clínica"
      icon={HeartPulse}
    >
      {({ client, pet }) => <NuevaAtencionContent client={client} pet={pet} />}
    </ClinicalActionFlow>
  )
}
