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
import { SectionHeader } from "@/components/shared/section-header"
import { LargePrimaryAction } from "@/components/shared/large-primary-action"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { KpiStrip, type KpiItem } from "@/components/shared/kpi-strip"

const tipoIcons: Record<string, typeof FileText> = {
  "Análisis de sangre": Microscope,
  "Ecografía": FileImage,
  "Radiografía": FileImage,
  "Foto clínica": Camera,
  "Receta": FileCheck,
  "Certificado": FileCheck,
  "Informe PDF": File,
}

/** Full page (route /estudios): header + the estudios listing panel. */
export function EstudiosPage() {
  return (
    <div className="animate-section-in mx-auto max-w-[1600px] space-y-6">
      <SectionHeader
        title="Estudios y Archivos"
        description="Adjuntá análisis, radiografías o archivos. Cada estudio queda en la historia clínica."
        action={<LargePrimaryAction label="Cargar estudio" icon={Upload} tone="green" href="/estudios?nuevo=1" />}
      />
      <EstudiosPanel />
    </div>
  )
}

/**
 * Estudios listing (filters + table + KPIs) without its own page header, so it
 * can be embedded inside Historia Clínica as a tab.
 */
export function EstudiosPanel() {
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

  const kpis: KpiItem[] = [
    { label: "Total archivos", value: estudiosArchivos.length, icon: FileText },
    { label: "Pendientes", value: pendientes, icon: Microscope, tone: "warning" },
    { label: "Resultados recibidos", value: recibidos, icon: FileCheck, tone: "success" },
    { label: "Con archivo", value: estudiosArchivos.filter(e => e.archivo).length, icon: FileImage },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="rounded-2xl">
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
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Listado de estudios</CardTitle>
          <CardDescription>{filteredEstudios.length} registros encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEstudios.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No hay estudios para estos filtros"
              description="Ajustá la búsqueda o cargá un nuevo estudio."
              action={<LargePrimaryAction label="Cargar estudio" icon={Upload} tone="green" href="/estudios?nuevo=1" />}
            />
          ) : (
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
                        <StatusBadge status={estudio.estado} />
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
          )}
        </CardContent>
      </Card>

      {/* Secondary metrics — last */}
      <div className="space-y-3 border-t border-border/70 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resumen</h2>
        <KpiStrip items={kpis} className="lg:grid-cols-4 xl:grid-cols-4" />
      </div>
    </div>
  )
}
