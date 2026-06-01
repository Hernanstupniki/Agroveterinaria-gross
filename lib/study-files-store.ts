import { clientes, estudiosArchivos, mascotas } from "@/lib/mock-data"
import {
  readStoredClinicalHistoryEvents,
  writeStoredClinicalHistoryEvents,
  type ClinicalHistoryEvent,
} from "@/lib/clinical-history-mock"

export const STUDY_FILES_STORAGE_KEY = "agroveterinaria-gross-study-files"

export type StudyFileStatus =
  | "Solicitado"
  | "Pendiente de resultado"
  | "Resultado recibido"
  | "Archivado en historial"
  | "Archivado"

export interface StudyFileAttachment {
  name: string
  type: string
  size: number
  dataUrl: string | null
}

export interface StudyFileRecord {
  id: string
  clientId: number
  petId: number
  petName: string
  clientName: string
  tipo: string
  descripcion: string
  fecha: string
  profesional: string
  estado: StudyFileStatus
  archivoNombre: string | null
  archivoTipo: string | null
  archivoSize: number | null
  archivoUrl: string | null
  source: "demo" | "local"
  archivedAt?: string | null
}

export interface CreateStudyFileInput {
  clientId: number
  petId: number
  tipo?: string
  descripcion?: string
  fecha?: string
  profesional?: string
  estado?: StudyFileStatus
  attachment?: StudyFileAttachment | null
}

export const STUDY_TYPE_OPTIONS = [
  "Estudio sin especificar",
  "Analisis de sangre",
  "Ecografia",
  "Radiografia",
  "Foto clinica",
  "Receta",
  "Certificado",
  "Informe PDF",
  "Otro",
]

export const STUDY_STATUS_OPTIONS: StudyFileStatus[] = [
  "Solicitado",
  "Pendiente de resultado",
  "Resultado recibido",
  "Archivado en historial",
  "Archivado",
]

function getContext(clientId: number, petId: number) {
  const pet = mascotas.find((item) => item.id === petId) || mascotas[0]
  const client = clientes.find((item) => item.id === clientId) || clientes.find((item) => item.id === pet.clienteId) || clientes[0]

  return {
    clientId: client.id,
    petId: pet.id,
    petName: pet.nombre,
    clientName: client.nombre,
  }
}

function normalizeDemoType(value: string) {
  return value
    .replace("AnÃ¡lisis", "Analisis")
    .replace("EcografÃ­a", "Ecografia")
    .replace("RadiografÃ­a", "Radiografia")
    .replace("clÃ­nica", "clinica")
}

function demoStudiesToRecords(): StudyFileRecord[] {
  return estudiosArchivos.map((study) => {
    const pet = mascotas.find((item) => item.id === study.mascotaId)
    const client = clientes.find((item) => item.id === pet?.clienteId)

    return {
      id: `demo-estudio-${study.id}`,
      clientId: client?.id || pet?.clienteId || 0,
      petId: study.mascotaId,
      petName: study.mascota,
      clientName: client?.nombre || "Cliente sin asignar",
      tipo: normalizeDemoType(study.tipo),
      descripcion: study.descripcion,
      fecha: study.fecha,
      profesional: study.profesional,
      estado: study.estado as StudyFileStatus,
      archivoNombre: study.archivo,
      archivoTipo: study.archivo?.toLowerCase().endsWith(".jpg") ? "image/jpeg" : study.archivo?.toLowerCase().endsWith(".pdf") ? "application/pdf" : null,
      archivoSize: null,
      archivoUrl: null,
      source: "demo",
      archivedAt: study.estado === "Archivado en historial" ? study.fecha : null,
    }
  })
}

export function readLocalStudyFiles(): StudyFileRecord[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(STUDY_FILES_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeLocalStudyFiles(records: StudyFileRecord[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STUDY_FILES_STORAGE_KEY, JSON.stringify(records))
}

export function getAllStudyFiles() {
  return [...demoStudiesToRecords(), ...readLocalStudyFiles()]
}

export function getStudyFilesForPet(petId: number) {
  return getAllStudyFiles().filter((record) => record.petId === petId)
}

export function createStudyFileRecord(input: CreateStudyFileInput) {
  const context = getContext(input.clientId, input.petId)
  const attachment = input.attachment || null
  const record: StudyFileRecord = {
    id: `local-estudio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...context,
    tipo: input.tipo?.trim() || "Estudio sin especificar",
    descripcion: input.descripcion?.trim() || "Archivo o estudio cargado sin descripcion adicional.",
    fecha: input.fecha || new Date().toISOString().slice(0, 10),
    profesional: input.profesional || "Equipo clinico",
    estado: input.estado || "Resultado recibido",
    archivoNombre: attachment?.name || null,
    archivoTipo: attachment?.type || null,
    archivoSize: attachment?.size || null,
    archivoUrl: attachment?.dataUrl || null,
    source: "local",
    archivedAt: input.estado === "Archivado" || input.estado === "Archivado en historial" ? new Date().toISOString().slice(0, 10) : null,
  }

  const records = readLocalStudyFiles()
  writeLocalStudyFiles([record, ...records])
  return record
}

export function addStudyRecordToClinicalHistory(record: StudyFileRecord) {
  const event: ClinicalHistoryEvent = {
    id: `local-estudio-history-${record.id}`,
    petId: record.petId,
    clientId: record.clientId,
    petName: record.petName,
    clientName: record.clientName,
    eventType: "Estudio",
    date: record.fecha,
    veterinarian: record.profesional,
    title: record.tipo,
    reason: record.tipo,
    notes: record.descripcion,
    status: record.estado,
    attachmentName: record.archivoNombre || "",
  }

  const events = readStoredClinicalHistoryEvents()
  if (!events.some((item) => item.id === event.id)) {
    writeStoredClinicalHistoryEvents([event, ...events])
  }
  return event.id
}

export function updateStudyFileRecord(id: string, updates: Partial<StudyFileRecord>) {
  const records = readLocalStudyFiles()
  const next = records.map((record) => (record.id === id ? { ...record, ...updates } : record))
  writeLocalStudyFiles(next)
  return next.find((record) => record.id === id) || null
}

export function archiveStudyFileRecord(id: string) {
  return updateStudyFileRecord(id, {
    estado: "Archivado",
    archivedAt: new Date().toISOString().slice(0, 10),
  })
}

export function restoreStudyFileRecord(id: string) {
  return updateStudyFileRecord(id, {
    estado: "Resultado recibido",
    archivedAt: null,
  })
}

export function fileToStudyAttachment(file: File): Promise<StudyFileAttachment> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: typeof reader.result === "string" ? reader.result : null,
      })
    reader.onerror = () =>
      resolve({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: null,
      })
    reader.readAsDataURL(file)
  })
}

export function formatFileSize(size?: number | null) {
  if (!size) return "Tamaño no disponible"
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
