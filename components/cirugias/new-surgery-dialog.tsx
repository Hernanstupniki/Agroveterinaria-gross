"use client"

import { useEffect, useState } from "react"
import { CalendarDays, ClipboardList, BookOpen, Scissors } from "lucide-react"
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
import { profesionales } from "@/lib/mock-data"

interface NewSurgeryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialClienteId?: number | null
  initialMascotaId?: number | null
  onCreateClient?: () => void
  onCreatePet?: (clienteId: number | null) => void
  onNextTreatment?: (clienteId: number | null, mascotaId: number | null) => void
  onNextTurno?: (clienteId: number | null, mascotaId: number | null) => void
}

const emptyForm = {
  tipo: "",
  veterinario: "Dr. García",
  fecha: "",
  hora: "",
  duracion: "",
  riesgo: "Bajo",
  notas: "",
}

export function NewSurgeryDialog({
  open,
  onOpenChange,
  initialClienteId = null,
  initialMascotaId = null,
  onCreateClient,
  onCreatePet,
  onNextTreatment,
  onNextTurno,
}: NewSurgeryDialogProps) {
  const [clienteId, setClienteId] = useState<number | null>(initialClienteId)
  const [mascotaId, setMascotaId] = useState<number | null>(initialMascotaId)
  const [form, setForm] = useState(emptyForm)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      setClienteId(initialClienteId)
      setMascotaId(initialMascotaId)
    }
  }, [open, initialClienteId, initialMascotaId])

  const set = (key: keyof typeof emptyForm, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const reset = () => {
    setForm(emptyForm)
    setSaved(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Nueva cirugía</DialogTitle>
          <DialogDescription>
            Queda programada y registrada en la historia clínica del paciente.
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <FormFlowFooter
            title={`Cirugía ${form.tipo || ""} agendada`}
            description="Quedó programada en la historia clínica."
            onNavigate={() => handleOpenChange(false)}
            actions={[
              {
                label: "Cargar tratamiento postoperatorio",
                icon: ClipboardList,
                onClick: () => onNextTreatment?.(clienteId, mascotaId),
              },
              {
                label: "Agendar turno de control",
                icon: CalendarDays,
                onClick: () => onNextTurno?.(clienteId, mascotaId),
              },
            ]}
            sectionLink={{ label: "Ver historia clínica", icon: BookOpen, href: "/historial" }}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ns-tipo">Tipo de cirugía *</Label>
                <Input id="ns-tipo" required value={form.tipo} onChange={(e) => set("tipo", e.target.value)} className="rounded-xl" placeholder="Ej: Castración, Extracción dental..." />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Veterinario</Label>
                <Select value={form.veterinario} onValueChange={(v) => set("veterinario", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {profesionales.filter((p) => p.rol === "Veterinario").map((p) => (
                      <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ns-fecha">Fecha *</Label>
                <Input id="ns-fecha" type="date" required value={form.fecha} onChange={(e) => set("fecha", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ns-hora">Hora</Label>
                <Input id="ns-hora" type="time" value={form.hora} onChange={(e) => set("hora", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ns-dur">Duración estimada</Label>
                <Input id="ns-dur" value={form.duracion} onChange={(e) => set("duracion", e.target.value)} className="rounded-xl" placeholder="Ej: 45 minutos" />
              </div>
              <div className="space-y-2">
                <Label>Nivel de riesgo</Label>
                <Select value={form.riesgo} onValueChange={(v) => set("riesgo", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bajo">Bajo</SelectItem>
                    <SelectItem value="Moderado">Moderado</SelectItem>
                    <SelectItem value="Alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ns-notas">Notas preoperatorias</Label>
                <Textarea id="ns-notas" value={form.notas} onChange={(e) => set("notas", e.target.value)} className="rounded-xl" rows={2} placeholder="Ayuno previo, instrucciones especiales..." />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl" disabled={!clienteId || !mascotaId || !form.tipo}>
                Agendar cirugía
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
