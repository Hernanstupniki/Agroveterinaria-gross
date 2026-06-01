"use client"

import { useState, type ComponentType } from "react"
import {
  Users,
  PawPrint,
  Syringe,
  ClipboardList,
  BookOpen,
  Scissors,
  CalendarDays,
  BarChart3,
} from "lucide-react"
import { ModuleCard, ModuleButton } from "./action-card"
import { QuickCreateClientDialog } from "@/components/shared/quick-create-client-dialog"
import { QuickCreatePetDialog } from "@/components/shared/quick-create-pet-dialog"
import { NewVaccineDialog } from "@/components/vacunas/new-vaccine-dialog"
import { NewTreatmentDialog } from "@/components/tratamientos/new-treatment-dialog"
import { NewSurgeryDialog } from "@/components/cirugias/new-surgery-dialog"
import { NewTurnoDialog } from "@/components/turnos/new-turno-dialog"

type DialogKey = "cliente" | "mascota" | "vacuna" | "tratamiento" | "cirugia" | "turno"

interface ModuleButtonDef {
  label: string
  href?: string
  dialog?: DialogKey
}

interface ModuleDef {
  id: string
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  buttons: ModuleButtonDef[]
}

const modules: ModuleDef[] = [
  {
    id: "clientes",
    title: "Clientes",
    description: "Propietarios, contacto, fichas y WhatsApp.",
    icon: Users,
    buttons: [
      { label: "Ver", href: "/clientes" },
      { label: "Crear", dialog: "cliente" },
    ],
  },
  {
    id: "mascotas",
    title: "Mascotas",
    description: "Pacientes, fichas y datos clínicos.",
    icon: PawPrint,
    buttons: [
      { label: "Ver", href: "/mascotas" },
      { label: "Crear", dialog: "mascota" },
    ],
  },
  {
    id: "vacunas",
    title: "Vacunas",
    description: "Aplicadas, próximas y vencidas.",
    icon: Syringe,
    buttons: [
      { label: "Ver", href: "/vacunas" },
      { label: "Cargar", dialog: "vacuna" },
    ],
  },
  {
    id: "tratamientos",
    title: "Tratamientos",
    description: "Activos, finalizados y plantillas.",
    icon: ClipboardList,
    buttons: [
      { label: "Ver", href: "/tratamientos" },
      { label: "Crear", dialog: "tratamiento" },
    ],
  },
  {
    id: "historial",
    title: "Historia clínica",
    description: "Consultas, vacunas, tratamientos, cirugías y estudios. Se carga sola.",
    icon: BookOpen,
    buttons: [{ label: "Ver", href: "/historial" }],
  },
  {
    id: "cirugias",
    title: "Cirugías",
    description: "Programadas, confirmadas y realizadas.",
    icon: Scissors,
    buttons: [
      { label: "Ver", href: "/cirugias" },
      { label: "Agendar", dialog: "cirugia" },
    ],
  },
  {
    id: "turnos",
    title: "Turnos",
    description: "Agenda clínica y próximos turnos.",
    icon: CalendarDays,
    buttons: [
      { label: "Ver", href: "/turnos" },
      { label: "Crear", dialog: "turno" },
    ],
  },
  {
    id: "resumen",
    title: "Resumen",
    description: "Métricas, alertas y actividad general.",
    icon: BarChart3,
    buttons: [{ label: "Ver", href: "/resumen" }],
  },
]

export function PrincipalActions() {
  // Active dialog
  const [active, setActive] = useState<DialogKey | null>(null)

  // Shared flow context — carries cliente & mascota across dialog transitions
  // so the user never has to search again within the same session flow.
  const [flowClienteId, setFlowClienteId] = useState<number | null>(null)
  const [flowMascotaId, setFlowMascotaId] = useState<number | null>(null)

  // ── Transitions ──────────────────────────────────────────────────────────

  const openWith = (key: DialogKey, clienteId?: number | null, mascotaId?: number | null) => {
    if (clienteId !== undefined) setFlowClienteId(clienteId)
    if (mascotaId !== undefined) setFlowMascotaId(mascotaId)
    setActive(key)
  }

  const close = () => setActive(null)

  // Called when a client is created → open pet dialog pre-filled with that client
  const handleNextPet = (clienteId: number) => {
    openWith("mascota", clienteId, null)
  }

  // Called when a pet is created → open next clinical dialog pre-filled
  const handlePetNextVaccine = (clienteId: number, mascotaId: number) => {
    openWith("vacuna", clienteId, mascotaId)
  }
  const handlePetNextTreatment = (clienteId: number, mascotaId: number) => {
    openWith("tratamiento", clienteId, mascotaId)
  }
  const handlePetNextTurno = (clienteId: number, mascotaId: number) => {
    openWith("turno", clienteId, mascotaId)
  }

  // Called from clinical dialogs → open next clinical dialog, carry context
  const handleNextTreatment = (cId: number | null, mId: number | null) => {
    openWith("tratamiento", cId, mId)
  }
  const handleNextSurgery = (cId: number | null, mId: number | null) => {
    openWith("cirugia", cId, mId)
  }
  const handleNextTurno = (cId: number | null, mId: number | null) => {
    openWith("turno", cId, mId)
  }

  // Chain back: any dialog can request opening client/pet creation
  const goCreateClient = () => openWith("cliente")
  const goCreatePet = (clienteId: number | null = null) => openWith("mascota", clienteId, null)

  return (
    <>
      <div className="stagger-in grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {modules.map((mod, i) => (
          <ModuleCard
            key={mod.id}
            title={mod.title}
            description={mod.description}
            icon={mod.icon}
            tone="magenta"
            index={i}
            footer={mod.buttons.map((b) =>
              b.dialog ? (
                <ModuleButton
                  key={b.label}
                  label={b.label}
                  variant="action"
                  tone="magenta"
                  onClick={() => openWith(b.dialog!)}
                />
              ) : (
                <ModuleButton key={b.label} label={b.label} href={b.href} variant="ver" tone="magenta" />
              ),
            )}
          />
        ))}
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}

      <QuickCreateClientDialog
        open={active === "cliente"}
        onOpenChange={(o) => (o ? openWith("cliente") : close())}
        onNextPet={handleNextPet}
      />

      <QuickCreatePetDialog
        open={active === "mascota"}
        onOpenChange={(o) => (o ? openWith("mascota") : close())}
        initialClienteId={flowClienteId}
        onCreateClient={goCreateClient}
        onNextVaccine={handlePetNextVaccine}
        onNextTreatment={handlePetNextTreatment}
        onNextTurno={handlePetNextTurno}
      />

      <NewVaccineDialog
        open={active === "vacuna"}
        onOpenChange={(o) => (o ? openWith("vacuna") : close())}
        initialClienteId={flowClienteId}
        initialMascotaId={flowMascotaId}
        onCreateClient={goCreateClient}
        onCreatePet={goCreatePet}
        onNextTreatment={handleNextTreatment}
        onNextTurno={handleNextTurno}
      />

      <NewTreatmentDialog
        open={active === "tratamiento"}
        onOpenChange={(o) => (o ? openWith("tratamiento") : close())}
        initialClienteId={flowClienteId}
        initialMascotaId={flowMascotaId}
        onCreateClient={goCreateClient}
        onCreatePet={goCreatePet}
        onNextSurgery={handleNextSurgery}
        onNextTurno={handleNextTurno}
      />

      <NewSurgeryDialog
        open={active === "cirugia"}
        onOpenChange={(o) => (o ? openWith("cirugia") : close())}
        initialClienteId={flowClienteId}
        initialMascotaId={flowMascotaId}
        onCreateClient={goCreateClient}
        onCreatePet={goCreatePet}
        onNextTreatment={handleNextTreatment}
        onNextTurno={handleNextTurno}
      />

      <NewTurnoDialog
        open={active === "turno"}
        onOpenChange={(o) => (o ? openWith("turno") : close())}
        initialClienteId={flowClienteId}
        initialMascotaId={flowMascotaId}
        onCreateClient={goCreateClient}
        onCreatePet={goCreatePet}
      />
    </>
  )
}
