"use client"

import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Download,
  Edit,
  FileHeart,
  FileText,
  HeartPulse,
  MessageCircle,
  Phone,
  Pill,
  Plus,
  Scissors,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Weight,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  cirugias,
  clientes,
  estudiosArchivos,
  historialLuna,
  mascotas,
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
}

const tipoEventoColors: Record<string, string> = {
  Consulta: "border-primary/30 bg-primary text-primary-foreground",
  Vacuna: "border-success/30 bg-success text-success-foreground",
  Estudio: "border-secondary/40 bg-secondary text-secondary-foreground",
  Cirugía: "border-destructive/30 bg-destructive text-destructive-foreground",
  Tratamiento: "border-warning/40 bg-warning text-warning-foreground",
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
  const vacunasVencidasMascota = planVacunasMascota.filter((item) => item.estado === "Vencida")

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
  const groupedControlTitles = Array.from(
    new Set(generatedControlEvents.map((event) => event.motivo?.replace(/Control \d+ - /, "") || "protocolo clínico")),
  )

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
      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="bg-[linear-gradient(135deg,#b3007a_0%,#920064_58%,#6e7c12_100%)] px-5 py-6 text-primary-foreground sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="h-24 w-24 border-4 border-white/20">
                <AvatarFallback className="bg-white text-4xl font-bold text-primary">
                  {mascota.nombre[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-3">
                <Button variant="secondary" size="sm" asChild className="h-10 w-fit bg-white/14 text-white hover:bg-white/22">
                  <Link href="/clientes">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a clientes
                  </Link>
                </Button>
                <div className="space-y-2">
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
                <div className="grid gap-2 text-sm sm:grid-cols-2 lg:max-w-xl">
                  <div className="rounded-lg bg-white/12 p-3">
                    <p className="text-xs text-white/70">Dueño</p>
                    <p className="font-semibold">{mascota.dueno}</p>
                  </div>
                  <div className="rounded-lg bg-white/12 p-3">
                    <p className="text-xs text-white/70">Contacto</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{cliente?.telefono || "-"}</p>
                      <MessageCircle className="h-4 w-4 text-secondary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:w-[360px] lg:flex-col">
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
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Datos importantes
          </CardTitle>
          <CardDescription>Información rápida para confirmar antes de atender.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile icon={ShieldAlert} label="Chip" value={mascota.chip || "Sin chip"} />
          <InfoTile icon={Weight} label="Peso actual" value={`${mascota.peso} kg`} />
          <InfoTile icon={HeartPulse} label="Esterilizado/a" value={mascota.esterilizado ? "Sí" : "No"} />
          <InfoTile icon={Activity} label="Color" value={mascota.color} />
          <InfoTile icon={Calendar} label="Última consulta" value={formatDate(mascota.ultimaConsulta)} />
          <InfoTile icon={Stethoscope} label="Último diagnóstico" value={mascota.ultimoDiagnostico} />
          <InfoTile icon={Phone} label="WhatsApp" value={cliente?.consentimientoWhatsApp ? "Habilitado" : "Sin consentimiento"} />
          <InfoTile icon={Calendar} label="Fecha de nacimiento" value={formatDate(mascota.fechaNacimiento)} />
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Alertas clínicas destacadas
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

      <Card className="border-primary/20">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-primary" />
                Plan de vacunas
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
        <CardContent className="space-y-5 pt-5">
          {planVacunasMascota.length > 0 ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {vacunaGroups.flatMap((estado) =>
                planVacunasMascota
                  .filter((vacuna) => vacuna.estado === estado)
                  .map((vacuna) => (
                    <VaccinePlanItem key={vacuna.id} vacuna={vacuna} clienteId={cliente?.id} mascotaId={mascota.id} />
                  )),
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <Syringe className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 font-semibold">Sin plan de vacunas cargado</p>
              <p className="text-sm text-muted-foreground">Registrá la primera vacuna o una fecha recomendada para este paciente.</p>
            </div>
          )}
        </CardContent>
      </Card>

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
              {estudiosMascota.slice(0, 3).map((estudio) => (
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

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Timeline clínico resumido
              </CardTitle>
              <CardDescription>Últimos eventos importantes; los controles automáticos se agrupan para no saturar la ficha.</CardDescription>
            </div>
            <Button variant="outline" className="h-11 rounded-xl" asChild>
              <Link href="/historial">
                Ver historial completo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="relative">
            <div className="absolute bottom-0 left-4 top-0 w-px bg-border" />
            <div className="space-y-4">
              {timelinePreview.map((evento) => (
                <TimelineItem key={evento.id} evento={evento} />
              ))}
              {generatedControlEvents.length > 0 && (
                <article className="relative pl-11">
                  <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/30 bg-primary text-primary-foreground">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="rounded-xl border bg-primary/5 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <Badge variant="outline">Controles agrupados</Badge>
                        <h3 className="mt-2 font-bold">
                          {generatedControlEvents.length} controles generados por protocolo
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {groupedControlTitles.slice(0, 3).join(", ")}
                        </p>
                      </div>
                      <Button variant="outline" className="h-10 rounded-xl" asChild>
                        <Link href="/historial">Ver historial completo</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value?: string }) {
  return (
    <div className="flex min-h-24 items-center gap-3 rounded-xl border bg-muted/25 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-bold leading-snug">{value || "-"}</p>
      </div>
    </div>
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
