"use client"

import { useState } from "react"
import { HeartPulse, Plus, ShieldAlert, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VETERINARIANS } from "@/lib/clinical-history-builder"
import type { ConsultaAtencionDraft } from "@/lib/atencion-store"

interface ConsultaFormProps {
  petId: number
  clientId: number
  petName: string
  clientName: string
  veterinarian?: string
  onSaved: (draft: ConsultaAtencionDraft) => void
  onCancel?: () => void
}

export function ConsultaForm({ petId, clientId, petName, clientName, veterinarian, onSaved, onCancel }: ConsultaFormProps) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    veterinarian: veterinarian || VETERINARIANS[0] || "",
    reason: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    weight: "",
    temperature: "",
    nextControlDate: "",
    status: "Registrada",
  })

  const [newAlergias, setNewAlergias] = useState<string[]>([])
  const [newAntecedentes, setNewAntecedentes] = useState<string[]>([])
  const [newCondicionesCronicas, setNewCondicionesCronicas] = useState<string[]>([])
  const [alergiaInput, setAlergiaInput] = useState("")
  const [antecedenteInput, setAntecedenteInput] = useState("")
  const [condicionInput, setCondicionInput] = useState("")
  const [showClinicalData, setShowClinicalData] = useState(false)

  function handleSubmit() {
    if (!form.reason.trim()) return
    const draft: ConsultaAtencionDraft = {
      tipo: "consulta",
      petId,
      clientId,
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
      newAlergias: newAlergias.length > 0 ? newAlergias : undefined,
      newAntecedentes: newAntecedentes.length > 0 ? newAntecedentes : undefined,
      newCondicionesCronicas: newCondicionesCronicas.length > 0 ? newCondicionesCronicas : undefined,
    }
    onSaved(draft)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-primary/5 p-3">
        <p className="text-sm font-medium">
          {petName} · {clientName}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Fecha *</Label>
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

      <details open={showClinicalData} className="rounded-xl border">
        <summary className="cursor-pointer p-4 font-semibold" onClick={(e) => { e.preventDefault(); setShowClinicalData(!showClinicalData) }}>
          <ShieldAlert className="mr-2 inline h-4 w-4 text-warning" />
          Datos clinicos importantes detectados (opcional)
        </summary>
        <div className="space-y-4 px-4 pb-4">
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
              <Input className="h-10 flex-1" placeholder="Ej: Convulsiones anteriores..." value={antecedenteInput} onChange={(e) => setAntecedenteInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = antecedenteInput.trim(); if (v) { setNewAntecedentes((a) => [...a, v]); setAntecedenteInput("") } } }} />
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

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-orange-600" />
              Condicion cronica
            </Label>
            <div className="flex gap-2">
              <Input className="h-10 flex-1" placeholder="Ej: Insuficiencia renal cronica..." value={condicionInput} onChange={(e) => setCondicionInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = condicionInput.trim(); if (v) { setNewCondicionesCronicas((a) => [...a, v]); setCondicionInput("") } } }} />
              <Button type="button" variant="outline" className="h-10 px-3" onClick={() => { const v = condicionInput.trim(); if (v) { setNewCondicionesCronicas((a) => [...a, v]); setCondicionInput("") } }}>
                <Plus className="mr-1 h-4 w-4" />
                Agregar
              </Button>
            </div>
            {newCondicionesCronicas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newCondicionesCronicas.map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full border border-orange-300/30 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
                    {a}
                    <button onClick={() => setNewCondicionesCronicas((arr) => arr.filter((_, idx) => idx !== i))} className="ml-1 rounded-full p-0.5 hover:bg-black/10"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Las alergias, antecedentes y condiciones se agregaran a la ficha de la mascota y se registraran como eventos en la historia clinica.
          </p>
        </div>
      </details>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" className="h-14 flex-1 rounded-xl text-base font-bold" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button
          className="h-14 flex-1 rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={!form.reason.trim()}
        >
          <Plus className="mr-2 h-5 w-5" />
          Guardar atencion
        </Button>
      </div>
    </div>
  )
}