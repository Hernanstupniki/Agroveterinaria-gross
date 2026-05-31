"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  Filter,
  PawPrint,
  Dog,
  Cat,
  MoreHorizontal,
  Eye,
  Edit,
  FileHeart,
  Syringe,
  AlertTriangle,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mascotas } from "@/lib/mock-data"

const estadoColors: Record<string, string> = {
  "Saludable": "bg-success text-success-foreground",
  "En tratamiento": "bg-warning text-warning-foreground",
  "Vacuna vencida": "bg-destructive text-destructive-foreground",
  "Control pendiente": "bg-secondary text-secondary-foreground",
  "Cirugía programada": "bg-primary text-primary-foreground",
}

export function MascotasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [especieFilter, setEspecieFilter] = useState<string>("todas")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")

  const filteredMascotas = mascotas.filter((mascota) => {
    const matchesSearch =
      mascota.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mascota.dueno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mascota.raza.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEspecie = especieFilter === "todas" || mascota.especie.toLowerCase() === especieFilter.toLowerCase()
    const matchesEstado = estadoFilter === "todos" || mascota.estadoGeneral === estadoFilter

    return matchesSearch && matchesEspecie && matchesEstado
  })

  const perros = mascotas.filter(m => m.especie === "Perro").length
  const gatos = mascotas.filter(m => m.especie === "Gato").length
  const conAlerta = mascotas.filter(m => 
    m.estadoGeneral === "Vacuna vencida" || 
    m.estadoGeneral === "Control pendiente"
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mascotas / Pacientes</h1>
          <p className="text-muted-foreground">
            Listado completo de pacientes registrados
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Mascota
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <PawPrint className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mascotas.length}</p>
              <p className="text-sm text-muted-foreground">Total pacientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/50">
              <Dog className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{perros}</p>
              <p className="text-sm text-muted-foreground">Perros</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Cat className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{gatos}</p>
              <p className="text-sm text-muted-foreground">Gatos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{conAlerta}</p>
              <p className="text-sm text-muted-foreground">Con alertas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, dueño o raza..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={especieFilter} onValueChange={setEspecieFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Especie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="perro">Perro</SelectItem>
                  <SelectItem value="gato">Gato</SelectItem>
                </SelectContent>
              </Select>
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="Saludable">Saludable</SelectItem>
                  <SelectItem value="En tratamiento">En tratamiento</SelectItem>
                  <SelectItem value="Vacuna vencida">Vacuna vencida</SelectItem>
                  <SelectItem value="Control pendiente">Control pendiente</SelectItem>
                  <SelectItem value="Cirugía programada">Cirugía programada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMascotas.map((mascota) => (
          <Card key={mascota.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {mascota.nombre[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{mascota.nombre}</CardTitle>
                    <CardDescription>
                      {mascota.especie} • {mascota.raza}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/mascotas/${mascota.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver ficha completa
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <FileHeart className="mr-2 h-4 w-4" />
                      Nueva atencion
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Syringe className="mr-2 h-4 w-4" />
                      Registrar vacuna
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar turno
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Edad</p>
                  <p className="font-medium">{mascota.edad}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Peso</p>
                  <p className="font-medium">{mascota.peso} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sexo</p>
                  <p className="font-medium">{mascota.sexo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dueño</p>
                  <p className="font-medium truncate">{mascota.dueno}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Última consulta: {mascota.ultimaConsulta}</p>
                <p className="text-sm truncate">{mascota.ultimoDiagnostico}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Badge className={estadoColors[mascota.estadoGeneral] || "bg-muted"}>
                  {mascota.estadoGeneral}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/mascotas/${mascota.id}`}>
                    Ver ficha
                  </Link>
                </Button>
              </div>

              {mascota.alergias.length > 0 && (
                <div className="flex items-center gap-1 pt-1">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                  <span className="text-xs text-warning">
                    Alergia: {mascota.alergias.join(', ')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMascotas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PawPrint className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No se encontraron mascotas</p>
            <p className="text-sm text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
