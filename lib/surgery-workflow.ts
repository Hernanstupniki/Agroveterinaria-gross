import { generateSurgeryFollowUps } from "./clinical-mock-logic"
import {
  controlFrequencyPresets,
  getPreset,
  reminderPresets,
  surgeryDurationPresets,
  surgeryFollowUpDurationPresets,
} from "./clinical-presets"

export interface SurgeryProtocol {
  id: string
  name: string
  procedureDurationPresetId: string
  followUpDurationPresetId: string
  controlFrequencyPresetId: string
  reminderOffsetPresetId: string
  preInstructions: string
  requirements: string
  postInstructions: string
  active: boolean
}

export const surgeryProtocols: SurgeryProtocol[] = [
  {
    id: "surgery-demo-castracion",
    name: "Castración",
    procedureDurationPresetId: "1-hour",
    followUpDurationPresetId: "1-week",
    controlFrequencyPresetId: "every-3-days",
    reminderOffsetPresetId: "1-day-before",
    preInstructions: "Ayuno, consentimiento informado y control prequirurgico.",
    requirements: "Peso actualizado, evaluacion clinica y consentimiento firmado.",
    postInstructions: "Control de herida, analgesia y retiro de puntos si corresponde.",
    active: true,
  },
  {
    id: "surgery-demo-limpieza-dental",
    name: "Limpieza dental",
    procedureDurationPresetId: "1-hour",
    followUpDurationPresetId: "1-week",
    controlFrequencyPresetId: "every-3-days",
    reminderOffsetPresetId: "1-day-before",
    preInstructions: "Evaluacion anestesica y revision oral previa.",
    requirements: "Consentimiento, ayuno y registro de piezas comprometidas.",
    postInstructions: "Control de dolor, dieta blanda y reevaluacion oral.",
    active: true,
  },
  {
    id: "surgery-demo-extraccion",
    name: "Extracción",
    procedureDurationPresetId: "45-min",
    followUpDurationPresetId: "2-weeks",
    controlFrequencyPresetId: "weekly",
    reminderOffsetPresetId: "2-days-before",
    preInstructions: "Diagnostico, imagen si corresponde y consentimiento.",
    requirements: "Definir pieza o tejido, riesgo y medicacion indicada.",
    postInstructions: "Seguimiento de cicatrizacion y signos de alarma.",
    active: true,
  },
  {
    id: "surgery-demo-menor",
    name: "Cirugía menor",
    procedureDurationPresetId: "30-min",
    followUpDurationPresetId: "3-days",
    controlFrequencyPresetId: "daily",
    reminderOffsetPresetId: "same-day",
    preInstructions: "Evaluacion clinica, antisepsia y consentimiento.",
    requirements: "Registrar zona, tecnica y materiales.",
    postInstructions: "Control local y recordatorio de revision.",
    active: true,
  },
  {
    id: "surgery-demo-general",
    name: "Cirugía programada general",
    procedureDurationPresetId: "2-hours",
    followUpDurationPresetId: "1-month",
    controlFrequencyPresetId: "weekly",
    reminderOffsetPresetId: "3-days-before",
    preInstructions: "Checklist prequirurgico completo.",
    requirements: "Agenda confirmada, consentimiento y responsable asignado.",
    postInstructions: "Seguimiento segun evolucion y controles programados.",
    active: true,
  },
]

export function getSurgeryProtocol(protocolId: string) {
  return surgeryProtocols.find((protocol) => protocol.id === protocolId)
}

export function getSurgeryProcedureDurationPreset(protocol: SurgeryProtocol) {
  return getPreset(protocol.procedureDurationPresetId, surgeryDurationPresets)
}

export function getSurgeryFollowUpDurationPreset(protocol: SurgeryProtocol) {
  return getPreset(protocol.followUpDurationPresetId, surgeryFollowUpDurationPresets)
}

export function getSurgeryFrequencyPreset(protocol: SurgeryProtocol) {
  return getPreset(protocol.controlFrequencyPresetId, controlFrequencyPresets)
}

export function getSurgeryReminderPreset(protocol: SurgeryProtocol) {
  return getPreset(protocol.reminderOffsetPresetId, reminderPresets)
}

export function inferSurgeryProtocol(type: string) {
  const normalized = type
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  return (
    surgeryProtocols.find((protocol) =>
      normalized.includes(
        protocol.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .split(" ")[0],
      ),
    ) || surgeryProtocols[0]
  )
}

export function buildSurgeryFollowUps(protocolId: string, surgeryDate: string) {
  const protocol = getSurgeryProtocol(protocolId)
  if (!protocol) return []

  return generateSurgeryFollowUps({
    surgeryDate,
    followUpDuration: getSurgeryFollowUpDurationPreset(protocol),
    frequencyPreset: getSurgeryFrequencyPreset(protocol),
    reminderPreset: getSurgeryReminderPreset(protocol),
  })
}
