"use client"

import { useEffect, useState } from "react"
import { Syringe, ClipboardList, CalendarDays, PawPrint } from "lucide-react"
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
import { ClientPetSelector } from "./client-pet-selector"
import { FormFlowFooter } from "./form-flow-footer"
import { useFlowStore } from "@/components/layout/flow-store"

interface QuickCreatePetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialClienteId?: number | null
  /** Chain back to client creation when no owner exists yet. */
  onCreateClient?: () => void
  /** Open vaccine dialog pre-filled with this pet. */
  onNextVaccine?: (clienteId: number, mascotaId: number) => void
  /** Open treatment dialog pre-filled with this pet. */
  onNextTreatment?: (clienteId: number, mascotaId: number) => void
  /** Open turno dialog pre-filled with this pet. */
  onNextTurno?: (clienteId: number, mascotaId: number) => void
}

const emptyForm = {
  nombre: "",
  especie: "Perro",
  raza: "",
  sexo: "Hembra",
  fechaNacimiento: "",
  peso: "",
  estadoGeneral: "Saludable",
  alergias: "",
  antecedentes: "",
}

export function QuickCreatePetDialog({
  open,
  onOpenChange,
  initialClienteId = null,
  onCreateClient,
  onNextVaccine,
  onNextTreatment,
  onNextTurno,
}: QuickCreatePetDialogProps) {
  const { addMascota, clientes } = useFlowStore()
  const [clienteId, setClienteId] = useState<number | null>(initialClienteId)
  const [form, setForm] = useState(emptyForm)
  const [savedData, setSavedData] = useState<{ mascotaId: number; clienteId: number } | null>(null)

  useEffect(() => {
    if (open) setClienteId(initialClienteId)
  }, [open, initialClienteId])

  const set = (key: keyof typeof emptyForm, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const reset = () => {
    setForm(emptyForm)
    setSavedData(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Nueva mascota</DialogTitle>
          <DialogDescription>Asociá el paciente a un cliente y cargá sus datos básicos.</DialogDescription>
        </DialogHeader>

        {savedData ? (
          <FormFlowFooter
            title={`${form.nombre || "Mascota"} guardada`}
            description="Todo lo que cargues se registra solo en su historia clínica:"
            onNavigate={() => handleOpenChange(false)}
            actions={[
              {
                label: "Cargar vacuna",
                icon: Syringe,
                onClick: () => onNextVaccine?.(savedData.clienteId, savedData.mascotaId),
              },
              {
                label: "Cargar tratamiento",
                icon: ClipboardList,
                onClick: () => onNextTreatment?.(savedData.clienteId, savedData.mascotaId),
              },
              {
                label: "Agendar turno",
                icon: CalendarDays,
                onClick: () => onNextTurno?.(savedData.clienteId, savedData.mascotaId),
              },
            ]}
            sectionLink={{ label: "Ver ficha / historia clínica", icon: PawPrint, href: "/historial" }}
          />
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (!clienteId) return
              const dueno = clientes.find((c) => c.id === clienteId)?.nombre ?? ""
              const newId = addMascota({
                nombre: form.nombre,
                especie: form.especie,
                raza: form.raza,
                sexo: form.sexo,
                fechaNacimiento: form.fechaNacimiento,
                peso: form.peso,
                estadoGeneral: form.estadoGeneral,
                alergias: form.alergias,
                antecedentes: form.antecedentes,
                clienteId,
                dueno,
              })
              setSavedData({ mascotaId: newId, clienteId })
            }}
          >
            <ClientPetSelector
              clienteId={clienteId}
              onClienteChange={setClienteId}
              onCreateCliente={onCreateClient}
              withMascota={false}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="qp-nombre">Nombre *</Label>
                <Input id="qp-nombre" required value={form.nombre} onChange={(e) => set("nombre", e.target.value)} className="rounded-xl" placeholder="Ej: Luna" />
              </div>
              <div className="space-y-2">
                <Label>Especie</Label>
                <Select value={form.especie} onValueChange={(v) => set("especie", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Perro">Perro</SelectItem>
                    <SelectItem value="Gato">Gato</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qp-raza">Raza</Label>
                <Input id="qp-raza" value={form.raza} onChange={(e) => set("raza", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Sexo</Label>
                <Select value={form.sexo} onValueChange={(v) => set("sexo", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hembra">Hembra</SelectItem>
                    <SelectItem value="Macho">Macho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qp-nac">Fecha de nacimiento</Label>
                <Input id="qp-nac" type="date" value={form.fechaNacimiento} onChange={(e) => set("fechaNacimiento", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qp-peso">Peso (kg)</Label>
                <Input id="qp-peso" value={form.peso} onChange={(e) => set("peso", e.target.value)} className="rounded-xl" placeholder="Ej: 12.5" />
              </div>
              <div className="space-y-2">
                <Label>Estado general</Label>
                <Select value={form.estadoGeneral} onValueChange={(v) => set("estadoGeneral", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Saludable">Saludable</SelectItem>
                    <SelectItem value="En tratamiento">En tratamiento</SelectItem>
                    <SelectItem value="Control pendiente">Control pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="qp-alergias">Alergias</Label>
                <Input id="qp-alergias" value={form.alergias} onChange={(e) => set("alergias", e.target.value)} className="rounded-xl" placeholder="Separadas por coma (opcional)" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="qp-ant">Antecedentes</Label>
                <Textarea id="qp-ant" value={form.antecedentes} onChange={(e) => set("antecedentes", e.target.value)} className="rounded-xl" rows={2} placeholder="Opcional" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl" disabled={!clienteId}>
                Guardar mascota
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
