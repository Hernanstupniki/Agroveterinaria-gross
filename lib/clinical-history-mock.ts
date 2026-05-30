import { clientes, mascotas } from "@/lib/mock-data"

export const CLINICAL_HISTORY_STORAGE_KEY = "agroveterinaria-gross-clinical-history"

export type ClinicalHistoryEventType =
  | "Consulta"
  | "Vacuna"
  | "Tratamiento"
  | "Cirugía"
  | "Estudio"
  | "Control"
  | "Recordatorio"

export interface ClinicalHistoryEvent {
  id: string
  petId: number
  clientId: number
  petName: string
  clientName: string
  eventType: ClinicalHistoryEventType
  date: string
  veterinarian: string
  title: string
  reason?: string
  symptoms?: string
  diagnosis?: string
  treatment?: string
  notes?: string
  weight?: string
  temperature?: string
  nextControlDate?: string
  status?: string
  relatedProtocolId?: string
  relatedTreatmentId?: string
  relatedVaccineId?: string
  attachmentName?: string
}

export interface ConsultationDraft {
  clientId: number
  petId: number
  date: string
  veterinarian: string
  reason: string
  symptoms: string
  diagnosis: string
  treatment: string
  notes: string
  weight: string
  temperature: string
  nextControlDate: string
  status: string
  attachmentName: string
}

function getPetContext(petId: number) {
  const pet = mascotas.find((item) => item.id === petId) || mascotas[0]
  const client = clientes.find((item) => item.id === pet.clienteId) || clientes[0]

  return {
    pet,
    client,
    petName: pet.nombre,
    clientName: client.nombre,
  }
}

export function readStoredClinicalHistoryEvents(): ClinicalHistoryEvent[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(CLINICAL_HISTORY_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeStoredClinicalHistoryEvents(events: ClinicalHistoryEvent[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CLINICAL_HISTORY_STORAGE_KEY, JSON.stringify(events))
}

export function createConsultationEvent(draft: ConsultationDraft): ClinicalHistoryEvent {
  const context = getPetContext(draft.petId)
  const safeDate = draft.date || new Date().toISOString().slice(0, 10)

  return {
    id: `local-consultation-${Date.now()}`,
    petId: context.pet.id,
    clientId: context.client.id,
    petName: context.petName,
    clientName: context.clientName,
    eventType: "Consulta",
    date: safeDate,
    veterinarian: draft.veterinarian || "Equipo clínico",
    title: draft.reason || "Consulta clínica",
    reason: draft.reason,
    symptoms: draft.symptoms,
    diagnosis: draft.diagnosis,
    treatment: draft.treatment,
    notes: draft.notes,
    weight: draft.weight,
    temperature: draft.temperature,
    nextControlDate: draft.nextControlDate,
    status: draft.status || "Registrada",
    attachmentName: draft.attachmentName,
  }
}
