"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  RefreshCw,
  Syringe,
  Stethoscope,
  Pill,
} from "lucide-react"
import { recordatoriosProgramados, mascotas, clientes } from "@/lib/mock-data"
import { SectionHeader } from "@/components/shared/section-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { KpiStrip, type KpiItem } from "@/components/shared/kpi-strip"
import { CheckCircle, XCircle } from "lucide-react"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  Pendiente: { label: "Pendiente", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  Enviado: { label: "Enviado", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  Fallido: { label: "Fallido", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
  Programado: { label: "Programado", variant: "outline", icon: <Calendar className="h-3 w-3" /> },
}

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  "Vacuna vencida": { label: "Vacuna", icon: <Syringe className="h-4 w-4" />, color: "bg-blue-100 text-blue-800" },
  "Recordatorio turno": { label: "Turno", icon: <Calendar className="h-4 w-4" />, color: "bg-green-100 text-green-800" },
  "Confirmación turno": { label: "Confirmación", icon: <CheckCircle2 className="h-4 w-4" />, color: "bg-purple-100 text-purple-800" },
  "Control": { label: "Control", icon: <Stethoscope className="h-4 w-4" />, color: "bg-teal-100 text-teal-800" },
  "Tratamiento": { label: "Tratamiento", icon: <Pill className="h-4 w-4" />, color: "bg-orange-100 text-orange-800" },
}

const messageTemplates = [
  {
    id: "1",
    name: "Recordatorio de Vacuna",
    type: "vacuna",
    message: "Hola {cliente}! Le recordamos que {mascota} tiene programada su vacuna de {vacuna} para el {fecha}. Por favor confirme su asistencia. Agroveterinaria Gross",
  },
  {
    id: "2",
    name: "Confirmación de Turno",
    type: "turno",
    message: "Hola {cliente}! Le confirmamos su turno para {mascota} el día {fecha} a las {hora}. Lo esperamos en Agroveterinaria Gross.",
  },
  {
    id: "3",
    name: "Recordatorio de Tratamiento",
    type: "tratamiento",
    message: "Hola {cliente}! Le recordamos que {mascota} debe continuar con su tratamiento de {tratamiento}. Si tiene dudas, contáctenos. Agroveterinaria Gross",
  },
  {
    id: "4",
    name: "Post-Cirugía",
    type: "cirugia",
    message: "Hola {cliente}! Esperamos que {mascota} se esté recuperando bien de su cirugía. Recuerde seguir las indicaciones post-operatorias. Cualquier duda estamos a su disposición. Agroveterinaria Gross",
  },
]

export default function RecordatoriosScreen() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")

  const filteredReminders = recordatoriosProgramados.filter((reminder) => {
    const matchesSearch =
      reminder.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.destinatario.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || reminder.estado === statusFilter
    const matchesType = typeFilter === "all" || reminder.tipo === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const pendingCount = recordatoriosProgramados.filter((r) => r.estado === "Pendiente").length
  const sentCount = recordatoriosProgramados.filter((r) => r.estado === "Enviado").length
  const scheduledCount = recordatoriosProgramados.filter((r) => r.estado === "Programado").length

  const kpis: KpiItem[] = [
    { label: "Pendientes", value: pendingCount, icon: Clock, tone: "warning" },
    { label: "Enviados", value: sentCount, icon: CheckCircle2, tone: "success" },
    { label: "Programados", value: scheduledCount, icon: Calendar },
    { label: "Total", value: recordatoriosProgramados.length, icon: MessageSquare },
  ]

  return (
    <div className="animate-section-in mx-auto max-w-[1600px] space-y-6">
      <SectionHeader
        title="Recordatorios WhatsApp"
        description="Vacunas, controles, cirugías y tratamientos. Listo para conectar con Evolution API cuando exista backend."
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 gap-2 rounded-xl bg-[#25D366] px-5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#128C7E] hover:shadow-md active:scale-[0.98]">
              <MessageSquare className="h-5 w-5" />
              Nuevo recordatorio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Recordatorio</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mascota</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar mascota" />
                    </SelectTrigger>
                    <SelectContent>
                      {mascotas.map((mascota) => (
                        <SelectItem key={mascota.id} value={mascota.id.toString()}>
                          {mascota.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Recordatorio</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vacuna vencida">Vacuna</SelectItem>
                      <SelectItem value="Recordatorio turno">Turno</SelectItem>
                      <SelectItem value="Confirmación turno">Confirmación</SelectItem>
                      <SelectItem value="Control">Control</SelectItem>
                      <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Plantilla</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Usar plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      {messageTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de Envío</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Hora de Envío</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mensaje</Label>
                <Textarea
                  placeholder="Escriba el mensaje o seleccione una plantilla..."
                  rows={4}
                  value={selectedTemplate ? messageTemplates.find(t => t.id === selectedTemplate)?.message : ""}
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles: {"{cliente}"}, {"{mascota}"}, {"{fecha}"}, {"{hora}"}, {"{vacuna}"}, {"{tratamiento}"}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white" onClick={() => setIsDialogOpen(false)}>
                  <Send className="mr-2 h-4 w-4" />
                  Programar Envío
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        }
      />

      <Tabs defaultValue="mensajes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mensajes">Mensajes</TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="mensajes" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente, mascota o mensaje..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Vacuna vencida">Vacuna</SelectItem>
                    <SelectItem value="Recordatorio turno">Turno</SelectItem>
                    <SelectItem value="Confirmación turno">Confirmación</SelectItem>
                    <SelectItem value="Control">Control</SelectItem>
                    <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Enviado">Enviado</SelectItem>
                    <SelectItem value="Programado">Programado</SelectItem>
                    <SelectItem value="Fallido">Fallido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Messages Table */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Historial de mensajes</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredReminders.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No hay recordatorios para estos filtros"
                  description="Ajustá la búsqueda o creá un nuevo recordatorio."
                />
              ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Destinatario</TableHead>
                      <TableHead>Mascota</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Mensaje</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Consentimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReminders.map((reminder) => {
                      const status = statusConfig[reminder.estado] || statusConfig["Programado"]
                      const type = typeConfig[reminder.tipo] || { label: reminder.tipo, icon: <MessageSquare className="h-4 w-4" />, color: "bg-gray-100 text-gray-800" }
                      const cliente = clientes.find((c) => c.nombre === reminder.destinatario)
                      const consiente = cliente?.consentimientoWhatsApp ?? false

                      return (
                        <TableRow key={reminder.id}>
                          <TableCell>
                            <p className="font-medium">{reminder.destinatario}</p>
                          </TableCell>
                          <TableCell>{reminder.mascota}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${type.color}`}>
                              {type.icon}
                              {type.label}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{reminder.mensaje}</TableCell>
                          <TableCell>{reminder.fechaProgramada}</TableCell>
                          <TableCell>
                            {consiente ? (
                              <Badge variant="outline" className="gap-1 border-success/50 text-success">
                                <CheckCircle className="h-3 w-3" />
                                Sí
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-muted-foreground">
                                <XCircle className="h-3 w-3" />
                                No
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={status.label} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {reminder.estado === "Pendiente" && (
                                <Button variant="ghost" size="sm" className="text-[#25D366]">
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                              {reminder.estado === "Fallido" && (
                                <Button variant="ghost" size="sm">
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plantillas" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Plantillas de Mensajes</CardTitle>
                <CardDescription>Administre las plantillas de mensajes predefinidos</CardDescription>
              </div>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Plantilla
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {messageTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.message}</p>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">Editar</Button>
                          <Button variant="ghost" size="sm" className="text-destructive">Eliminar</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracion" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de WhatsApp</CardTitle>
                <CardDescription>Conecte su cuenta de WhatsApp Business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Estado de conexión</p>
                    <p className="text-sm text-muted-foreground">WhatsApp Business API</p>
                  </div>
                  <Badge className="bg-[#25D366]">Conectado</Badge>
                </div>
                <div className="space-y-2">
                  <Label>Número de WhatsApp</Label>
                  <Input defaultValue="+54 9 376 444 5555" />
                </div>
                <div className="space-y-2">
                  <Label>Token de API</Label>
                  <Input type="password" defaultValue="••••••••••••••••" />
                </div>
                <Button variant="outline" className="w-full">Reconectar</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automatización</CardTitle>
                <CardDescription>Configure envíos automáticos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Recordatorios de vacunas</p>
                    <p className="text-sm text-muted-foreground">Enviar 7 días antes del vencimiento</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Confirmación de turnos</p>
                    <p className="text-sm text-muted-foreground">Enviar 24hs antes del turno</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Seguimiento post-consulta</p>
                    <p className="text-sm text-muted-foreground">Enviar 48hs después</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cumpleaños de mascotas</p>
                    <p className="text-sm text-muted-foreground">Enviar saludo el día del cumpleaños</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Secondary metrics — last */}
      <div className="space-y-3 border-t border-border/70 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resumen</h2>
        <KpiStrip items={kpis} className="lg:grid-cols-4 xl:grid-cols-4" />
      </div>
    </div>
  )
}
