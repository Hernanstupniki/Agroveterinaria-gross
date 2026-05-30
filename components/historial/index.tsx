"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Filter,
  Stethoscope,
  Syringe,
  FileText,
  Scissors,
  Pill,
  Activity,
  Download,
  ChevronDown,
  Calendar,
  User,
  Weight,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { mascotas, historialLuna } from "@/lib/mock-data"

const tipoEventoIcons: Record<string, typeof Activity> = {
  "Consulta": Stethoscope,
  "Vacuna": Syringe,
  "Estudio": FileText,
  "Cirugía": Scissors,
  "Tratamiento": Pill,
}

const tipoEventoColors: Record<string, string> = {
  "Consulta": "bg-primary text-primary-foreground",
  "Vacuna": "bg-success text-success-foreground",
  "Estudio": "bg-secondary text-secondary-foreground",
  "Cirugía": "bg-destructive text-destructive-foreground",
  "Tratamiento": "bg-warning text-warning-foreground",
}

export function HistorialPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMascota, setSelectedMascota] = useState<string>("1")
  const [tipoFilter, setTipoFilter] = useState<string>("todos")
  const [expandedItems, setExpandedItems] = useState<number[]>([1])

  const mascotaSeleccionada = mascotas.find(m => m.id === parseInt(selectedMascota))

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const filteredHistorial = historialLuna.filter(evento => {
    const matchesTipo = tipoFilter === "todos" || evento.tipo === tipoFilter
    const matchesSearch = searchTerm === "" || 
      (evento.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (evento.diagnostico?.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesTipo && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historial Clínico</h1>
          <p className="text-muted-foreground">
            Registro completo de consultas y eventos médicos
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Consulta
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Select value={selectedMascota} onValueChange={setSelectedMascota}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Seleccionar mascota" />
              </SelectTrigger>
              <SelectContent>
                {mascotas.map((mascota) => (
                  <SelectItem key={mascota.id} value={mascota.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{mascota.nombre}</span>
                      <span className="text-muted-foreground">({mascota.especie})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar en historial..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="Consulta">Consultas</SelectItem>
                <SelectItem value="Vacuna">Vacunas</SelectItem>
                <SelectItem value="Estudio">Estudios</SelectItem>
                <SelectItem value="Cirugía">Cirugías</SelectItem>
                <SelectItem value="Tratamiento">Tratamientos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient Summary */}
      {mascotaSeleccionada && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {mascotaSeleccionada.nombre[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{mascotaSeleccionada.nombre}</h2>
                  <Badge variant="outline">{mascotaSeleccionada.especie}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mascotaSeleccionada.raza} • {mascotaSeleccionada.edad} • {mascotaSeleccionada.dueno}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/mascotas/${mascotaSeleccionada.id}`}>
                  Ver ficha completa
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Línea de Tiempo</CardTitle>
          <CardDescription>{filteredHistorial.length} registros encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              
              <div className="space-y-4">
                {filteredHistorial.map((evento) => {
                  const Icon = tipoEventoIcons[evento.tipo] || Activity
                  const isExpanded = expandedItems.includes(evento.id)
                  
                  return (
                    <Collapsible
                      key={evento.id}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(evento.id)}
                    >
                      <div className="relative pl-12">
                        {/* Timeline dot */}
                        <div className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${tipoEventoColors[evento.tipo]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="rounded-lg border hover:shadow-sm transition-shadow">
                          <CollapsibleTrigger asChild>
                            <div className="p-4 cursor-pointer">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className={tipoEventoColors[evento.tipo]}>
                                      {evento.tipo}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {evento.fecha}
                                    </span>
                                  </div>
                                  <h3 className="font-semibold">{evento.motivo}</h3>
                                  {evento.diagnostico && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {evento.diagnostico}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    <User className="h-3 w-3 mr-1" />
                                    {evento.veterinario}
                                  </Badge>
                                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <div className="px-4 pb-4 pt-0">
                              <Separator className="mb-4" />
                              
                              <div className="grid gap-4 md:grid-cols-2">
                                {evento.sintomas && evento.sintomas !== "-" && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Síntomas</p>
                                    <p className="text-sm">{evento.sintomas}</p>
                                  </div>
                                )}
                                
                                {evento.diagnostico && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Diagnóstico</p>
                                    <p className="text-sm">{evento.diagnostico}</p>
                                  </div>
                                )}
                                
                                {evento.tratamiento && evento.tratamiento !== "-" && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Tratamiento</p>
                                    <p className="text-sm">{evento.tratamiento}</p>
                                  </div>
                                )}
                                
                                {evento.peso && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Peso Registrado</p>
                                    <p className="text-sm flex items-center gap-1">
                                      <Weight className="h-4 w-4" />
                                      {evento.peso} kg
                                    </p>
                                  </div>
                                )}
                                
                                {evento.vacuna && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Vacuna Aplicada</p>
                                    <p className="text-sm">{evento.vacuna}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Lote: {evento.lote} • {evento.laboratorio}
                                    </p>
                                  </div>
                                )}
                                
                                {evento.procedimiento && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Procedimiento</p>
                                    <p className="text-sm">{evento.procedimiento}</p>
                                  </div>
                                )}
                                
                                {evento.anestesia && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Anestesia</p>
                                    <p className="text-sm">{evento.anestesia}</p>
                                  </div>
                                )}
                              </div>
                              
                              {evento.medicacion && evento.medicacion.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Medicación Indicada</p>
                                  <div className="space-y-2">
                                    {evento.medicacion.map((med, idx) => (
                                      <div key={idx} className="flex items-center gap-4 p-2 rounded-lg bg-muted/50 text-sm">
                                        <Pill className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{med.nombre}</span>
                                        <span>{med.dosis}</span>
                                        <span className="text-muted-foreground">{med.frecuencia}</span>
                                        <span className="text-muted-foreground">{med.duracion}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {evento.observaciones && (
                                <div className="mt-4 p-3 rounded-lg bg-muted/50">
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Observaciones</p>
                                  <p className="text-sm">{evento.observaciones}</p>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                                {evento.proximoControl && (
                                  <div className="flex items-center gap-2 text-sm text-primary">
                                    <Clock className="h-4 w-4" />
                                    <span>Próximo control: <strong>{evento.proximoControl}</strong></span>
                                  </div>
                                )}
                                {evento.proximaVacuna && (
                                  <div className="flex items-center gap-2 text-sm text-success">
                                    <Syringe className="h-4 w-4" />
                                    <span>Próxima vacuna: <strong>{evento.proximaVacuna}</strong></span>
                                  </div>
                                )}
                                {evento.archivo && (
                                  <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar archivo
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </div>
                    </Collapsible>
                  )
                })}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
