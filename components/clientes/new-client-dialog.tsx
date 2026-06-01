"use client"

import { useState, type ReactNode } from "react"
import { PawPrint, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function NewClientDialog({ trigger }: { trigger: ReactNode }) {
  const [petForms, setPetForms] = useState([1])

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo cliente con mascotas</DialogTitle>
          <DialogDescription>
            Alta preparada para guardar cliente y mascotas vinculadas en una sola operacion.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre del cliente" placeholder="Ej: Maria Garcia" />
            <Field label="Telefono / WhatsApp" placeholder="(376) XXX XXXX" />
            <Field label="Email" placeholder="cliente@email.com" />
            <Field label="Direccion" placeholder="Direccion del cliente" />
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/25 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">Mascotas vinculadas</h3>
                <p className="text-sm text-muted-foreground">
                  La mascota se carga junto al cliente, sin ir a otro modulo.
                </p>
              </div>
              <Button
                type="button"
                className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90"
                onClick={() => setPetForms((forms) => [...forms, forms.length + 1])}
              >
                <Plus className="mr-2 h-4 w-4" />
                Otra mascota
              </Button>
            </div>

            <div className="space-y-4">
              {petForms.map((formNumber) => (
                <div key={formNumber} className="rounded-lg border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                    <PawPrint className="h-4 w-4" />
                    Mascota {formNumber}
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Field label="Nombre" placeholder="Ej: Luna" />
                    <Field label="Especie" placeholder="Perro, gato..." />
                    <Field label="Raza" placeholder="Raza" />
                    <Field label="Nacimiento" placeholder="AAAA-MM-DD" />
                    <Field label="Peso" placeholder="Kg" />
                    <Field label="Sexo" placeholder="Hembra / Macho" />
                  </div>
                  <div className="mt-3">
                    <Label>Antecedentes o alertas</Label>
                    <Textarea placeholder="Alergias, antecedentes, observaciones clinicas..." />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" className="h-12 px-5">
              Cancelar
            </Button>
            <Button className="h-12 bg-primary px-6 text-base font-bold hover:bg-primary/90">
              Guardar cliente y mascotas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input placeholder={placeholder} />
    </div>
  )
}
