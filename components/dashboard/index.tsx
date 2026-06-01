"use client"

import Link from "next/link"
import {
  Calendar,
  PawPrint,
  Syringe,
  AlertTriangle,
  Clock,
  Scissors,
  FileText,
  MessageCircle,
  Activity,
  ChevronRight,
  Bell,
} from "lucide-react"
import { TodayAttention } from "@/components/principal/today-attention"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  turnosHoy,
  vacunasPendientes,
  controlesPendientes,
  cirugiasProgramadas,
  estudiosPendientes,
  recordatoriosProgramados,
  respuestasWhatsAppPendientes,
  alertasClinicas,
  actividadReciente,
} from "@/lib/mock-data"

const estadoColors: Record<string, string> = {
  "Finalizado": "bg-muted text-muted-foreground",
  "En atención": "bg-primary text-primary-foreground",
  "En espera": "bg-warning text-warning-foreground",
  "Confirmado": "bg-success text-success-foreground",
  "Pendiente": "bg-secondary text-secondary-foreground",
  "Cancelado": "bg-destructive text-destructive-foreground",
}

const prioridadColors: Record<string, string> = {
  "Alta": "bg-destructive text-destructive-foreground",
  "Media": "bg-warning text-warning-foreground",
  "Baja": "bg-muted text-muted-foreground",
}

const alertaTipoColors: Record<string, string> = {
  "Crítica": "border-l-destructive bg-destructive/5",
  "Importante": "border-l-warning bg-warning/5",
  "Moderada": "border-l-primary bg-primary/5",
}

const actividadIcons: Record<string, typeof Activity> = {
  consulta: PawPrint,
  vacuna: Syringe,
  turno: Calendar,
  estudio: FileText,
  whatsapp: MessageCircle,
}

export function Dashboard() {
  const turnosActivos = turnosHoy.filter(t => t.estado !== "Finalizado" && t.estado !== "Cancelado")
  const vacunasVencidas = vacunasPendientes.filter(v => v.estado === "Vencida")
  const vacunasProximas = vacunasPendientes.filter(v => v.estado === "Próxima")
  const respuestasPendientes = respuestasWhatsAppPendientes.filter(r => r.requiereAccion)

  return (
    <div className="animate-section-in mx-auto max-w-[1600px] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
        <p className="text-muted-foreground">
          Métricas, alertas y actividad de Agroveterinaria Gross — {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Turnos Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{turnosHoy.length}</div>
            <p className="text-xs text-muted-foreground">
              {turnosActivos.length} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vacunas Vencidas</CardTitle>
            <Syringe className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{vacunasVencidas.length}</div>
            <p className="text-xs text-muted-foreground">
              {vacunasProximas.length} próximas a vencer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Controles Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{controlesPendientes.length}</div>
            <p className="text-xs text-muted-foreground">
              {controlesPendientes.filter(c => c.prioridad === "Alta").length} urgentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Pendientes</CardTitle>
            <MessageCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{respuestasPendientes.length}</div>
            <p className="text-xs text-muted-foreground">
              Requieren respuesta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operative attention — same content as was on Principal */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Hoy requiere atención</h2>
        <TodayAttention />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Agenda del Día */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Agenda del Día
              </CardTitle>
              <CardDescription>Turnos programados para hoy</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/turnos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-3">
                {turnosHoy.map((turno) => (
                  <div
                    key={turno.id}
                    className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-lg font-bold">{turno.hora.split(':')[0]}</span>
                      <span className="text-[10px]">{turno.hora.split(':')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/mascotas/${turno.mascotaId}`} className="font-medium hover:text-primary">
                          {turno.mascota}
                        </Link>
                        <Badge variant="outline" className="text-xs">
                          {turno.profesional}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {turno.dueno} • {turno.motivo}
                      </p>
                    </div>
                    <Badge className={estadoColors[turno.estado] || "bg-muted"}>
                      {turno.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Alertas Clínicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Alertas Clínicas
            </CardTitle>
            <CardDescription>Situaciones que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertasClinicas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`rounded-lg border-l-4 p-3 ${alertaTipoColors[alerta.tipo]}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs">
                      {alerta.tipo}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{alerta.fecha}</span>
                  </div>
                  <p className="text-sm font-medium">{alerta.mascota}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alerta.mensaje}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Vacunas Pendientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Syringe className="h-4 w-4 text-primary" />
                Vacunas
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vacunas">
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vacunasPendientes.slice(0, 4).map((vacuna) => (
                <div key={vacuna.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {vacuna.mascota[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{vacuna.mascota}</p>
                    <p className="text-xs text-muted-foreground">{vacuna.vacuna}</p>
                  </div>
                  <Badge
                    className={vacuna.estado === "Vencida" ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"}
                  >
                    {vacuna.estado === "Vencida" ? `-${vacuna.diasVencida}d` : `${vacuna.diasRestantes}d`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cirugías Programadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Scissors className="h-4 w-4 text-primary" />
                Cirugías
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cirugias">
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cirugiasProgramadas.map((cirugia) => (
                <div key={cirugia.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {cirugia.mascota[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cirugia.mascota}</p>
                    <p className="text-xs text-muted-foreground">{cirugia.tipo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{cirugia.fecha}</p>
                    <p className="text-xs text-muted-foreground">{cirugia.hora}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estudios Pendientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Estudios
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/estudios">
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estudiosPendientes.map((estudio) => (
                <div key={estudio.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {estudio.mascota[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{estudio.mascota}</p>
                    <p className="text-xs text-muted-foreground truncate">{estudio.tipo}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {estudio.estado.split(' ').slice(0, 2).join(' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Respuestas WhatsApp */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-success" />
                Mensajes WhatsApp
              </CardTitle>
              <CardDescription>Respuestas pendientes de atención</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/recordatorios">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {respuestasWhatsAppPendientes.map((resp) => (
                <div
                  key={resp.id}
                  className={`rounded-lg border p-3 ${resp.requiereAccion ? 'border-success/50 bg-success/5' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{resp.cliente}</span>
                      <Badge variant="outline" className="text-xs">{resp.mascota}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{resp.hora}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{resp.mensaje}</p>
                  {resp.requiereAccion && (
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="default" className="h-7 text-xs">
                        Responder
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Marcar leído
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimas acciones registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actividadReciente.map((actividad) => {
                const Icon = actividadIcons[actividad.tipo] || Activity
                return (
                  <div key={actividad.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{actividad.descripcion}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{actividad.usuario}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{actividad.hora}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recordatorios Programados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Recordatorios Programados
            </CardTitle>
            <CardDescription>Mensajes automáticos pendientes de envío</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/recordatorios">Gestionar</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recordatoriosProgramados.map((recordatorio) => (
              <div
                key={recordatorio.id}
                className="rounded-lg border p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">{recordatorio.tipo}</Badge>
                  <Badge
                    className={recordatorio.estado === "Enviado" ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"}
                  >
                    {recordatorio.estado}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{recordatorio.destinatario}</p>
                <p className="text-xs text-muted-foreground">
                  {recordatorio.mascota} • {recordatorio.fechaProgramada}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
