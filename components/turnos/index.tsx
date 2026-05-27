"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
  User,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { turnosHoy } from "@/lib/mock-data"

const estadoColors: Record<string, string> = {
  "Pendiente": "bg-secondary text-secondary-foreground",
  "Confirmado": "bg-success text-success-foreground",
  "En espera": "bg-warning text-warning-foreground",
  "En atención": "bg-primary text-primary-foreground",
  "Finalizado": "bg-muted text-muted-foreground",
  "Cancelado": "bg-destructive/50 text-destructive-foreground",
  "Reprogramado": "bg-muted text-muted-foreground",
  "No asistió": "bg-destructive text-destructive-foreground",
}

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const currentDate = new Date()

// Generate mock week data
const generateWeekData = () => {
  const week = []
  const start = new Date()
  start.setDate(start.getDate() - start.getDay() + 1) // Monday
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    week.push({
      day: weekDays[i],
      date: date.getDate(),
      fullDate: date,
      turnos: i === currentDate.getDay() - 1 ? turnosHoy.length : Math.floor(Math.random() * 6) + 2
    })
  }
  return week
}

const weekData = generateWeekData()

export function TurnosPage() {
  const [activeTab, setActiveTab] = useState("dia")
  const [selectedDate, setSelectedDate] = useState(currentDate.getDate())

  const turnosActivos = turnosHoy.filter(t => 
    t.estado !== "Finalizado" && t.estado !== "Cancelado"
  ).length

  const turnosCompletados = turnosHoy.filter(t => t.estado === "Finalizado").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Turnos</h1>
          <p className="text-muted-foreground">
            Gestión de agenda y turnos
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Turno
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{turnosHoy.length}</p>
              <p className="text-sm text-muted-foreground">Turnos hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{turnosActivos}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <Check className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{turnosCompletados}</p>
              <p className="text-sm text-muted-foreground">Finalizados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/50">
              <User className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Profesionales</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </h3>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {weekData.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                  day.date === selectedDate
                    ? 'bg-primary text-primary-foreground'
                    : day.date === currentDate.getDate()
                    ? 'bg-primary/10 hover:bg-primary/20'
                    : 'hover:bg-muted'
                }`}
              >
                <span className="text-xs font-medium">{day.day}</span>
                <span className="text-lg font-bold">{day.date}</span>
                <Badge 
                  variant="secondary" 
                  className={`mt-1 text-xs ${day.date === selectedDate ? 'bg-primary-foreground/20 text-primary-foreground' : ''}`}
                >
                  {day.turnos}
                </Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dia">Vista del Día</TabsTrigger>
          <TabsTrigger value="semana">Vista Semanal</TabsTrigger>
        </TabsList>

        {/* Day View */}
        <TabsContent value="dia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Turnos del {selectedDate} de {currentDate.toLocaleDateString('es-AR', { month: 'long' })}
              </CardTitle>
              <CardDescription>
                {turnosHoy.length} turnos programados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {turnosHoy.map((turno) => (
                  <div
                    key={turno.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:shadow-sm ${
                      turno.estado === "En atención" ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <span className="text-xl font-bold">{turno.hora.split(':')[0]}</span>
                      <span className="text-xs">{turno.hora.split(':')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link 
                          href={`/mascotas/${turno.mascotaId}`}
                          className="font-semibold hover:text-primary"
                        >
                          {turno.mascota}
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{turno.dueno}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{turno.motivo}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {turno.profesional}
                      </Badge>
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
                            Marcar en espera
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Enviar recordatorio
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reprogramar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <X className="mr-2 h-4 w-4" />
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

        {/* Week View */}
        <TabsContent value="semana" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vista Semanal</CardTitle>
              <CardDescription>Resumen de turnos de la semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {weekData.map((day, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      day.date === currentDate.getDate() ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{day.day}</p>
                        <p className="text-2xl font-bold">{day.date}</p>
                      </div>
                      <Badge variant={day.date === currentDate.getDate() ? "default" : "secondary"}>
                        {day.turnos} turnos
                      </Badge>
                    </div>
                    {day.date === currentDate.getDate() && (
                      <div className="space-y-2">
                        {turnosHoy.slice(0, 3).map((turno) => (
                          <div key={turno.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{turno.hora}</span>
                              <span className="text-muted-foreground">{turno.mascota}</span>
                            </div>
                            <Badge className={`text-xs ${estadoColors[turno.estado]}`}>
                              {turno.estado.slice(0, 3)}
                            </Badge>
                          </div>
                        ))}
                        {turnosHoy.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{turnosHoy.length - 3} más
                          </p>
                        )}
                      </div>
                    )}
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
