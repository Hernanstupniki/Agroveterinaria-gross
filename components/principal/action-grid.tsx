import {
  UserPlus,
  PawPrint,
  Stethoscope,
  Syringe,
  ClipboardList,
  Scissors,
  FileText,
  BookOpen,
  MessageCircle,
  BarChart3,
} from "lucide-react"
import { ActionCard, type ActionCardProps } from "./action-card"

// Quick actions in the order a clinical day usually flows.
const actions: Omit<ActionCardProps, "index">[] = [
  { href: "/clientes?nuevo=1", icon: UserPlus, title: "Nuevo cliente", description: "Registrar propietario y datos de contacto", tone: "magenta" },
  { href: "/mascotas?nuevo=1", icon: PawPrint, title: "Nueva mascota", description: "Asociar paciente a un cliente", tone: "magenta" },
  { href: "/historial?nueva-consulta=1", icon: Stethoscope, title: "Nueva consulta", description: "Registrar motivo, diagnóstico y evolución", tone: "magenta" },
  { href: "/vacunas", icon: Syringe, title: "Vacunas", description: "Aplicar vacuna o revisar vencimientos", tone: "green" },
  { href: "/tratamientos", icon: ClipboardList, title: "Tratamientos", description: "Iniciar o controlar tratamiento activo", tone: "magenta" },
  { href: "/cirugias", icon: Scissors, title: "Cirugías", description: "Programar cirugía y requisitos previos", tone: "magenta" },
  { href: "/estudios", icon: FileText, title: "Estudios", description: "Adjuntar análisis, radiografías o archivos", tone: "green" },
  { href: "/historial", icon: BookOpen, title: "Historia clínica", description: "Consultar historial completo del paciente", tone: "magenta" },
  { href: "/recordatorios", icon: MessageCircle, title: "Recordatorios", description: "Vacunas, controles, cirugías y tratamientos", tone: "green" },
  { href: "/resumen", icon: BarChart3, title: "Resumen", description: "Métricas, alertas y actividad", tone: "green" },
]

export function ActionGrid() {
  return (
    <div className="stagger-in grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
      {actions.map((action, i) => (
        <ActionCard key={action.href} index={i} {...action} />
      ))}
    </div>
  )
}
