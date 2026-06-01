import { mascotas } from "@/lib/mock-data"
import {
  createAlertaClinicaEvent,
  readStoredClinicalHistoryEvents,
  writeStoredClinicalHistoryEvents,
} from "@/lib/clinical-history-mock"

export interface MascotaOverride {
  nombre?: string
  especie?: string
  raza?: string
  sexo?: string
  fechaNacimiento?: string
  edad?: string
  peso?: string
  color?: string
  chip?: string
  esterilizado?: boolean
  estadoGeneral?: string
  alergias?: string[]
  antecedentes?: string[]
  condicionesCronicas?: string[]
  observacionesClinicas?: string
  ultimoDiagnostico?: string
}

const MASCOTA_OVERRIDES_KEY = "agroveterinaria-gross-mascota-overrides"

function normalizeAntecedentes(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value
  if (typeof value === "string" && value.trim()) return [value.trim()]
  return []
}

export interface MascotaData {
  id: number
  nombre: string
  especie: string
  raza: string
  animalTypeId: string
  breedId: string
  lifeStage: string
  fechaNacimiento: string
  edad: string
  sexo: string
  peso: string
  color: string
  clienteId: number
  dueno: string
  estadoGeneral: string
  chip: string
  esterilizado: boolean
  alergias: string[]
  antecedentes: string[]
  condicionesCronicas: string[]
  observacionesClinicas: string
  ultimaConsulta: string
  ultimoDiagnostico: string
  foto: string | null
}

export function readMascotaOverrides(): Record<number, MascotaOverride> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(MASCOTA_OVERRIDES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function writeMascotaOverrides(overrides: Record<number, MascotaOverride>) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(MASCOTA_OVERRIDES_KEY, JSON.stringify(overrides))
}

export function getMascotaData(petId: number): MascotaData {
  const base = mascotas.find((m) => m.id === petId) || mascotas[0]
  const overrides = readMascotaOverrides()[petId] || {}

  return {
    id: base.id,
    nombre: overrides.nombre ?? base.nombre,
    especie: overrides.especie ?? base.especie,
    raza: overrides.raza ?? base.raza,
    animalTypeId: base.animalTypeId,
    breedId: base.breedId,
    lifeStage: base.lifeStage,
    fechaNacimiento: overrides.fechaNacimiento ?? base.fechaNacimiento,
    edad: overrides.edad ?? base.edad,
    sexo: overrides.sexo ?? base.sexo,
    peso: overrides.peso ?? base.peso,
    color: overrides.color ?? base.color,
    clienteId: base.clienteId,
    dueno: base.dueno,
    estadoGeneral: overrides.estadoGeneral ?? base.estadoGeneral,
    chip: overrides.chip ?? base.chip,
    esterilizado: overrides.esterilizado ?? base.esterilizado,
    alergias: overrides.alergias ?? normalizeAntecedentes(base.alergias),
    antecedentes: normalizeAntecedentes(overrides.antecedentes ?? base.antecedentes),
    condicionesCronicas:
      overrides.condicionesCronicas ??
      normalizeAntecedentes((base as Record<string, unknown>).condicionesCronicas as string | string[] | undefined),
    observacionesClinicas: overrides.observacionesClinicas ?? ((base as Record<string, unknown>).observacionesClinicas as string || ""),
    ultimaConsulta: base.ultimaConsulta,
    ultimoDiagnostico: overrides.ultimoDiagnostico ?? base.ultimoDiagnostico,
    foto: base.foto,
  }
}

export function updateMascotaData(petId: number, updates: MascotaOverride): string[] {
  const overrides = readMascotaOverrides()
  const current = getMascotaData(petId)

  overrides[petId] = { ...overrides[petId], ...updates }
  writeMascotaOverrides(overrides)

  const newAlertEvents: string[] = []

  const compareAndAlert = (newItems: string[] | undefined, currentItems: string[], alertType: string) => {
    if (!newItems) return
    const added = newItems.filter((item) => !currentItems.includes(item))
    for (const item of added) {
      const event = createAlertaClinicaEvent({
        petId,
        alertType,
        detail: item,
      })
      const stored = readStoredClinicalHistoryEvents()
      writeStoredClinicalHistoryEvents([...stored, event])
      newAlertEvents.push(event.id)
    }
  }

  compareAndAlert(updates.alergias, current.alergias, "alergia")
  compareAndAlert(updates.antecedentes, current.antecedentes, "antecedente")
  compareAndAlert(updates.condicionesCronicas, current.condicionesCronicas, "condicion_cronica")

  if (updates.observacionesClinicas !== undefined && updates.observacionesClinicas.trim() && !current.observacionesClinicas.trim()) {
    const event = createAlertaClinicaEvent({
      petId,
      alertType: "observacion",
      detail: updates.observacionesClinicas.trim(),
    })
    const stored = readStoredClinicalHistoryEvents()
    writeStoredClinicalHistoryEvents([...stored, event])
    newAlertEvents.push(event.id)
  }

  return newAlertEvents
}
