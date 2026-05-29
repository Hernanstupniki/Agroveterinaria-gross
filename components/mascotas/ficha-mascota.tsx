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
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
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

interface FichaMascotaProps {
  mascotaId: number
}

const vacunaEstadoStyles: Record<string, { badge: string; card: string; icon: string; label: string }> = {
  Aplicada: {
    badge: "bg-success text-success-foreground",
    card: "border-success/25 bg-success/5",
    icon: "bg-success/10 text-success",
    label: "Aplicada",
  },
  Próxima: {
    badge: "bg-primary text-primary-foreground",
    card: "border-primary/25 bg-primary/5",
    icon: "bg-primary/10 text-primary",
    label: "Próxima",
  },
  Pendiente: {
    badge: "bg-secondary text-secondary-foreground",
    card: "border-secondary/50 bg-secondary/10",
    icon: "bg-secondary/20 text-secondary-foreground",
    label: "Pendiente",
  },
  Vencida: {
    badge: "bg-destructive text-destructive-foreground",
    card: "border-destructive/40 bg-destructive/10",
    icon: "bg-destructive/10 text-destructive",
    label: "Vencida",
  },
}

const vacunaGroups = ["Vencida", "Próxima", "Pendiente", "Aplicada"]

function formatDate(date?: string | null) {
  if (!date) return "-"
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

export function FichaMascota({ mascotaId }: FichaMascotaProps) {
  const mascota = mascotas.find((item) => item.id === mascotaId) || mascotas[0]
  const cliente = clientes.find((item) => item.id === mascota.clienteId)

  const vacunasMascota = vacunasRegistradas.filter((item) => item.mascotaId === mascota.id)
  const planVacunasMascota = vacunasClinicas.filter((item) => item.mascotaId === mascota.id)
  const tratamientosMascota = tratamientosActivos.filter((item) => item.mascotaId === mascota.id)
  const estudiosMascota = estudiosArchivos.filter((item) => item.mascotaId === mascota.id)
  const cirugiasMascota = cirugias.filter((item) => item.mascotaId === mascota.id)

  const vacunasAplicadas = planVacunasMascota.filter((item) => item.estado === "Aplicada").length
  const vacunasProximas = planVacunasMascota.filter((item) => item.estado === "Próxima").length
  const vacunasPendientes = planVacunasMascota.filter((item) => item.estado === "Pendiente").length
  const vacunasVencidas = planVacunasMascota.filter((item) => item.estado === "Vencida").length
  const proximoRecordatorioVacuna = planVacunasMascota
    .filter((item) => item.proximoRecordatorio)
    .sort((a, b) => a.proximoRecordatorio.localeCompare(b.proximoRecordatorio))[0]
  const tratamientosActivosMascota = tratamientosMascota.filter((item) => item.estado === "Activo")
  const cirugiasProgramadas = cirugiasMascota.filter(
    (item) => item.estado === "Programada" || item.estado === "Confirmada" || item.estado === "Pendiente confirmación",
  )
  const timelineEventos = (mascota.id === 1
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
          veterinario: tratamiento.veterinario,
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
      ]).sort((a, b) => b.fecha.localeCompare(a.fecha))
  const ultimaConsulta = timelineEventos.find((evento) => evento.tipo === "Consulta") || timelineEventos[0]

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
    ...(vacunasVencidas > 0
      ? [
          {
            id: "vacunas-vencidas",
            titulo: "Vacuna vencida",
            detalle: `${vacunasVencidas} vacuna requiere atención`,
            icon: Syringe,
            className: "border-destructive/25 bg-destructive/10 text-destructive",
          },
        ]
      : []),
    ...cirugiasProgramadas.map((cirugia) => ({
      id: `cirugia-${cirugia.id}`,
      titulo: "Cirugía programada",
      detalle: `${cirugia.tipo} - ${cirugia.fecha}`,
      icon: Scissors,
      className: "border-primary/25 bg-primary/10 text-primary",
    })),
  ]

  const quickActions = [
    { label: "Consulta", icon: FileHeart, href: "/historial", className: "bg-primary text-primary-foreground hover:bg-primary/90" },
    { label: "Vacuna", icon: Syringe, href: "/vacunas", className: "bg-success text-success-foreground hover:bg-success/90" },
    { label: "Estudio", icon: FileText, href: "/estudios", className: "bg-secondary text-secondary-foreground hover:bg-secondary/90" },
    { label: "Tratamiento", icon: Pill, href: "/tratamientos", className: "bg-warning text-warning-foreground hover:bg-warning/90" },
    { label: "Cirugía", icon: Scissors, href: "/cirugias", className: "bg-background hover:bg-muted" },
    { label: "Recordatorio", icon: MessageCircle, href: "/recordatorios", className: "bg-background hover:bg-muted" },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/clientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a clientes
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button className="h-11 bg-primary px-4 font-semibold hover:bg-primary/90">
            <Edit className="mr-2 h-4 w-4" />
            Editar ficha
          </Button>
          <Button className="h-11 bg-primary px-4 font-semibold hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nueva atención
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="bg-[linear-gradient(135deg,#b3007a_0%,#8f0062_58%,#617000_100%)] px-5 py-5 text-primary-foreground lg:px-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white/20">
                <AvatarFallback className="bg-white text-3xl font-bold text-primary">
                  {mascota.nombre[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-normal">{mascota.nombre}</h1>
                  <Badge className={estadoColors[mascota.estadoGeneral] || "bg-muted text-muted-foreground"}>
                    {mascota.estadoGeneral}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-white/82">
                  {mascota.especie} · {mascota.raza} · {mascota.sexo} · {mascota.edad}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-white/14 px-2.5 py-1">Chip {mascota.chip}</span>
                  <span className="rounded-md bg-white/14 px-2.5 py-1">{mascota.esterilizado ? "Esterilizado/a" : "No esterilizado/a"}</span>
                  <span className="rounded-md bg-white/14 px-2.5 py-1">{mascota.color}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:w-[360px]">
              <div className="rounded-lg bg-white/12 p-3">
                <p className="text-xs text-white/70">Dueño</p>
                <p className="font-semibold">{mascota.dueno}</p>
              </div>
              <div className="rounded-lg bg-white/12 p-3">
                <p className="text-xs text-white/70">Contacto</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{cliente?.telefono}</p>
                  <MessageCircle className="h-4 w-4 text-secondary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-0 border-t bg-card md:grid-cols-4">
          <ClinicalMetric icon={Weight} label="Peso actual" value={`${mascota.peso} kg`} />
          <ClinicalMetric icon={Calendar} label="Última consulta" value={mascota.ultimaConsulta} />
          <ClinicalMetric icon={Stethoscope} label="Último diagnóstico" value={mascota.ultimoDiagnostico} />
          <ClinicalMetric icon={Phone} label="WhatsApp" value={cliente?.consentimientoWhatsApp ? "Habilitado" : "Sin consentimiento"} />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <VaccineSummaryCard icon={Syringe} label="Vacunas aplicadas" value={`${vacunasAplicadas}`} detail="Registradas en la ficha" tone="success" />
        <VaccineSummaryCard icon={Clock} label="Próximas vacunas" value={`${vacunasProximas + vacunasPendientes}`} detail={`${vacunasPendientes} pendiente`} tone="primary" />
        <VaccineSummaryCard icon={AlertTriangle} label="Vacunas vencidas" value={`${vacunasVencidas}`} detail={vacunasVencidas ? "Requieren contacto" : "Sin alertas"} tone="danger" />
        <VaccineSummaryCard
          icon={MessageCircle}
          label="Próximo recordatorio"
          value={proximoRecordatorioVacuna ? formatDate(proximoRecordatorioVacuna.proximoRecordatorio) : "-"}
          detail={proximoRecordatorioVacuna?.vacuna || "Sin programación"}
          tone="primary"
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-[1fr_360px]">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4 text-primary" />
              Accesos rápidos
            </CardTitle>
            <CardDescription>Cargar una nueva acción clínica sin salir de la ficha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              {quickActions.map((action) => (
                <Button key={action.label} asChild variant="outline" className={`h-14 min-w-0 justify-start gap-2 px-3 ${action.className}`}>
                  <Link href={action.href} title={action.label}>
                    <action.icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 whitespace-normal text-left text-sm leading-tight">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Alertas clínicas
            </CardTitle>
            <CardDescription>Información crítica para atender primero</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {alertas.length > 0 ? (
              alertas.map((alerta) => (
                <div key={alerta.id} className={`flex gap-3 rounded-lg border p-3 ${alerta.className}`}>
                  <alerta.icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{alerta.titulo}</p>
                    <p className="text-sm text-foreground">{alerta.detalle}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-success/25 bg-success/10 p-3 text-sm">
                Sin alertas clínicas activas.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <Card className="border-primary/20">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Syringe className="h-5 w-5 text-primary" />
                    Plan de vacunas
                  </CardTitle>
                  <CardDescription>Aplicadas, próximas, pendientes y vencidas para este paciente</CardDescription>
                </div>
                <Button className="h-12 bg-primary px-5 font-bold hover:bg-primary/90" asChild>
                  <Link href="/vacunas">
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
                        <VaccinePlanItem key={vacuna.id} vacuna={vacuna} />
                      )),
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center">
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
                    <Activity className="h-5 w-5 text-primary" />
                    Timeline clínico
                  </CardTitle>
                  <CardDescription>Consultas, vacunas, estudios, tratamientos y cirugías en una línea de tiempo</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/historial">
                    Ver historial completo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <ScrollArea className="h-[620px] pr-4">
                <div className="relative">
                  <div className="absolute bottom-0 left-4 top-0 w-px bg-border" />
                  <div className="space-y-5">
                    {timelineEventos.map((evento) => {
                      const Icon = tipoEventoIcons[evento.tipo] || Activity
                      const colorClass = tipoEventoColors[evento.tipo] || "border-muted bg-muted text-muted-foreground"

                      return (
                        <article key={evento.id} className="relative pl-11">
                          <div className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="outline">{evento.tipo}</Badge>
                                  <span className="text-sm text-muted-foreground">{evento.fecha}</span>
                                  <span className="text-sm text-muted-foreground">· {evento.veterinario}</span>
                                </div>
                                <h3 className="mt-2 text-base font-semibold">{evento.motivo || evento.procedimiento}</h3>
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
                              {evento.proximoControl && <TimelineDetail label="Próximo control" value={evento.proximoControl} />}
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
                    })}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-4 w-4 text-primary" />
                Resumen clínico
              </CardTitle>
              <CardDescription>Lectura rápida antes de atender</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Última consulta</p>
                <p className="font-semibold">{ultimaConsulta?.fecha}</p>
                <p className="mt-1 text-sm">{ultimaConsulta?.diagnostico || mascota.ultimoDiagnostico}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <MiniStat icon={Syringe} label="Vacunas" value={`${vacunasAplicadas}`} detail={vacunasVencidas ? `${vacunasVencidas} vencida` : "Al día"} />
                <MiniStat icon={Pill} label="Tratamientos" value={`${tratamientosActivosMascota.length}`} detail="Activos" />
                <MiniStat icon={FileText} label="Estudios" value={`${estudiosMascota.length}`} detail="Archivados" />
                <MiniStat icon={Scissors} label="Cirugías" value={`${cirugiasMascota.length}`} detail={cirugiasProgramadas.length ? "Programada" : "Histórico"} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-primary" />
                  Próximos pasos
                </CardTitle>
                <CardDescription>Seguimiento operativo</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/recordatorios">Ver</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {ultimaConsulta?.proximoControl && (
                <FollowUpItem tone="warning" label="Control" date={ultimaConsulta.proximoControl} title="Revisar evolución clínica" />
              )}
              {planVacunasMascota.filter((vacuna) => vacuna.estado !== "Aplicada").slice(0, 3).map((vacuna) => (
                <FollowUpItem key={vacuna.id} tone={vacuna.estado === "Vencida" ? "danger" : "neutral"} label="Vacuna" date={formatDate(vacuna.proximaFecha)} title={vacuna.vacuna} />
              ))}
              <Button variant="outline" className="w-full" size="sm" asChild>
                <Link href="/recordatorios">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar recordatorio
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Pill className="h-4 w-4 text-warning" />
                  Tratamientos activos
                </CardTitle>
                <CardDescription>Medicación y controles</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tratamientos">Ver</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {tratamientosActivosMascota.length > 0 ? (
                tratamientosActivosMascota.map((tratamiento) => (
                  <div key={tratamiento.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{tratamiento.medicamento}</p>
                        <p className="text-xs text-muted-foreground">{tratamiento.diagnostico}</p>
                      </div>
                      <Badge variant="outline">Activo</Badge>
                    </div>
                    <p className="mt-2 text-sm">{tratamiento.dosis} · {tratamiento.frecuencia}</p>
                    <p className="mt-2 text-xs text-primary">Control: {tratamiento.proximoControl}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border p-3 text-sm text-muted-foreground">Sin tratamientos activos.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Estudios y archivos
                </CardTitle>
                <CardDescription>Documentación reciente</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/estudios">Ver</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {estudiosMascota.slice(0, 3).map((estudio) => (
                <div key={estudio.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{estudio.tipo}</p>
                    <p className="text-xs text-muted-foreground">{estudio.fecha}</p>
                  </div>
                  {estudio.archivo && (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm" asChild>
                <Link href="/estudios">
                  <Plus className="mr-2 h-4 w-4" />
                  Cargar estudio
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function ClinicalMetric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value?: string }) {
  return (
    <div className="flex min-h-20 items-center gap-3 border-b p-4 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value || "-"}</p>
      </div>
    </div>
  )
}

function VaccineSummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Activity
  label: string
  value: string
  detail: string
  tone: "success" | "primary" | "danger"
}) {
  const toneClass = {
    success: "border-success/25 bg-success/5 text-success",
    primary: "border-primary/25 bg-primary/5 text-primary",
    danger: "border-destructive/30 bg-destructive/10 text-destructive",
  }[tone]

  return (
    <Card className={toneClass}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/80">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-tight text-foreground">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function VaccinePlanItem({ vacuna }: { vacuna: (typeof vacunasClinicas)[number] }) {
  const style = vacunaEstadoStyles[vacuna.estado]
  const isActionable = Boolean(vacuna.proximaFecha || vacuna.fechaRecomendada)

  return (
    <article className={`rounded-lg border p-3 ${style.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.icon}`}>
            <Syringe className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{vacuna.vacuna}</h3>
              <Badge className={style.badge}>{vacuna.estado}</Badge>
              {vacuna.recordatorioProgramado && (
                <Badge variant="outline" className="border-primary/40 text-primary">Recordatorio programado</Badge>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{vacuna.observaciones}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <CompactDetail label="Aplicada" value={formatDate(vacuna.fechaAplicada)} />
        <CompactDetail label="Próxima" value={formatDate(vacuna.proximaFecha || vacuna.fechaRecomendada)} />
        <CompactDetail label="Veterinario" value={vacuna.veterinario || "A definir"} />
        <CompactDetail label="Recordatorio" value={formatDate(vacuna.proximoRecordatorio)} />
      </div>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button className="h-11 bg-primary font-semibold hover:bg-primary/90" disabled={!isActionable}>
          <Calendar className="mr-2 h-4 w-4" />
          Programar
        </Button>
        <Button className={vacuna.estado === "Vencida" ? "h-11 bg-destructive font-semibold hover:bg-destructive/90" : "h-11 bg-primary font-semibold hover:bg-primary/90"}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Enviar
        </Button>
      </div>
    </article>
  )
}

function CompactDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background/70 px-2.5 py-2">
      <p className="text-[11px] leading-none text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, detail }: { icon: typeof Activity; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border bg-muted/25 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
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

function FollowUpItem({ tone, label, date, title }: { tone: "danger" | "warning" | "neutral"; label: string; date: string; title: string }) {
  const toneClass = {
    danger: "border-destructive/25 bg-destructive/10",
    warning: "border-warning/30 bg-warning/10",
    neutral: "border-border bg-card",
  }[tone]

  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className="text-xs">{label}</Badge>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
      <p className="mt-2 text-sm font-semibold">{title}</p>
    </div>
  )
}
