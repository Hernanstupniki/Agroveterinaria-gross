"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Download,
  Edit,
  FileHeart,
  FileText,
  HeartPulse,
  MessageCircle,
  Pill,
  Plus,
  Scissors,
  ShieldAlert,
  Stethoscope,
  Syringe,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClinicalTimelineItem } from "@/components/clinical/timeline-item"
import { EditarFichaDialog } from "@/components/mascotas/editar-ficha-dialog"
import {
  cirugias,
  clientes,
  recordatoriosProgramados,
  tratamientosActivos,
  vacunasRegistradas,
} from "@/lib/mock-data"
import { getMascotaData, type MascotaData } from "@/lib/mascota-store"
import {
  buildClinicalTimeline,
  searchClinicalTimeline,
  type ClinicalTimelineEvent,
} from "@/lib/clinical-history-builder"
import {
  buildVaccineDisplayList,
  formatOverdueText,
  getVaccineDisplayGroups,
  getVaccineGroupLabel,
  getVaccineStatusBadgeStyle,
  type VaccineDisplayItem,
  type VaccineDisplayStatus,
} from "@/lib/vaccine-workflow"
import { getStudyFilesForPet, type StudyFileRecord } from "@/lib/study-files-store"

const MOCK_TODAY = new Date("2026-05-30T00:00:00")

const estadoColors: Record<string, string> = {
  Saludable: "bg-success text-success-foreground",
  "En tratamiento": "bg-warning text-warning-foreground",
  "Vacuna vencida": "bg-destructive text-destructive-foreground",
  "Control pendiente": "bg-secondary text-secondary-foreground",
  "Cirugía programada": "bg-primary text-primary-foreground",
}

const vacunaGroups = getVaccineDisplayGroups()

const vacunaGroupLabels = Object.fromEntries(
  vacunaGroups.map((status) => [status, getVaccineGroupLabel(status)])
) as Record<VaccineDisplayStatus, string>

type ReminderBucket = "vencidos" | "proximos" | "pendientes" | "completados"

const reminderBucketLabels: Record<ReminderBucket, string> = {
  vencidos: "Recordatorios vencidos",
  proximos: "Recordatorios próximos",
  pendientes: "Recordatorios pendientes",
  completados: "Recordatorios completados",
}

const reminderBucketStyles: Record<ReminderBucket, string> = {
  vencidos: "border-destructive/30 bg-destructive/10",
  proximos: "border-warning/30 bg-warning/10",
  pendientes: "border-secondary/40 bg-secondary/10",
  completados: "border-success/25 bg-success/10",
}

const reminderBucketOrder: ReminderBucket[] = ["vencidos", "proximos", "pendientes", "completados"]

interface FichaMascotaProps {
  mascotaId: number
}

interface ClinicalNextStep {
  id: string
  label: string
  title: string
  detail: string
  date?: string | null
  tone: "danger" | "warning" | "neutral" | "primary"
  primaryAction: string
  href: string
}

const historiaTipoEventos = ["Consulta", "Vacuna", "Tratamiento", "Cirugía", "Estudio", "Control", "Recordatorio"]

function formatDate(date?: string | null) {
  if (!date) return "-"
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

function parseMockDate(date?: string | null) {
  if (!date) return null
  const parsed = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getUrgencyPriority(date?: string | null, status?: string) {
  if (status === "Vencida") return 0
  const parsed = parseMockDate(date)
  if (!parsed) return 2

  const diffDays = Math.ceil((parsed.getTime() - MOCK_TODAY.getTime()) / 86_400_000)
  if (diffDays < 0) return 0
  if (diffDays <= 14) return 1
  return 3
}

function getUrgencyTone(priority: number): ClinicalNextStep["tone"] {
  if (priority === 0) return "danger"
  if (priority === 1) return "warning"
  if (priority === 2) return "neutral"
  return "primary"
}

function getReminderBucket(status: string, scheduledDate?: string | null): ReminderBucket {
  if (status === "Enviado") return "completados"
  const parsed = parseMockDate(scheduledDate)
  if (!parsed) return "pendientes"

  const diffDays = Math.ceil((parsed.getTime() - MOCK_TODAY.getTime()) / 86_400_000)
  if (diffDays < 0) return "vencidos"
  if (diffDays <= 7) return "proximos"
  return "pendientes"
}

export function FichaMascota({ mascotaId }: FichaMascotaProps) {
  const [mascota, setMascota] = useState(() => getMascotaData(mascotaId))
  const cliente = clientes.find((item) => item.id === mascota.clienteId)
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "resumen")
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleFichaSaved = () => {
    setMascota(getMascotaData(mascotaId))
    setTimelineRefreshKey((k) => k + 1)
  }

  useEffect(() => {
    setMascota(getMascotaData(mascotaId))
    setTimelineRefreshKey((k) => k + 1)
  }, [mascotaId])
  const [historySearch, setHistorySearch] = useState("")
  const [historyTypeFilter, setHistoryTypeFilter] = useState("todos")
  const [historyVetFilter, setHistoryVetFilter] = useState("todos")
  const [historyStatusFilter, setHistoryStatusFilter] = useState("todos")
  const [historyDateFrom, setHistoryDateFrom] = useState("")
  const [historyDateTo, setHistoryDateTo] = useState("")
  const [estudiosMascota, setEstudiosMascota] = useState<StudyFileRecord[]>(() => getStudyFilesForPet(mascota.id))
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<Array<string | number>>([])
  const [expandedResumenItems, setExpandedResumenItems] = useState<Array<string | number>>([])
  const [expandedTreatmentItems, setExpandedTreatmentItems] = useState<Array<string | number>>([])
  const [timelineRefreshKey, setTimelineRefreshKey] = useState(0)

  useEffect(() => {
    setTimelineRefreshKey((k) => k + 1)
    setEstudiosMascota(getStudyFilesForPet(mascota.id))
  }, [mascota.id])

  const vacunasMascota = vacunasRegistradas.filter((item) => item.mascotaId === mascota.id)
  const planVacunasMascota = buildVaccineDisplayList(mascota.id)
  const tratamientosMascota = tratamientosActivos.filter((item) => item.mascotaId === mascota.id)
  const tratamientosActivosMascota = tratamientosMascota.filter((item) => item.estado === "Activo")
  const cirugiasMascota = cirugias.filter((item) => item.mascotaId === mascota.id)
  const cirugiasProgramadas = cirugiasMascota.filter(
    (item) => item.estado === "Programada" || item.estado === "Confirmada" || item.estado === "Pendiente confirmación",
  )
  const cirugiasPendientes = cirugiasMascota.filter((item) => item.estado === "Pendiente confirmación")
  const cirugiasAgendadas = cirugiasMascota.filter(
    (item) => item.estado === "Programada" || item.estado === "Confirmada",
  )
  const cirugiasRealizadas = cirugiasMascota.filter((item) => item.estado === "Realizada")
  const vacunasVencidasMascota = planVacunasMascota.filter((item) => item.status === "vencida")
  const recordatoriosMascota = recordatoriosProgramados.filter((item) => item.mascota === mascota.nombre)
  const recordatoriosConBucket = recordatoriosMascota.map((item) => ({
    ...item,
    bucket: getReminderBucket(item.estado, item.fechaProgramada),
  }))
  const recordatoriosPorBucket = {
    vencidos: recordatoriosConBucket.filter((item) => item.bucket === "vencidos"),
    proximos: recordatoriosConBucket.filter((item) => item.bucket === "proximos"),
    pendientes: recordatoriosConBucket.filter((item) => item.bucket === "pendientes"),
    completados: recordatoriosConBucket.filter((item) => item.bucket === "completados"),
  }

  const allTimelineEvents = useMemo(
    () => buildClinicalTimeline(mascota.id),
    [mascota.id, timelineRefreshKey],
  )
  const filteredHistoryEventos = useMemo(
    () =>
      searchClinicalTimeline(allTimelineEvents, historySearch, historyTypeFilter, historyVetFilter, historyStatusFilter, historyDateFrom, historyDateTo),
    [allTimelineEvents, historySearch, historyTypeFilter, historyVetFilter, historyStatusFilter, historyDateFrom, historyDateTo],
  )
  const treatmentHistoryEventos = allTimelineEvents.filter((event) => event.tipo === "Tratamiento")
  const timelinePreview = useMemo(
    () => [...allTimelineEvents].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 4),
    [allTimelineEvents],
  )
  const controlesPostoperatorios = cirugiasMascota.flatMap((cirugia) => {
    if (!cirugia.postoperatorio) return []
    const controls = [] as Array<{ id: string; label: string; fecha: string; detail: string }>
    if (cirugia.postoperatorio.fechaControl) {
      controls.push({
        id: `control-${cirugia.id}`,
        label: "Control postoperatorio",
        fecha: cirugia.postoperatorio.fechaControl,
        detail: cirugia.tipo,
      })
    }
    if (cirugia.postoperatorio.retiroPuntos) {
      controls.push({
        id: `puntos-${cirugia.id}`,
        label: "Retiro de puntos",
        fecha: cirugia.postoperatorio.retiroPuntos,
        detail: cirugia.tipo,
      })
    }
    return controls
  })

  const clinicalNextSteps: ClinicalNextStep[] = [
    ...planVacunasMascota
      .filter((vacuna) => vacuna.status !== "aplicada")
      .map((vacuna) => {
        const date = vacuna.estimatedAt
        const isOverdue = vacuna.status === "vencida"
        const priority = getUrgencyPriority(date, isOverdue ? "Vencida" : undefined)
        return {
          id: `vacuna-${vacuna.id}`,
          label: isOverdue ? "Vencido" : "Vacuna",
          title: vacuna.vaccineName,
          detail:
            isOverdue
              ? "Requiere contacto y registro de aplicación"
              : vacuna.observations || vacuna.actionLabel,
          date,
          tone: getUrgencyTone(priority),
          primaryAction: isOverdue ? "Registrar como realizado" : vacuna.actionLabel,
          href: `/vacunas/registrar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}`,
        }
      }),
    ...tratamientosActivosMascota.map((tratamiento) => {
      const priority = getUrgencyPriority(tratamiento.proximoControl)
      return {
        id: `tratamiento-${tratamiento.id}`,
        label: priority === 0 ? "Control vencido" : "Control",
        title: tratamiento.diagnostico,
        detail: `${tratamiento.medicamento} · ${tratamiento.dosis} · ${tratamiento.frecuencia}`,
        date: tratamiento.proximoControl,
        tone: getUrgencyTone(priority),
        primaryAction: "Actualizar evolución",
        href: `/tratamientos/registrar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}`,
      }
    }),
    ...cirugiasProgramadas.map((cirugia) => {
      const priority = getUrgencyPriority(cirugia.fecha)
      return {
        id: `cirugia-${cirugia.id}`,
        label: "Cirugía",
        title: cirugia.tipo,
        detail: `${cirugia.estado} · ${cirugia.hora}`,
        date: cirugia.fecha,
        tone: getUrgencyTone(priority),
        primaryAction: "Ver detalle",
        href: `/cirugias/pendientes?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}`,
      }
    }),
  ].sort((a, b) => {
    const priorityDiff = getUrgencyPriority(a.date, a.label === "Vencido" ? "Vencida" : undefined) - getUrgencyPriority(b.date, b.label === "Vencido" ? "Vencida" : undefined)
    if (priorityDiff !== 0) return priorityDiff
    return (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31")
  })

  const clearHistoryFilters = () => {
    setHistorySearch("")
    setHistoryTypeFilter("todos")
    setHistoryVetFilter("todos")
    setHistoryStatusFilter("todos")
    setHistoryDateFrom("")
    setHistoryDateTo("")
  }

  const quickActions = [
    { label: "Atención", icon: FileHeart, href: `/atencion/nueva?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}` },
    { label: "Vacuna", icon: Syringe, href: `/vacunas/registrar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}` },
    { label: "Tratamiento", icon: Pill, href: `/tratamientos/registrar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}` },
    { label: "Cirugía", icon: Scissors, href: `/cirugias/agendar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}` },
    { label: "Estudio", icon: FileText, href: `/estudios/agregar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}` },
  { label: "Recordatorio", icon: MessageCircle, href: `/recordatorios?mascotaId=${mascota.id}` },
  ]

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="bg-[linear-gradient(135deg,#b3007a_0%,#920064_58%,#6e7c12_100%)] px-5 py-6 text-primary-foreground sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="secondary" size="sm" asChild className="h-10 w-fit bg-white/14 text-white hover:bg-white/22">
                <Link href="/clientes">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a clientes
                </Link>
              </Button>
              <div className="flex flex-wrap gap-2">
<Button
                  className="h-12 rounded-xl bg-white px-5 text-base font-bold text-primary shadow-sm hover:bg-white/90"
                  asChild
                >
                  <Link href={`/atencion/nueva?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}`}>
                    <Plus className="mr-2 h-5 w-5" />
                    Nueva atención
                  </Link>
                </Button>
                <Button variant="secondary" className="h-12 rounded-xl bg-white/14 px-5 text-base font-bold text-white hover:bg-white/22" onClick={() => setEditDialogOpen(true)}>
                  <Edit className="mr-2 h-5 w-5" />
                  Editar ficha
                </Button>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-24 w-24 border-4 border-white/20">
                <AvatarFallback className="bg-white text-4xl font-bold text-primary">
                  {mascota.nombre[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-bold tracking-normal">{mascota.nombre}</h1>
                </div>
                <p className="text-base text-white/85">
                  {mascota.especie} · {mascota.raza} · {mascota.sexo} · {mascota.edad}
                </p>

              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-3 border-t bg-card px-5 py-5 text-sm sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
          <HeaderStat label="Dueño" value={mascota.dueno} />
          <HeaderStat label="Contacto" value={cliente?.telefono || "-"} />
          <HeaderStat label="Peso actual" value={`${mascota.peso} kg`} />
          <HeaderStat label="Última consulta" value={formatDate(mascota.ultimaConsulta)} />
          <HeaderStat label="Último diagnóstico" value={mascota.ultimoDiagnostico} />
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
          <TabsList className="no-scrollbar flex w-full flex-wrap justify-center gap-2 bg-transparent p-0">
            <TabsTrigger
              value="resumen"
              className="h-11 rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="vacunas"
              className="h-11 rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Vacunas
            </TabsTrigger>
            <TabsTrigger
              value="tratamientos"
              className="h-11 rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Tratamientos
            </TabsTrigger>
            <TabsTrigger
              value="cirugias"
              className="h-11 rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Cirugías
            </TabsTrigger>
            <TabsTrigger
              value="estudios"
              className="h-11 rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Estudios
            </TabsTrigger>
            <TabsTrigger
              value="historia"
              className="h-11 rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Historia clínica
            </TabsTrigger>
            <TabsTrigger
              value="recordatorios"
              className="h-11 rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Recordatorios
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="resumen" className="space-y-6">
          <Card className="border-destructive/20">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Alertas clínicas
                  </CardTitle>
                  <CardDescription>Información crítica antes de atender.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-9 rounded-xl" onClick={() => setEditDialogOpen(true)}>
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Editar datos clínicos
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex min-w-0 items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">Alergias:</span>
                  {mascota.alergias.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {mascota.alergias.map((alergia, i) => (
                        <span key={i} className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                          {alergia}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin alergias registradas.</span>
                  )}
                </div>

                <div className="flex min-w-0 items-center gap-2">
                  <HeartPulse className="h-4 w-4 shrink-0 text-warning" />
                  <span className="text-sm font-semibold text-warning">Antecedentes:</span>
                  {mascota.antecedentes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {mascota.antecedentes.map((ant, i) => (
                        <span key={i} className="inline-flex items-center rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                          {ant}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin antecedentes registrados.</span>
                  )}
                </div>

                <div className="flex min-w-0 items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm font-semibold text-primary">Crónicas:</span>
                  {mascota.condicionesCronicas.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {mascota.condicionesCronicas.map((cond, i) => (
                        <span key={i} className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {cond}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin condiciones crónicas.</span>
                  )}
                </div>
              </div>

              {mascota.observacionesClinicas.trim() && (
                <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-2.5">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Obs. clínicas:</span> {mascota.observacionesClinicas}</p>
                </div>
              )}
</CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Próximos pasos clínicos
                  </CardTitle>
                  <CardDescription>Ordenados por urgencia: vencido, próximo, pendiente y futuro.</CardDescription>
                </div>
                <Button variant="outline" className="h-11 rounded-xl" asChild>
                  <Link href="/recordatorios">Ver recordatorios</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {clinicalNextSteps.length > 0 ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {clinicalNextSteps.slice(0, 6).map((step) => (
                    <NextStepItem key={step.id} step={step} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No hay próximos pasos clínicos cargados para esta mascota.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    Tratamientos activos importantes
                  </CardTitle>
                  <CardDescription>Medicación, evolución y próximos controles abiertos.</CardDescription>
                </div>
                <Button className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90" asChild>
                  <Link href={`/tratamientos/registrar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar tratamiento
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {tratamientosActivosMascota.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {tratamientosActivosMascota.map((tratamiento) => (
                    <TreatmentActiveCard key={tratamiento.id} tratamiento={tratamiento} clienteId={cliente?.id} mascotaId={mascota.id} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Sin tratamientos activos.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Últimos eventos relevantes
                  </CardTitle>
                  <CardDescription>Lo más reciente en la historia clínica.</CardDescription>
                </div>
                <Button variant="outline" className="h-11 rounded-xl" asChild>
                  <Link href={`/mascotas/${mascota.id}?tab=historia`}>Ver historial completo</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {timelinePreview.length > 0 ? (
                <div className="space-y-4">
                  {timelinePreview.map((evento) => (
                    <ClinicalTimelineItem
                      key={evento.id}
                      event={evento}
                      isExpanded={expandedResumenItems.includes(evento.id)}
                      onToggle={() =>
                        setExpandedResumenItems((current) =>
                          current.includes(evento.id)
                            ? current.filter((item) => item !== evento.id)
                            : [...current, evento.id],
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Sin eventos recientes registrados.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Accesos rápidos clínicos
              </CardTitle>
              <CardDescription>Cargar una acción clínica vinculada a esta mascota.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {quickActions.map((action) => (
                    <div key={action.label} className="min-w-0">
                      <Button asChild className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-center font-bold leading-tight hover:bg-primary/90 whitespace-normal">
                        <Link href={action.href || "#"}>
                          <action.icon className="h-5 w-5 shrink-0" />
                          <span className="whitespace-normal break-words text-sm">{action.label}</span>
                        </Link>
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vacunas" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Syringe className="h-5 w-5 text-primary" />
                    Vacunas
                  </CardTitle>
                  <CardDescription>Prioridad: vencidas, pendientes, proximas, aplicadas e historial desconocido.</CardDescription>
                </div>
                <Button className="h-12 rounded-xl bg-primary px-5 text-center font-bold leading-tight hover:bg-primary/90" asChild>
                  <Link href={`/vacunas/registrar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar vacuna
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              {planVacunasMascota.length > 0 ? (
                vacunaGroups.map((estado) => {
                  const vacunasPorEstado = planVacunasMascota.filter((vacuna) => vacuna.status === estado)
                  if (vacunasPorEstado.length === 0) return null
                  return (
                    <div key={estado} className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">{vacunaGroupLabels[estado]}</h3>
                        <Badge variant="outline">{vacunasPorEstado.length}</Badge>
                      </div>
                      <div className="grid gap-3 xl:grid-cols-2">
                        {vacunasPorEstado.map((vacuna) => (
                          <VaccineDisplayCard key={vacuna.id} item={vacuna} clienteId={cliente?.id} mascotaId={mascota.id} />
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <Syringe className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 font-semibold">Sin plan de vacunas cargado</p>
                  <p className="text-sm text-muted-foreground">Registrá la primera vacuna o una fecha recomendada para este paciente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tratamientos" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    Tratamientos activos
                  </CardTitle>
                  <CardDescription>Medicación, evolución y próximos controles abiertos.</CardDescription>
                </div>
                <Button className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90" asChild>
                  <Link href={`/tratamientos/registrar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar tratamiento
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {tratamientosActivosMascota.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {tratamientosActivosMascota.map((tratamiento) => (
                    <TreatmentActiveCard key={tratamiento.id} tratamiento={tratamiento} clienteId={cliente?.id} mascotaId={mascota.id} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Sin tratamientos activos.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <FileHeart className="h-5 w-5 text-primary" />
                Historial de tratamientos
              </CardTitle>
              <CardDescription>Registro cronológico de tratamientos iniciados.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {treatmentHistoryEventos.length > 0 ? (
                <div className="space-y-4">
                  {treatmentHistoryEventos.map((evento) => (
                    <ClinicalTimelineItem
                      key={evento.id}
                      event={evento}
                      isExpanded={expandedTreatmentItems.includes(evento.id)}
                      onToggle={() =>
                        setExpandedTreatmentItems((current) =>
                          current.includes(evento.id)
                            ? current.filter((item) => item !== evento.id)
                            : [...current, evento.id],
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Sin historial de tratamientos registrado.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cirugias" className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-primary" />
                    Cirugías
                  </CardTitle>
                  <CardDescription>Agendadas, pendientes, realizadas y controles postoperatorios.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90" asChild>
                    <Link href={`/cirugias/agendar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agendar cirugía
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-12 rounded-xl" asChild>
                    <Link href={`/cirugias/pendientes?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}`}>
                      Registrar cirugía agendada
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              {[
                { key: "agendadas", label: "Cirugías agendadas", items: cirugiasAgendadas },
                { key: "pendientes", label: "Cirugías pendientes", items: cirugiasPendientes },
                { key: "realizadas", label: "Cirugías realizadas", items: cirugiasRealizadas },
              ].map((section) => (
                <div key={section.key} className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">{section.label}</h3>
                    <Badge variant="outline">{section.items.length}</Badge>
                  </div>
                  {section.items.length > 0 ? (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {section.items.map((cirugia) => (
                        <SurgeryItem key={cirugia.id} cirugia={cirugia} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                      Sin cirugías cargadas en esta categoría.
                    </div>
                  )}
                </div>
              ))}
</CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Controles postoperatorios
              </CardTitle>
              <CardDescription>Seguimiento clínico y retiro de puntos.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {controlesPostoperatorios.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {controlesPostoperatorios.map((control) => (
                    <div key={control.id} className="rounded-xl border bg-card p-4">
                      <p className="text-sm text-muted-foreground">{control.label}</p>
                      <p className="mt-2 text-lg font-bold">{formatDate(control.fecha)}</p>
                      <p className="text-sm text-muted-foreground">{control.detail}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Sin controles postoperatorios registrados.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estudios" className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Estudios y archivos
                  </CardTitle>
                  <CardDescription>Documentación secundaria asociada al paciente.</CardDescription>
                </div>
                <Button className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90" asChild>
                  <Link href={`/estudios/agregar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Cargar estudio
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {estudiosMascota.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {estudiosMascota.map((estudio) => (
                    <div key={estudio.id} className="flex items-center justify-between gap-3 rounded-xl border p-4">
                      <div className="min-w-0">
                        <p className="font-semibold">{estudio.tipo}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(estudio.fecha)}</p>
                        <p className="mt-1 line-clamp-2 text-sm">{estudio.descripcion}</p>
                      </div>
                      {estudio.archivoUrl ? (
                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" asChild>
                          <a href={estudio.archivoUrl} download={estudio.archivoNombre || "archivo"}>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : estudio.archivoNombre ? (
                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" disabled title="Archivo demo sin URL real">
                          <Download className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Sin estudios cargados.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historia" className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Historia clínica completa
              </CardTitle>
              <CardDescription>Consultas, vacunas, tratamientos, cirugías, estudios, controles y recordatorios.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="mb-5 space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Historia clínica</h3>
                    <p className="text-sm text-muted-foreground">
                      Consultas, vacunas, tratamientos, estudios, cirugías y controles de esta mascota.
                    </p>
                  </div>
                  <Button className="min-h-14 rounded-2xl bg-primary px-6 py-3 text-base font-bold leading-tight shadow-md shadow-primary/20 hover:bg-primary/90" asChild>
<Link href={`/atencion/nueva?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}`}>
                      <Plus className="mr-2 h-5 w-5" />
                      Nueva atención
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(160px,1fr))]">
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} className="h-11 pl-10" placeholder="Buscar diagnóstico, motivo, tratamiento, vacuna, estudio..." />
                  </div>
                  <Select value={historyTypeFilter} onValueChange={setHistoryTypeFilter}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Tipo de evento" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los tipos</SelectItem>
                      {historiaTipoEventos.map((tipo) => <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={historyVetFilter} onValueChange={setHistoryVetFilter}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Veterinario" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los veterinarios</SelectItem>
                      {[...new Set(allTimelineEvents.map((e) => e.veterinario).filter(Boolean))].map((vet) => <SelectItem key={vet} value={vet}>{vet}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Estado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      {[...new Set(allTimelineEvents.map((e) => e.estado).filter(Boolean))].map((status) => <SelectItem key={status} value={status!}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <Input type="date" value={historyDateFrom} onChange={(event) => setHistoryDateFrom(event.target.value)} className="h-11" aria-label="Fecha desde" />
                  <Input type="date" value={historyDateTo} onChange={(event) => setHistoryDateTo(event.target.value)} className="h-11" aria-label="Fecha hasta" />
                  <Button variant="outline" className="h-11 rounded-xl px-4" onClick={clearHistoryFilters}>Limpiar filtros</Button>
                </div>
                <p className="text-sm font-semibold text-muted-foreground">{filteredHistoryEventos.length} registros encontrados</p>
              </div>

              {filteredHistoryEventos.length > 0 ? (
                <div className="space-y-4">
                  {filteredHistoryEventos.map((evento) => (
                    <ClinicalTimelineItem
                      key={evento.id}
                      event={evento}
                      isExpanded={expandedHistoryItems.includes(evento.id)}
                      onToggle={() =>
                        setExpandedHistoryItems((current) =>
                          current.includes(evento.id)
                            ? current.filter((item) => item !== evento.id)
                            : [...current, evento.id],
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Sin eventos clínicos registrados.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recordatorios" className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Recordatorios
                  </CardTitle>
                  <CardDescription>Seguimiento de mensajes pendientes, próximos, vencidos y completados.</CardDescription>
                </div>
                <Button className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90" asChild>
                  <Link href="/recordatorios">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar recordatorio
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              {recordatoriosMascota.length > 0 ? (
                reminderBucketOrder.map((bucket) => (
                  <div key={bucket} className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">{reminderBucketLabels[bucket]}</h3>
                      <Badge variant="outline">{recordatoriosPorBucket[bucket].length}</Badge>
                    </div>
                    {recordatoriosPorBucket[bucket].length > 0 ? (
                      <div className="grid gap-3 lg:grid-cols-2">
                        {recordatoriosPorBucket[bucket].map((reminder) => (
                          <ReminderItem key={reminder.id} reminder={reminder} className={reminderBucketStyles[bucket]} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                        Sin recordatorios en esta categoría.
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Sin recordatorios asociados a esta mascota.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditarFichaDialog
        mascota={mascota}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSaved={handleFichaSaved}
      />
    </div>
  )
}

function HeaderStat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border bg-muted/10 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value || "-"}</p>
    </div>
  )
}

function SurgeryItem({ cirugia }: { cirugia: (typeof cirugias)[number] }) {
  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{cirugia.tipo}</h3>
            <Badge variant="outline">{cirugia.estado}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(cirugia.fecha)} · {cirugia.hora}
          </p>
          <p className="text-sm text-muted-foreground">Veterinario: {cirugia.veterinario}</p>
        </div>
        <Button variant="outline" className="h-10 rounded-xl">
          Ver detalle
        </Button>
      </div>
    </article>
  )
}

function ReminderItem({
  reminder,
  className,
}: {
  reminder: (typeof recordatoriosProgramados)[number]
  className: string
}) {
  return (
    <article className={`rounded-xl border p-4 ${className}`}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{reminder.tipo}</Badge>
          <span className="text-sm text-muted-foreground">{formatDate(reminder.fechaProgramada)}</span>
        </div>
        <h3 className="font-bold">{reminder.mascota}</h3>
        <p className="text-sm text-muted-foreground">{reminder.destinatario}</p>
        <p className="text-sm">{reminder.mensaje}</p>
      </div>
    </article>
  )
}

function NextStepItem({ step }: { step: ClinicalNextStep }) {
  const toneClass = {
    danger: "border-destructive/35 bg-destructive/10",
    warning: "border-warning/35 bg-warning/10",
    neutral: "border-border bg-card",
    primary: "border-primary/25 bg-primary/5",
  }[step.tone]

  return (
    <article className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{step.label}</Badge>
            <span className="text-sm text-muted-foreground">{formatDate(step.date)}</span>
          </div>
          <h3 className="mt-2 font-bold">{step.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{step.detail}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <Button className="h-11 rounded-xl bg-primary px-4 font-bold hover:bg-primary/90" asChild>
            <Link href={step.href}>{step.primaryAction}</Link>
          </Button>
          <Button variant="outline" className="h-11 rounded-xl">
            Ver detalle
          </Button>
        </div>
      </div>
    </article>
  )
}

function TreatmentActiveCard({
  tratamiento,
  clienteId,
  mascotaId,
}: {
  tratamiento: (typeof tratamientosActivos)[number]
  clienteId?: number
  mascotaId: number
}) {
  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold">{tratamiento.medicamento}</h3>
            <Badge className="bg-primary text-primary-foreground">{tratamiento.estado}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{tratamiento.diagnostico}</p>
        </div>
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-bold text-primary">
          Control: {formatDate(tratamiento.proximoControl)}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <CompactDetail label="Medicación indicada" value={tratamiento.medicamento} />
        <CompactDetail label="Dosis" value={tratamiento.dosis} />
        <CompactDetail label="Frecuencia" value={tratamiento.frecuencia} />
        <CompactDetail label="Duración" value={tratamiento.duracion} />
      </div>

      <div className="mt-3 rounded-lg bg-muted/35 p-3 text-sm">
        <span className="font-semibold">Observaciones: </span>
        {tratamiento.indicaciones}
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button className="h-11 rounded-xl bg-primary px-4 font-bold hover:bg-primary/90" asChild>
          <Link href={`/tratamientos/registrar?clienteId=${clienteId || ""}&mascotaId=${mascotaId}`}>
            Actualizar evolución
          </Link>
        </Button>
        <Button variant="outline" className="h-11 rounded-xl">
          Finalizar tratamiento
        </Button>
      </div>
    </article>
  )
}

function VaccineDisplayCard({
  item,
  clienteId,
  mascotaId,
}: {
  item: VaccineDisplayItem
  clienteId?: number
  mascotaId: number
}) {
  const style = getVaccineStatusBadgeStyle(item.status)
  const actionHref = `/vacunas/registrar?clienteId=${clienteId || ""}&mascotaId=${mascotaId}`
  const overdueText = formatOverdueText(item.overdueDays)

  const statusLabelMap: Record<VaccineDisplayStatus, string> = {
    aplicada: "Aplicada",
    proxima: "Proxima",
    pendiente: "Pendiente",
    vencida: "Vencida",
    historial_desconocido: "Historial desconocido",
  }

  return (
    <article className={`rounded-xl border p-4 ${style.card}`}>
      <div className="flex min-w-0 gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
          <Syringe className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{item.vaccineName}</h3>
            <Badge className={style.badge}>{statusLabelMap[item.status]}</Badge>
            {item.doseName && <Badge variant="outline">{item.doseName}</Badge>}
          </div>
          {overdueText && (
            <p className="mt-1 text-sm font-semibold text-destructive">{overdueText}</p>
          )}
          {item.blockedByPreviousDose && (
            <p className="mt-1 text-sm font-medium text-warning">Dosis anterior no registrada. Registre primero la dosis correspondiente.</p>
          )}
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.observations}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {item.appliedAt && <CompactDetail label="Aplicada" value={formatDate(item.appliedAt)} />}
        {item.estimatedAt && <CompactDetail label="Fecha esperada" value={formatDate(item.estimatedAt)} />}
        {item.status === "historial_desconocido" && <CompactDetail label="Estado" value="Sin registros previos" />}
        {item.reminderDate && <CompactDetail label="Recordatorio" value={formatDate(item.reminderDate)} />}
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {item.canRegister ? (
          <Button className="h-11 rounded-xl bg-primary px-4 font-bold hover:bg-primary/90" asChild>
            <Link href={actionHref}>{item.actionLabel}</Link>
          </Button>
        ) : item.status === "aplicada" ? (
          <Button variant="outline" className="h-11 rounded-xl">
            Ver detalle
          </Button>
        ) : (
          <Button className="h-11 rounded-xl bg-primary px-4 font-bold hover:bg-primary/90" asChild>
            <Link href={actionHref}>{item.actionLabel}</Link>
          </Button>
        )}
        {item.secondaryActionLabel && (
          <Button variant="outline" className="h-11 rounded-xl">
            {item.secondaryActionLabel}
          </Button>
        )}
      </div>
    </article>
  )
}

function CompactDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/70 px-3 py-2">
      <p className="text-[11px] leading-none text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium leading-snug">{value}</p>
    </div>
  )
}
