"use client"

import { useEffect, useState } from "react"
import { BookOpen, CalendarDays } from "lucide-react"
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

interface NewTurnoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialClienteId?: number | null
  initialMascotaId?: number | null
  onCreateClient?: () => void
  onCreatePet?: (clienteId: number | null) => void
}

const emptyForm = {
  fecha: "",
  hora: "",
  tipo: "Consulta",
  motivo: "",
  profesional: "Dr. García",
}

export function NewTurnoDialog({
  open,
  onOpenChange,
  initialClienteId = null,
  initialMascotaId = null,
  onCreateClient,
  onCreatePet,
}: NewTurnoDialogProps) {
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
          <DialogTitle>Nuevo turno</DialogTitle>
          <DialogDescription>Reservá un turno para el paciente en la agenda clínica.</DialogDescription>
        </DialogHeader>

        {saved ? (
          <FormFlowFooter
            title="Turno agendado"
            description="Quedó reservado en la agenda."
            onNavigate={() => handleOpenChange(false)}
            actions={[]}
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
              <div className="space-y-2">
                <Label htmlFor="nt-fecha">Fecha *</Label>
                <Input id="nt-fecha" type="date" required value={form.fecha} onChange={(e) => set("fecha", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nt-hora">Hora *</Label>
                <Input id="nt-hora" type="time" required value={form.hora} onChange={(e) => set("hora", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de turno</Label>
                <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta">Consulta</SelectItem>
                    <SelectItem value="Vacunación">Vacunación</SelectItem>
                    <SelectItem value="Control">Control</SelectItem>
                    <SelectItem value="Cirugía">Cirugía</SelectItem>
                    <SelectItem value="Estudio">Estudio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Profesional</Label>
                <Select value={form.profesional} onValueChange={(v) => set("profesional", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {profesionales.filter((p) => p.rol === "Veterinario").map((p) => (
                      <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nt-motivo">Motivo</Label>
                <Textarea id="nt-motivo" value={form.motivo} onChange={(e) => set("motivo", e.target.value)} className="rounded-xl" rows={2} placeholder="Motivo del turno (opcional)" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl" disabled={!clienteId || !mascotaId}>
                Agendar turno
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
