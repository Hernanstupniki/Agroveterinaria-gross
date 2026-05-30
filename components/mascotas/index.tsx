"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Search,
  PawPrint,
  Dog,
  Cat,
  MoreHorizontal,
  Eye,
  Edit,
  Stethoscope,
  Syringe,
  AlertTriangle,
  Scissors,
  FileText,
  ClipboardList,
  BookOpen,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { mascotas } from "@/lib/mock-data"
import { SectionHeader } from "@/components/shared/section-header"
import { LargePrimaryAction } from "@/components/shared/large-primary-action"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { KpiStrip, type KpiItem } from "@/components/shared/kpi-strip"
import { QuickCreatePetDialog } from "@/components/shared/quick-create-pet-dialog"
import { QuickCreateClientDialog } from "@/components/shared/quick-create-client-dialog"

// Quick clinical actions available from every patient card.
const quickActions = (id: number) => [
  { icon: Stethoscope, label: "Nueva consulta", href: `/historial?nueva-consulta=1&mascota=${id}` },
  { icon: Syringe, label: "Nueva vacuna", href: `/vacunas?mascota=${id}` },
  { icon: ClipboardList, label: "Nuevo tratamiento", href: `/tratamientos?mascota=${id}` },
  { icon: Scissors, label: "Nueva cirugía", href: `/cirugias?mascota=${id}` },
  { icon: FileText, label: "Nuevo estudio", href: `/estudios?mascota=${id}` },
  { icon: BookOpen, label: "Historia clínica", href: `/mascotas/${id}` },
]

export function MascotasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [especieFilter, setEspecieFilter] = useState<string>("todas")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")
  const [petDialogOpen, setPetDialogOpen] = useState(false)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)

  // Auto-open the new-pet flow when arriving from Principal (?nuevo=1).
  useEffect(() => {
    if (typeof window === "undefined") return
    if (new URLSearchParams(window.location.search).get("nuevo") === "1") {
      setPetDialogOpen(true)
    }
  }, [])

  const filteredMascotas = mascotas.filter((mascota) => {
    const matchesSearch =
      mascota.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mascota.dueno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mascota.raza.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEspecie =
      especieFilter === "todas" || mascota.especie.toLowerCase() === especieFilter.toLowerCase()
    const matchesEstado = estadoFilter === "todos" || mascota.estadoGeneral === estadoFilter

    return matchesSearch && matchesEspecie && matchesEstado
  })

  const perros = mascotas.filter((m) => m.especie === "Perro").length
  const gatos = mascotas.filter((m) => m.especie === "Gato").length
  const conAlerta = mascotas.filter(
    (m) => m.estadoGeneral === "Vacuna vencida" || m.estadoGeneral === "Control pendiente",
  ).length

  const kpis: KpiItem[] = [
    { label: "Total pacientes", value: mascotas.length, icon: PawPrint },
    { label: "Perros", value: perros, icon: Dog },
    { label: "Gatos", value: gatos, icon: Cat },
    { label: "Con alertas", value: conAlerta, icon: AlertTriangle, tone: "critical" },
  ]

  return (
    <TooltipProvider delayDuration={200}>
      <div className="animate-section-in mx-auto max-w-[1600px] space-y-6">
        <SectionHeader
          title="Mascotas"
          description="Listado completo de pacientes registrados."
          action={<LargePrimaryAction label="Nueva mascota" icon={PawPrint} onClick={() => setPetDialogOpen(true)} />}
        />

        {/* Filters */}
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, dueño o raza..."
                  className="rounded-xl pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={especieFilter} onValueChange={setEspecieFilter}>
                  <SelectTrigger className="w-[140px] rounded-xl">
                    <SelectValue placeholder="Especie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="perro">Perro</SelectItem>
                    <SelectItem value="gato">Gato</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger className="w-[180px] rounded-xl">
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
        {filteredMascotas.length === 0 ? (
          <EmptyState
            icon={PawPrint}
            title="No se encontraron mascotas"
            description="Probá ajustando los filtros o registrá una nueva mascota."
            action={<LargePrimaryAction label="Nueva mascota" icon={PawPrint} onClick={() => setPetDialogOpen(true)} />}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMascotas.map((mascota) => (
              <Card key={mascota.id} className="overflow-hidden rounded-2xl transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-lg text-primary-foreground">
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
                        {quickActions(mascota.id).map((qa) => (
                          <DropdownMenuItem key={qa.label} asChild>
                            <Link href={qa.href}>
                              <qa.icon className="mr-2 h-4 w-4" />
                              {qa.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
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
                      <p className="truncate font-medium">{mascota.dueno}</p>
                    </div>
                  </div>

                  <div className="border-t pt-2">
                    <p className="mb-1 text-xs text-muted-foreground">
                      Última consulta: {mascota.ultimaConsulta}
                    </p>
                    <p className="truncate text-sm">{mascota.ultimoDiagnostico}</p>
                  </div>

                  {mascota.alergias.length > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-warning" />
                      <span className="text-xs text-warning">Alergia: {mascota.alergias.join(", ")}</span>
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className="flex items-center justify-between gap-1 border-t pt-3">
                    <div className="flex items-center gap-1">
                      {quickActions(mascota.id).slice(0, 5).map((qa) => (
                        <Tooltip key={qa.label}>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" asChild>
                              <Link href={qa.href} aria-label={qa.label}>
                                <qa.icon className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{qa.label}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                    <StatusBadge status={mascota.estadoGeneral} />
                  </div>

                  <Button variant="outline" size="sm" className="w-full rounded-xl" asChild>
                    <Link href={`/mascotas/${mascota.id}`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Ver ficha e historia clínica
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Secondary metrics — last */}
        <div className="space-y-3 border-t border-border/70 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resumen</h2>
          <KpiStrip items={kpis} className="lg:grid-cols-4 xl:grid-cols-4" />
        </div>

        <QuickCreatePetDialog
          open={petDialogOpen}
          onOpenChange={setPetDialogOpen}
          onCreateClient={() => setClientDialogOpen(true)}
        />
        <QuickCreateClientDialog
          open={clientDialogOpen}
          onOpenChange={setClientDialogOpen}
          onCreatePet={() => setPetDialogOpen(true)}
        />
      </div>
    </TooltipProvider>
  )
}
