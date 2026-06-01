import { addPresetToDate, generateControls, generateLifetimeControls, type GeneratedControl } from "./clinical-mock-logic"
import { controlFrequencyPresets, durationPresets, getPreset, reminderPresets } from "./clinical-presets"
import { getPetTaxonomy, sortProtocolsByCompatibility, type LifeStageId, type ProtocolApplicability } from "./animal-taxonomy"

export type TreatmentStatus = "activo" | "pausado" | "finalizado" | "cancelado"
export type TreatmentDurationType = "fixed" | "lifetime"

export interface TreatmentProtocol extends ProtocolApplicability {
  id: string
  name: string
  description: string
  durationType: TreatmentDurationType
  durationPresetId: string
  controlFrequencyPresetId: string
  reminderOffsetPresetId: string
  indications: string
  observations: string
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
  observations: string
}

export const treatmentProtocols: TreatmentProtocol[] = [
  {
    id: "protocol-demo-leishmaniasis",
    name: "Leishmaniasis",
    description: "Protocolo demo de por vida con controles mensuales.",
    durationType: "lifetime",
    durationPresetId: "lifetime",
    controlFrequencyPresetId: "monthly",
    reminderOffsetPresetId: "3-days-before",
    indications: "Registrar evolucion, peso, tolerancia y signos clinicos en cada control.",
    observations: "No tiene fecha final automatica; se finaliza manualmente.",
    active: true,
    possibleStates: ["activo", "pausado", "finalizado", "cancelado"],
    animalTypeIds: ["perro"],
    breedIds: [],
    lifeStages: ["adult", "senior"],
    appliesToAllAnimalTypes: false,
    appliesToAllBreeds: true,
    appliesToAllLifeStages: false,
  },
  {
    id: "protocol-demo-otitis",
    name: "Otitis externa",
    description: "Protocolo demo de 2 semanas con controles frecuentes.",
    durationType: "fixed",
    durationPresetId: "2-weeks",
    controlFrequencyPresetId: "every-3-days",
    reminderOffsetPresetId: "1-day-before",
    indications: "Revisar conducto auditivo, dolor, secrecion y respuesta al tratamiento.",
    observations: "Ejemplo de tratamiento fijo con recordatorios.",
    active: true,
    possibleStates: ["activo", "pausado", "finalizado", "cancelado"],
    animalTypeIds: ["perro"],
    breedIds: [],
    lifeStages: ["adult", "senior"],
    appliesToAllAnimalTypes: false,
    appliesToAllBreeds: true,
    appliesToAllLifeStages: false,
  },
  {
    id: "protocol-demo-renal",
    name: "Enfermedad renal cronica",
    description: "Protocolo demo cronico con controles mensuales.",
    durationType: "lifetime",
    durationPresetId: "lifetime",
    controlFrequencyPresetId: "monthly",
    reminderOffsetPresetId: "1-week-before",
    indications: "Controlar parametros clinicos y estudios complementarios.",
    observations: "Seguimiento continuo con ventana mock de 6 meses.",
    active: true,
    possibleStates: ["activo", "pausado", "finalizado", "cancelado"],
    animalTypeIds: ["gato", "perro"],
    breedIds: [],
    lifeStages: ["senior", "adult"],
    appliesToAllAnimalTypes: false,
    appliesToAllBreeds: true,
    appliesToAllLifeStages: false,
  },
]

export const activeTreatmentsSeed: ActiveTreatment[] = [
  {
    id: "treat-demo-simon-renal",
    clientId: 2,
    petId: 2,
    protocolId: "protocol-demo-renal",
    name: "Enfermedad renal cronica",
    startedAt: "2026-06-01",
    status: "activo",
    observations: "Registro demo: monitorear hidratacion y apetito.",
  },
  {
    id: "treat-demo-milo-otitis",
    clientId: 4,
    petId: 4,
    protocolId: "protocol-demo-otitis",
    name: "Otitis externa",
    startedAt: "2026-06-01",
    status: "activo",
    observations: "Registro demo: evaluar respuesta a gotas oticas.",
  },
  {
    id: "treat-demo-luna-leish",
    clientId: 1,
    petId: 1,
    protocolId: "protocol-demo-leishmaniasis",
    name: "Leishmaniasis",
    startedAt: "2026-06-01",
    status: "pausado",
    observations: "Registro demo de protocolo de por vida pausado.",
  },
]

export function getTreatmentProtocol(protocolId: string) {
  return treatmentProtocols.find((protocol) => protocol.id === protocolId)
}

export function getTreatmentProtocolsForPet(pet: { especie: string; raza?: string; edad?: string; animalTypeId?: string; breedId?: string | null; lifeStage?: LifeStageId }) {
  return sortProtocolsByCompatibility(treatmentProtocols.filter((protocol) => protocol.active), getPetTaxonomy(pet))
}

export function getTreatmentDurationPreset(protocol: TreatmentProtocol) {
  return getPreset(protocol.durationPresetId, durationPresets)
}

export function getTreatmentFrequencyPreset(protocol: TreatmentProtocol) {
  return getPreset(protocol.controlFrequencyPresetId, controlFrequencyPresets)
}

export function getTreatmentReminderPreset(protocol: TreatmentProtocol) {
  return getPreset(protocol.reminderOffsetPresetId, reminderPresets)
}

export function calculateTreatmentEndDate(startedAt: string, protocolId: string) {
  const protocol = getTreatmentProtocol(protocolId)
  if (!protocol || protocol.durationType === "lifetime") return null
  return addPresetToDate(startedAt, getTreatmentDurationPreset(protocol))
}

export function generateTreatmentControls(startedAt: string, protocolId: string, status: TreatmentStatus = "activo") {
  const protocol = getTreatmentProtocol(protocolId)
  if (!protocol) return []

  const controlStatus: GeneratedControl["status"] =
    status === "pausado" ? "pausado" : status === "finalizado" || status === "cancelado" ? "cancelado" : "pendiente"

  if (protocol.durationType === "lifetime") {
    return generateLifetimeControls({
      startDate: startedAt,
      frequencyPreset: getTreatmentFrequencyPreset(protocol),
      reminderPreset: getTreatmentReminderPreset(protocol),
      label: `Control ${protocol.name}`,
      status: controlStatus,
    })
  }

  return generateControls({
    startDate: startedAt,
    durationPreset: getTreatmentDurationPreset(protocol),
    frequencyPreset: getTreatmentFrequencyPreset(protocol),
    reminderPreset: getTreatmentReminderPreset(protocol),
    label: `Control ${protocol.name}`,
    status: controlStatus,
  })
}

export function calculateNextTreatmentControl(startedAt: string, protocolId: string) {
  return generateTreatmentControls(startedAt, protocolId)[0]?.dueDate || null
}

export function buildActiveTreatmentView(treatment: ActiveTreatment) {
  const protocol = getTreatmentProtocol(treatment.protocolId)
  const generatedControls = generateTreatmentControls(treatment.startedAt, treatment.protocolId, treatment.status)
  const estimatedEndDate = calculateTreatmentEndDate(treatment.startedAt, treatment.protocolId)

  return {
    ...treatment,
    protocol,
    estimatedEndDate,
    generatedControls,
    generatedReminders: generatedControls
      .filter((control) => control.reminderDate)
      .map((control) => ({
        id: `reminder-${control.id}`,
        dueDate: control.dueDate,
        reminderDate: control.reminderDate,
        status: control.status,
        title: `Recordatorio ${control.title}`,
      })),
    nextControlAt: generatedControls.find((control) => control.status === "pendiente")?.dueDate || null,
  }
}

export function formatControlFrequency(protocol: TreatmentProtocol) {
  return getTreatmentFrequencyPreset(protocol).label
}
