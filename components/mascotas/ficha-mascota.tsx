"use client"

import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  cirugias,
  clientes,
  estudiosArchivos,
  historialLuna,
  mascotas,
  recordatoriosProgramados,
  tratamientosActivos,
  vacunasClinicas,
  vacunasRegistradas,
} from "@/lib/mock-data"
import { buildMockClinicalHistory } from "@/lib/clinical-history-workflow"

const MOCK_TODAY = new Date("2026-05-30T00:00:00")

const estadoColors: Record<string, string> = {
  Saludable: "bg-success text-success-foreground",
  "En tratamiento": "bg-warning text-warning-foreground",
  "Vacuna vencida": "bg-destructive text-destructive-foreground",
  "Control pendiente": "bg-secondary text-secondary-foreground",
  "Cirugía programada": "bg-primary text-primary-foreground",
}

const tipoEventoIcons: Record<string, typeof Activity> = {
  Consulta: Stethoscope,
  Vacuna: Syringe,
  Estudio: FileText,
  Cirugía: Scissors,
  Tratamiento: Pill,
  Control: Clock,
  Recordatorio: MessageCircle,
}

const tipoEventoColors: Record<string, string> = {
  Consulta: "border-primary/30 bg-primary text-primary-foreground",
  Vacuna: "border-success/30 bg-success text-success-foreground",
  Estudio: "border-secondary/40 bg-secondary text-secondary-foreground",
  Cirugía: "border-destructive/30 bg-destructive text-destructive-foreground",
  Tratamiento: "border-warning/40 bg-warning text-warning-foreground",
  Control: "border-primary/20 bg-primary/5 text-primary",
  Recordatorio: "border-secondary/40 bg-secondary text-secondary-foreground",
}

const vacunaEstadoStyles: Record<string, { badge: string; card: string; icon: string }> = {
  Aplicada: {
    badge: "bg-success text-success-foreground",
    card: "border-success/25 bg-success/5",
    icon: "bg-success/10 text-success",
  },
  Próxima: {
    badge: "bg-primary text-primary-foreground",
    card: "border-primary/25 bg-primary/5",
    icon: "bg-primary/10 text-primary",
  },
  Pendiente: {
    badge: "bg-secondary text-secondary-foreground",
    card: "border-secondary/50 bg-secondary/10",
    icon: "bg-secondary/20 text-secondary-foreground",
  },
  Vencida: {
    badge: "bg-destructive text-destructive-foreground",
    card: "border-destructive/40 bg-destructive/10",
    icon: "bg-destructive/10 text-destructive",
  },
}

const vacunaGroups = ["Vencida", "Pendiente", "Próxima", "Aplicada"]

const vacunaGroupLabels: Record<string, string> = {
  Vencida: "Vacunas vencidas",
  Pendiente: "Vacunas pendientes",
  Próxima: "Próximas vacunas",
  Aplicada: "Vacunas aplicadas",
}

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

interface TimelineEvent {
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
  procedimiento?: string
  proximoControl?: string
  observaciones?: string
  archivo?: string | null
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
  const mascota = mascotas.find((item) => item.id === mascotaId) || mascotas[0]
  const cliente = clientes.find((item) => item.id === mascota.clienteId)

  const vacunasMascota = vacunasRegistradas.filter((item) => item.mascotaId === mascota.id)
  const planVacunasMascota = vacunasClinicas.filter((item) => item.mascotaId === mascota.id)
  const tratamientosMascota = tratamientosActivos.filter((item) => item.mascotaId === mascota.id)
  const tratamientosActivosMascota = tratamientosMascota.filter((item) => item.estado === "Activo")
  const estudiosMascota = estudiosArchivos.filter((item) => item.mascotaId === mascota.id)
  const cirugiasMascota = cirugias.filter((item) => item.mascotaId === mascota.id)
  const cirugiasProgramadas = cirugiasMascota.filter(
    (item) => item.estado === "Programada" || item.estado === "Confirmada" || item.estado === "Pendiente confirmación",
  )
  const cirugiasPendientes = cirugiasMascota.filter((item) => item.estado === "Pendiente confirmación")
  const cirugiasAgendadas = cirugiasMascota.filter(
    (item) => item.estado === "Programada" || item.estado === "Confirmada",
  )
  const cirugiasRealizadas = cirugiasMascota.filter((item) => item.estado === "Realizada")
  const vacunasVencidasMascota = planVacunasMascota.filter((item) => item.estado === "Vencida")
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

  const mockClinicalHistory = buildMockClinicalHistory(mascota.id)
  const baseTimelineEventos: TimelineEvent[] = (mascota.id === 1
    ? historialLuna
    : [
        ...vacunasMascota.map((vacuna) => ({
          id: `vacuna-${vacuna.id}`,
          fecha: vacuna.fechaAplicada,
          tipo: "Vacuna",
          veterinario: vacuna.veterinario,
          motivo: vacuna.vacuna,
          vacuna: vacuna.vacuna,
          laboratorio: vacuna.laboratorio,
          proximoControl: vacuna.proximaFecha,
        })),
        ...estudiosMascota.map((estudio) => ({
          id: `estudio-${estudio.id}`,
          fecha: estudio.fecha,
          tipo: "Estudio",
          veterinario: estudio.profesional,
          motivo: estudio.descripcion,
          diagnostico: estudio.estado,
          archivo: estudio.archivo,
        })),
        ...tratamientosMascota.map((tratamiento) => ({
          id: `tratamiento-${tratamiento.id}`,
          fecha: tratamiento.fechaInicio,
          tipo: "Tratamiento",
          veterinario: "Sistema demo",
          motivo: tratamiento.diagnostico,
          tratamiento: `${tratamiento.medicamento} · ${tratamiento.dosis} · ${tratamiento.frecuencia}`,
          proximoControl: tratamiento.proximoControl,
        })),
        ...cirugiasMascota.map((cirugia) => ({
          id: `cirugia-${cirugia.id}`,
          fecha: cirugia.fecha,
          tipo: "Cirugía",
          veterinario: cirugia.veterinario,
          motivo: cirugia.tipo,
          procedimiento: cirugia.registroCirugia?.procedimiento || cirugia.tipo,
          diagnostico: cirugia.registroCirugia?.diagnosticoPrevio || cirugia.estado,
          proximoControl: cirugia.postoperatorio?.fechaControl,
        })),
      ])
  const timelineEventos: TimelineEvent[] = [
    ...baseTimelineEventos,
    ...mockClinicalHistory.map((event) => ({
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
      proximoControl: event.type === "control" ? event.date : undefined,
    })),
  ]
    .filter((event, index, events) => events.findIndex((item) => item.id === event.id) === index)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  const generatedControlEvents = timelineEventos.filter((event) =>
    String(event.id).startsWith("history-treatment-control-") || String(event.id).startsWith("history-surgery-control-"),
  )
  const timelinePreview = timelineEventos
    .filter((event) => !generatedControlEvents.some((control) => control.id === event.id))
    .slice(0, 6)
  const treatmentHistoryEventos = timelineEventos.filter((event) => event.tipo === "Tratamiento")
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

  const alertas = [
    ...mascota.alergias.map((alergia) => ({
      id: `alergia-${alergia}`,
      titulo: "Alergia registrada",
      detalle: alergia,
      icon: ShieldAlert,
      className: "border-destructive/25 bg-destructive/10 text-destructive",
    })),
    ...(mascota.antecedentes
      ? [
          {
            id: "antecedentes",
            titulo: "Antecedente importante",
            detalle: mascota.antecedentes,
            icon: HeartPulse,
            className: "border-warning/30 bg-warning/10 text-warning",
          },
        ]
      : []),
    ...vacunasVencidasMascota.map((vacuna) => ({
      id: `vacuna-vencida-${vacuna.id}`,
      titulo: "Vacuna vencida",
      detalle: `${vacuna.vacuna} desde ${formatDate(vacuna.proximaFecha || vacuna.fechaRecomendada)}`,
      icon: Syringe,
      className: "border-destructive/25 bg-destructive/10 text-destructive",
    })),
    ...tratamientosActivosMascota.map((tratamiento) => ({
      id: `tratamiento-alerta-${tratamiento.id}`,
      titulo: "Tratamiento activo",
      detalle: `${tratamiento.diagnostico}: ${tratamiento.medicamento} ${tratamiento.dosis}, ${tratamiento.frecuencia}`,
      icon: Pill,
      className: "border-primary/25 bg-primary/10 text-primary",
    })),
    ...cirugiasProgramadas.map((cirugia) => ({
      id: `cirugia-${cirugia.id}`,
      titulo: "Cirugía programada",
      detalle: `${cirugia.tipo} - ${formatDate(cirugia.fecha)} ${cirugia.hora}`,
      icon: Scissors,
      className: "border-primary/25 bg-primary/10 text-primary",
    })),
  ]

  const clinicalNextSteps: ClinicalNextStep[] = [
    ...planVacunasMascota
      .filter((vacuna) => vacuna.estado !== "Aplicada")
      .map((vacuna) => {
        const date = vacuna.proximaFecha || vacuna.fechaRecomendada
        const priority = getUrgencyPriority(date, vacuna.estado)
        return {
          id: `vacuna-${vacuna.id}`,
          label: vacuna.estado === "Vencida" ? "Vencido" : "Vacuna",
          title: vacuna.vacuna,
          detail:
            vacuna.estado === "Vencida"
              ? "Requiere contacto y registro de aplicación"
              : vacuna.observaciones,
          date,
          tone: getUrgencyTone(priority),
          primaryAction: vacuna.estado === "Vencida" ? "Registrar como realizado" : "Programar",
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

  const quickActions = [
    { label: "Consulta", icon: FileHeart, href: "/historial" },
    { label: "Vacuna", icon: Syringe, href: `/vacunas/registrar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}` },
    { label: "Tratamiento", icon: Pill, href: `/tratamientos/registrar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}` },
    { label: "Cirugía", icon: Scissors, href: `/cirugias/agendar?clienteId=${cliente?.id || ""}&mascotaId=${mascota.id}` },
    { label: "Estudio", icon: FileText, href: "/estudios" },
    { label: "Recordatorio", icon: MessageCircle, href: "/recordatorios" },
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
                <Button className="h-12 rounded-xl bg-white px-5 text-base font-bold text-primary shadow-sm hover:bg-white/90" asChild>
                  <Link href="/historial">
                    <Plus className="mr-2 h-5 w-5" />
                    Nueva atención
                  </Link>
                </Button>
                <Button variant="secondary" className="h-12 rounded-xl bg-white/14 px-5 text-base font-bold text-white hover:bg-white/22">
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
                  <Badge className={estadoColors[mascota.estadoGeneral] || "bg-muted text-muted-foreground"}>
                    {mascota.estadoGeneral}
                  </Badge>
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

      <Tabs defaultValue="resumen" className="space-y-6">
        <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
          <TabsList className="no-scrollbar flex w-full flex-nowrap gap-2 overflow-x-auto bg-transparent p-0 sm:flex-wrap">
            <TabsTrigger
              value="resumen"
              className="h-11 flex-none rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="vacunas"
              className="h-11 flex-none rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Vacunas
            </TabsTrigger>
            <TabsTrigger
              value="tratamientos"
              className="h-11 flex-none rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Tratamientos
            </TabsTrigger>
            <TabsTrigger
              value="cirugias"
              className="h-11 flex-none rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Cirugías
            </TabsTrigger>
            <TabsTrigger
              value="estudios"
              className="h-11 flex-none rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Estudios
            </TabsTrigger>
            <TabsTrigger
              value="historia"
              className="h-11 flex-none rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Historia clínica
            </TabsTrigger>
            <TabsTrigger
              value="recordatorios"
              className="h-11 flex-none rounded-full border border-transparent bg-muted/40 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap data-[state=active]:border-[#B3007A] data-[state=active]:bg-[#B3007A]/10 data-[state=active]:text-[#B3007A]"
            >
              Recordatorios
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="resumen" className="space-y-6">
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Alertas clínicas importantes
              </CardTitle>
              <CardDescription>Lo que el veterinario necesita ver antes de iniciar la atención.</CardDescription>
            </CardHeader>
            <CardContent>
              {alertas.length > 0 ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {alertas.map((alerta) => (
                    <div key={alerta.id} className={`flex gap-3 rounded-xl border p-4 ${alerta.className}`}>
                      <alerta.icon className="mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-bold">{alerta.titulo}</p>
                        <p className="mt-1 text-sm text-foreground">{alerta.detalle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-success/25 bg-success/10 p-4 text-sm font-medium">
                  Sin alertas clínicas activas.
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {quickActions.map((action) => (
                  <Button key={action.label} asChild className="h-14 rounded-xl bg-primary px-4 text-center font-bold leading-tight hover:bg-primary/90">
                    <Link href={action.href}>
                      <action.icon className="mr-2 h-5 w-5 shrink-0" />
                      <span className="whitespace-normal">{action.label}</span>
                    </Link>
                  </Button>
                ))}
              </div>
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
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Últimos eventos relevantes
              </CardTitle>
              <CardDescription>Lo más reciente en la historia clínica.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {timelinePreview.length > 0 ? (
                <div className="relative">
                  <div className="absolute bottom-0 left-4 top-0 w-px bg-border" />
                  <div className="space-y-4">
                    {timelinePreview.map((evento) => (
                      <TimelineItem key={evento.id} evento={evento} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Sin eventos recientes registrados.
                </div>
              )}
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
                  <CardDescription>Prioridad: vencidas, pendientes, próximas y aplicadas.</CardDescription>
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
                  const vacunasPorEstado = planVacunasMascota.filter((vacuna) => vacuna.estado === estado)
                  return (
                    <div key={estado} className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">{vacunaGroupLabels[estado]}</h3>
                        <Badge variant="outline">{vacunasPorEstado.length}</Badge>
                      </div>
                      {vacunasPorEstado.length > 0 ? (
                        <div className="grid gap-3 xl:grid-cols-2">
                          {vacunasPorEstado.map((vacuna) => (
                            <VaccinePlanItem key={vacuna.id} vacuna={vacuna} clienteId={cliente?.id} mascotaId={mascota.id} />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                          Sin {vacunaGroupLabels[estado].toLowerCase()}.
                        </div>
                      )}
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
                <div className="relative">
                  <div className="absolute bottom-0 left-4 top-0 w-px bg-border" />
                  <div className="space-y-4">
                    {treatmentHistoryEventos.map((evento) => (
                      <TimelineItem key={evento.id} evento={evento} />
                    ))}
                  </div>
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
                  <Link href="/estudios">
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
                      {estudio.archivo && (
                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
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
              {timelineEventos.length > 0 ? (
                <div className="relative">
                  <div className="absolute bottom-0 left-4 top-0 w-px bg-border" />
                  <div className="space-y-4">
                    {timelineEventos.map((evento) => (
                      <TimelineItem key={evento.id} evento={evento} />
                    ))}
                  </div>
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

function VaccinePlanItem({
  vacuna,
  clienteId,
  mascotaId,
}: {
  vacuna: (typeof vacunasClinicas)[number]
  clienteId?: number
  mascotaId: number
}) {
  const style = vacunaEstadoStyles[vacuna.estado]
  const isApplied = vacuna.estado === "Aplicada"
  const actionLabel = vacuna.estado === "Vencida" ? "Registrar aplicación" : isApplied ? "Ver detalle" : "Programar"
  const actionHref = `/vacunas/registrar?clienteId=${clienteId || ""}&mascotaId=${mascotaId}`

  return (
    <article className={`rounded-xl border p-4 ${style.card}`}>
      <div className="flex min-w-0 gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
          <Syringe className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{vacuna.vacuna}</h3>
            <Badge className={style.badge}>{vacuna.estado}</Badge>
            {vacuna.recordatorioProgramado && (
              <Badge variant="outline" className="border-primary/40 text-primary">
                Recordatorio programado
              </Badge>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{vacuna.observaciones}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <CompactDetail label="Dosis" value="Según esquema" />
        <CompactDetail label="Aplicada" value={formatDate(vacuna.fechaAplicada)} />
        <CompactDetail label="Próxima fecha" value={formatDate(vacuna.proximaFecha || vacuna.fechaRecomendada)} />
        <CompactDetail label="Veterinario" value={vacuna.veterinario || "A definir"} />
        <CompactDetail label="Recordatorio" value={formatDate(vacuna.proximoRecordatorio)} />
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button className="h-11 rounded-xl bg-primary px-4 font-bold hover:bg-primary/90" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
        {!isApplied && (
          <Button variant="outline" className="h-11 rounded-xl">
            Ver detalle
          </Button>
        )}
      </div>
    </article>
  )
}

function TimelineItem({ evento }: { evento: TimelineEvent }) {
  const Icon = tipoEventoIcons[evento.tipo] || Activity
  const colorClass = tipoEventoColors[evento.tipo] || "border-muted bg-muted text-muted-foreground"

  return (
    <article className="relative pl-11">
      <div className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{evento.tipo}</Badge>
              <span className="text-sm text-muted-foreground">{formatDate(evento.fecha)}</span>
              <span className="text-sm text-muted-foreground">· {evento.veterinario}</span>
            </div>
            <h3 className="mt-2 font-bold">{evento.motivo || evento.procedimiento}</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 self-start">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {evento.diagnostico && <TimelineDetail label="Diagnóstico" value={evento.diagnostico} />}
          {evento.tratamiento && evento.tratamiento !== "-" && <TimelineDetail label="Tratamiento" value={evento.tratamiento} />}
          {evento.vacuna && <TimelineDetail label="Vacuna" value={`${evento.vacuna} · ${evento.laboratorio}`} />}
          {evento.peso && <TimelineDetail label="Peso" value={`${evento.peso} kg`} />}
          {evento.procedimiento && <TimelineDetail label="Procedimiento" value={evento.procedimiento} />}
          {evento.proximoControl && <TimelineDetail label="Próximo control" value={formatDate(evento.proximoControl)} />}
        </div>

        {evento.observaciones && (
          <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
            {evento.observaciones}
          </div>
        )}

        {evento.archivo && (
          <div className="mt-3 flex justify-end border-t pt-3">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Ver archivo
            </Button>
          </div>
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

function TimelineDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/35 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}
