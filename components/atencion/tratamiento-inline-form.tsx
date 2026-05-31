"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import type { TratamientoAtencionDraft } from "@/lib/atencion-store"

interface TratamientoInlineFormProps {
  petId: number
  clientId: number
  onSaved: (draft: TratamientoAtencionDraft) => void
  onCancel?: () => void
}

export function TratamientoInlineForm({ petId, clientId, onSaved, onCancel }: TratamientoInlineFormProps) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    veterinarian: VETERINARIANS[0] || "",
    diagnosis: "",
    medicamento: "",
    dosis: "",
    frecuencia: "",
    duracion: "",
    indicaciones: "",
    nextControlDate: "",
  })

  function handleSubmit() {
    const draft: TratamientoAtencionDraft = {
      tipo: "tratamiento",
      petId,
      clientId,
      date: form.date,
      veterinarian: form.veterinarian,
      diagnosis: form.diagnosis || "Tratamiento sin diagnostico detallado",
      medicamento: form.medicamento || "Medicamento no especificado",
      dosis: form.dosis,
      frecuencia: form.frecuencia,
      duracion: form.duracion,
      indicaciones: form.indicaciones,
      nextControlDate: form.nextControlDate,
    }
    onSaved(draft)
  }

  return (
    <div className="space-y-4">
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
      </div>

      <div className="space-y-2">
        <Label>Diagnostico</Label>
        <Input className="h-11 rounded-xl" placeholder="Diagnostico que motiva el tratamiento" value={form.diagnosis} onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))} />
      </div>

      <div className="space-y-2">
        <Label>Medicamento</Label>
        <Input className="h-11 rounded-xl" placeholder="Nombre del medicamento" value={form.medicamento} onChange={(e) => setForm((f) => ({ ...f, medicamento: e.target.value }))} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Dosis</Label>
          <Input className="h-11 rounded-xl" placeholder="Ej: 10mg" value={form.dosis} onChange={(e) => setForm((f) => ({ ...f, dosis: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Frecuencia</Label>
          <Input className="h-11 rounded-xl" placeholder="Ej: Cada 12hs" value={form.frecuencia} onChange={(e) => setForm((f) => ({ ...f, frecuencia: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Duracion</Label>
          <Input className="h-11 rounded-xl" placeholder="Ej: 7 dias" value={form.duracion} onChange={(e) => setForm((f) => ({ ...f, duracion: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Indicaciones</Label>
        <Textarea className="rounded-xl" rows={2} placeholder="Instrucciones adicionales para el dueno..." value={form.indicaciones} onChange={(e) => setForm((f) => ({ ...f, indicaciones: e.target.value }))} />
      </div>

      <div className="space-y-2">
        <Label>Proximo control</Label>
        <Input type="date" className="h-11 rounded-xl" value={form.nextControlDate} onChange={(e) => setForm((f) => ({ ...f, nextControlDate: e.target.value }))} />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" className="h-14 flex-1 rounded-xl text-base font-bold" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button
          className="h-14 flex-1 rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90"
          onClick={handleSubmit}
        >
          <Plus className="mr-2 h-5 w-5" />
          Guardar tratamiento
        </Button>
      </div>
    </div>
  )
}
