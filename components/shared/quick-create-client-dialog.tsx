"use client"

import { useState } from "react"
import { PawPrint, Eye } from "lucide-react"
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

interface QuickCreateClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Invoked when the user chooses to create a pet for the new client (Flow A). */
  onCreatePet?: () => void
}

const emptyForm = {
  nombre: "",
  telefono: "",
  whatsapp: "",
  direccion: "",
  observaciones: "",
  consentimientoWhatsApp: true,
}

/**
 * Flow A — register a client without leaving the current screen, then offer the
 * natural next steps. Persistence is mocked (no backend yet); on save we move to
 * the success step. The structure is backend-ready.
 */
export function QuickCreateClientDialog({ open, onOpenChange, onCreatePet }: QuickCreateClientDialogProps) {
  const [form, setForm] = useState(emptyForm)
  const [saved, setSaved] = useState(false)

  const set = (key: keyof typeof emptyForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

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
      <DialogContent className="max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription>Registrá al propietario y sus datos de contacto.</DialogDescription>
        </DialogHeader>

        {saved ? (
          <FormFlowFooter
            title={`Cliente ${form.nombre || ""} guardado`}
            description="¿Qué querés hacer ahora?"
            onNavigate={() => handleOpenChange(false)}
            actions={[
              {
                label: "Crear mascota para este cliente",
                icon: PawPrint,
                onClick: () => onCreatePet?.(),
              },
              { label: "Ver cliente", icon: Eye, href: "/clientes", tone: "outline" },
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
