"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Archive,
  Download,
  Edit,
  Eye,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Search,
  Upload,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ClinicalActionFlow, type ClinicalActionSelection } from "@/components/clinical/action-flow"
import { VETERINARIANS } from "@/lib/clinical-history-builder"
import {
  archiveStudyFileRecord,
  addStudyRecordToClinicalHistory,
  createStudyFileRecord,
  fileToStudyAttachment,
  formatFileSize,
  getStudyFilesForPet,
  restoreStudyFileRecord,
  STUDY_STATUS_OPTIONS,
  STUDY_TYPE_OPTIONS,
  updateStudyFileRecord,
  type StudyFileRecord,
  type StudyFileStatus,
} from "@/lib/study-files-store"

const estadoColors: Record<string, string> = {
  Solicitado: "bg-muted text-muted-foreground",
  "Pendiente de resultado": "bg-warning text-warning-foreground",
  "Resultado recibido": "bg-success text-success-foreground",
  "Archivado en historial": "bg-secondary text-secondary-foreground",
  Archivado: "bg-secondary text-secondary-foreground",
}

function formatDate(date?: string | null) {
  if (!date) return "-"
  const [year, month, day] = date.split("-")
  if (!year || !month || !day) return date
  return `${day}/${month}/${year}`
}

function isImage(record: StudyFileRecord) {
  return Boolean(record.archivoTipo?.startsWith("image/"))
}

function isPdf(record: StudyFileRecord) {
  return record.archivoTipo === "application/pdf" || Boolean(record.archivoNombre?.toLowerCase().endsWith(".pdf"))
}

function StudyUploadForm({
  clientId,
  petId,
  initialRecord,
  onSaved,
  onCancel,
}: {
  clientId: number
  petId: number
  initialRecord?: StudyFileRecord | null
  onSaved: (updatedRecord?: StudyFileRecord) => void
  onCancel?: () => void
}) {
  const [tipo, setTipo] = useState(initialRecord?.tipo || STUDY_TYPE_OPTIONS[0])
  const [descripcion, setDescripcion] = useState(initialRecord?.descripcion || "")
  const [fecha, setFecha] = useState(initialRecord?.fecha || new Date().toISOString().slice(0, 10))
  const [profesional, setProfesional] = useState(initialRecord?.profesional || VETERINARIANS[0] || "Equipo clinico")
  const [estado, setEstado] = useState<StudyFileStatus>(initialRecord?.estado || "Resultado recibido")
  const [files, setFiles] = useState<File[]>([])
  const isEditing = Boolean(initialRecord)

  async function handleSubmit() {
    if (isEditing && initialRecord) {
      const updates = {
        tipo,
        descripcion: descripcion || "Archivo o estudio sin descripcion adicional.",
        fecha,
        profesional,
        estado,
      }
      if (initialRecord.source === "local") updateStudyFileRecord(initialRecord.id, updates)
      onSaved({ ...initialRecord, ...updates })
      return
    }

    if (files.length === 0) {
      const record = createStudyFileRecord({
        clientId,
        petId,
        tipo,
        descripcion,
        fecha,
        profesional,
        estado,
        attachment: null,
      })
      addStudyRecordToClinicalHistory(record)
      onSaved()
      return
    }

    const attachments = await Promise.all(files.map((file) => fileToStudyAttachment(file)))
    attachments.forEach((attachment) => {
      const record = createStudyFileRecord({
        clientId,
        petId,
        tipo,
        descripcion,
        fecha,
        profesional,
        estado,
        attachment,
      })
      addStudyRecordToClinicalHistory(record)
    })
    setFiles([])
    onSaved()
  }

  return (
    <Card className="border-primary/25 bg-primary/5">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          {isEditing ? "Editar estudio / archivo" : "Cargar archivo / estudio"}
        </CardTitle>
        <CardDescription>
          Demo frontend: los archivos quedan guardados localmente en esta sesión/navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STUDY_TYPE_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input type="date" className="h-12 rounded-xl" value={fecha} onChange={(event) => setFecha(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Profesional</Label>
            <Select value={profesional} onValueChange={setProfesional}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {VETERINARIANS.map((vet) => <SelectItem key={vet} value={vet}>{vet}</SelectItem>)}
                <SelectItem value="Equipo clinico">Equipo clinico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={estado} onValueChange={(value) => setEstado(value as StudyFileStatus)}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STUDY_STATUS_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Descripcion</Label>
          <Textarea
            className="rounded-xl"
            rows={2}
            placeholder="Motivo, region evaluada, hallazgo o comentario del archivo..."
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
          />
        </div>

        {!isEditing && (
          <div className="space-y-3 rounded-xl border border-dashed bg-background/80 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Label>Archivo</Label>
                <p className="text-sm text-muted-foreground">PDF, imagenes o documentos comunes. Puede cargarse mas de uno.</p>
              </div>
              <Button type="button" variant="outline" className="relative h-12 overflow-hidden rounded-xl px-4 font-bold">
                <Upload className="mr-2 h-4 w-4" />
                Seleccionar archivos
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(event) => {
                    setFiles(Array.from(event.target.files || []))
                    event.currentTarget.value = ""
                  }}
                />
              </Button>
            </div>
            {files.length > 0 && (
              <div className="grid gap-2">
                {files.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="rounded-lg border bg-card px-3 py-2 text-sm">
                    <p className="break-words font-semibold">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.type || "Archivo"} · {formatFileSize(file.size)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" className="h-12 rounded-xl px-5 font-bold" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="button" className="h-12 rounded-xl bg-primary px-6 font-bold shadow-md shadow-primary/15 hover:bg-primary/90" onClick={() => void handleSubmit()}>
            <Upload className="mr-2 h-4 w-4" />
            {isEditing ? "Guardar cambios" : "Guardar estudio"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function StudyFilesPanel({ client, pet }: ClinicalActionSelection) {
  const [records, setRecords] = useState<StudyFileRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("todos")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [showUpload, setShowUpload] = useState(false)
  const [previewRecord, setPreviewRecord] = useState<StudyFileRecord | null>(null)
  const [editingRecord, setEditingRecord] = useState<StudyFileRecord | null>(null)

  function refreshRecords() {
    setRecords(getStudyFilesForPet(pet.id))
    setShowUpload(false)
    setEditingRecord(null)
  }

  function handleFormSaved(updatedRecord?: StudyFileRecord) {
    if (updatedRecord) {
      setRecords((current) => current.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)))
      setShowUpload(false)
      setEditingRecord(null)
      return
    }
    refreshRecords()
  }

  useEffect(() => {
    refreshRecords()
  }, [pet.id])

  const filteredRecords = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return records.filter((record) => {
      const matchesSearch =
        !term ||
        record.tipo.toLowerCase().includes(term) ||
        record.descripcion.toLowerCase().includes(term) ||
        record.archivoNombre?.toLowerCase().includes(term)
      const matchesTipo = tipoFilter === "todos" || record.tipo === tipoFilter
      const matchesEstado = estadoFilter === "todos" || record.estado === estadoFilter
      return matchesSearch && matchesTipo && matchesEstado
    })
  }, [records, searchTerm, tipoFilter, estadoFilter])

  const availableTypes = Array.from(new Set([...STUDY_TYPE_OPTIONS, ...records.map((record) => record.tipo)]))

  function updateRecordInState(record: StudyFileRecord, updates: Partial<StudyFileRecord>) {
    const next = { ...record, ...updates }
    if (record.source === "local") updateStudyFileRecord(record.id, updates)
    setRecords((current) => current.map((item) => (item.id === record.id ? next : item)))
  }

  function handleArchive(record: StudyFileRecord) {
    if (record.source === "local") archiveStudyFileRecord(record.id)
    updateRecordInState(record, { estado: "Archivado", archivedAt: new Date().toISOString().slice(0, 10) })
  }

  function handleRestore(record: StudyFileRecord) {
    if (record.source === "local") restoreStudyFileRecord(record.id)
    updateRecordInState(record, { estado: "Resultado recibido", archivedAt: null })
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Estudios y archivos de {pet.nombre}
              </CardTitle>
              <CardDescription>
                {client.nombre} · {pet.especie} · {pet.raza}. Carga, consulta y archivo documental del paciente.
              </CardDescription>
            </div>
            <Button className="min-h-12 rounded-xl bg-primary px-5 py-3 text-center font-bold leading-tight hover:bg-primary/90" onClick={() => setShowUpload(true)}>
              <Upload className="mr-2 h-5 w-5" />
              Cargar archivo / estudio
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_220px_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-12 rounded-xl pl-10"
                placeholder="Buscar por tipo, descripcion o archivo..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {availableTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {STUDY_STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {(showUpload || editingRecord) && (
        <StudyUploadForm
          clientId={client.id}
          petId={pet.id}
          initialRecord={editingRecord}
          onSaved={handleFormSaved}
          onCancel={() => {
            setShowUpload(false)
            setEditingRecord(null)
          }}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredRecords.map((record) => {
          const Icon = isImage(record) ? ImageIcon : FileText
          const isArchived = record.estado === "Archivado" || record.estado === "Archivado en historial"

          return (
            <Card key={record.id} className={isArchived ? "border-muted bg-muted/20" : ""}>
              <CardContent className="space-y-4 p-4">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-lg font-bold leading-tight">{record.tipo}</h3>
                      <Badge className={estadoColors[record.estado] || "bg-muted text-muted-foreground"}>{record.estado}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(record.fecha)} · {record.profesional}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm">{record.descripcion}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/35 p-3 text-sm">
                  <p className="break-words font-semibold">{record.archivoNombre || "Sin archivo adjunto"}</p>
                  <p className="text-xs text-muted-foreground">
                    {record.archivoTipo || "Metadata mock"} · {formatFileSize(record.archivoSize)}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  <Button variant="outline" className="min-h-11 rounded-xl px-3 py-2 font-semibold leading-tight" onClick={() => setPreviewRecord(record)}>
                    <Eye className="mr-2 h-4 w-4 shrink-0" />
                    Visualizar
                  </Button>
                  {record.archivoUrl ? (
                    <Button variant="outline" className="min-h-11 rounded-xl px-3 py-2 font-semibold leading-tight" asChild>
                      <a href={record.archivoUrl} download={record.archivoNombre || "archivo"}>
                        <Download className="mr-2 h-4 w-4 shrink-0" />
                        Descargar
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" className="min-h-11 rounded-xl px-3 py-2 font-semibold leading-tight" disabled>
                      <Download className="mr-2 h-4 w-4 shrink-0" />
                      Descargar
                    </Button>
                  )}
                  <Button variant="outline" className="min-h-11 rounded-xl px-3 py-2 font-semibold leading-tight" onClick={() => setEditingRecord(record)}>
                    <Edit className="mr-2 h-4 w-4 shrink-0" />
                    Editar
                  </Button>
                  {isArchived ? (
                    <Button className="min-h-11 rounded-xl bg-primary px-3 py-2 font-bold leading-tight hover:bg-primary/90" onClick={() => handleRestore(record)}>
                      <RotateCcw className="mr-2 h-4 w-4 shrink-0" />
                      Restaurar
                    </Button>
                  ) : (
                    <Button variant="outline" className="min-h-11 rounded-xl px-3 py-2 font-semibold leading-tight" onClick={() => handleArchive(record)}>
                      <Archive className="mr-2 h-4 w-4 shrink-0" />
                      Archivar
                    </Button>
                  )}
                  <Button variant="outline" className="min-h-11 rounded-xl px-3 py-2 font-semibold leading-tight" asChild>
                    <Link href={`/mascotas/${pet.id}`}>Ficha</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-bold">Sin estudios para los filtros actuales</p>
              <p className="text-sm text-muted-foreground">Podés cargar un archivo o limpiar la búsqueda para revisar otros registros.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={Boolean(previewRecord)} onOpenChange={(open) => !open && setPreviewRecord(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewRecord?.tipo || "Visualizar archivo"}</DialogTitle>
            <DialogDescription>{previewRecord?.archivoNombre || "Registro mock sin archivo real adjunto."}</DialogDescription>
          </DialogHeader>
          {previewRecord && (
            <div className="space-y-4">
              {previewRecord.archivoUrl && isImage(previewRecord) && (
                <img src={previewRecord.archivoUrl} alt={previewRecord.archivoNombre || previewRecord.tipo} className="max-h-[65vh] w-full rounded-xl border object-contain" />
              )}
              {previewRecord.archivoUrl && isPdf(previewRecord) && (
                <iframe title={previewRecord.archivoNombre || previewRecord.tipo} src={previewRecord.archivoUrl} className="h-[65vh] w-full rounded-xl border" />
              )}
              {(!previewRecord.archivoUrl || (!isImage(previewRecord) && !isPdf(previewRecord))) && (
                <div className="rounded-xl border bg-muted/30 p-5">
                  <p className="font-semibold">{previewRecord.archivoNombre || "Archivo no disponible para preview"}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{previewRecord.descripcion}</p>
                  <p className="mt-3 text-xs text-muted-foreground">Los archivos demo sin URL real muestran solo sus metadatos.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function EstudiosPage() {
  return (
    <ClinicalActionFlow
      title="Estudios y Archivos"
      description="Selecciona cliente y mascota para cargar, ver, descargar, editar o archivar estudios del paciente."
      actionLabel="Gestionar archivos"
      icon={FileText}
    >
      {({ client, pet }) => <StudyFilesPanel client={client} pet={pet} />}
    </ClinicalActionFlow>
  )
}
