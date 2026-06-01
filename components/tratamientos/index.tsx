"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Search,
  Pill,
  Clock,
  AlertTriangle,
  Check,
  Pause,
  Calendar,
  MoreHorizontal,
  ClipboardList,
  FileStack,
  Plus,
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
import { tratamientosActivos, controlesPendientes, plantillasTratamiento } from "@/lib/mock-data"
import { SectionHeader } from "@/components/shared/section-header"
import { LargePrimaryAction } from "@/components/shared/large-primary-action"
import { StatusBadge } from "@/components/shared/status-badge"
import { KpiStrip, type KpiItem } from "@/components/shared/kpi-strip"
import { EmptyState } from "@/components/shared/empty-state"
import { QuickCreateClientDialog } from "@/components/shared/quick-create-client-dialog"
import { QuickCreatePetDialog } from "@/components/shared/quick-create-pet-dialog"
import { NewTreatmentDialog } from "./new-treatment-dialog"

const prioridadColors: Record<string, string> = {
  "Alta": "bg-destructive text-destructive-foreground",
  "Media": "bg-warning text-warning-foreground",
  "Baja": "bg-muted text-muted-foreground",
}

export function TratamientosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("tratamientos")
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [petDialogOpen, setPetDialogOpen] = useState(false)
  const [petInitialCliente, setPetInitialCliente] = useState<number | null>(null)

  // Deep-links from Principal: ?tab=plantillas opens the Plantillas tab;
  // ?nuevo=1 (on the treatments tab) opens the new-treatment flow.
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    if (params.get("tab") === "plantillas") {
      setActiveTab("plantillas")
    } else if (params.get("nuevo") === "1") {
      setTreatmentDialogOpen(true)
    }
  }, [])

  const activos = tratamientosActivos.filter((t) => t.estado === "Activo").length
  const controlesPend = controlesPendientes.length

  const filteredTratamientos = tratamientosActivos.filter(
    (tratamiento) =>
      tratamiento.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tratamiento.medicamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tratamiento.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const kpis: KpiItem[] = [
    { label: "Activos", value: activos, icon: Pill, tone: "success" },
    { label: "Controles pendientes", value: controlesPend, icon: Clock, tone: "warning" },
    {
      label: "Urgentes",
      value: controlesPendientes.filter((c) => c.prioridad === "Alta").length,
      icon: AlertTriangle,
      tone: "critical",
    },
    { label: "Total registros", value: tratamientosActivos.length, icon: Check },
    { label: "Plantillas", value: plantillasTratamiento.length, icon: FileStack },
  ]

  return (
    <div className="animate-section-in mx-auto max-w-[1600px] space-y-6">
      <SectionHeader
        title="Tratamientos"
        description="Iniciá, controlá o finalizá tratamientos y reutilizá plantillas clínicas."
        action={<LargePrimaryAction label="Nuevo tratamiento" icon={Plus} onClick={() => setTreatmentDialogOpen(true)} />}
      />

      {/* Search */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por mascota, medicamento o diagnóstico..."
              className="rounded-xl pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tratamientos">Tratamientos activos</TabsTrigger>
          <TabsTrigger value="controles">Controles pendientes ({controlesPend})</TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas ({plantillasTratamiento.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tratamientos" className="space-y-4">
          {filteredTratamientos.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Sin tratamientos para esa búsqueda"
              description="Probá con otro término o iniciá un nuevo tratamiento."
              action={<LargePrimaryAction label="Nuevo tratamiento" icon={Plus} onClick={() => setTreatmentDialogOpen(true)} />}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTratamientos.map((tratamiento) => (
                <Card key={tratamiento.id} className="overflow-hidden rounded-2xl">
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
                          <DropdownMenuItem asChild>
                            <Link href={`/mascotas/${tratamiento.mascotaId}`}>Cargar evolución</Link>
                          </DropdownMenuItem>
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
                    <div className="rounded-xl bg-muted/50 p-3">
                      <div className="mb-2 flex items-center gap-2">
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

                    <div className="flex items-center justify-between border-t pt-2">
                      <StatusBadge status={tratamiento.estado} />
                      <div className="flex items-center gap-1 text-sm text-primary">
                        <Calendar className="h-4 w-4" />
                        <span>Control: {tratamiento.proximoControl}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="controles" className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Controles pendientes</CardTitle>
              <CardDescription>Pacientes que requieren seguimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {controlesPendientes.map((control) => (
                  <div
                    key={control.id}
                    className="flex items-center gap-4 rounded-xl border p-4 transition-shadow hover:shadow-sm"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {control.mascota[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
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
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {control.fechaSugerida}
                        </span>
                        <span>{control.profesional}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={prioridadColors[control.prioridad]}>{control.prioridad}</Badge>
                      <Button size="sm">Agendar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plantillas" className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Creá una plantilla una vez y reutilizala en cualquier mascota. Al aplicarla se precargan
              medicamento, frecuencia, duración y controles; todo sigue siendo editable.
            </p>
            <Button variant="outline" className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Nueva plantilla
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plantillasTratamiento.map((plantilla) => (
              <Card key={plantilla.id} className="flex flex-col rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileStack className="h-4 w-4 text-primary" />
                      {plantilla.nombre}
                    </CardTitle>
                    {plantilla.activo && <StatusBadge status="Activa" tone="success" />}
                  </div>
                  <CardDescription>{plantilla.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3 text-sm">
                  <div className="rounded-xl bg-muted/50 p-3 space-y-1.5">
                    <p><span className="text-muted-foreground">Medicamento: </span>{plantilla.medicamentoBase}</p>
                    <p><span className="text-muted-foreground">Dosis: </span>{plantilla.dosisSugerida}</p>
                    <p><span className="text-muted-foreground">Frecuencia: </span>{plantilla.frecuenciaSugerida}</p>
                    <p><span className="text-muted-foreground">Duración: </span>{plantilla.duracionSugerida}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-muted-foreground">Controles sugeridos</p>
                    <ul className="space-y-1">
                      {plantilla.controlesSugeridos.map((c) => (
                        <li key={c} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {plantilla.notas && (
                    <p className="text-xs text-muted-foreground">{plantilla.notas}</p>
                  )}
                  <Button className="mt-auto rounded-xl">Aplicar a una mascota</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Secondary metrics — last */}
      <div className="space-y-3 border-t border-border/70 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Resumen
        </h2>
        <KpiStrip items={kpis} className="lg:grid-cols-5 xl:grid-cols-5" />
      </div>

      <NewTreatmentDialog
        open={treatmentDialogOpen}
        onOpenChange={setTreatmentDialogOpen}
        onCreateClient={() => {
          setTreatmentDialogOpen(false)
          setClientDialogOpen(true)
        }}
        onCreatePet={(clienteId) => {
          setTreatmentDialogOpen(false)
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
