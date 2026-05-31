"use client"

import { useState, type ComponentType } from "react"
import {
  Users,
  PawPrint,
  BookOpen,
  Syringe,
  ClipboardList,
  Scissors,
  CalendarDays,
  FileText,
  MessageCircle,
  BarChart3,
  Settings,
  FileHeart,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { mascotas } from "@/lib/mock-data"
import { useActivePatient } from "@/components/layout/active-patient"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ModuleCard, ModuleButton, type ModuleTone } from "./action-card"

interface ModuleButtonDef {
  label: string
  href?: string
  variant: "ver" | "action"
}

interface ModuleDef {
  id: string
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  tone: ModuleTone
  buttons: ModuleButtonDef[]
}

// One card per module. Actions are internal buttons, never separate cards.
const modules: ModuleDef[] = [
  {
    id: "clientes",
    title: "Clientes",
    description: "Propietarios, contacto y mascotas asociadas.",
    icon: Users,
    tone: "magenta",
    buttons: [
      { label: "Ver", href: "/clientes", variant: "ver" },
      { label: "Crear", href: "/clientes?nuevo=1", variant: "action" },
    ],
  },
  {
    id: "mascotas",
    title: "Mascotas",
    description: "Pacientes, fichas y datos clínicos.",
    icon: PawPrint,
    tone: "magenta",
    buttons: [
      { label: "Ver", href: "/mascotas", variant: "ver" },
      { label: "Crear", href: "/mascotas?nuevo=1", variant: "action" },
    ],
  },
  {
    id: "historial",
    title: "Historia clínica",
    description: "Consultas, vacunas, tratamientos, cirugías y estudios.",
    icon: BookOpen,
    tone: "magenta",
    buttons: [
      { label: "Ver", href: "/historial", variant: "ver" },
      { label: "Cargar consulta", href: "/historial?nueva-consulta=1", variant: "action" },
    ],
  },
  {
    id: "vacunas",
    title: "Vacunas",
    description: "Aplicadas, próximas y vencidas.",
    icon: Syringe,
    tone: "green",
    buttons: [
      { label: "Ver", href: "/vacunas", variant: "ver" },
      { label: "Cargar", href: "/vacunas?nueva=1", variant: "action" },
    ],
  },
  {
    id: "tratamientos",
    title: "Tratamientos",
    description: "Activos, finalizados y plantillas.",
    icon: ClipboardList,
    tone: "magenta",
    buttons: [
      { label: "Ver", href: "/tratamientos", variant: "ver" },
      { label: "Crear", href: "/tratamientos?nuevo=1", variant: "action" },
    ],
  },
  {
    id: "cirugias",
    title: "Cirugías",
    description: "Programadas, confirmadas y realizadas.",
    icon: Scissors,
    tone: "magenta",
    buttons: [
      { label: "Ver", href: "/cirugias", variant: "ver" },
      { label: "Agendar", href: "/cirugias?nueva=1", variant: "action" },
    ],
  },
  {
    id: "turnos",
    title: "Turnos",
    description: "Agenda clínica y próximos turnos.",
    icon: CalendarDays,
    tone: "green",
    buttons: [
      { label: "Ver", href: "/turnos", variant: "ver" },
      { label: "Crear", href: "/turnos?nuevo=1", variant: "action" },
    ],
  },
  {
    id: "estudios",
    title: "Estudios y archivos",
    description: "Análisis, radiografías y documentos clínicos.",
    icon: FileText,
    tone: "green",
    buttons: [
      { label: "Ver", href: "/estudios", variant: "ver" },
      { label: "Cargar", href: "/estudios?nuevo=1", variant: "action" },
    ],
  },
  {
    id: "recordatorios",
    title: "Recordatorios WhatsApp",
    description: "Pendientes, programados y enviados.",
    icon: MessageCircle,
    tone: "green",
    buttons: [
      { label: "Ver", href: "/recordatorios", variant: "ver" },
      { label: "Crear", href: "/recordatorios?nuevo=1", variant: "action" },
    ],
  },
  {
    id: "resumen",
    title: "Resumen",
    description: "Métricas, alertas y actividad general.",
    icon: BarChart3,
    tone: "neutral",
    buttons: [{ label: "Ver", href: "/resumen", variant: "ver" }],
  },
  {
    id: "configuracion",
    title: "Configuración",
    description: "Parámetros clínicos y preferencias del sistema.",
    icon: Settings,
    tone: "neutral",
    buttons: [{ label: "Ver", href: "/configuracion", variant: "ver" }],
  },
]

const patientOptions = mascotas.map((pet) => ({
  id: pet.id,
  name: pet.nombre,
  species: pet.especie,
  breed: pet.raza,
  owner: pet.dueno,
}))

/**
 * Paciente activo as a full module. The active-patient selection lives here
 * (moved out of the header). "Ver" opens the active ficha or, if none is set,
 * the patient picker; "Buscar" always opens the picker.
 */
function PacienteActivoCard({ index }: { index: number }) {
  const { patient, setPatient } = useActivePatient()
  const [open, setOpen] = useState(false)

  const footer = (
    <>
      {patient ? (
        <ModuleButton label="Ver ficha" href={`/mascotas/${patient.id}`} variant="action" tone="magenta" />
      ) : (
        <ModuleButton label="Ver" onClick={() => setOpen(true)} variant="action" tone="magenta" />
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border bg-background px-6 text-sm font-medium shadow-xs transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
            )}
          >
            Buscar
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar paciente, dueño o raza..." />
            <CommandList>
              <CommandEmpty>No se encontraron mascotas.</CommandEmpty>
              {patient && (
                <CommandGroup heading="Activo">
                  <CommandItem
                    value="__limpiar"
                    onSelect={() => {
                      setPatient(null)
                      setOpen(false)
                    }}
                    className="text-muted-foreground"
                  >
                    Quitar paciente activo
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup heading="Pacientes">
                {patientOptions.map((pet) => (
                  <CommandItem
                    key={pet.id}
                    value={`${pet.name} ${pet.owner} ${pet.breed}`}
                    onSelect={() => {
                      setPatient(pet)
                      setOpen(false)
                    }}
                    className="flex items-center gap-3 py-2"
                  >
                    <Check className={cn("h-4 w-4", patient?.id === pet.id ? "opacity-100" : "opacity-0")} />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">{pet.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{pet.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {pet.breed} · {pet.owner}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )

  return (
    <ModuleCard
      title="Paciente activo"
      description={
        patient
          ? `Ficha activa: ${patient.name}${patient.breed ? ` · ${patient.breed}` : ""}.`
          : "Seleccioná un paciente para abrir su ficha."
      }
      icon={FileHeart}
      tone="neutral"
      index={index}
      badge={patient?.name}
      footer={footer}
    />
  )
}

export function PrincipalActions() {
  return (
    <div className="stagger-in grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {modules.slice(0, 9).map((mod, i) => (
        <ModuleCard
          key={mod.id}
          title={mod.title}
          description={mod.description}
          icon={mod.icon}
          tone={mod.tone}
          index={i}
          footer={mod.buttons.map((b) => (
            <ModuleButton
              key={b.label}
              label={b.label}
              href={b.href}
              variant={b.variant}
              tone={mod.tone}
            />
          ))}
        />
      ))}

      {/* Paciente activo — module that owns the active-patient selection. */}
      <PacienteActivoCard index={9} />

      {modules.slice(9).map((mod, i) => (
        <ModuleCard
          key={mod.id}
          title={mod.title}
          description={mod.description}
          icon={mod.icon}
          tone={mod.tone}
          index={10 + i}
          footer={mod.buttons.map((b) => (
            <ModuleButton
              key={b.label}
              label={b.label}
              href={b.href}
              variant={b.variant}
              tone={mod.tone}
            />
          ))}
        />
      ))}
    </div>
  )
}
