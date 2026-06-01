"use client"

import { useEffect, useState } from "react"
import { ClipboardList, CalendarDays, BookOpen, Syringe } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
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

interface NewVaccineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialClienteId?: number | null
  initialMascotaId?: number | null
  onCreateClient?: () => void
  onCreatePet?: (clienteId: number | null) => void
  onNextTreatment?: (clienteId: number | null, mascotaId: number | null) => void
  onNextTurno?: (clienteId: number | null, mascotaId: number | null) => void
}

const vacunasComunes = [
  "Antirrábica",
  "Quíntuple (perro)",
  "Séxtuple (perro)",
  "Triple felina",
  "Leucemia felina",
  "Tos de las perreras (KC)",
  "Desparasitación",
  "Otra",
]

const emptyForm = {
  vacuna: "",
  etapaVida: "Adulto",
  fechaAplicacion: "",
  lote: "",
  laboratorio: "",
  dosis: "",
  via: "Subcutánea",
  peso: "",
  proximaFecha: "",
  veterinario: "Dr. García",
  observaciones: "",
}

export function NewVaccineDialog({
  open,
  onOpenChange,
  initialClienteId = null,
  initialMascotaId = null,
  onCreateClient,
  onCreatePet,
  onNextTreatment,
  onNextTurno,
}: NewVaccineDialogProps) {
  const [clienteId, setClienteId] = useState<number | null>(initialClienteId)
  const [mascotaId, setMascotaId] = useState<number | null>(initialMascotaId)
  const [form, setForm] = useState(emptyForm)
  const [recordatorio, setRecordatorio] = useState(true)
  const [saved, setSaved] = useState(false)

  // Sync initial values when dialog re-opens with new context
  useEffect(() => {
    if (open) {
      setClienteId(initialClienteId)
      setMascotaId(initialMascotaId)
    }
  }, [open, initialClienteId, initialMascotaId])

  const set = (key: keyof typeof emptyForm, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const reset = () => {
    setForm(emptyForm)
    setRecordatorio(true)
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
          <DialogTitle>Nueva vacuna</DialogTitle>
          <DialogDescription>
            Se carga automáticamente en la historia clínica del paciente.
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <FormFlowFooter
            title={`Vacuna ${form.vacuna || ""} registrada`}
            description="Quedó cargada en la historia clínica."
            onNavigate={() => handleOpenChange(false)}
            actions={[
              {
                label: "Agendar turno de seguimiento",
                icon: CalendarDays,
                onClick: () => onNextTurno?.(clienteId, mascotaId),
              },
              {
                label: "Cargar tratamiento",
                icon: ClipboardList,
                onClick: () => onNextTreatment?.(clienteId, mascotaId),
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
                <Label>Vacuna *</Label>
                <Select value={form.vacuna} onValueChange={(v) => set("vacuna", v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Elegí la vacuna a aplicar" />
                  </SelectTrigger>
                  <SelectContent>
                    {vacunasComunes.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Etapa de vida</Label>
                <Select value={form.etapaVida} onValueChange={(v) => set("etapaVida", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cachorro">Cachorro</SelectItem>
                    <SelectItem value="Adulto">Adulto</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nv-fecha">Fecha de aplicación *</Label>
                <Input id="nv-fecha" type="date" required value={form.fechaAplicacion} onChange={(e) => set("fechaAplicacion", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nv-lote">Lote</Label>
                <Input id="nv-lote" value={form.lote} onChange={(e) => set("lote", e.target.value)} className="rounded-xl" placeholder="Ej: AB12345" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nv-lab">Laboratorio</Label>
                <Input id="nv-lab" value={form.laboratorio} onChange={(e) => set("laboratorio", e.target.value)} className="rounded-xl" placeholder="Ej: Nobivac" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nv-dosis">Dosis</Label>
                <Input id="nv-dosis" value={form.dosis} onChange={(e) => set("dosis", e.target.value)} className="rounded-xl" placeholder="Ej: 1 ml" />
              </div>
              <div className="space-y-2">
                <Label>Vía de aplicación</Label>
                <Select value={form.via} onValueChange={(v) => set("via", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Subcutánea">Subcutánea</SelectItem>
                    <SelectItem value="Intramuscular">Intramuscular</SelectItem>
                    <SelectItem value="Oral">Oral</SelectItem>
                    <SelectItem value="Intranasal">Intranasal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nv-peso">Peso (kg)</Label>
                <Input id="nv-peso" value={form.peso} onChange={(e) => set("peso", e.target.value)} className="rounded-xl" placeholder="Ej: 12.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nv-prox">Próxima dosis / refuerzo</Label>
                <Input id="nv-prox" type="date" value={form.proximaFecha} onChange={(e) => set("proximaFecha", e.target.value)} className="rounded-xl" />
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
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nv-obs">Observaciones</Label>
                <Textarea id="nv-obs" value={form.observaciones} onChange={(e) => set("observaciones", e.target.value)} className="rounded-xl" rows={2} placeholder="Reacciones, indicaciones (opcional)" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="font-medium">Programar recordatorio WhatsApp</p>
                <p className="text-sm text-muted-foreground">Avisar al dueño cuando se acerque la próxima dosis.</p>
              </div>
              <Switch checked={recordatorio} onCheckedChange={setRecordatorio} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl" disabled={!clienteId || !mascotaId || !form.vacuna}>
                Guardar vacuna
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
