"use client"

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
  UserPlus,
  Stethoscope,
  ClipboardPlus,
  CalendarPlus,
  FileUp,
  MessageCirclePlus,
} from "lucide-react"
import { ActionCard, type PrincipalActionItem } from "./action-card"
import { useActivePatient } from "@/components/layout/active-patient"

// VER... — consultar cada sección (tono neutro).
const viewActions: PrincipalActionItem[] = [
  { title: "Ver clientes", description: "Propietarios, contacto y mascotas asociadas.", icon: Users, href: "/clientes", tone: "neutral" },
  { title: "Ver mascotas", description: "Pacientes, fichas y datos clínicos.", icon: PawPrint, href: "/mascotas", tone: "neutral" },
  { title: "Ver historia clínica", description: "Timeline clínico completo por mascota.", icon: BookOpen, href: "/historial", tone: "neutral" },
  { title: "Ver vacunas", description: "Aplicadas, próximas y vencidas.", icon: Syringe, href: "/vacunas", tone: "neutral" },
  { title: "Ver tratamientos", description: "Activos, finalizados y plantillas.", icon: ClipboardList, href: "/tratamientos", tone: "neutral" },
  { title: "Ver cirugías", description: "Programadas, confirmadas y realizadas.", icon: Scissors, href: "/cirugias", tone: "neutral" },
  { title: "Ver turnos", description: "Agenda clínica y próximos turnos.", icon: CalendarDays, href: "/turnos", tone: "neutral" },
  { title: "Ver estudios y archivos", description: "Análisis, radiografías y documentos.", icon: FileText, href: "/estudios", tone: "neutral" },
  { title: "Ver recordatorios WhatsApp", description: "Pendientes, programados y enviados.", icon: MessageCircle, href: "/recordatorios", tone: "neutral" },
  { title: "Ver resumen", description: "Métricas, alertas y actividad general.", icon: BarChart3, href: "/resumen", tone: "neutral" },
  { title: "Ver configuración", description: "Parámetros clínicos y sistema.", icon: Settings, href: "/configuracion", tone: "neutral" },
]

// CREAR / CARGAR... — acciones operativas (acento más fuerte).
const createActions: PrincipalActionItem[] = [
  { title: "Crear cliente", description: "Registrar propietario y datos de contacto.", icon: UserPlus, href: "/clientes?nuevo=1", tone: "magenta" },
  { title: "Crear mascota", description: "Asociar paciente a un cliente.", icon: PawPrint, href: "/mascotas?nuevo=1", tone: "magenta" },
  { title: "Cargar consulta", description: "Registrar motivo, diagnóstico y evolución.", icon: Stethoscope, href: "/historial?nueva-consulta=1", tone: "magenta" },
  { title: "Cargar vacuna", description: "Aplicar vacuna o programar próxima dosis.", icon: Syringe, href: "/vacunas?nueva=1", tone: "green" },
  { title: "Crear tratamiento", description: "Iniciar tratamiento o aplicar plantilla.", icon: ClipboardPlus, href: "/tratamientos?nuevo=1", tone: "magenta" },
  { title: "Agendar cirugía", description: "Programar cirugía y requisitos previos.", icon: Scissors, href: "/cirugias?nueva=1", tone: "magenta" },
  { title: "Crear turno", description: "Agendar atención clínica.", icon: CalendarPlus, href: "/turnos?nuevo=1", tone: "green" },
  { title: "Cargar estudio / archivo", description: "Adjuntar análisis, radiografía o documento.", icon: FileUp, href: "/estudios?nuevo=1", tone: "green" },
  { title: "Crear recordatorio WhatsApp", description: "Aviso de vacuna, cirugía, control o tratamiento.", icon: MessageCirclePlus, href: "/recordatorios?nuevo=1", tone: "green" },
  { title: "Crear plantilla de tratamiento", description: "Tratamientos repetibles como Leishmaniasis.", icon: ClipboardList, href: "/tratamientos?tab=plantillas&nuevo=1", tone: "magenta" },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{children}</h3>
  )
}

function Grid({ items }: { items: PrincipalActionItem[] }) {
  return (
    <div className="stagger-in grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item, i) => (
        <ActionCard key={item.title} item={item} index={i} />
      ))}
    </div>
  )
}

export function PrincipalActions() {
  const { patient } = useActivePatient()

  const fichaCard: PrincipalActionItem = patient
    ? {
        title: "Ver ficha de paciente activo",
        description: `Abrir la ficha de ${patient.name}.`,
        icon: FileHeart,
        href: `/mascotas/${patient.id}`,
        tone: "neutral",
        badge: patient.name,
      }
    : {
        title: "Ver ficha de paciente activo",
        description: "Seleccioná un paciente para abrir su ficha.",
        icon: FileHeart,
        disabled: true,
        disabledText: "Seleccioná un paciente activo en el encabezado para abrir su ficha.",
      }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionLabel>Ver...</SectionLabel>
        <Grid items={[...viewActions, fichaCard]} />
      </section>

      <section className="space-y-3">
        <SectionLabel>Crear / cargar...</SectionLabel>
        <Grid items={createActions} />
      </section>
    </div>
  )
}
