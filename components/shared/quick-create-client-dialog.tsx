"use client"

import { useState } from "react"
import { PawPrint } from "lucide-react"
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
import { FormFlowFooter } from "./form-flow-footer"
import { useFlowStore } from "@/components/layout/flow-store"

interface QuickCreateClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after save; passes the new client's id so the next dialog can pre-fill it. */
  onNextPet?: (clienteId: number) => void
}

const emptyForm = {
  nombre: "",
  telefono: "",
  whatsapp: "",
  direccion: "",
  observaciones: "",
  consentimientoWhatsApp: true,
}

export function QuickCreateClientDialog({ open, onOpenChange, onNextPet }: QuickCreateClientDialogProps) {
  const { addCliente } = useFlowStore()
  const [form, setForm] = useState(emptyForm)
  const [savedId, setSavedId] = useState<number | null>(null)

  const set = (key: keyof typeof emptyForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const reset = () => {
    setForm(emptyForm)
    setSavedId(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription>Registrá al propietario y sus datos de contacto.</DialogDescription>
        </DialogHeader>

        {savedId !== null ? (
          <FormFlowFooter
            title={`Cliente ${form.nombre} guardado`}
            description="¿Qué querés hacer ahora?"
            onNavigate={() => handleOpenChange(false)}
            actions={[
              {
                label: "Crear mascota para este cliente",
                icon: PawPrint,
                // Stays on Principal — opens pet dialog with this client pre-filled
                onClick: () => onNextPet?.(savedId),
              },
            ]}
            sectionLink={{ label: "Ir a Clientes", href: "/clientes" }}
          />
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              const newId = addCliente({
                nombre: form.nombre,
                telefono: form.telefono,
                whatsapp: form.whatsapp,
                direccion: form.direccion,
                observaciones: form.observaciones,
                consentimientoWhatsApp: form.consentimientoWhatsApp,
              })
              setSavedId(newId)
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="qc-nombre">Nombre y apellido *</Label>
                <Input
                  id="qc-nombre"
                  required
                  value={form.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  className="rounded-xl"
                  placeholder="Ej: María García"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qc-tel">Teléfono *</Label>
                <Input
                  id="qc-tel"
                  required
                  value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  className="rounded-xl"
                  placeholder="(376) 456 7890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qc-wa">WhatsApp</Label>
                <Input
                  id="qc-wa"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  className="rounded-xl"
                  placeholder="549376..."
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="qc-dir">Dirección</Label>
                <Input
                  id="qc-dir"
                  value={form.direccion}
                  onChange={(e) => set("direccion", e.target.value)}
                  className="rounded-xl"
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="qc-obs">Observaciones</Label>
                <Textarea
                  id="qc-obs"
                  value={form.observaciones}
                  onChange={(e) => set("observaciones", e.target.value)}
                  className="rounded-xl"
                  rows={2}
                  placeholder="Notas internas (opcional)"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="font-medium">Consentimiento WhatsApp</p>
                <p className="text-sm text-muted-foreground">Permite enviarle recordatorios por WhatsApp.</p>
              </div>
              <Switch
                checked={form.consentimientoWhatsApp}
                onCheckedChange={(v) => set("consentimientoWhatsApp", v)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl">
                Guardar cliente
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
