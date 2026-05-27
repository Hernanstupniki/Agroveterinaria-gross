"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Search,
  Plus,
  Calendar,
  Clock,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Timer,
  FileText,
} from "lucide-react"
import { cirugias, mascotas, profesionales } from "@/lib/mock-data"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  "Programada": { label: "Programada", variant: "secondary", icon: <Calendar className="h-3 w-3" /> },
  "En curso": { label: "En Curso", variant: "default", icon: <Timer className="h-3 w-3" /> },
  "Completada": { label: "Completada", variant: "outline", icon: <CheckCircle2 className="h-3 w-3" /> },
  "Cancelada": { label: "Cancelada", variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> },
  "Pendiente confirmación": { label: "Pendiente", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
}

const riskConfig: Record<string, { label: string; color: string }> = {
  "Bajo": { label: "Bajo", color: "bg-green-100 text-green-800" },
  "Moderado": { label: "Moderado", color: "bg-yellow-100 text-yellow-800" },
  "Alto": { label: "Alto", color: "bg-red-100 text-red-800" },
}

export default function CirugiasScreen() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredCirugias = cirugias.filter((cirugia) => {
    const matchesSearch =
      cirugia.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cirugia.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cirugia.dueno.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || cirugia.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const getMascotaInfo = (mascotaId: number) => mascotas.find((m) => m.id === mascotaId)
  const veterinarios = profesionales.filter((p) => p.rol === "Veterinario")

  const programadasCount = cirugias.filter((c) => c.estado === "Programada").length
  const enCursoCount = cirugias.filter((c) => c.estado === "En curso").length
  const completadasCount = cirugias.filter((c) => c.estado === "Completada").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cirugías</h1>
          <p className="text-muted-foreground">
            Gestión de procedimientos quirúrgicos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Programar Cirugía
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Programar Nueva Cirugía</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mascota</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar mascota" />
                    </SelectTrigger>
                    <SelectContent>
                      {mascotas.map((mascota) => (
                        <SelectItem key={mascota.id} value={String(mascota.id)}>
                          {mascota.nombre} - {mascota.especie}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Veterinario</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar veterinario" />
                    </SelectTrigger>
                    <SelectContent>
                      {veterinarios.map((vet) => (
                        <SelectItem key={vet.id} value={String(vet.id)}>
                          {vet.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Cirugía</Label>
                <Input placeholder="Ej: Castración, Extracción dental..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duración Estimada</Label>
                  <Input placeholder="Ej: 45 minutos" />
                </div>
                <div className="space-y-2">
                  <Label>Nivel de Riesgo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar riesgo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bajo">Bajo</SelectItem>
                      <SelectItem value="Moderado">Moderado</SelectItem>
                      <SelectItem value="Alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas Preoperatorias</Label>
                <Textarea placeholder="Instrucciones especiales, ayuno previo, etc." />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsDialogOpen(false)}>
                  Programar Cirugía
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Programadas</p>
                <p className="text-2xl font-bold">{programadasCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Curso</p>
                <p className="text-2xl font-bold">{enCursoCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold">{completadasCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-orange-100 p-3">
                <Stethoscope className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{cirugias.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por tipo, mascota o dueño..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Programada">Programada</SelectItem>
                <SelectItem value="En curso">En Curso</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
                <SelectItem value="Pendiente confirmación">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Surgery Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cirugías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mascota</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Veterinario</TableHead>
                  <TableHead>Riesgo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCirugias.map((cirugia) => {
                  const mascotaInfo = getMascotaInfo(cirugia.mascotaId)
                  const status = statusConfig[cirugia.estado] || statusConfig["Programada"]
                  const riesgo = cirugia.prequirurgico?.riesgoQuirurgico || "Bajo"
                  const risk = riskConfig[riesgo] || riskConfig["Bajo"]

                  return (
                    <TableRow key={cirugia.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                            {mascotaInfo?.especie === "Perro" ? "🐕" : mascotaInfo?.especie === "Gato" ? "🐈" : "🐾"}
                          </div>
                          <div>
                            <p className="font-medium">{cirugia.mascota}</p>
                            <p className="text-sm text-muted-foreground">{cirugia.dueno}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{cirugia.tipo}</TableCell>
                      <TableCell>{cirugia.fecha}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {cirugia.hora}
                        </div>
                      </TableCell>
                      <TableCell>{cirugia.veterinario}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${risk.color}`}>
                          {risk.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="gap-1">
                          {status.icon}
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
