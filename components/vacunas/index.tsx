"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Syringe,
  AlertTriangle,
  Clock,
  Check,
  MessageCircle,
  Calendar,
  MoreHorizontal,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { vacunasRegistradas, vacunasPendientes, mascotas } from "@/lib/mock-data"

const estadoColors: Record<string, string> = {
  "Aplicada": "bg-success text-success-foreground",
  "Próxima": "bg-warning text-warning-foreground",
  "Pendiente": "bg-secondary text-secondary-foreground",
  "Vencida": "bg-destructive text-destructive-foreground",
}

export function VacunasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todas")

  const vacunasVencidas = vacunasRegistradas.filter(v => v.estado === "Vencida")
  const vacunasProximas = vacunasPendientes.filter(v => v.estado === "Próxima")
  
  const filteredVacunas = vacunasRegistradas.filter(
    (vacuna) =>
      vacuna.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacuna.vacuna.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getFilteredByTab = () => {
    switch (activeTab) {
      case "vencidas":
        return filteredVacunas.filter(v => v.estado === "Vencida")
      case "proximas":
        return filteredVacunas.filter(v => {
          const proxima = new Date(v.proximaFecha)
          const hoy = new Date()
          const diff = Math.ceil((proxima.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
          return v.estado === "Aplicada" && diff <= 30 && diff > 0
        })
      case "aplicadas":
        return filteredVacunas.filter(v => v.estado === "Aplicada")
      default:
        return filteredVacunas
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vacunas</h1>
          <p className="text-muted-foreground">
            Control de vacunación de todos los pacientes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Vacuna
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <Check className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{vacunasRegistradas.filter(v => v.estado === "Aplicada").length}</p>
              <p className="text-sm text-muted-foreground">Aplicadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{vacunasProximas.length}</p>
              <p className="text-sm text-muted-foreground">Próximas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{vacunasVencidas.length}</p>
              <p className="text-sm text-muted-foreground">Vencidas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Syringe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{vacunasRegistradas.length}</p>
              <p className="text-sm text-muted-foreground">Total registros</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {vacunasVencidas.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Vacunas Vencidas - Requieren Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {vacunasPendientes.filter(v => v.estado === "Vencida").map((vacuna) => (
                <div key={vacuna.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-destructive/10 text-destructive">
                        {vacuna.mascota[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{vacuna.mascota}</p>
                      <p className="text-sm text-muted-foreground">{vacuna.vacuna}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-destructive text-destructive-foreground">
                      -{vacuna.diasVencida}d
                    </Badge>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <MessageCircle className="h-4 w-4 text-success" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Registro de Vacunas</CardTitle>
              <CardDescription>Historial completo de vacunación</CardDescription>
            </div>
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por mascota o vacuna..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="aplicadas">Aplicadas</TabsTrigger>
              <TabsTrigger value="proximas">Próximas</TabsTrigger>
              <TabsTrigger value="vencidas" className="text-destructive">
                Vencidas ({vacunasVencidas.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mascota</TableHead>
                      <TableHead>Vacuna</TableHead>
                      <TableHead className="hidden md:table-cell">Fecha Aplicada</TableHead>
                      <TableHead className="hidden lg:table-cell">Próxima Fecha</TableHead>
                      <TableHead className="hidden lg:table-cell">Veterinario</TableHead>
                      <TableHead className="hidden xl:table-cell">Lote / Lab</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredByTab().map((vacuna) => (
                      <TableRow key={vacuna.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {vacuna.mascota[0]}
                              </AvatarFallback>
                            </Avatar>
                            <Link 
                              href={`/mascotas/${vacuna.mascotaId}`}
                              className="font-medium hover:text-primary"
                            >
                              {vacuna.mascota}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Syringe className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{vacuna.vacuna}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vacuna.fechaAplicada}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {vacuna.proximaFecha}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {vacuna.veterinario}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="text-sm">
                            <p>{vacuna.lote}</p>
                            <p className="text-muted-foreground">{vacuna.laboratorio}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={estadoColors[vacuna.estado]}>
                            {vacuna.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Enviar recordatorio
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Programar aplicación
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
