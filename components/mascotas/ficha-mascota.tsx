"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Edit,
  Calendar,
  Syringe,
  FileText,
  Pill,
  Scissors,
  AlertTriangle,
  Weight,
  Clock,
  FileHeart,
  Download,
  ChevronRight,
  User,
  Heart,
  Activity,
  Stethoscope,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  mascotas,
  clientes,
  historialLuna,
  vacunasRegistradas,
  tratamientosActivos,
  estudiosArchivos,
  cirugias,
} from "@/lib/mock-data"

const estadoColors: Record<string, string> = {
  "Saludable": "bg-success text-success-foreground",
  "En tratamiento": "bg-warning text-warning-foreground",
  "Vacuna vencida": "bg-destructive text-destructive-foreground",
  "Control pendiente": "bg-secondary text-secondary-foreground",
  "Cirugía programada": "bg-primary text-primary-foreground",
}

const tipoEventoIcons: Record<string, typeof Activity> = {
  "Consulta": Stethoscope,
  "Vacuna": Syringe,
  "Estudio": FileText,
  "Cirugía": Scissors,
  "Tratamiento": Pill,
}

const tipoEventoColors: Record<string, string> = {
  "Consulta": "bg-primary/10 text-primary border-primary/20",
  "Vacuna": "bg-success/10 text-success border-success/20",
  "Estudio": "bg-secondary/10 text-secondary-foreground border-secondary/20",
  "Cirugía": "bg-destructive/10 text-destructive border-destructive/20",
  "Tratamiento": "bg-warning/10 text-warning border-warning/20",
}

interface FichaMascotaProps {
  mascotaId: number
}

export function FichaMascota({ mascotaId }: FichaMascotaProps) {
  // For this demo, we'll always show Luna's profile (id: 1)
  const mascota = mascotas.find(m => m.id === mascotaId) || mascotas[0]
  const cliente = clientes.find(c => c.id === mascota.clienteId)
  
  const vacunasMascota = vacunasRegistradas.filter(v => v.mascotaId === mascota.id)
  const tratamientosMascota = tratamientosActivos.filter(t => t.mascotaId === mascota.id)
  const estudiosMascota = estudiosArchivos.filter(e => e.mascotaId === mascota.id)
  const cirugiasMascota = cirugias.filter(c => c.mascotaId === mascota.id)
  
  const proximasVacunas = vacunasMascota.filter(v => v.estado === "Aplicada").length
  const vacunasVencidas = vacunasMascota.filter(v => v.estado === "Vencida").length
  const tratamientosActivosCount = tratamientosMascota.filter(t => t.estado === "Activo").length
  const cirugiasRealizadas = cirugiasMascota.filter(c => c.estado === "Realizada").length
  const cirugiasProgramadas = cirugiasMascota.filter(c => c.estado === "Programada" || c.estado === "Confirmada").length

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/mascotas">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a mascotas
        </Link>
      </Button>

      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white/20">
                <AvatarFallback className="bg-white text-primary text-3xl font-bold">
                  {mascota.nombre[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{mascota.nombre}</h1>
                <p className="text-white/80">
                  {mascota.especie} • {mascota.raza} • {mascota.sexo}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={estadoColors[mascota.estadoGeneral]}>
                    {mascota.estadoGeneral}
                  </Badge>
                  {mascota.esterilizado && (
                    <Badge variant="outline" className="border-white/30 text-white">
                      Esterilizado/a
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="secondary" size="sm">
                <FileHeart className="mr-2 h-4 w-4" />
                Nueva Consulta
              </Button>
              <Button variant="secondary" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Turno
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Info */}
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Edad</p>
                <p className="font-semibold">{mascota.edad}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Weight className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso Actual</p>
                <p className="font-semibold">{mascota.peso} kg</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dueño</p>
                <p className="font-semibold">{mascota.dueno}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contacto</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{cliente?.telefono}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MessageCircle className="h-4 w-4 text-success" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {(mascota.alergias.length > 0 || mascota.antecedentes) && (
            <div className="mt-4 space-y-2">
              {mascota.alergias.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Alergias</p>
                    <p className="text-sm">{mascota.alergias.join(', ')}</p>
                  </div>
                </div>
              )}
              {mascota.antecedentes && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <Heart className="h-5 w-5 text-warning shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-warning">Antecedentes Importantes</p>
                    <p className="text-sm">{mascota.antecedentes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Syringe className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{proximasVacunas}</p>
                  <p className="text-sm text-muted-foreground">Vacunas aplicadas</p>
                </div>
              </div>
              {vacunasVencidas > 0 && (
                <Badge className="bg-destructive text-destructive-foreground">
                  {vacunasVencidas} vencida
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Pill className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tratamientosActivosCount}</p>
                <p className="text-sm text-muted-foreground">Tratamientos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/30">
                <FileText className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{estudiosMascota.length}</p>
                <p className="text-sm text-muted-foreground">Estudios cargados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Scissors className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{cirugiasRealizadas}</p>
                  <p className="text-sm text-muted-foreground">Cirugías realizadas</p>
                </div>
              </div>
              {cirugiasProgramadas > 0 && (
                <Badge className="bg-primary text-primary-foreground">
                  {cirugiasProgramadas} prog.
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Recent Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Last Consultation */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Última Consulta
                </CardTitle>
                <CardDescription>{mascota.ultimaConsulta}</CardDescription>
              </div>
              <Button variant="outline" size="sm">Ver historial completo</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Diagnóstico</p>
                  <p className="font-medium">{mascota.ultimoDiagnostico}</p>
                </div>
                {historialLuna[0] && (
                  <>
                    <Separator />
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Veterinario</p>
                        <p className="font-medium">{historialLuna[0].veterinario}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Peso registrado</p>
                        <p className="font-medium">{historialLuna[0].peso} kg</p>
                      </div>
                    </div>
                    {historialLuna[0].observaciones && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm">{historialLuna[0].observaciones}</p>
                      </div>
                    )}
                    {historialLuna[0].proximoControl && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Próximo control: <strong>{historialLuna[0].proximoControl}</strong></span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Historial Clínico
              </CardTitle>
              <CardDescription>Línea de tiempo de eventos médicos</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  
                  <div className="space-y-6">
                    {historialLuna.map((evento, index) => {
                      const Icon = tipoEventoIcons[evento.tipo] || Activity
                      const colorClass = tipoEventoColors[evento.tipo] || "bg-muted"
                      
                      return (
                        <div key={evento.id} className="relative pl-10">
                          {/* Timeline dot */}
                          <div className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          
                          <div className="rounded-lg border p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{evento.tipo}</Badge>
                                  <span className="text-sm text-muted-foreground">{evento.fecha}</span>
                                </div>
                                <p className="font-medium mt-1">{evento.motivo}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {evento.diagnostico && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Diagnóstico:</strong> {evento.diagnostico}
                              </p>
                            )}
                            
                            {evento.tratamiento && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Tratamiento:</strong> {evento.tratamiento}
                              </p>
                            )}
                            
                            {evento.vacuna && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Vacuna:</strong> {evento.vacuna} ({evento.laboratorio})
                              </p>
                            )}
                            
                            {evento.procedimiento && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Procedimiento:</strong> {evento.procedimiento}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mt-3 pt-2 border-t text-xs text-muted-foreground">
                              <span>{evento.veterinario}</span>
                              {evento.archivo && (
                                <Button variant="ghost" size="sm" className="h-6 text-xs">
                                  <Download className="mr-1 h-3 w-3" />
                                  Ver archivo
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Access */}
        <div className="space-y-6">
          {/* Próximos Recordatorios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Próximos Recordatorios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border bg-warning/5 border-warning/20">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">Control</Badge>
                  <span className="text-xs text-muted-foreground">2024-02-10</span>
                </div>
                <p className="text-sm font-medium">Control de displasia</p>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">Vacuna</Badge>
                  <span className="text-xs text-muted-foreground">2024-11-20</span>
                </div>
                <p className="text-sm font-medium">Séxtuple + Antirrábica</p>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar recordatorio
              </Button>
            </CardContent>
          </Card>

          {/* Vacunas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Syringe className="h-4 w-4 text-success" />
                Vacunas
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/vacunas">Ver todas</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {vacunasMascota.slice(0, 3).map((vacuna) => (
                <div key={vacuna.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{vacuna.vacuna}</p>
                    <p className="text-xs text-muted-foreground">{vacuna.fechaAplicada}</p>
                  </div>
                  <Badge
                    className={
                      vacuna.estado === "Aplicada"
                        ? "bg-success text-success-foreground"
                        : vacuna.estado === "Vencida"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-warning text-warning-foreground"
                    }
                  >
                    {vacuna.estado}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm">
                <Syringe className="mr-2 h-4 w-4" />
                Registrar vacuna
              </Button>
            </CardContent>
          </Card>

          {/* Tratamientos Activos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="h-4 w-4 text-warning" />
                Tratamientos Activos
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tratamientos">Ver todos</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {tratamientosMascota.filter(t => t.estado === "Activo").map((tratamiento) => (
                <div key={tratamiento.id} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{tratamiento.medicamento}</p>
                    <Badge variant="outline" className="text-xs">Activo</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{tratamiento.diagnostico}</p>
                  <p className="text-xs">{tratamiento.dosis} - {tratamiento.frecuencia}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                    <Clock className="h-3 w-3" />
                    Control: {tratamiento.proximoControl}
                  </div>
                </div>
              ))}
              {tratamientosMascota.filter(t => t.estado === "Activo").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin tratamientos activos
                </p>
              )}
            </CardContent>
          </Card>

          {/* Archivos Recientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Archivos Recientes
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/estudios">Ver todos</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {estudiosMascota.slice(0, 3).map((estudio) => (
                <div key={estudio.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{estudio.tipo}</p>
                      <p className="text-xs text-muted-foreground">{estudio.fecha}</p>
                    </div>
                  </div>
                  {estudio.archivo && (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Cargar archivo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
