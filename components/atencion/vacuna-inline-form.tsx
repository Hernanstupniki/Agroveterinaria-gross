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
import { getActiveVaccinesForSpecies, getDosesForVaccine } from "@/lib/vaccine-workflow"
import { clientes, mascotas } from "@/lib/mock-data"
import type { VacunaAtencionDraft } from "@/lib/atencion-store"

interface VacunaInlineFormProps {
  petId: number
  clientId: number
  onSaved: (draft: VacunaAtencionDraft) => void
  onCancel?: () => void
}

export function VacunaInlineForm({ petId, clientId, onSaved, onCancel }: VacunaInlineFormProps) {
  const pet = mascotas.find((m) => m.id === petId)
  const species = pet?.especie || "Perro"

  const availableVaccines = getActiveVaccinesForSpecies(species)

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    veterinarian: "",
    vaccineId: availableVaccines[0]?.id || "",
    doseLabel: "",
    observations: "",
  })

  const selectedVaccine = availableVaccines.find((v) => v.id === form.vaccineId)
  const doses = selectedVaccine ? getDosesForVaccine(selectedVaccine.id) : []

  function handleSubmit() {
    if (!selectedVaccine) return
    const draft: VacunaAtencionDraft = {
      tipo: "vacuna",
      petId,
      clientId,
      date: form.date,
      veterinarian: form.veterinarian,
      vaccineName: selectedVaccine.name,
      doseLabel: form.doseLabel || undefined,
      observations: form.observations || undefined,
    }
    onSaved(draft)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Fecha</Label>
        <Input type="date" className="h-11 rounded-xl" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
      </div>

      <div className="space-y-2">
        <Label>Vacuna</Label>
        {availableVaccines.length > 0 ? (
          <Select value={form.vaccineId} onValueChange={(v) => setForm((f) => ({ ...f, vaccineId: v, doseLabel: "" }))}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Seleccionar vacuna" /></SelectTrigger>
            <SelectContent>
              {availableVaccines.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input className="h-11 rounded-xl" placeholder="Nombre de la vacuna" value={form.vaccineId} onChange={(e) => setForm((f) => ({ ...f, vaccineId: e.target.value }))} />
        )}
      </div>

      {doses.length > 0 && (
        <div className="space-y-2">
          <Label>Dosis</Label>
          <Select value={form.doseLabel} onValueChange={(v) => setForm((f) => ({ ...f, doseLabel: v }))}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Seleccionar dosis" /></SelectTrigger>
            <SelectContent>
              {doses.map((d) => (
                <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Observaciones</Label>
        <Textarea className="rounded-xl" rows={2} placeholder="Lote, laboratorio, observaciones..." value={form.observations} onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))} />
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
          disabled={!form.vaccineId}
        >
          <Plus className="mr-2 h-5 w-5" />
          Guardar vacuna
        </Button>
      </div>
    </div>
  )
}
