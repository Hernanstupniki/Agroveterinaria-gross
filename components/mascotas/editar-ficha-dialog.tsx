"use client"

import { useState } from "react"
import {
  Activity,
  AlertTriangle,
  FileText,
  HeartPulse,
  Pencil,
  Plus,
  ShieldAlert,
  Stethoscope,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { updateMascotaData, type MascotaData } from "@/lib/mascota-store"

const ESTADOS_GENERALES = [
  "Saludable",
  "En tratamiento",
  "Vacuna vencida",
  "Control pendiente",
  "Cirugía programada",
]

interface ChipListProps {
  items: string[]
  onRemove: (index: number) => void
  variant?: "destructive" | "warning" | "primary" | "default"
}

function ChipList({ items, onRemove, variant = "default" }: ChipListProps) {
  if (items.length === 0) return null
  const colorClass =
    variant === "destructive"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : variant === "warning"
        ? "border-warning/30 bg-warning/10 text-warning"
        : variant === "primary"
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-muted text-foreground"
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${colorClass}`}>
          {item}
          <button onClick={() => onRemove(i)} className="ml-1 rounded-full p-0.5 hover:bg-black/10">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  )
}

interface ChipInputProps {
  placeholder: string
  onAdd: (value: string) => void
}

function ChipInput({ placeholder, onAdd }: ChipInputProps) {
  const [value, setValue] = useState("")
  const handleAdd = () => {
    const trimmed = value.trim()
    if (trimmed) {
      onAdd(trimmed)
      setValue("")
    }
  }
  return (
    <div className="flex gap-2">
      <Input className="h-10 flex-1" placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd() } }} />
      <Button type="button" variant="outline" className="h-10 px-3" onClick={handleAdd}>
        <Plus className="mr-1 h-4 w-4" />
        Agregar
      </Button>
    </div>
  )
}

interface EditarFichaDialogProps {
  mascota: MascotaData
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function EditarFichaDialog({ mascota, open, onOpenChange, onSaved }: EditarFichaDialogProps) {
  const [form, setForm] = useState({
    nombre: mascota.nombre,
    especie: mascota.especie,
    raza: mascota.raza,
    sexo: mascota.sexo,
    fechaNacimiento: mascota.fechaNacimiento,
    edad: mascota.edad,
    peso: mascota.peso,
    color: mascota.color,
    chip: mascota.chip,
    esterilizado: mascota.esterilizado ? "si" : "no",
    estadoGeneral: mascota.estadoGeneral,
    alergias: [...mascota.alergias],
    antecedentes: [...mascota.antecedentes],
    condicionesCronicas: [...mascota.condicionesCronicas],
    observacionesClinicas: mascota.observacionesClinicas,
    ultimoDiagnostico: mascota.ultimoDiagnostico,
  })

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setForm({
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza,
        sexo: mascota.sexo,
        fechaNacimiento: mascota.fechaNacimiento,
        edad: mascota.edad,
        peso: mascota.peso,
        color: mascota.color,
        chip: mascota.chip,
        esterilizado: mascota.esterilizado ? "si" : "no",
        estadoGeneral: mascota.estadoGeneral,
        alergias: [...mascota.alergias],
        antecedentes: [...mascota.antecedentes],
        condicionesCronicas: [...mascota.condicionesCronicas],
        observacionesClinicas: mascota.observacionesClinicas,
        ultimoDiagnostico: mascota.ultimoDiagnostico,
      })
    }
    onOpenChange(isOpen)
  }

  const handleSave = () => {
    updateMascotaData(mascota.id, {
      nombre: form.nombre,
      especie: form.especie,
      raza: form.raza,
      sexo: form.sexo,
      fechaNacimiento: form.fechaNacimiento,
      edad: form.edad,
      peso: form.peso,
      color: form.color,
      chip: form.chip,
      esterilizado: form.esterilizado === "si",
      estadoGeneral: form.estadoGeneral,
      alergias: form.alergias,
      antecedentes: form.antecedentes,
      condicionesCronicas: form.condicionesCronicas,
      observacionesClinicas: form.observacionesClinicas,
      ultimoDiagnostico: form.ultimoDiagnostico,
    })
    onOpenChange(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Editar ficha de {mascota.nombre}
          </DialogTitle>
          <DialogDescription>
            Modificá los datos de la mascota. Los cambios se reflejan en la ficha y en la historia clínica.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <Stethoscope className="h-4 w-4" />
              Datos básicos
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input className="h-11 rounded-xl" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Especie</Label>
                <Input className="h-11 rounded-xl" value={form.especie} onChange={(e) => setForm((f) => ({ ...f, especie: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Raza</Label>
                <Input className="h-11 rounded-xl" value={form.raza} onChange={(e) => setForm((f) => ({ ...f, raza: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Sexo</Label>
                <Select value={form.sexo} onValueChange={(v) => setForm((f) => ({ ...f, sexo: v }))}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hembra">Hembra</SelectItem>
                    <SelectItem value="Macho">Macho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha de nacimiento</Label>
                <Input type="date" className="h-11 rounded-xl" value={form.fechaNacimiento} onChange={(e) => setForm((f) => ({ ...f, fechaNacimiento: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Edad</Label>
                <Input className="h-11 rounded-xl" value={form.edad} onChange={(e) => setForm((f) => ({ ...f, edad: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input className="h-11 rounded-xl" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <FileText className="h-4 w-4" />
              Identificación y estado
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input className="h-11 rounded-xl" value={form.peso} onChange={(e) => setForm((f) => ({ ...f, peso: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Chip / Identificación</Label>
                <Input className="h-11 rounded-xl" value={form.chip} onChange={(e) => setForm((f) => ({ ...f, chip: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Esterilizado</Label>
                <Select value={form.esterilizado} onValueChange={(v) => setForm((f) => ({ ...f, esterilizado: v }))}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="si">Sí</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado clínico general</Label>
                <Select value={form.estadoGeneral} onValueChange={(v) => setForm((f) => ({ ...f, estadoGeneral: v }))}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS_GENERALES.map((estado) => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <Activity className="h-4 w-4" />
              Dueño / Contacto <span className="font-normal text-muted-foreground">(solo lectura)</span>
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Dueño</p>
                <p className="text-sm font-medium">{mascota.dueno}</p>
              </div>
              <div className="rounded-lg bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="text-sm font-medium">—</p>
              </div>
              <div className="rounded-lg bg-background/70 p-3">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">—</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-destructive">
              <ShieldAlert className="h-4 w-4" />
              Alergias
            </h3>
            {form.alergias.length > 0 ? (
              <ChipList items={form.alergias} onRemove={(i) => setForm((f) => ({ ...f, alergias: f.alergias.filter((_, idx) => idx !== i) }))} variant="destructive" />
            ) : (
              <p className="text-sm text-muted-foreground">Sin alergias registradas.</p>
            )}
            <ChipInput placeholder="Ej: Pollo, Penicilina..." onAdd={(v) => setForm((f) => ({ ...f, alergias: [...f.alergias, v] }))} />
          </section>

          <section className="space-y-4 rounded-xl border border-warning/20 bg-warning/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-warning">
              <HeartPulse className="h-4 w-4" />
              Antecedentes importantes
            </h3>
            {form.antecedentes.length > 0 ? (
              <ChipList items={form.antecedentes} onRemove={(i) => setForm((f) => ({ ...f, antecedentes: f.antecedentes.filter((_, idx) => idx !== i) }))} variant="warning" />
            ) : (
              <p className="text-sm text-muted-foreground">Sin antecedentes importantes registrados.</p>
            )}
            <ChipInput placeholder="Ej: Displasia de cadera, Cirugía previa..." onAdd={(v) => setForm((f) => ({ ...f, antecedentes: [...f.antecedentes, v] }))} />
          </section>

          <section className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-primary">
              <AlertTriangle className="h-4 w-4" />
              Condiciones crónicas
            </h3>
            {form.condicionesCronicas.length > 0 ? (
              <ChipList items={form.condicionesCronicas} onRemove={(i) => setForm((f) => ({ ...f, condicionesCronicas: f.condicionesCronicas.filter((_, idx) => idx !== i) }))} variant="primary" />
            ) : (
              <p className="text-sm text-muted-foreground">Sin condiciones crónicas registradas.</p>
            )}
            <ChipInput placeholder="Ej: Enfermedad renal crónica, Artrosis..." onAdd={(v) => setForm((f) => ({ ...f, condicionesCronicas: [...f.condicionesCronicas, v] }))} />
          </section>

          <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <FileText className="h-4 w-4" />
              Observaciones clínicas y diagnóstico
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Observaciones clínicas importantes</Label>
                <Textarea className="rounded-xl" rows={3} placeholder="Notas críticas para el veterinario..." value={form.observacionesClinicas} onChange={(e) => setForm((f) => ({ ...f, observacionesClinicas: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Último diagnóstico</Label>
                <Input className="h-11 rounded-xl" value={form.ultimoDiagnostico} onChange={(e) => setForm((f) => ({ ...f, ultimoDiagnostico: e.target.value }))} />
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          <Button variant="outline" className="h-12 rounded-xl px-6" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="h-12 rounded-xl bg-primary px-6 text-base font-bold hover:bg-primary/90" onClick={handleSave}>
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}