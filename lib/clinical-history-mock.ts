import {
  cirugias,
  clientes,
  estudiosArchivos,
  historialLuna,
  mascotas,
  recordatoriosProgramados,
  tratamientosActivos,
  vacunasRegistradas,
} from "@/lib/mock-data"
import { buildMockClinicalHistory } from "@/lib/clinical-history-workflow"

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

function normalizeEventType(value?: string): ClinicalHistoryEventType {
  const clean = (value || "").toLowerCase()
  if (clean.includes("vacuna")) return "Vacuna"
  if (clean.includes("tratamiento")) return "Tratamiento"
  if (clean.includes("cir")) return "Cirugía"
  if (clean.includes("estudio") || clean.includes("eco") || clean.includes("radio")) return "Estudio"
  if (clean.includes("control")) return "Control"
  if (clean.includes("recordatorio")) return "Recordatorio"
  return "Consulta"
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

function getPetContextByName(petName: string) {
  const pet = mascotas.find((item) => item.nombre === petName) || mascotas[0]
  return getPetContext(pet.id)
}

function byNewestDate(a: ClinicalHistoryEvent, b: ClinicalHistoryEvent) {
  return b.date.localeCompare(a.date)
}

function dedupeEvents(events: ClinicalHistoryEvent[]) {
  const seen = new Set<string>()
  return events.filter((event) => {
    if (seen.has(event.id)) return false
    seen.add(event.id)
    return true
  })
}

export function buildGlobalClinicalHistoryMock(): ClinicalHistoryEvent[] {
  const luna = getPetContext(1)
  const lunaLegacyEvents: ClinicalHistoryEvent[] = historialLuna.map((event) => ({
    id: `legacy-luna-${event.id}`,
    petId: luna.pet.id,
    clientId: luna.client.id,
    petName: luna.petName,
    clientName: luna.clientName,
    eventType: normalizeEventType(event.tipo),
    date: event.fecha,
    veterinarian: event.veterinario || "Equipo clínico",
    title: event.motivo || event.procedimiento || "Evento clínico",
    reason: event.motivo,
    symptoms: event.sintomas,
    diagnosis: event.diagnostico,
    treatment: event.tratamiento,
    notes: event.observaciones || event.postoperatorio,
    weight: event.peso,
    nextControlDate: event.proximoControl || event.proximaVacuna,
    status: event.complicaciones ? `Complicaciones: ${event.complicaciones}` : undefined,
    relatedVaccineId: event.vacuna ? `legacy-vaccine-${event.id}` : undefined,
    attachmentName: event.archivo,
  }))

  const vaccineEvents: ClinicalHistoryEvent[] = vacunasRegistradas.map((vaccine) => {
    const context = getPetContext(vaccine.mascotaId)
    return {
      id: `registered-vaccine-${vaccine.id}`,
      petId: context.pet.id,
      clientId: context.client.id,
      petName: context.petName,
      clientName: context.clientName,
      eventType: "Vacuna",
      date: vaccine.fechaAplicada,
      veterinarian: vaccine.veterinario,
      title: `Vacuna aplicada: ${vaccine.vacuna}`,
      reason: "Registro de vacuna aplicada",
      diagnosis: vaccine.estado,
      notes: `Lote ${vaccine.lote} · ${vaccine.laboratorio}`,
      nextControlDate: vaccine.proximaFecha,
      status: vaccine.estado,
      relatedVaccineId: String(vaccine.id),
    }
  })

  const treatmentEvents: ClinicalHistoryEvent[] = tratamientosActivos.map((treatment) => {
    const context = getPetContext(treatment.mascotaId)
    return {
      id: `active-treatment-${treatment.id}`,
      petId: context.pet.id,
      clientId: context.client.id,
      petName: context.petName,
      clientName: context.clientName,
      eventType: "Tratamiento",
      date: treatment.fechaInicio,
      veterinarian: "Sistema demo",
      title: `Tratamiento iniciado: ${treatment.medicamento}`,
      reason: treatment.diagnostico,
      diagnosis: treatment.diagnostico,
      treatment: `${treatment.medicamento} · ${treatment.dosis} · ${treatment.frecuencia}`,
      notes: treatment.indicaciones,
      nextControlDate: treatment.proximoControl,
      status: treatment.estado,
      relatedTreatmentId: String(treatment.id),
    }
  })

  const studyEvents: ClinicalHistoryEvent[] = estudiosArchivos.map((study) => {
    const context = getPetContext(study.mascotaId)
    return {
      id: `study-${study.id}`,
      petId: context.pet.id,
      clientId: context.client.id,
      petName: context.petName,
      clientName: context.clientName,
      eventType: "Estudio",
      date: study.fecha,
      veterinarian: study.profesional,
      title: study.tipo,
      reason: study.descripcion,
      diagnosis: study.estado,
      notes: study.descripcion,
      status: study.estado,
      attachmentName: study.archivo || undefined,
    }
  })

  const surgeryEvents: ClinicalHistoryEvent[] = cirugias.map((surgery) => {
    const context = getPetContext(surgery.mascotaId)
    return {
      id: `surgery-${surgery.id}`,
      petId: context.pet.id,
      clientId: context.client.id,
      petName: context.petName,
      clientName: context.clientName,
      eventType: "Cirugía",
      date: surgery.registroCirugia?.fechaRealizacion || surgery.fecha,
      veterinarian: surgery.registroCirugia?.veterinario || surgery.veterinario,
      title: surgery.tipo,
      reason: surgery.registroCirugia?.diagnosticoPrevio || surgery.estado,
      diagnosis: surgery.registroCirugia?.diagnosticoPrevio || surgery.estado,
      treatment: surgery.postoperatorio?.medicacion?.join(", "),
      notes: surgery.registroCirugia?.observaciones || surgery.postoperatorio?.cuidadosEnCasa,
      nextControlDate: surgery.postoperatorio?.fechaControl,
      status: surgery.estado,
      attachmentName: surgery.consentimiento?.archivo || undefined,
    }
  })

  const reminderEvents: ClinicalHistoryEvent[] = recordatoriosProgramados.map((reminder) => {
    const context = getPetContextByName(reminder.mascota)
    return {
      id: `reminder-${reminder.id}`,
      petId: context.pet.id,
      clientId: context.client.id,
      petName: context.petName,
      clientName: context.clientName,
      eventType: "Recordatorio",
      date: reminder.fechaProgramada,
      veterinarian: "Sistema demo",
      title: reminder.tipo,
      reason: "Recordatorio clínico",
      notes: reminder.mensaje,
      status: reminder.estado,
    }
  })

  const generatedEvents: ClinicalHistoryEvent[] = mascotas.flatMap((pet) =>
    buildMockClinicalHistory(pet.id).map((event) => {
      const context = getPetContext(pet.id)
      const eventType: ClinicalHistoryEventType =
        event.type === "vaccine"
          ? "Vacuna"
          : event.type === "treatment"
            ? "Tratamiento"
            : event.type === "surgery"
              ? "Cirugía"
              : event.type === "reminder"
                ? "Recordatorio"
                : "Control"

      return {
        id: `generated-${event.id}`,
        petId: context.pet.id,
        clientId: context.client.id,
        petName: context.petName,
        clientName: context.clientName,
        eventType,
        date: event.date,
        veterinarian: "Sistema demo",
        title: event.title,
        reason: event.type === "control" ? "Control generado por protocolo mock" : event.title,
        diagnosis: event.status,
        notes: event.description,
        nextControlDate: event.type === "control" ? event.date : undefined,
        status: event.status,
      }
    }),
  )

  return dedupeEvents([
    ...lunaLegacyEvents,
    ...vaccineEvents,
    ...treatmentEvents,
    ...studyEvents,
    ...surgeryEvents,
    ...reminderEvents,
    ...generatedEvents,
  ]).sort(byNewestDate)
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

export function mergeClinicalHistoryEvents(baseEvents: ClinicalHistoryEvent[], localEvents: ClinicalHistoryEvent[]) {
  return dedupeEvents([...localEvents, ...baseEvents]).sort(byNewestDate)
}
