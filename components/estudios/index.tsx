"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  FileText,
  Upload,
  Download,
  Eye,
  MoreHorizontal,
  Image,
  FileImage,
  File,
  Microscope,
  Camera,
  FileCheck,
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
import { estudiosArchivos } from "@/lib/mock-data"

const estadoColors: Record<string, string> = {
  "Solicitado": "bg-muted text-muted-foreground",
  "Pendiente de resultado": "bg-warning text-warning-foreground",
  "Resultado recibido": "bg-success text-success-foreground",
  "Informado al dueño": "bg-primary text-primary-foreground",
  "Archivado en historial": "bg-secondary text-secondary-foreground",
}

const tipoIcons: Record<string, typeof FileText> = {
  "Análisis de sangre": Microscope,
  "Ecografía": FileImage,
  "Radiografía": FileImage,
  "Foto clínica": Camera,
  "Receta": FileCheck,
  "Certificado": FileCheck,
  "Informe PDF": File,
}

export function EstudiosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState<string>("todos")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")

  const filteredEstudios = estudiosArchivos.filter((estudio) => {
    const matchesSearch =
      estudio.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudio.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = tipoFilter === "todos" || estudio.tipo === tipoFilter
    const matchesEstado = estadoFilter === "todos" || estudio.estado === estadoFilter
    return matchesSearch && matchesTipo && matchesEstado
  })

  const pendientes = estudiosArchivos.filter(e => e.estado === "Pendiente de resultado").length
  const recibidos = estudiosArchivos.filter(e => e.estado === "Resultado recibido").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estudios y Archivos</h1>
          <p className="text-muted-foreground">
            Gestión de estudios médicos y archivos adjuntos
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Cargar Archivo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{estudiosArchivos.length}</p>
              <p className="text-sm text-muted-foreground">Total archivos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <Microscope className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendientes}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <FileCheck className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recibidos}</p>
              <p className="text-sm text-muted-foreground">Resultados recibidos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <FileImage className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{estudiosArchivos.filter(e => e.archivo).length}</p>
              <p className="text-sm text-muted-foreground">Con archivo</p>
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
                placeholder="Buscar por mascota o descripción..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="Análisis de sangre">Análisis de sangre</SelectItem>
                <SelectItem value="Ecografía">Ecografía</SelectItem>
                <SelectItem value="Radiografía">Radiografía</SelectItem>
                <SelectItem value="Foto clínica">Foto clínica</SelectItem>
                <SelectItem value="Receta">Receta</SelectItem>
                <SelectItem value="Certificado">Certificado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Pendiente de resultado">Pendiente de resultado</SelectItem>
                <SelectItem value="Resultado recibido">Resultado recibido</SelectItem>
                <SelectItem value="Informado al dueño">Informado al dueño</SelectItem>
                <SelectItem value="Archivado en historial">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Estudios</CardTitle>
          <CardDescription>{filteredEstudios.length} registros encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mascota</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Descripción</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                  <TableHead className="hidden lg:table-cell">Profesional</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[100px]">Archivo</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstudios.map((estudio) => {
                  const Icon = tipoIcons[estudio.tipo] || FileText
                  return (
                    <TableRow key={estudio.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {estudio.mascota[0]}
                            </AvatarFallback>
                          </Avatar>
                          <Link 
                            href={`/mascotas/${estudio.mascotaId}`}
                            className="font-medium hover:text-primary"
                          >
                            {estudio.mascota}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{estudio.tipo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px]">
                        <p className="truncate">{estudio.descripcion}</p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {estudio.fecha}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {estudio.profesional}
                      </TableCell>
                      <TableCell>
                        <Badge className={estadoColors[estudio.estado]}>
                          {estudio.estado.split(' ').slice(0, 2).join(' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {estudio.archivo ? (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" className="h-8">
                            <Upload className="h-3 w-3 mr-1" />
                            Cargar
                          </Button>
                        )}
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
                            <DropdownMenuItem>Informar al dueño</DropdownMenuItem>
                            <DropdownMenuItem>Archivar en historial</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
