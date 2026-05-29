export type TreatmentStatus = "activo" | "pausado" | "finalizado"
export type TreatmentControlUnit = "dias" | "semanas" | "meses"

export interface TreatmentProtocol {
  id: string
  name: string
  description: string
  estimatedDuration: string
  controlFrequencyValue: number
  controlFrequencyUnit: TreatmentControlUnit
  indications: string
  reminders: string
  active: boolean
  possibleStates: TreatmentStatus[]
}

export interface ActiveTreatment {
  id: string
  clientId: number
  petId: number
  protocolId: string
  name: string
  startedAt: string
  status: TreatmentStatus
  nextControlAt: string
  observations: string
}

export const treatmentProtocols: TreatmentProtocol[] = [
  {
    id: "protocol-demo-leishmaniasis",
    name: "Leishmaniasis",
    description: "Protocolo demo para seguimiento clinico con controles periodicos.",
    estimatedDuration: "Segun evolucion clinica",
    controlFrequencyValue: 2,
    controlFrequencyUnit: "semanas",
    indications: "Registrar evolucion, peso, tolerancia y signos clinicos en cada control.",
    reminders: "Preparar recordatorio antes de cada control.",
    active: true,
    possibleStates: ["activo", "pausado", "finalizado"],
  },
  {
    id: "protocol-demo-otitis",
    name: "Otitis externa",
    description: "Protocolo demo para controles cortos y ajuste de medicacion.",
    estimatedDuration: "10 a 15 dias",
    controlFrequencyValue: 10,
    controlFrequencyUnit: "dias",
    indications: "Revisar conducto auditivo, dolor, secrecion y respuesta al tratamiento.",
    reminders: "Control al finalizar medicacion inicial.",
    active: true,
    possibleStates: ["activo", "pausado", "finalizado"],
  },
  {
    id: "protocol-demo-renal",
    name: "Enfermedad renal cronica",
    description: "Protocolo demo para seguimiento cronico.",
    estimatedDuration: "Indefinido",
    controlFrequencyValue: 1,
    controlFrequencyUnit: "meses",
    indications: "Controlar parametros clinicos y estudios complementarios.",
    reminders: "Recordatorio mensual de control.",
    active: true,
    possibleStates: ["activo", "pausado", "finalizado"],
  },
]

export const activeTreatmentsSeed: ActiveTreatment[] = [
  {
    id: "treat-demo-simon-renal",
    clientId: 2,
    petId: 2,
    protocolId: "protocol-demo-renal",
    name: "Enfermedad renal cronica",
    startedAt: "2024-01-12",
    status: "activo",
    nextControlAt: "2024-02-12",
    observations: "Registro demo: monitorear hidratacion y apetito.",
  },
  {
    id: "treat-demo-milo-otitis",
    clientId: 4,
    petId: 4,
    protocolId: "protocol-demo-otitis",
    name: "Otitis externa",
    startedAt: "2024-01-08",
    status: "activo",
    nextControlAt: "2024-01-18",
    observations: "Registro demo: evaluar respuesta a gotas oticas.",
  },
  {
    id: "treat-demo-luna-cadera",
    clientId: 1,
    petId: 1,
    protocolId: "protocol-demo-leishmaniasis",
    name: "Seguimiento locomotor",
    startedAt: "2024-01-10",
    status: "pausado",
    nextControlAt: "2024-02-10",
    observations: "Registro demo de seguimiento activo.",
  },
]

export function calculateNextTreatmentControl(startedAt: string, protocolId: string) {
  const protocol = treatmentProtocols.find((item) => item.id === protocolId)
  if (!protocol || !startedAt) return null
  return addInterval(startedAt, protocol.controlFrequencyValue, protocol.controlFrequencyUnit)
}

export function formatControlFrequency(value: number, unit: TreatmentControlUnit) {
  if (value === 0) return "Sin frecuencia"
  const singular: Record<TreatmentControlUnit, string> = {
    dias: "dia",
    semanas: "semana",
    meses: "mes",
  }
  return `${value} ${value === 1 ? singular[unit] : unit}`
}

function addInterval(date: string, value: number, unit: TreatmentControlUnit) {
  const result = new Date(`${date}T00:00:00`)
  if (unit === "dias") result.setDate(result.getDate() + value)
  if (unit === "semanas") result.setDate(result.getDate() + value * 7)
  if (unit === "meses") result.setMonth(result.getMonth() + value)
  return result.toISOString().slice(0, 10)
}
