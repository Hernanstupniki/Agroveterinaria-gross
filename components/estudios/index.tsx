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
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Upload,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  type StudyFileAttachment,
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

export function StudyUploadForm({
  clientId,
  petId,
  initialRecord,
  onSaved,
  onCancel,
  mode = "page",
  onDraftSaved,
}: {
  clientId: number
  petId: number
  initialRecord?: StudyFileRecord | null
  onSaved?: (updatedRecord?: StudyFileRecord) => void
  onCancel?: () => void
  mode?: "page" | "inline"
  onDraftSaved?: (draft: {
    studyType: string
    description: string
    estado: StudyFileStatus
    files: StudyFileAttachment[]
  }) => void
}) {
  const [tipo, setTipo] = useState(initialRecord?.tipo || STUDY_TYPE_OPTIONS[0])
  const [descripcion, setDescripcion] = useState(initialRecord?.descripcion || "")
  const [fecha, setFecha] = useState(initialRecord?.fecha || new Date().toISOString().slice(0, 10))
  const [profesional, setProfesional] = useState(initialRecord?.profesional || VETERINARIANS[0] || "Equipo clinico")
  const [estado, setEstado] = useState<StudyFileStatus>(initialRecord?.estado || "Resultado recibido")
  const [files, setFiles] = useState<File[]>([])
  const isEditing = Boolean(initialRecord)

  async function handleSubmit() {
    if (mode === "inline") {
      const attachments = await Promise.all(files.map((file) => fileToStudyAttachment(file)))
      onDraftSaved?.({
        studyType: tipo,
        description: descripcion,
        estado,
        files: attachments,
      })
      onSaved?.()
      return
    }

    if (isEditing && initialRecord) {
      const updates = {
        tipo,
        descripcion: descripcion || "Archivo o estudio sin descripcion adicional.",
        fecha,
        profesional,
        estado,
      }
      if (initialRecord.source === "local") updateStudyFileRecord(initialRecord.id, updates)
      onSaved?.({ ...initialRecord, ...updates })
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
      onSaved?.()
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
    onSaved?.()
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

export function StudyFilesPanel({ client, pet, defaultShowUpload = false }: ClinicalActionSelection & { defaultShowUpload?: boolean }) {
  const [records, setRecords] = useState<StudyFileRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("todos")
  const [profesionalFilter, setProfesionalFilter] = useState("todos")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showUpload, setShowUpload] = useState(defaultShowUpload)
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
    setShowUpload(defaultShowUpload)
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
      const matchesProfesional = profesionalFilter === "todos" || record.profesional === profesionalFilter
      const matchesEstado = estadoFilter === "todos" || record.estado === estadoFilter
      const matchesDateFrom = !dateFrom || record.fecha >= dateFrom
      const matchesDateTo = !dateTo || record.fecha <= dateTo
      return matchesSearch && matchesTipo && matchesProfesional && matchesEstado && matchesDateFrom && matchesDateTo
    })
  }, [records, searchTerm, tipoFilter, profesionalFilter, estadoFilter, dateFrom, dateTo])

  const availableTypes = Array.from(new Set([...STUDY_TYPE_OPTIONS, ...records.map((record) => record.tipo)]))
  const availableProfessionals = Array.from(new Set(records.map((record) => record.profesional).filter(Boolean)))

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
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_160px_180px_180px_160px_160px]">
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
            <Select value={profesionalFilter} onValueChange={setProfesionalFilter}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Profesional" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los profesionales</SelectItem>
                {availableProfessionals.map((professional) => <SelectItem key={professional} value={professional}>{professional}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {STUDY_STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" className="h-12 rounded-xl" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="Fecha desde" />
            <Input type="date" className="h-12 rounded-xl" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="Fecha hasta" />
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

      <Card>
        <CardHeader>
          <CardTitle>Listado de Estudios</CardTitle>
          <CardDescription>{filteredRecords.length} registros encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Mascota</TableHead>
                  <TableHead className="min-w-[170px]">Tipo</TableHead>
                  <TableHead className="min-w-[260px]">Descripción</TableHead>
                  <TableHead className="min-w-[120px]">Fecha</TableHead>
                  <TableHead className="min-w-[150px]">Profesional</TableHead>
                  <TableHead className="min-w-[150px]">Estado</TableHead>
                  <TableHead className="min-w-[160px] text-center">Archivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const Icon = isImage(record) ? ImageIcon : FileText
                  const isArchived = record.estado === "Archivado" || record.estado === "Archivado en historial"

                  return (
                    <TableRow key={record.id} className={isArchived ? "bg-muted/20" : undefined}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                              {record.petName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <Link href={`/mascotas/${record.petId}`} className="font-medium hover:text-primary">
                            {record.petName}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="font-medium">{record.tipo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="line-clamp-2 text-sm">{record.descripcion}</p>
                      </TableCell>
                      <TableCell>{record.fecha}</TableCell>
                      <TableCell>{record.profesional}</TableCell>
                      <TableCell>
                        <Badge className={estadoColors[record.estado] || "bg-muted text-muted-foreground"}>
                          {record.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewRecord(record)} title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {record.archivoUrl ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Descargar">
                              <a href={record.archivoUrl} download={record.archivoNombre || "archivo"}>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          ) : record.archivoNombre ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled title="Archivo demo sin URL real">
                              <Download className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="h-8 rounded-lg px-3" onClick={() => setEditingRecord(record)}>
                              <Upload className="mr-1 h-3.5 w-3.5" />
                              Cargar
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingRecord(record)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              {isArchived ? (
                                <DropdownMenuItem onClick={() => handleRestore(record)}>
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Restaurar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleArchive(record)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archivar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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

function ActionCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  href,
}: {
  icon: LucideIcon
  title: string
  description: string
  buttonLabel: string
  href: string
}) {
  return (
    <Link href={href} className="group block min-w-0">
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
        <CardContent className="flex h-full flex-col gap-5 p-5 xl:p-4 2xl:p-5">
          <div className="flex flex-col gap-4 sm:flex-row xl:flex-col 2xl:flex-row">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:h-14 sm:w-14">
              <Icon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold leading-tight 2xl:text-xl">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="mt-auto inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 py-3 text-center text-base font-bold leading-tight text-primary-foreground group-hover:bg-primary/90 whitespace-normal">
            <span className="text-center leading-tight">{buttonLabel}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function EstudiosPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            <FileText className="h-4 w-4" />
            Estudios y Archivos
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-normal">Que querés hacer con estudios?</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Buscá documentación clínica o agregá nuevos archivos eligiendo cliente y mascota.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ActionCard icon={Search} title="Buscar Estudio" description="Elegí cliente y mascota para ver archivos, filtrar, visualizar, descargar o archivar." buttonLabel="Buscar Estudio" href="/estudios/buscar" />
        <ActionCard icon={Plus} title="Agregar Estudio" description="Elegí cliente y mascota para cargar estudios, imágenes, PDFs o documentos clínicos." buttonLabel="Agregar Estudio" href="/estudios/agregar" />
      </div>
    </div>
  )
}

export function BuscarEstudiosFlow() {
  return (
    <ClinicalActionFlow
      title="Buscar Estudio"
      description="Seleccioná cliente y mascota para consultar estudios y archivos ya cargados."
      actionLabel="Buscar archivos"
      icon={FileText}
    >
      {({ client, pet }) => <StudyFilesPanel client={client} pet={pet} />}
    </ClinicalActionFlow>
  )
}

export function AgregarEstudioFlow() {
  return (
    <ClinicalActionFlow
      title="Agregar Estudio"
      description="Seleccioná cliente y mascota para cargar un estudio o archivo clínico."
      actionLabel="Agregar archivo"
      icon={Upload}
    >
      {({ client, pet }) => <StudyFilesPanel client={client} pet={pet} defaultShowUpload />}
    </ClinicalActionFlow>
  )
}
