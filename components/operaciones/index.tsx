"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Calendar,
  ClipboardList,
  Users,
  FileText,
  MessageCircle,
  AlertTriangle,
  Plus,
  Check,
  Clock,
  MoreHorizontal,
  Phone,
  Mail,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  turnosHoy,
  tareasInternas,
  casosEnSeguimiento,
  estudiosPendientes,
  respuestasWhatsAppPendientes,
  alertasClinicas,
} from "@/lib/mock-data"

const estadoColors: Record<string, string> = {
  "Finalizado": "bg-muted text-muted-foreground",
  "En atención": "bg-primary text-primary-foreground",
  "En espera": "bg-warning text-warning-foreground",
  "Confirmado": "bg-success text-success-foreground",
  "Pendiente": "bg-secondary text-secondary-foreground",
  "Cancelado": "bg-destructive text-destructive-foreground",
  "Reprogramado": "bg-muted text-muted-foreground",
}

const prioridadColors: Record<string, string> = {
  "Alta": "bg-destructive text-destructive-foreground",
  "Media": "bg-warning text-warning-foreground",
  "Baja": "bg-muted text-muted-foreground",
}

const tareaEstadoColors: Record<string, string> = {
  "Pendiente": "bg-secondary text-secondary-foreground",
  "En progreso": "bg-primary text-primary-foreground",
  "Completada": "bg-success text-success-foreground",
}

const estudioEstadoColors: Record<string, string> = {
  "Solicitado": "bg-muted text-muted-foreground",
  "Pendiente de resultado": "bg-warning text-warning-foreground",
  "Resultado recibido": "bg-success text-success-foreground",
  "Informado al dueño": "bg-primary text-primary-foreground",
  "Archivado en historial": "bg-muted text-muted-foreground",
}

export function OperacionesPage() {
  const [activeTab, setActiveTab] = useState("agenda")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operaciones</h1>
          <p className="text-muted-foreground">
            Gestión de la operación diaria de la veterinaria
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ClipboardList className="mr-2 h-4 w-4" />
            Nueva Tarea
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Turno
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="agenda" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Agenda</span>
          </TabsTrigger>
          <TabsTrigger value="tareas" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Tareas</span>
          </TabsTrigger>
          <TabsTrigger value="seguimiento" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Seguimiento</span>
          </TabsTrigger>
          <TabsTrigger value="estudios" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Estudios</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="alertas" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
        </TabsList>

        {/* Agenda del Día */}
        <TabsContent value="agenda" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agenda del Día</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {turnosHoy.map((turno) => (
                  <div
                    key={turno.id}
                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <span className="text-xl font-bold">{turno.hora.split(':')[0]}</span>
                      <span className="text-xs">{turno.hora.split(':')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/mascotas/${turno.mascotaId}`} className="font-semibold hover:text-primary">
                          {turno.mascota}
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{turno.dueno}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{turno.motivo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{turno.profesional}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={estadoColors[turno.estado]}>
                        {turno.estado}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Check className="mr-2 h-4 w-4" />
                            Confirmar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Clock className="mr-2 h-4 w-4" />
                            Reprogramar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Enviar recordatorio
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tareas Internas */}
        <TabsContent value="tareas" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tareas Internas</CardTitle>
                <CardDescription>Gestión de tareas del equipo</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Tarea
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tareasInternas.map((tarea) => (
                  <div
                    key={tarea.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 ${tarea.estado === 'Completada' ? 'opacity-60' : ''}`}
                  >
                    <Checkbox
                      checked={tarea.estado === 'Completada'}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${tarea.estado === 'Completada' ? 'line-through' : ''}`}>
                          {tarea.titulo}
                        </span>
                        <Badge className={prioridadColors[tarea.prioridad]} variant="secondary">
                          {tarea.prioridad}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{tarea.descripcion}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {tarea.responsable}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tarea.fechaLimite}
                        </span>
                      </div>
                    </div>
                    <Badge className={tareaEstadoColors[tarea.estado]}>
                      {tarea.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Casos en Seguimiento */}
        <TabsContent value="seguimiento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Casos en Seguimiento</CardTitle>
              <CardDescription>Pacientes con tratamientos activos o condiciones crónicas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {casosEnSeguimiento.map((caso) => (
                  <div
                    key={caso.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {caso.mascota[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/mascotas/${caso.mascotaId}`} className="font-semibold hover:text-primary">
                            {caso.mascota}
                          </Link>
                          <p className="text-sm text-muted-foreground">{caso.dueno}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Ver ficha</Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Condición</p>
                        <p className="text-sm font-medium">{caso.condicion}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Tratamiento Activo</p>
                        <p className="text-sm">{caso.tratamientoActivo}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Último Control</p>
                        <p className="text-sm">{caso.ultimoControl}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Próximo Control</p>
                        <p className="text-sm font-medium text-primary">{caso.proximoControl}</p>
                      </div>
                    </div>
                    {caso.notas && (
                      <div className="mt-3 p-2 rounded bg-muted/50">
                        <p className="text-xs text-muted-foreground">{caso.notas}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estudios Pendientes */}
        <TabsContent value="estudios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estudios Pendientes</CardTitle>
              <CardDescription>Estado de estudios y análisis solicitados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estudiosPendientes.map((estudio) => (
                  <div
                    key={estudio.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {estudio.mascota[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/mascotas/${estudio.mascotaId}`} className="font-medium hover:text-primary">
                          {estudio.mascota}
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{estudio.dueno}</span>
                      </div>
                      <p className="text-sm font-medium">{estudio.tipo}</p>
                      <p className="text-xs text-muted-foreground">Solicitado: {estudio.fechaSolicitud}</p>
                    </div>
                    <Badge className={estudioEstadoColors[estudio.estado] || "bg-muted"}>
                      {estudio.estado}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Cargar resultado</DropdownMenuItem>
                        <DropdownMenuItem>Informar al dueño</DropdownMenuItem>
                        <DropdownMenuItem>Archivar en historial</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Respuestas WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes de WhatsApp</CardTitle>
              <CardDescription>Respuestas de clientes que requieren atención</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {respuestasWhatsAppPendientes.map((resp) => (
                  <div
                    key={resp.id}
                    className={`rounded-lg border p-4 ${resp.requiereAccion ? 'border-success/50 bg-success/5' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-success/10 text-success">
                            {resp.cliente[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{resp.cliente}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{resp.mascota}</Badge>
                            <Badge variant="outline" className="text-xs">{resp.tipo}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{resp.fecha}</p>
                        <p className="text-xs text-muted-foreground">{resp.hora}</p>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <p className="text-sm">{resp.mensaje}</p>
                    </div>
                    {resp.requiereAccion && (
                      <div className="flex gap-2">
                        <Button size="sm">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Responder
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="mr-2 h-4 w-4" />
                          Llamar
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Check className="mr-2 h-4 w-4" />
                          Marcar resuelto
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alertas Operativas */}
        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Operativas</CardTitle>
              <CardDescription>Situaciones que requieren atención inmediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertasClinicas.map((alerta) => {
                  const bgColor = alerta.tipo === "Crítica" 
                    ? "border-l-destructive bg-destructive/5" 
                    : alerta.tipo === "Importante"
                    ? "border-l-warning bg-warning/5"
                    : "border-l-primary bg-primary/5"
                  
                  return (
                    <div
                      key={alerta.id}
                      className={`rounded-lg border-l-4 p-4 ${bgColor}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={
                                alerta.tipo === "Crítica"
                                  ? "bg-destructive text-destructive-foreground"
                                  : alerta.tipo === "Importante"
                                  ? "bg-warning text-warning-foreground"
                                  : "bg-primary text-primary-foreground"
                              }
                            >
                              {alerta.tipo}
                            </Badge>
                            <span className="text-sm font-medium">{alerta.mascota}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{alerta.mensaje}</p>
                          <p className="text-xs text-muted-foreground mt-2">{alerta.fecha}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Atender
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
