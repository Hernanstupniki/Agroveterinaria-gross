"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Edit,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Syringe,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { vacunasClinicas, mascotas, clientes } from "@/lib/mock-data"
import { SectionHeader } from "@/components/shared/section-header"
import { LargePrimaryAction } from "@/components/shared/large-primary-action"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { KpiStrip, type KpiItem } from "@/components/shared/kpi-strip"
import { QuickCreateClientDialog } from "@/components/shared/quick-create-client-dialog"
import { QuickCreatePetDialog } from "@/components/shared/quick-create-pet-dialog"
import { NewVaccineDialog } from "./new-vaccine-dialog"

function formatDate(date?: string | null) {
  if (!date) return "-"
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

export function VacunasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todas")
  const [mascotaFilter, setMascotaFilter] = useState("todas")
  const [duenoFilter, setDuenoFilter] = useState("todos")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [fechaProxima, setFechaProxima] = useState("")
  const [vaccineDialogOpen, setVaccineDialogOpen] = useState(false)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [petDialogOpen, setPetDialogOpen] = useState(false)
  const [petInitialCliente, setPetInitialCliente] = useState<number | null>(null)

  // Auto-open the new-vaccine flow when arriving from another flow (?nueva=1).
  useEffect(() => {
    if (typeof window === "undefined") return
    if (new URLSearchParams(window.location.search).get("nueva") === "1") {
      setVaccineDialogOpen(true)
    }
  }, [])

  const stats = {
    aplicadas: vacunasClinicas.filter((v) => v.estado === "Aplicada").length,
    proximas: vacunasClinicas.filter((v) => v.estado === "Próxima").length,
    pendientes: vacunasClinicas.filter((v) => v.estado === "Pendiente").length,
    vencidas: vacunasClinicas.filter((v) => v.estado === "Vencida").length,
  }

  const filteredVacunas = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()

    return vacunasClinicas.filter((vacuna) => {
      const matchesSearch =
        !term ||
        vacuna.mascota.toLowerCase().includes(term) ||
        vacuna.dueno.toLowerCase().includes(term) ||
        vacuna.vacuna.toLowerCase().includes(term)
      const matchesMascota = mascotaFilter === "todas" || String(vacuna.mascotaId) === mascotaFilter
      const matchesDueno = duenoFilter === "todos" || vacuna.dueno === duenoFilter
      const matchesEstado = estadoFilter === "todos" || vacuna.estado === estadoFilter
      const matchesFecha = !fechaProxima || vacuna.proximaFecha === fechaProxima || vacuna.fechaRecomendada === fechaProxima
      const matchesTab = activeTab === "todas" || vacuna.estado.toLowerCase() === activeTab

      return matchesSearch && matchesMascota && matchesDueno && matchesEstado && matchesFecha && matchesTab
    })
  }, [activeTab, duenoFilter, estadoFilter, fechaProxima, mascotaFilter, searchTerm])

  const vacunasVencidas = vacunasClinicas.filter((vacuna) => vacuna.estado === "Vencida")

  const kpis: KpiItem[] = [
    { label: "Aplicadas", value: stats.aplicadas, icon: Check, tone: "success" },
    { label: "Próximas", value: stats.proximas, icon: Clock },
    { label: "Vencidas", value: stats.vencidas, icon: AlertTriangle, tone: "critical" },
    { label: "Pendientes", value: stats.pendientes, icon: Syringe, tone: "warning" },
  ]

  return (
    <div className="animate-section-in mx-auto max-w-[1600px] space-y-6">
      <SectionHeader
        title="Vacunas"
        description="Control global de vacunación y recordatorios WhatsApp por paciente. El calendario se adapta a la etapa de vida (cachorro, adulto, senior)."
        action={<LargePrimaryAction label="Aplicar vacuna" icon={Plus} tone="green" onClick={() => setVaccineDialogOpen(true)} />}
      />

      {vacunasVencidas.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Vacunas vencidas que requieren contacto
            </CardTitle>
            <CardDescription>Priorizar estos pacientes para coordinar aplicación o turno.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {vacunasVencidas.map((vacuna) => (
                <div key={vacuna.id} className="rounded-lg border bg-card p-3">
                  <div className="flex items-start justify-between gap-3">
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
                    <Badge className="bg-destructive text-destructive-foreground">{formatDate(vacuna.proximaFecha)}</Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="bg-destructive hover:bg-destructive/90">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Enviar WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/mascotas/${vacuna.mascotaId}`}>Ver mascota</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Registro de vacunas</CardTitle>
              <CardDescription>Aplicadas, próximas, pendientes y vencidas de toda la veterinaria</CardDescription>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_180px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por mascota, dueño o vacuna..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={mascotaFilter} onValueChange={setMascotaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Mascota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las mascotas</SelectItem>
                  {mascotas.map((mascota) => (
                    <SelectItem key={mascota.id} value={String(mascota.id)}>{mascota.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={duenoFilter} onValueChange={setDuenoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Dueño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los dueños</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.nombre}>{cliente.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="Aplicada">Aplicada</SelectItem>
                  <SelectItem value="Próxima">Próxima</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Vencida">Vencida</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={fechaProxima}
                onChange={(e) => setFechaProxima(e.target.value)}
                aria-label="Filtrar por próxima fecha"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 flex h-auto flex-wrap justify-start">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="aplicada">Aplicadas</TabsTrigger>
              <TabsTrigger value="próxima">Próximas</TabsTrigger>
              <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
              <TabsTrigger value="vencida" className="text-destructive">
                Vencidas ({stats.vencidas})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredVacunas.length === 0 ? (
                <EmptyState
                  icon={Syringe}
                  title="No hay vacunas para estos filtros"
                  description="Ajustá los filtros o registrá una nueva aplicación."
                  action={<LargePrimaryAction label="Aplicar vacuna" icon={Plus} tone="green" onClick={() => setVaccineDialogOpen(true)} />}
                />
              ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mascota</TableHead>
                      <TableHead>Dueño</TableHead>
                      <TableHead>Vacuna</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="hidden md:table-cell">Fecha aplicada</TableHead>
                      <TableHead className="hidden lg:table-cell">Próxima fecha</TableHead>
                      <TableHead className="hidden xl:table-cell">Recordatorio WhatsApp</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVacunas.map((vacuna) => (
                      <TableRow key={vacuna.id} className={vacuna.estado === "Vencida" ? "bg-destructive/5" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {vacuna.mascota[0]}
                              </AvatarFallback>
                            </Avatar>
                            <Link href={`/mascotas/${vacuna.mascotaId}`} className="font-medium hover:text-primary">
                              {vacuna.mascota}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>{vacuna.dueno}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Syringe className="h-4 w-4 text-primary" />
                            <span className="font-medium">{vacuna.vacuna}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={vacuna.estado} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(vacuna.fechaAplicada)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(vacuna.proximaFecha || vacuna.fechaRecomendada)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="space-y-1">
                            <Badge variant={vacuna.recordatorioProgramado ? "outline" : "secondary"} className={vacuna.recordatorioProgramado ? "border-primary/40 text-primary" : ""}>
                              {vacuna.recordatorioProgramado ? "Programado" : "Sin programar"}
                            </Badge>
                            <p className="text-xs text-muted-foreground">{formatDate(vacuna.proximoRecordatorio)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/mascotas/${vacuna.mascotaId}`}>Ver mascota</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Check className="mr-2 h-4 w-4" />
                                Registrar aplicación
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Programar recordatorio
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Enviar WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Secondary metrics — last */}
      <div className="space-y-3 border-t border-border/70 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resumen</h2>
        <KpiStrip items={kpis} className="lg:grid-cols-4 xl:grid-cols-4" />
      </div>

      <NewVaccineDialog
        open={vaccineDialogOpen}
        onOpenChange={setVaccineDialogOpen}
        onCreateClient={() => {
          setVaccineDialogOpen(false)
          setClientDialogOpen(true)
        }}
        onCreatePet={(clienteId) => {
          setVaccineDialogOpen(false)
          setPetInitialCliente(clienteId)
          setPetDialogOpen(true)
        }}
      />
      <QuickCreateClientDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        onNextPet={() => {
          setPetInitialCliente(null)
          setPetDialogOpen(true)
        }}
      />
      <QuickCreatePetDialog
        open={petDialogOpen}
        onOpenChange={setPetDialogOpen}
        initialClienteId={petInitialCliente}
        onCreateClient={() => setClientDialogOpen(true)}
      />
    </div>
  )
}
