import { addPresetToDate, calculateReminderDate } from "./clinical-mock-logic"
import { durationPresets, getPreset, reminderPresets, type ClinicalPreset } from "./clinical-presets"
import { getPetTaxonomy, sortProtocolsByCompatibility, type LifeStageId, type ProtocolApplicability } from "./animal-taxonomy"

export type VaccineSpecies = "Perro" | "Gato" | "Otro"
export type VaccinationOrigin = "aplicada_hoy" | "carga_historica"
export type VaccineScheduleStatus = "pendiente" | "aplicada" | "vencida" | "cancelada"
export type ReminderStatus = "preparado" | "programado" | "enviado" | "sin_recordatorio"

export type VaccineDisplayStatus =
  | "aplicada"
  | "proxima"
  | "pendiente"
  | "vencida"
  | "historial_desconocido"

export interface VaccineScheme extends ProtocolApplicability {
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

export interface VaccineDisplayItem {
  id: string
  petId: number
  clientId: number
  vaccineId: string
  vaccineName: string
  doseId: string
  doseName: string
  doseOrder: number
  status: VaccineDisplayStatus
  appliedAt: string | null
  estimatedAt: string | null
  overdueDays: number | null
  blockedByPreviousDose: boolean
  canRegister: boolean
  actionLabel: string
  secondaryActionLabel: string | null
  reminderDate: string | null
  reminderStatus: string
  observations: string
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
    animalTypeIds: ["perro"],
    breedIds: [],
    lifeStages: ["adult"],
    appliesToAllAnimalTypes: false,
    appliesToAllBreeds: true,
    appliesToAllLifeStages: false,
  },
  {
    id: "vac-demo-sextuple-perro",
    name: "Sextuple",
    species: "Perro",
    description: "Esquema demo con dosis inicial y refuerzo.",
    active: true,
    observations: "Configurable por especie y dosis.",
    reminderOffsetPresetId: "3-days-before",
    animalTypeIds: ["perro"],
    breedIds: [],
    lifeStages: ["puppy", "adult"],
    appliesToAllAnimalTypes: false,
    appliesToAllBreeds: true,
    appliesToAllLifeStages: false,
  },
  {
    id: "vac-demo-triple-felina",
    name: "Triple Felina",
    species: "Gato",
    description: "Esquema demo felino con refuerzo anual.",
    active: true,
    observations: "Semilla de ejemplo para gatos.",
    reminderOffsetPresetId: "1-week-before",
    animalTypeIds: ["gato"],
    breedIds: [],
    lifeStages: ["adult"],
    appliesToAllAnimalTypes: false,
    appliesToAllBreeds: true,
    appliesToAllLifeStages: false,
  },
  {
    id: "vac-demo-leishmaniasis",
    name: "Leishmaniasis",
    species: "Perro",
    description: "Esquema demo con dosis seriadas.",
    active: true,
    observations: "Ejemplo de flujo con intervalos configurables.",
    reminderOffsetPresetId: "3-days-before",
    animalTypeIds: ["perro"],
    breedIds: [],
    lifeStages: ["adult"],
    appliesToAllAnimalTypes: false,
    appliesToAllBreeds: true,
    appliesToAllLifeStages: false,
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
    appliedAt: "2026-05-01",
    appliedBy: "Dr. Garcia",
    observations: "Dosis 1 aplicada. Dosis 2 esperada el 15/05/2026.",
    origin: "carga_historica",
  },
  {
    id: "pv-demo-luna-antirrabica",
    petId: 1,
    clientId: 1,
    vaccineId: "vac-demo-antirrabica-perro",
    doseId: "dose-antirrabica-anual",
    appliedAt: "2026-03-12",
    appliedBy: "Dr. Garcia",
    observations: "Aplicacion anual registrada sin reacciones adversas.",
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

export const MOCK_VACCINE_TODAY = "2026-05-30"

export function getDosesForVaccine(vaccineId: string) {
  return vaccineDoses.filter((dose) => dose.vaccineId === vaccineId).sort((a, b) => a.order - b.order)
}

export function getActiveVaccinesForSpecies(species: string) {
  return vaccineSchemes.filter((scheme) => scheme.active && (scheme.species === species || scheme.species === "Otro"))
}

export function getVaccinesForPet(pet: { especie: string; raza?: string; edad?: string; animalTypeId?: string; breedId?: string | null; lifeStage?: LifeStageId }) {
  return sortProtocolsByCompatibility(vaccineSchemes.filter((scheme) => scheme.active), getPetTaxonomy(pet))
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

function diffDays(dateA: string, dateB: string): number {
  const a = new Date(`${dateA}T00:00:00`)
  const b = new Date(`${dateB}T00:00:00`)
  return Math.ceil((a.getTime() - b.getTime()) / 86_400_000)
}

export function buildVaccineDisplayList(petId: number, today = MOCK_VACCINE_TODAY): VaccineDisplayItem[] {
  const petRecords = petVaccinationsSeed.filter((r) => r.petId === petId)
  const pet = { id: petId }
  const items: VaccineDisplayItem[] = []
  let itemId = 0

  const schemesForPet = vaccineSchemes.filter((scheme) => {
    if (!scheme.active) return false
    const petRecord = petRecords.find((r) => r.vaccineId === scheme.id)
    return !!petRecord || true
  })

  for (const scheme of schemesForPet) {
    const doses = getDosesForVaccine(scheme.id)
    const recordsForScheme = petRecords.filter((r) => r.vaccineId === scheme.id)

    if (recordsForScheme.length === 0) {
      const firstDose = doses.find((d) => d.order === 1)
      if (firstDose) {
        itemId++
        items.push({
          id: `vdi-${itemId}`,
          petId,
          clientId: 0,
          vaccineId: scheme.id,
          vaccineName: scheme.name,
          doseId: firstDose.id,
          doseName: firstDose.name,
          doseOrder: firstDose.order,
          status: "historial_desconocido",
          appliedAt: null,
          estimatedAt: null,
          overdueDays: null,
          blockedByPreviousDose: false,
          canRegister: true,
          actionLabel: "Registrar primera aplicacion",
          secondaryActionLabel: "Cargar historial",
          reminderDate: null,
          reminderStatus: "sin_recordatorio",
          observations: `No hay registros de ${scheme.name} para esta mascota.`,
        })
      }
      continue
    }

    for (const record of recordsForScheme) {
      const dose = doses.find((d) => d.id === record.doseId)
      itemId++
      items.push({
        id: `vdi-applied-${record.id}`,
        petId: record.petId,
        clientId: record.clientId,
        vaccineId: scheme.id,
        vaccineName: scheme.name,
        doseId: record.doseId,
        doseName: dose?.name || record.doseId,
        doseOrder: dose?.order || 0,
        status: "aplicada",
        appliedAt: record.appliedAt,
        estimatedAt: null,
        overdueDays: null,
        blockedByPreviousDose: false,
        canRegister: false,
        actionLabel: "Ver detalle",
        secondaryActionLabel: null,
        reminderDate: null,
        reminderStatus: "sin_recordatorio",
        observations: record.observations,
      })

      const nextResult = calculateNextDose(scheme.id, record.doseId, record.appliedAt)
      if (nextResult && nextResult.dose) {
        const nextDose = nextResult.dose
        const estimatedAt = nextResult.estimatedAt
        const daysUntil = diffDays(estimatedAt, today)
        const reminderDate = nextResult.reminder.reminderDate

        const previousDoses = doses.filter((d) => d.order < nextDose.order && d.order > 0)
        const previousDoseApplied = previousDoses.length > 0
          ? previousDoses.every((pd) => recordsForScheme.some((r) => r.doseId === pd.id))
          : true

        let status: VaccineDisplayStatus
        let actionLabel: string
        let secondaryActionLabel: string | null
        let overdueDays: number | null = null
        let canRegister: boolean

        if (daysUntil < 0) {
          status = "vencida"
          overdueDays = Math.abs(daysUntil)
          actionLabel = "Registrar aplicacion"
          secondaryActionLabel = "Reprogramar"
          canRegister = true
        } else if (daysUntil <= 3) {
          status = "pendiente"
          actionLabel = "Registrar aplicacion"
          secondaryActionLabel = "Reprogramar"
          canRegister = true
        } else {
          status = "proxima"
          actionLabel = "Programar"
          secondaryActionLabel = null
          canRegister = false
        }

        const blockedByPreviousDose = !previousDoseApplied && nextDose.order > 1 && !nextDose.recurrent

        if (blockedByPreviousDose) {
          canRegister = false
          actionLabel = `Registrar Dosis ${nextDose.order - 1} primero`
          secondaryActionLabel = null
        }

        itemId++
        items.push({
          id: `vdi-next-${record.id}-${nextDose.id}`,
          petId: record.petId,
          clientId: record.clientId,
          vaccineId: scheme.id,
          vaccineName: scheme.name,
          doseId: nextDose.id,
          doseName: nextDose.name,
          doseOrder: nextDose.order,
          status,
          appliedAt: null,
          estimatedAt,
          overdueDays,
          blockedByPreviousDose,
          canRegister,
          actionLabel,
          secondaryActionLabel,
          reminderDate,
          reminderStatus: "preparado",
          observations: nextDose.observations,
        })
      }
    }
  }

  return items.sort((a, b) => {
    const orderMap: Record<VaccineDisplayStatus, number> = {
      vencida: 0,
      pendiente: 1,
      proxima: 2,
      aplicada: 3,
      historial_desconocido: 4,
    }
    const statusDiff = orderMap[a.status] - orderMap[b.status]
    if (statusDiff !== 0) return statusDiff
    const aDate = a.estimatedAt || a.appliedAt || "9999-12-31"
    const bDate = b.estimatedAt || b.appliedAt || "9999-12-31"
    return aDate.localeCompare(bDate)
  })
}

export function formatOverdueText(days: number | null): string {
  if (days === null) return ""
  if (days === 1) return "Vencida hace 1 dia"
  if (days < 30) return `Vencida hace ${days} dias`
  const months = Math.floor(days / 30)
  if (months === 1) return "Vencida hace 1 mes"
  return `Vencida hace ${months} meses`
}

export function getVaccineStatusBadgeStyle(status: VaccineDisplayStatus): { badge: string; card: string; icon: string } {
  switch (status) {
    case "aplicada":
      return {
        badge: "bg-success text-success-foreground",
        card: "border-success/25 bg-success/5",
        icon: "bg-success/10 text-success",
      }
    case "proxima":
      return {
        badge: "bg-primary text-primary-foreground",
        card: "border-primary/25 bg-primary/5",
        icon: "bg-primary/10 text-primary",
      }
    case "pendiente":
      return {
        badge: "bg-secondary text-secondary-foreground",
        card: "border-secondary/50 bg-secondary/10",
        icon: "bg-secondary/20 text-secondary-foreground",
      }
    case "vencida":
      return {
        badge: "bg-destructive text-destructive-foreground",
        card: "border-destructive/40 bg-destructive/10",
        icon: "bg-destructive/10 text-destructive",
      }
    case "historial_desconocido":
      return {
        badge: "bg-muted text-muted-foreground",
        card: "border-muted bg-muted/20",
        icon: "bg-muted/30 text-muted-foreground",
      }
  }
}

export function getVaccineGroupOrder(status: VaccineDisplayStatus): number {
  const order: Record<VaccineDisplayStatus, number> = {
    vencida: 0,
    pendiente: 1,
    proxima: 2,
    aplicada: 3,
    historial_desconocido: 4,
  }
  return order[status]
}

export function getVaccineGroupLabel(status: VaccineDisplayStatus): string {
  const labels: Record<VaccineDisplayStatus, string> = {
    vencida: "Vacunas vencidas",
    pendiente: "Vacunas pendientes",
    proxima: "Proximas vacunas",
    aplicada: "Vacunas aplicadas",
    historial_desconocido: "Historial desconocido",
  }
  return labels[status]
}

export function getVaccineDisplayGroups(): VaccineDisplayStatus[] {
  return ["vencida", "pendiente", "proxima", "aplicada", "historial_desconocido"]
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

export function buildPetVaccineSchedule(petId: number, today = MOCK_VACCINE_TODAY): PetVaccineSchedule[] {
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