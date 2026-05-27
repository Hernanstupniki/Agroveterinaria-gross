"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pill,
  Clock,
  AlertTriangle,
  Check,
  Pause,
  Calendar,
  MoreHorizontal,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { tratamientosActivos, controlesPendientes } from "@/lib/mock-data"

const estadoColors: Record<string, string> = {
  "Activo": "bg-success text-success-foreground",
  "Finalizado": "bg-muted text-muted-foreground",
  "Suspendido": "bg-warning text-warning-foreground",
  "Requiere control": "bg-destructive text-destructive-foreground",
}

const prioridadColors: Record<string, string> = {
  "Alta": "bg-destructive text-destructive-foreground",
  "Media": "bg-warning text-warning-foreground",
  "Baja": "bg-muted text-muted-foreground",
}

export function TratamientosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("tratamientos")

  const activos = tratamientosActivos.filter(t => t.estado === "Activo").length
  const controlesPend = controlesPendientes.length

  const filteredTratamientos = tratamientosActivos.filter(
    (tratamiento) =>
      tratamiento.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tratamiento.medicamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tratamiento.diagnostico.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tratamientos y Controles</h1>
          <p className="text-muted-foreground">
            Gestión de tratamientos médicos y controles pendientes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tratamiento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <Pill className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activos}</p>
              <p className="text-sm text-muted-foreground">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{controlesPend}</p>
              <p className="text-sm text-muted-foreground">Controles pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{controlesPendientes.filter(c => c.prioridad === "Alta").length}</p>
              <p className="text-sm text-muted-foreground">Urgentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tratamientosActivos.length}</p>
              <p className="text-sm text-muted-foreground">Total registros</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por mascota, medicamento o diagnóstico..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tratamientos">Tratamientos</TabsTrigger>
          <TabsTrigger value="controles">
            Controles Pendientes ({controlesPend})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tratamientos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTratamientos.map((tratamiento) => (
              <Card key={tratamiento.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {tratamiento.mascota[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link 
                          href={`/mascotas/${tratamiento.mascotaId}`}
                          className="font-semibold hover:text-primary"
                        >
                          {tratamiento.mascota}
                        </Link>
                        <p className="text-sm text-muted-foreground">{tratamiento.diagnostico}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Pause className="mr-2 h-4 w-4" />
                          Suspender
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Check className="mr-2 h-4 w-4" />
                          Finalizar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-4 w-4 text-primary" />
                      <span className="font-medium">{tratamiento.medicamento}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Dosis</p>
                        <p>{tratamiento.dosis}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Frecuencia</p>
                        <p>{tratamiento.frecuencia}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground">Indicaciones</p>
                    <p>{tratamiento.indicaciones}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Inicio</p>
                      <p>{tratamiento.fechaInicio}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fin</p>
                      <p>{tratamiento.fechaFinalizacion || "Indefinido"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge className={estadoColors[tratamiento.estado]}>
                      {tratamiento.estado}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-primary">
                      <Calendar className="h-4 w-4" />
                      <span>Control: {tratamiento.proximoControl}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="controles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controles Pendientes</CardTitle>
              <CardDescription>Pacientes que requieren seguimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {controlesPendientes.map((control) => (
                  <div
                    key={control.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {control.mascota[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link 
                          href={`/mascotas/${control.mascotaId}`}
                          className="font-semibold hover:text-primary"
                        >
                          {control.mascota}
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{control.dueno}</span>
                      </div>
                      <p className="text-sm">{control.tipo}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {control.fechaSugerida}
                        </span>
                        <span>{control.profesional}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={prioridadColors[control.prioridad]}>
                        {control.prioridad}
                      </Badge>
                      <Button size="sm">Agendar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
