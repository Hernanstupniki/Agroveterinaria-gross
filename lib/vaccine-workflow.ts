export type VaccineSpecies = "Perro" | "Gato" | "Otro"
export type VaccineIntervalUnit = "dias" | "semanas" | "meses" | "anos"
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
}

export interface VaccineDose {
  id: string
  vaccineId: string
  name: string
  order: number
  intervalValue: number
  intervalUnit: VaccineIntervalUnit
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
}

export interface VaccineReminder {
  id: string
  petId: number
  clientId: number
  vaccineId: string
  doseId: string
  estimatedAt: string
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
  },
  {
    id: "vac-demo-sextuple-perro",
    name: "Sextuple",
    species: "Perro",
    description: "Esquema demo con dosis inicial y refuerzo.",
    active: true,
    observations: "Configurable por especie y dosis.",
  },
  {
    id: "vac-demo-triple-felina",
    name: "Triple Felina",
    species: "Gato",
    description: "Esquema demo felino con refuerzo anual.",
    active: true,
    observations: "Semilla de ejemplo para gatos.",
  },
  {
    id: "vac-demo-leishmaniasis",
    name: "Leishmaniasis",
    species: "Perro",
    description: "Esquema demo con dosis seriadas.",
    active: true,
    observations: "Ejemplo de flujo con intervalos configurables.",
  },
]

export const vaccineDoses: VaccineDose[] = [
  {
    id: "dose-antirrabica-anual",
    vaccineId: "vac-demo-antirrabica-perro",
    name: "Refuerzo anual",
    order: 1,
    intervalValue: 1,
    intervalUnit: "anos",
    recurrent: true,
    observations: "Repite todos los anos desde la ultima aplicacion.",
  },
  {
    id: "dose-sextuple-1",
    vaccineId: "vac-demo-sextuple-perro",
    name: "Dosis 1",
    order: 1,
    intervalValue: 0,
    intervalUnit: "dias",
    recurrent: false,
    observations: "Primera dosis.",
  },
  {
    id: "dose-sextuple-2",
    vaccineId: "vac-demo-sextuple-perro",
    name: "Dosis 2",
    order: 2,
    intervalValue: 2,
    intervalUnit: "semanas",
    recurrent: false,
    observations: "Se calcula dos semanas despues de Dosis 1.",
  },
  {
    id: "dose-sextuple-refuerzo",
    vaccineId: "vac-demo-sextuple-perro",
    name: "Refuerzo anual",
    order: 3,
    intervalValue: 1,
    intervalUnit: "anos",
    recurrent: true,
    observations: "Refuerzo anual luego de completar esquema inicial.",
  },
  {
    id: "dose-triple-felina-anual",
    vaccineId: "vac-demo-triple-felina",
    name: "Refuerzo anual",
    order: 1,
    intervalValue: 1,
    intervalUnit: "anos",
    recurrent: true,
    observations: "Refuerzo anual felino.",
  },
  {
    id: "dose-leish-1",
    vaccineId: "vac-demo-leishmaniasis",
    name: "Dosis 1",
    order: 1,
    intervalValue: 0,
    intervalUnit: "dias",
    recurrent: false,
    observations: "Inicio de esquema.",
  },
  {
    id: "dose-leish-2",
    vaccineId: "vac-demo-leishmaniasis",
    name: "Dosis 2",
    order: 2,
    intervalValue: 2,
    intervalUnit: "semanas",
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
  return vaccineDoses
    .filter((dose) => dose.vaccineId === vaccineId)
    .sort((a, b) => a.order - b.order)
}

export function getActiveVaccinesForSpecies(species: string) {
  return vaccineSchemes.filter((scheme) => scheme.active && (scheme.species === species || scheme.species === "Otro"))
}

export function calculateNextDose(vaccineId: string, doseId: string, appliedAt: string) {
  const doses = getDosesForVaccine(vaccineId)
  const appliedDose = doses.find((dose) => dose.id === doseId)
  if (!appliedDose || !appliedAt) return null

  const nextDose = doses.find((dose) => dose.order === appliedDose.order + 1) || (appliedDose.recurrent ? appliedDose : null)
  if (!nextDose) return null

  const intervalSource = nextDose === appliedDose ? appliedDose : nextDose
  const estimatedAt = addInterval(appliedAt, intervalSource.intervalValue, intervalSource.intervalUnit)

  return {
    dose: nextDose,
    estimatedAt,
    reminder: {
      estimatedAt,
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
    status: "preparado",
  }
}

export function formatInterval(value: number, unit: VaccineIntervalUnit) {
  if (value === 0) return "Sin intervalo inicial"
  const singular: Record<VaccineIntervalUnit, string> = {
    dias: "dia",
    semanas: "semana",
    meses: "mes",
    anos: "ano",
  }
  return `${value} ${value === 1 ? singular[unit] : unit}`
}

function addInterval(date: string, value: number, unit: VaccineIntervalUnit) {
  const result = new Date(`${date}T00:00:00`)
  if (unit === "dias") result.setDate(result.getDate() + value)
  if (unit === "semanas") result.setDate(result.getDate() + value * 7)
  if (unit === "meses") result.setMonth(result.getMonth() + value)
  if (unit === "anos") result.setFullYear(result.getFullYear() + value)
  return result.toISOString().slice(0, 10)
}
