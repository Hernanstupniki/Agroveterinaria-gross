import {
  createConsultationEvent,
  readStoredClinicalHistoryEvents,
  writeStoredClinicalHistoryEvents,
  type ClinicalHistoryEvent,
} from "@/lib/clinical-history-mock"
import { updateMascotaData } from "@/lib/mascota-store"

export type ClasificacionAtencion =
  | "consulta_general"
  | "vacunacion"
  | "control"
  | "urgencia"
  | "postoperatorio"
  | "otro"

export const CLASIFICACIONES: { key: ClasificacionAtencion; label: string; icon: string }[] = [
  { key: "consulta_general", label: "Consulta general", icon: "Stethoscope" },
  { key: "vacunacion", label: "Vacunacion", icon: "Syringe" },
  { key: "control", label: "Control", icon: "ClipboardList" },
  { key: "urgencia", label: "Urgencia", icon: "AlertTriangle" },
  { key: "postoperatorio", label: "Postoperatorio", icon: "HeartPulse" },
  { key: "otro", label: "Otro", icon: "FileText" },
]

export interface AtencionBase {
  clasificacion: ClasificacionAtencion
  date: string
  veterinarian: string
  reason: string
  symptoms: string
  diagnosis: string
  weight: string
  temperature: string
  notes: string
  nextControlDate: string
  newAlergias: string[]
  newAntecedentes: string[]
  newCondicionesCronicas: string[]
}

export interface VacunaAccion {
  vaccineName: string
  doseLabel: string
  observations: string
}

export interface TratamientoAccion {
  diagnosis: string
  medicamento: string
  dosis: string
  frecuencia: string
  duracion: string
  indicaciones: string
  nextControlDate: string
}

export interface CirugiaAccion {
  surgeryType: string
  status: string
  notes: string
}

export interface EstudioAccion {
  studyType: string
  description: string
}

export interface RecordatorioAccion {
  date: string
  reminderType: string
  message: string
}

export interface AccionesActivas {
  vacuna: { activa: boolean; data: VacunaAccion }
  tratamiento: { activa: boolean; data: TratamientoAccion }
  cirugia: { activa: boolean; data: CirugiaAccion }
  estudio: { activa: boolean; data: EstudioAccion }
  recordatorio: { activa: boolean; data: RecordatorioAccion }
}

export const ACCIONES_CLINICAS = [
  { key: "vacuna" as const, label: "Vacuna aplicada", description: "Registrar una vacuna aplicada durante esta atencion.", icon: "Syringe" },
  { key: "tratamiento" as const, label: "Tratamiento indicado", description: "Indicar medicacion, duracion y controles.", icon: "Pill" },
  { key: "cirugia" as const, label: "Cirugia agendada", description: "Agendar o registrar una intervencion quirurgica.", icon: "Scissors" },
  { key: "estudio" as const, label: "Estudio solicitado", description: "Solicitar o registrar un estudio complementario.", icon: "FileText" },
  { key: "recordatorio" as const, label: "Recordatorio / proximo control", description: "Programar un recordatorio o control futuro.", icon: "Bell" },
]

export interface AtencionCompletaDraft {
  petId: number
  clientId: number
  base: AtencionBase
  acciones: AccionesActivas
}

export interface AtencionResult {
  success: boolean
  eventIds: string[]
  errors: string[]
}

function addEventToHistory(event: ClinicalHistoryEvent): string {
  const stored = readStoredClinicalHistoryEvents()
  stored.push(event)
  writeStoredClinicalHistoryEvents(stored)
  return event.id
}

export function guardarAtencionCompleta(draft: AtencionCompletaDraft): AtencionResult {
  const eventIds: string[] = []
  const errors: string[] = []
  const { petId, clientId, base, acciones } = draft

  try {
    const clasificacionLabel = CLASIFICACIONES.find((c) => c.key === base.clasificacion)?.label || "Atencion"
    const consultationEvent = createConsultationEvent({
      clientId,
      petId,
      date: base.date,
      veterinarian: base.veterinarian,
      reason: base.reason,
      symptoms: base.symptoms || "",
      diagnosis: base.diagnosis || "",
      treatment: "",
      notes: base.notes ? `[${clasificacionLabel}] ${base.notes}` : `[${clasificacionLabel}]`,
      weight: base.weight || "",
      temperature: base.temperature || "",
      nextControlDate: base.nextControlDate || "",
      status: base.clasificacion === "urgencia" ? "Urgencia" : "Registrada",
      attachmentName: "",
    })
    const mainEventId = addEventToHistory(consultationEvent)
    eventIds.push(mainEventId)

    if (base.newAlergias.length > 0) {
      const alerts = updateMascotaData(petId, { alergias: base.newAlergias })
      eventIds.push(...alerts)
    }
    if (base.newAntecedentes.length > 0) {
      const alerts = updateMascotaData(petId, { antecedentes: base.newAntecedentes })
      eventIds.push(...alerts)
    }
    if (base.newCondicionesCronicas.length > 0) {
      const alerts = updateMascotaData(petId, { condicionesCronicas: base.newCondicionesCronicas })
      eventIds.push(...alerts)
    }

    if (base.nextControlDate && base.nextControlDate.trim()) {
      const reminderEvent: ClinicalHistoryEvent = {
        id: `local-recordatorio-control-${Date.now()}`,
        petId,
        clientId,
        petName: consultationEvent.petName,
        clientName: consultationEvent.clientName,
        eventType: "Recordatorio",
        date: base.nextControlDate,
        veterinarian: base.veterinarian,
        title: `Control de seguimiento — ${base.reason}`,
        notes: `Proximo control programado para ${base.nextControlDate}`,
        status: "Programado",
      }
      const remId = addEventToHistory(reminderEvent)
      eventIds.push(remId)
    }

    if (acciones.vacuna.activa) {
      const v = acciones.vacuna.data
      const vacunaEvent: ClinicalHistoryEvent = {
        id: `local-vacuna-${Date.now()}-v`,
        petId,
        clientId,
        petName: consultationEvent.petName,
        clientName: consultationEvent.clientName,
        eventType: "Vacuna",
        date: base.date,
        veterinarian: base.veterinarian,
        title: `${v.vaccineName}${v.doseLabel ? ` — ${v.doseLabel}` : ""}`,
        reason: v.vaccineName,
        notes: v.observations || undefined,
        status: "Aplicada",
      }
      eventIds.push(addEventToHistory(vacunaEvent))
    }

    if (acciones.tratamiento.activa) {
      const t = acciones.tratamiento.data
      const treatmentEvent: ClinicalHistoryEvent = {
        id: `local-tratamiento-${Date.now()}-t`,
        petId,
        clientId,
        petName: consultationEvent.petName,
        clientName: consultationEvent.clientName,
        eventType: "Tratamiento",
        date: base.date,
        veterinarian: base.veterinarian,
        title: t.diagnosis,
        reason: t.diagnosis,
        treatment: `${t.medicamento} — ${t.dosis} — ${t.frecuencia}`,
        notes: t.indicaciones || undefined,
        status: "activo",
      }
      eventIds.push(addEventToHistory(treatmentEvent))

      if (t.nextControlDate && t.nextControlDate.trim()) {
        const treatmentRemEvent: ClinicalHistoryEvent = {
          id: `local-recordatorio-tratamiento-${Date.now()}-t`,
          petId,
          clientId,
          petName: consultationEvent.petName,
          clientName: consultationEvent.clientName,
          eventType: "Recordatorio",
          date: t.nextControlDate,
          veterinarian: base.veterinarian,
          title: `Control de tratamiento — ${t.diagnosis}`,
          notes: `Proximo control: ${t.nextControlDate}`,
          status: "Programado",
        }
        eventIds.push(addEventToHistory(treatmentRemEvent))
      }
    }

    if (acciones.cirugia.activa) {
      const c = acciones.cirugia.data
      const cirugiaEvent: ClinicalHistoryEvent = {
        id: `local-cirugia-${Date.now()}-c`,
        petId,
        clientId,
        petName: consultationEvent.petName,
        clientName: consultationEvent.clientName,
        eventType: "Cirugía",
        date: base.date,
        veterinarian: base.veterinarian,
        title: c.surgeryType,
        reason: c.surgeryType,
        notes: c.notes || undefined,
        status: c.status || "Programada",
      }
      eventIds.push(addEventToHistory(cirugiaEvent))
    }

    if (acciones.estudio.activa) {
      const e = acciones.estudio.data
      const estudioEvent: ClinicalHistoryEvent = {
        id: `local-estudio-${Date.now()}-e`,
        petId,
        clientId,
        petName: consultationEvent.petName,
        clientName: consultationEvent.clientName,
        eventType: "Estudio",
        date: base.date,
        veterinarian: base.veterinarian,
        title: e.studyType,
        reason: e.studyType,
        notes: e.description || undefined,
        status: "Pendiente",
      }
      eventIds.push(addEventToHistory(estudioEvent))
    }

    if (acciones.recordatorio.activa) {
      const r = acciones.recordatorio.data
      const remEvent: ClinicalHistoryEvent = {
        id: `local-recordatorio-${Date.now()}-r`,
        petId,
        clientId,
        petName: consultationEvent.petName,
        clientName: consultationEvent.clientName,
        eventType: "Recordatorio",
        date: r.date,
        veterinarian: base.veterinarian,
        title: r.reminderType,
        reason: r.reminderType,
        notes: r.message,
        status: "Programado",
      }
      eventIds.push(addEventToHistory(remEvent))
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Error desconocido al guardar la atencion")
  }

  return { success: errors.length === 0, eventIds, errors }
}

export type TipoAtencion = "consulta" | "vacuna" | "tratamiento" | "cirugia" | "estudio" | "recordatorio"

export interface ConsultaAtencionDraft {
  tipo: "consulta"
  petId: number
  clientId: number
  date: string
  veterinarian: string
  reason: string
  symptoms?: string
  diagnosis?: string
  treatment?: string
  notes?: string
  weight?: string
  temperature?: string
  nextControlDate?: string
  status?: string
  newAlergias?: string[]
  newAntecedentes?: string[]
  newCondicionesCronicas?: string[]
  observacionesClinicas?: string
}

export interface VacunaAtencionDraft {
  tipo: "vacuna"
  petId: number
  clientId: number
  date: string
  veterinarian: string
  vaccineName: string
  doseLabel?: string
  observations?: string
}

export interface TratamientoAtencionDraft {
  tipo: "tratamiento"
  petId: number
  clientId: number
  date: string
  veterinarian: string
  diagnosis: string
  medicamento: string
  dosis: string
  frecuencia: string
  duracion: string
  indicaciones?: string
  nextControlDate?: string
}

export interface CirugiaAtencionDraft {
  tipo: "cirugia"
  petId: number
  clientId: number
  date: string
  veterinarian: string
  surgeryType: string
  status?: string
  notes?: string
}

export interface EstudioAtencionDraft {
  tipo: "estudio"
  petId: number
  clientId: number
  date: string
  veterinarian: string
  studyType: string
  description?: string
}

export interface RecordatorioAtencionDraft {
  tipo: "recordatorio"
  petId: number
  clientId: number
  date: string
  reminderType: string
  message: string
}

export type AtencionDraft =
  | ConsultaAtencionDraft
  | VacunaAtencionDraft
  | TratamientoAtencionDraft
  | CirugiaAtencionDraft
  | EstudioAtencionDraft
  | RecordatorioAtencionDraft

export function guardarAtencion(draft: AtencionDraft): AtencionResult {
  const eventIds: string[] = []
  const errors: string[] = []
  try {
    if (draft.tipo === "consulta") {
      const d = draft as ConsultaAtencionDraft
      const consultationEvent = createConsultationEvent({
        clientId: d.clientId, petId: d.petId, date: d.date, veterinarian: d.veterinarian,
        reason: d.reason, symptoms: d.symptoms || "", diagnosis: d.diagnosis || "",
        treatment: d.treatment || "", notes: d.notes || "", weight: d.weight || "",
        temperature: d.temperature || "", nextControlDate: d.nextControlDate || "",
        status: d.status || "Registrada", attachmentName: "",
      })
      eventIds.push(addEventToHistory(consultationEvent))
      if (d.newAlergias && d.newAlergias.length > 0) eventIds.push(...updateMascotaData(d.petId, { alergias: d.newAlergias }))
      if (d.newAntecedentes && d.newAntecedentes.length > 0) eventIds.push(...updateMascotaData(d.petId, { antecedentes: d.newAntecedentes }))
      if (d.newCondicionesCronicas && d.newCondicionesCronicas.length > 0) eventIds.push(...updateMascotaData(d.petId, { condicionesCronicas: d.newCondicionesCronicas }))
    } else if (draft.tipo === "vacuna") {
      const d = draft as VacunaAtencionDraft
      eventIds.push(addEventToHistory({ id: `local-vacuna-${Date.now()}`, petId: d.petId, clientId: d.clientId, petName: "", clientName: "", eventType: "Vacuna", date: d.date, veterinarian: d.veterinarian, title: `${d.vaccineName}${d.doseLabel ? ` — ${d.doseLabel}` : ""}`, reason: d.vaccineName, notes: d.observations, status: "Aplicada" }))
    } else if (draft.tipo === "tratamiento") {
      const d = draft as TratamientoAtencionDraft
      eventIds.push(addEventToHistory({ id: `local-tratamiento-${Date.now()}`, petId: d.petId, clientId: d.clientId, petName: "", clientName: "", eventType: "Tratamiento", date: d.date, veterinarian: d.veterinarian, title: d.diagnosis, reason: d.diagnosis, treatment: `${d.medicamento} — ${d.dosis} — ${d.frecuencia}`, notes: d.indicaciones, status: "activo" }))
    } else if (draft.tipo === "cirugia") {
      const d = draft as CirugiaAtencionDraft
      eventIds.push(addEventToHistory({ id: `local-cirugia-${Date.now()}`, petId: d.petId, clientId: d.clientId, petName: "", clientName: "", eventType: "Cirugía", date: d.date, veterinarian: d.veterinarian, title: d.surgeryType, reason: d.surgeryType, notes: d.notes, status: d.status || "Programada" }))
    } else if (draft.tipo === "estudio") {
      const d = draft as EstudioAtencionDraft
      eventIds.push(addEventToHistory({ id: `local-estudio-${Date.now()}`, petId: d.petId, clientId: d.clientId, petName: "", clientName: "", eventType: "Estudio", date: d.date, veterinarian: d.veterinarian, title: d.studyType, reason: d.studyType, notes: d.description, status: "Pendiente" }))
    } else if (draft.tipo === "recordatorio") {
      const d = draft as RecordatorioAtencionDraft
      eventIds.push(addEventToHistory({ id: `local-recordatorio-${Date.now()}`, petId: d.petId, clientId: d.clientId, petName: "", clientName: "", eventType: "Recordatorio", date: d.date, veterinarian: "", title: d.reminderType, reason: d.reminderType, notes: d.message, status: "Programado" }))
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Error desconocido")
  }
  return { success: errors.length === 0, eventIds, errors }
}