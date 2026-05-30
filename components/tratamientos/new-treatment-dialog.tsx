"use client"

import { useState } from "react"
import { BookOpen, Eye, FileStack } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { ClientPetSelector } from "@/components/shared/client-pet-selector"
import { FormFlowFooter } from "@/components/shared/form-flow-footer"
import { plantillasTratamiento } from "@/lib/mock-data"

interface NewTreatmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateClient?: () => void
  onCreatePet?: (clienteId: number | null) => void
}

const emptyForm = {
  nombre: "",
  medicamento: "",
  dosis: "",
  frecuencia: "",
  duracion: "",
  fechaInicio: "",
  fechaFin: "",
  observaciones: "",
}

/**
 * Flow B + C — start a treatment, optionally from a reusable template
 * (e.g. Leishmaniasis). Picks/creates client and pet inline. On save the
 * treatment would be recorded in the pet's clinical history (mocked for now).
 */
export function NewTreatmentDialog({ open, onOpenChange, onCreateClient, onCreatePet }: NewTreatmentDialogProps) {
  const [clienteId, setClienteId] = useState<number | null>(null)
  const [mascotaId, setMascotaId] = useState<number | null>(null)
  const [plantillaId, setPlantillaId] = useState<string>("")
  const [form, setForm] = useState(emptyForm)
  const [saved, setSaved] = useState(false)

  const set = (key: keyof typeof emptyForm, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const reset = () => {
    setForm(emptyForm)
    setPlantillaId("")
    setClienteId(null)
    setMascotaId(null)
    setSaved(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  // Applying a template prefills fields but everything stays editable.
  const applyTemplate = (id: string) => {
    setPlantillaId(id)
    const t = plantillasTratamiento.find((p) => p.id === id)
    if (!t) return
    setForm((f) => ({
      ...f,
      nombre: t.nombre,
      medicamento: t.medicamentoBase,
      dosis: t.dosisSugerida,
      frecuencia: t.frecuenciaSugerida,
      duracion: t.duracionSugerida,
      observaciones: t.notas,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Nuevo tratamiento</DialogTitle>
          <DialogDescription>
            Elegí cliente y mascota, aplicá una plantilla si querés, y ajustá los datos.
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <FormFlowFooter
            title={`Tratamiento ${form.nombre || ""} guardado`}
            description="Quedó registrado en la historia clínica de la mascota y entre los tratamientos activos."
            onNavigate={() => handleOpenChange(false)}
            actions={[
              { label: "Ver historia clínica", icon: BookOpen, href: "/historial" },
              { label: "Ver ficha de la mascota", icon: Eye, href: "/mascotas", tone: "outline" },
            ]}
          />
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              setSaved(true)
            }}
          >
            <ClientPetSelector
              clienteId={clienteId}
              mascotaId={mascotaId}
              onClienteChange={setClienteId}
              onMascotaChange={setMascotaId}
              onCreateCliente={onCreateClient}
              onCreateMascota={(id) => onCreatePet?.(id)}
            />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileStack className="h-4 w-4 text-primary" />
                Plantilla de tratamiento
              </Label>
              <Select value={plantillaId} onValueChange={applyTemplate}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Sin plantilla (cargar manual)" />
                </SelectTrigger>
                <SelectContent>
                  {plantillasTratamiento.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nt-nombre">Tratamiento / diagnóstico *</Label>
                <Input id="nt-nombre" required value={form.nombre} onChange={(e) => set("nombre", e.target.value)} className="rounded-xl" placeholder="Ej: Leishmaniasis" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nt-med">Medicamento</Label>
                <Input id="nt-med" value={form.medicamento} onChange={(e) => set("medicamento", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nt-dosis">Dosis</Label>
                <Input id="nt-dosis" value={form.dosis} onChange={(e) => set("dosis", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nt-frec">Frecuencia</Label>
                <Input id="nt-frec" value={form.frecuencia} onChange={(e) => set("frecuencia", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nt-ini">Fecha de inicio</Label>
                <Input id="nt-ini" type="date" value={form.fechaInicio} onChange={(e) => set("fechaInicio", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nt-fin">Fecha de fin</Label>
                <Input id="nt-fin" type="date" value={form.fechaFin} onChange={(e) => set("fechaFin", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nt-obs">Observaciones / controles</Label>
                <Textarea id="nt-obs" value={form.observaciones} onChange={(e) => set("observaciones", e.target.value)} className="rounded-xl" rows={3} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl" disabled={!clienteId || !mascotaId}>
                Guardar tratamiento
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
