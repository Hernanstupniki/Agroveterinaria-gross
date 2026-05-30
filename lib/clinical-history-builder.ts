import { clientes, mascotas, historialLuna, vacunasRegistradas, estudiosArchivos, tratamientosActivos, cirugias } from "@/lib/mock-data"
import { buildMockClinicalHistory } from "@/lib/clinical-history-workflow"
import {
  createConsultationEvent,
  readStoredClinicalHistoryEvents,
  writeStoredClinicalHistoryEvents,
  type ClinicalHistoryEvent,
  type ConsultationDraft,
} from "@/lib/clinical-history-mock"
import { profesionales } from "@/lib/mock-data"

export type { ClinicalHistoryEvent, ConsultationDraft }

export const CLINICAL_HISTORY_EVENT_TYPES = [
  "Consulta",
  "Vacuna",
  "Tratamiento",
  "Cirugía",
  "Estudio",
  "Control",
  "Recordatorio",
] as const

export const VETERINARIANS = profesionales
  .filter((p) => p.rol === "Veterinario")
  .map((p) => p.nombre)

export interface ClinicalTimelineEvent {
  id: string | number
  fecha: string
  tipo: string
  veterinario: string
  motivo?: string
  sintomas?: string
  diagnostico?: string
  tratamiento?: string
  vacuna?: string
  laboratorio?: string
  peso?: string
  temperatura?: string
  procedimiento?: string
  proximoControl?: string
  observaciones?: string
  estado?: string
  archivo?: string | null
}

export interface PetWithClient {
  id: number
  nombre: string
  especie: string
  raza: string
  edad: string
  peso: string
  sexo: string
  estadoGeneral: string
  dueno: string
  clienteId: number
  clienteTelefono: string
  clienteEmail: string
  alergias: string[]
  antecedentes: string
  ultimaConsulta: string
  ultimoDiagnostico: string
  esterilizado: boolean
}

export function getPetWithClient(petId: number): PetWithClient | null {
  const pet = mascotas.find((m) => m.id === petId)
  if (!pet) return null
  const client = clientes.find((c) => c.id === pet.clienteId)
  if (!client) return null
  return {
    id: pet.id,
    nombre: pet.nombre,
    especie: pet.especie,
    raza: pet.raza,
    edad: pet.edad,
    peso: pet.peso,
    sexo: pet.sexo,
    estadoGeneral: pet.estadoGeneral,
    dueno: client.nombre,
    clienteId: client.id,
    clienteTelefono: client.telefono,
    clienteEmail: client.email,
    alergias: pet.alergias,
    antecedentes: pet.antecedentes,
    ultimaConsulta: pet.ultimaConsulta,
    ultimoDiagnostico: pet.ultimoDiagnostico,
    esterilizado: pet.esterilizado,
  }
}

export function buildClinicalTimeline(petId: number): ClinicalTimelineEvent[] {
  const pet = mascotas.find((m) => m.id === petId)
  if (!pet) return []

  const storedEvents = readStoredClinicalHistoryEvents().filter((e) => e.petId === petId)
  const mockHistory = buildMockClinicalHistory(petId)

  const baseEvents: ClinicalTimelineEvent[] =
    petId === 1
      ? historialLuna.map((entry) => ({
          id: `historial-luna-${entry.id}`,
          fecha: entry.fecha,
          tipo: entry.tipo,
          veterinario: entry.veterinario,
          motivo: entry.motivo,
          sintomas: entry.sintomas,
          diagnostico: entry.diagnostico,
          tratamiento: entry.tratamiento,
          vacuna: entry.vacuna,
          laboratorio: entry.laboratorio,
          peso: entry.peso,
          procedimiento: entry.procedimiento,
          proximoControl: entry.proximoControl || entry.proximaVacuna,
          observaciones: entry.observaciones,
          estado: undefined,
          archivo: entry.archivo || null,
        }))
      : []

  const vaccineEvents: ClinicalTimelineEvent[] =
    petId !== 1
      ? vacunasRegistradas
          .filter((v) => v.mascotaId === petId)
          .map((vacuna) => ({
            id: `vacuna-${vacuna.id}`,
            fecha: vacuna.fechaAplicada,
            tipo: "Vacuna" as const,
            veterinario: vacuna.veterinario,
            motivo: vacuna.vacuna,
            vacuna: vacuna.vacuna,
            laboratorio: vacuna.laboratorio,
            proximoControl: vacuna.proximaFecha,
          }))
      : []

  const studyEvents: ClinicalTimelineEvent[] =
    petId !== 1
      ? estudiosArchivos
          .filter((e) => e.mascotaId === petId)
          .map((estudio) => ({
            id: `estudio-${estudio.id}`,
            fecha: estudio.fecha,
            tipo: "Estudio" as const,
            veterinario: estudio.profesional,
            motivo: estudio.descripcion,
            diagnostico: estudio.estado,
            archivo: estudio.archivo,
          }))
      : []

  const treatmentEvents: ClinicalTimelineEvent[] =
    petId !== 1
      ? tratamientosActivos
          .filter((t) => t.mascotaId === petId)
          .map((tratamiento) => ({
            id: `tratamiento-${tratamiento.id}`,
            fecha: tratamiento.fechaInicio,
            tipo: "Tratamiento" as const,
            veterinario: "Sistema demo",
            motivo: tratamiento.diagnostico,
            tratamiento: `${tratamiento.medicamento} · ${tratamiento.dosis} · ${tratamiento.frecuencia}`,
            proximoControl: tratamiento.proximoControl,
          }))
      : []

  const surgeryEvents: ClinicalTimelineEvent[] =
    petId !== 1
      ? cirugias
          .filter((c) => c.mascotaId === petId)
          .map((cirugia) => ({
            id: `cirugia-${cirugia.id}`,
            fecha: cirugia.fecha,
            tipo: "Cirugía" as const,
            veterinario: cirugia.veterinario,
            motivo: cirugia.tipo,
            procedimiento: cirugia.registroCirugia?.procedimiento || cirugia.tipo,
            diagnostico: cirugia.registroCirugia?.diagnosticoPrevio || cirugia.estado,
            proximoControl: cirugia.postoperatorio?.fechaControl,
          }))
      : []

  const storedTimeline: ClinicalTimelineEvent[] = storedEvents.map((event) => ({
    id: event.id,
    fecha: event.date,
    tipo: event.eventType,
    veterinario: event.veterinarian,
    motivo: event.title,
    sintomas: event.symptoms,
    diagnostico: event.diagnosis || event.status,
    tratamiento: event.treatment,
    peso: event.weight,
    temperatura: event.temperature,
    proximoControl: event.nextControlDate,
    observaciones: event.notes,
    estado: event.status,
    archivo: event.attachmentName,
  }))

  const mockTimeline: ClinicalTimelineEvent[] = mockHistory.map((event) => ({
    id: event.id,
    fecha: event.date,
    tipo:
      event.type === "vaccine"
        ? "Vacuna"
        : event.type === "treatment"
          ? "Tratamiento"
          : event.type === "surgery"
            ? "Cirugía"
            : event.type === "control"
              ? "Control"
              : event.type === "reminder"
                ? "Recordatorio"
                : "Consulta",
    veterinario: "Sistema demo",
    motivo: event.title,
    diagnostico: event.status,
    observaciones: event.description,
    estado: event.status,
    proximoControl: event.type === "control" ? event.date : undefined,
  }))

  const seen = new Set<string | number>()
  const all = [
    ...baseEvents,
    ...vaccineEvents,
    ...studyEvents,
    ...treatmentEvents,
    ...surgeryEvents,
    ...storedTimeline,
    ...mockTimeline,
  ]
  const deduped = all.filter((event) => {
    if (seen.has(event.id)) return false
    seen.add(event.id)
    return true
  })

  return deduped.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export function addConsultationFromDraft(draft: ConsultationDraft) {
  const event = createConsultationEvent(draft)
  const stored = readStoredClinicalHistoryEvents()
  writeStoredClinicalHistoryEvents([...stored, event])
  return event
}

export function searchClinicalTimeline(
  events: ClinicalTimelineEvent[],
  search: string,
  eventType: string,
  vetName: string,
  status: string,
  dateFrom: string,
  dateTo: string,
): ClinicalTimelineEvent[] {
  return events.filter((event) => {
    if (eventType !== "todos" && event.tipo !== eventType) return false
    if (vetName !== "todos" && event.veterinario !== vetName) return false
    if (status !== "todos" && event.estado !== status) return false
    if (dateFrom && event.fecha < dateFrom) return false
    if (dateTo && event.fecha > dateTo) return false

    if (search) {
      const q = search.toLowerCase()
      const searchable = [
        event.motivo,
        event.diagnostico,
        event.tratamiento,
        event.vacuna,
        event.procedimiento,
        event.veterinario,
        event.observaciones,
        event.sintomas,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      if (!searchable.includes(q)) return false
    }

    return true
  })
}