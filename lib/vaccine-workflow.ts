import { addPresetToDate, calculateReminderDate } from "./clinical-mock-logic"
import { durationPresets, getPreset, reminderPresets, type ClinicalPreset } from "./clinical-presets"

export type VaccineSpecies = "Perro" | "Gato" | "Otro"
export type VaccinationOrigin = "aplicada_hoy" | "carga_historica"
export type VaccineScheduleStatus = "pendiente" | "aplicada" | "vencida" | "cancelada"
export type ReminderStatus = "preparado" | "programado" | "enviado" | "sin_recordatorio"

export interface VaccineScheme {
  id: string
  name: string
  species: VaccineSpecies
  description: string
  active: boolean
  observations: string
  reminderOffsetPresetId: string
}

export interface VaccineDose {
  id: string
  vaccineId: string
  name: string
  order: number
  intervalPresetId: string
  recurrent: boolean
  observations: string
}

export interface PetVaccination {
  id: string
  petId: number
  clientId: number
  vaccineId: string
  doseId: string
  appliedAt: string
  appliedBy: string
  observations: string
  origin: VaccinationOrigin
}

export interface PetVaccineSchedule {
  id: string
  petId: number
  clientId: number
  vaccineId: string
  doseId: string
  estimatedAt: string
  status: VaccineScheduleStatus
  reminderStatus: ReminderStatus
  reminderDate?: string | null
}

export interface VaccineReminder {
  id: string
  petId: number
  clientId: number
  vaccineId: string
  doseId: string
  estimatedAt: string
  reminderDate?: string | null
  status: ReminderStatus
}

export const vaccineSchemes: VaccineScheme[] = [
  {
    id: "vac-demo-antirrabica-perro",
    name: "Antirrabica",
    species: "Perro",
    description: "Esquema demo para refuerzo anual.",
    active: true,
    observations: "Usar como semilla de configuracion, no como dato clinico real.",
    reminderOffsetPresetId: "1-week-before",
  },
  {
    id: "vac-demo-sextuple-perro",
    name: "Sextuple",
    species: "Perro",
    description: "Esquema demo con dosis inicial y refuerzo.",
    active: true,
    observations: "Configurable por especie y dosis.",
    reminderOffsetPresetId: "3-days-before",
  },
  {
    id: "vac-demo-triple-felina",
    name: "Triple Felina",
    species: "Gato",
    description: "Esquema demo felino con refuerzo anual.",
    active: true,
    observations: "Semilla de ejemplo para gatos.",
    reminderOffsetPresetId: "1-week-before",
  },
  {
    id: "vac-demo-leishmaniasis",
    name: "Leishmaniasis",
    species: "Perro",
    description: "Esquema demo con dosis seriadas.",
    active: true,
    observations: "Ejemplo de flujo con intervalos configurables.",
    reminderOffsetPresetId: "3-days-before",
  },
]

export const vaccineDoses: VaccineDose[] = [
  {
    id: "dose-antirrabica-anual",
    vaccineId: "vac-demo-antirrabica-perro",
    name: "Refuerzo anual",
    order: 1,
    intervalPresetId: "1-year",
    recurrent: true,
    observations: "Repite todos los anos desde la ultima aplicacion.",
  },
  {
    id: "dose-sextuple-1",
    vaccineId: "vac-demo-sextuple-perro",
    name: "Dosis 1",
    order: 1,
    intervalPresetId: "1-day",
    recurrent: false,
    observations: "Primera dosis.",
  },
  {
    id: "dose-sextuple-2",
    vaccineId: "vac-demo-sextuple-perro",
    name: "Dosis 2",
    order: 2,
    intervalPresetId: "2-weeks",
    recurrent: false,
    observations: "Se calcula dos semanas despues de Dosis 1.",
  },
  {
    id: "dose-sextuple-refuerzo",
    vaccineId: "vac-demo-sextuple-perro",
    name: "Refuerzo anual",
    order: 3,
    intervalPresetId: "1-year",
    recurrent: true,
    observations: "Refuerzo anual luego de completar esquema inicial.",
  },
  {
    id: "dose-triple-felina-anual",
    vaccineId: "vac-demo-triple-felina",
    name: "Refuerzo anual",
    order: 1,
    intervalPresetId: "1-year",
    recurrent: true,
    observations: "Refuerzo anual felino.",
  },
  {
    id: "dose-leish-1",
    vaccineId: "vac-demo-leishmaniasis",
    name: "Dosis 1",
    order: 1,
    intervalPresetId: "1-day",
    recurrent: false,
    observations: "Inicio de esquema.",
  },
  {
    id: "dose-leish-2",
    vaccineId: "vac-demo-leishmaniasis",
    name: "Dosis 2",
    order: 2,
    intervalPresetId: "2-weeks",
    recurrent: false,
    observations: "Ejemplo solicitado: dos semanas despues de Dosis 1.",
  },
]

export const petVaccinationsSeed: PetVaccination[] = [
  {
    id: "pv-demo-luna-sextuple-1",
    petId: 1,
    clientId: 1,
    vaccineId: "vac-demo-sextuple-perro",
    doseId: "dose-sextuple-1",
    appliedAt: "2026-06-01",
    appliedBy: "Dr. Garcia",
    observations: "Registro demo: calcula Dosis 2 para 15/06/2026.",
    origin: "carga_historica",
  },
  {
    id: "pv-demo-rocky-antirrabica",
    petId: 3,
    clientId: 3,
    vaccineId: "vac-demo-antirrabica-perro",
    doseId: "dose-antirrabica-anual",
    appliedAt: "2025-01-05",
    appliedBy: "Dra. Lopez",
    observations: "Registro demo con refuerzo anual vencido.",
    origin: "carga_historica",
  },
  {
    id: "pv-demo-simon-triple",
    petId: 2,
    clientId: 2,
    vaccineId: "vac-demo-triple-felina",
    doseId: "dose-triple-felina-anual",
    appliedAt: "2026-03-02",
    appliedBy: "Dra. Lopez",
    observations: "Registro demo felino.",
    origin: "carga_historica",
  },
]

export function getDosesForVaccine(vaccineId: string) {
  return vaccineDoses.filter((dose) => dose.vaccineId === vaccineId).sort((a, b) => a.order - b.order)
}

export function getActiveVaccinesForSpecies(species: string) {
  return vaccineSchemes.filter((scheme) => scheme.active && (scheme.species === species || scheme.species === "Otro"))
}

export function getDoseIntervalPreset(dose: VaccineDose) {
  return getPreset(dose.intervalPresetId, durationPresets)
}

export function getSchemeReminderPreset(scheme: VaccineScheme) {
  return getPreset(scheme.reminderOffsetPresetId, reminderPresets)
}

export function calculateNextDose(vaccineId: string, doseId: string, appliedAt: string) {
  const scheme = vaccineSchemes.find((item) => item.id === vaccineId)
  const doses = getDosesForVaccine(vaccineId)
  const appliedDose = doses.find((dose) => dose.id === doseId)
  if (!scheme || !appliedDose || !appliedAt) return null

  const nextDose = doses.find((dose) => dose.order === appliedDose.order + 1) || (appliedDose.recurrent ? appliedDose : null)
  if (!nextDose) return null

  const intervalSource = nextDose === appliedDose ? appliedDose : nextDose
  const intervalPreset = getDoseIntervalPreset(intervalSource)
  const estimatedAt = addPresetToDate(appliedAt, intervalPreset)
  if (!estimatedAt) return null

  const reminderDate = calculateReminderDate(estimatedAt, getSchemeReminderPreset(scheme))

  return {
    dose: nextDose,
    estimatedAt,
    reminder: {
      estimatedAt,
      reminderDate,
      status: "preparado" as ReminderStatus,
    },
  }
}

export function buildPetVaccinationHistory(petId: number) {
  return petVaccinationsSeed
    .filter((record) => record.petId === petId)
    .map((record) => ({
      ...record,
      vaccine: vaccineSchemes.find((scheme) => scheme.id === record.vaccineId),
      dose: vaccineDoses.find((dose) => dose.id === record.doseId),
      next: calculateNextDose(record.vaccineId, record.doseId, record.appliedAt),
    }))
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
}

export function buildPetVaccineSchedule(petId: number, today = "2026-05-29"): PetVaccineSchedule[] {
  const schedule: PetVaccineSchedule[] = []

  for (const record of buildPetVaccinationHistory(petId)) {
    if (record.next) {
      schedule.push({
        id: `schedule-${record.id}`,
        petId: record.petId,
        clientId: record.clientId,
        vaccineId: record.vaccineId,
        doseId: record.next.dose.id,
        estimatedAt: record.next.estimatedAt,
        status: record.next.estimatedAt < today ? "vencida" : "pendiente",
        reminderStatus: "preparado",
        reminderDate: record.next.reminder.reminderDate,
      })
    }
  }

  return schedule.sort((a, b) => a.estimatedAt.localeCompare(b.estimatedAt))
}

export function buildReminderForSchedule(schedule: PetVaccineSchedule): VaccineReminder {
  return {
    id: `reminder-${schedule.id}`,
    petId: schedule.petId,
    clientId: schedule.clientId,
    vaccineId: schedule.vaccineId,
    doseId: schedule.doseId,
    estimatedAt: schedule.estimatedAt,
    reminderDate: schedule.reminderDate,
    status: "preparado",
  }
}

export function formatInterval(preset: ClinicalPreset) {
  if (preset.value === 0) return "Sin intervalo inicial"
  return preset.label
}
