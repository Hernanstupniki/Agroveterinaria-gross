"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NewSurgeryDialog } from "./new-surgery-dialog"
import { QuickCreateClientDialog } from "@/components/shared/quick-create-client-dialog"
import { QuickCreatePetDialog } from "@/components/shared/quick-create-pet-dialog"
import { LargePrimaryAction } from "@/components/shared/large-primary-action"
import {
  Search,
  Plus,
  Calendar,
  Clock,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Timer,
  FileText,
} from "lucide-react"
import { cirugias, mascotas } from "@/lib/mock-data"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { KpiStrip, type KpiItem } from "@/components/shared/kpi-strip"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  "Programada": { label: "Programada", variant: "secondary", icon: <Calendar className="h-3 w-3" /> },
  "En curso": { label: "En Curso", variant: "default", icon: <Timer className="h-3 w-3" /> },
  "Completada": { label: "Completada", variant: "outline", icon: <CheckCircle2 className="h-3 w-3" /> },
  "Cancelada": { label: "Cancelada", variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> },
  "Pendiente confirmación": { label: "Pendiente", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
}

const riskConfig: Record<string, { label: string; color: string }> = {
  "Bajo": { label: "Bajo", color: "bg-green-100 text-green-800" },
  "Moderado": { label: "Moderado", color: "bg-yellow-100 text-yellow-800" },
  "Alto": { label: "Alto", color: "bg-red-100 text-red-800" },
}

export default function CirugiasScreen() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [surgeryDialogOpen, setSurgeryDialogOpen] = useState(false)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [petDialogOpen, setPetDialogOpen] = useState(false)
  const [petInitialCliente, setPetInitialCliente] = useState<number | null>(null)

  // Auto-open the new-surgery flow when arriving from another flow (?nueva=1).
  useEffect(() => {
    if (typeof window === "undefined") return
    if (new URLSearchParams(window.location.search).get("nueva") === "1") {
      setSurgeryDialogOpen(true)
    }
  }, [])

  const filteredCirugias = cirugias.filter((cirugia) => {
    const matchesSearch =
      cirugia.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cirugia.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cirugia.dueno.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || cirugia.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const getMascotaInfo = (mascotaId: number) => mascotas.find((m) => m.id === mascotaId)

  const programadasCount = cirugias.filter((c) => c.estado === "Programada").length
  const enCursoCount = cirugias.filter((c) => c.estado === "En curso").length
  const completadasCount = cirugias.filter((c) => c.estado === "Completada").length

  const kpis: KpiItem[] = [
    { label: "Programadas", value: programadasCount, icon: Calendar },
    { label: "En curso", value: enCursoCount, icon: Timer, tone: "warning" },
    { label: "Completadas", value: completadasCount, icon: CheckCircle2, tone: "success" },
    { label: "Total", value: cirugias.length, icon: Stethoscope },
  ]

  return (
    <div className="animate-section-in mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cirugías</h1>
          <p className="text-muted-foreground">
            Programá cirugías, requisitos prequirúrgicos y seguí su estado.
          </p>
        </div>
        <LargePrimaryAction label="Agendar cirugía" icon={Plus} onClick={() => setSurgeryDialogOpen(true)} />
      </div>

      {/* Filters */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por tipo, mascota o dueño..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Programada">Programada</SelectItem>
                <SelectItem value="En curso">En Curso</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
                <SelectItem value="Pendiente confirmación">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Surgery Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Lista de cirugías</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCirugias.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No hay cirugías para estos filtros"
              description="Ajustá la búsqueda o agendá una nueva cirugía."
            />
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mascota</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Veterinario</TableHead>
                  <TableHead>Riesgo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCirugias.map((cirugia) => {
                  const mascotaInfo = getMascotaInfo(cirugia.mascotaId)
                  const status = statusConfig[cirugia.estado] || statusConfig["Programada"]
                  const riesgo = cirugia.prequirurgico?.riesgoQuirurgico || "Bajo"
                  const risk = riskConfig[riesgo] || riskConfig["Bajo"]

                  return (
                    <TableRow key={cirugia.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                            {mascotaInfo?.especie === "Perro" ? "🐕" : mascotaInfo?.especie === "Gato" ? "🐈" : "🐾"}
                          </div>
                          <div>
                            <p className="font-medium">{cirugia.mascota}</p>
                            <p className="text-sm text-muted-foreground">{cirugia.dueno}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{cirugia.tipo}</TableCell>
                      <TableCell>{cirugia.fecha}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {cirugia.hora}
                        </div>
                      </TableCell>
                      <TableCell>{cirugia.veterinario}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${risk.color}`}>
                          {risk.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={status.label} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
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

      <NewSurgeryDialog
        open={surgeryDialogOpen}
        onOpenChange={setSurgeryDialogOpen}
        onCreateClient={() => {
          setSurgeryDialogOpen(false)
          setClientDialogOpen(true)
        }}
        onCreatePet={(clienteId) => {
          setSurgeryDialogOpen(false)
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
