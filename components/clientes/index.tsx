"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  PawPrint,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { clientes, mascotas } from "@/lib/mock-data"
import { SectionHeader } from "@/components/shared/section-header"
import { LargePrimaryAction } from "@/components/shared/large-primary-action"
import { EmptyState } from "@/components/shared/empty-state"
import { QuickCreateClientDialog } from "@/components/shared/quick-create-client-dialog"
import { QuickCreatePetDialog } from "@/components/shared/quick-create-pet-dialog"
import { UserPlus } from "lucide-react"

export function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCliente, setSelectedCliente] = useState<typeof clientes[0] | null>(null)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [petDialogOpen, setPetDialogOpen] = useState(false)
  const [petInitialCliente, setPetInitialCliente] = useState<number | null>(null)

  // Auto-open the new-client flow when arriving from Principal (?nuevo=1).
  useEffect(() => {
    if (typeof window === "undefined") return
    if (new URLSearchParams(window.location.search).get("nuevo") === "1") {
      setClientDialogOpen(true)
    }
  }, [])

  const openPetFor = (clienteId: number | null) => {
    setPetInitialCliente(clienteId)
    setPetDialogOpen(true)
  }

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getMascotasByCliente = (mascotaIds: number[]) => {
    return mascotas.filter((m) => mascotaIds.includes(m.id))
  }

  return (
    <div className="animate-section-in mx-auto max-w-[1600px] space-y-6">
      <SectionHeader
        title="Clientes"
        description="Gestión de clientes, fichas de sus mascotas y recordatorios por WhatsApp."
        action={
          <>
            <Button asChild variant="outline" className="h-12 gap-2 rounded-xl px-5 text-base font-medium">
              <Link href="/recordatorios">
                <MessageCircle className="h-5 w-5" />
                Configurar WhatsApp
              </Link>
            </Button>
            <LargePrimaryAction label="Nuevo cliente" icon={UserPlus} onClick={() => setClientDialogOpen(true)} />
          </>
        }
      />

      {/* Search */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono o email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
          <CardDescription>{filteredClientes.length} clientes registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClientes.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No se encontraron clientes"
              description="Probá con otro término de búsqueda o registrá un nuevo cliente."
              action={<LargePrimaryAction label="Nuevo cliente" icon={UserPlus} onClick={() => setClientDialogOpen(true)} />}
            />
          ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Contacto</TableHead>
                  <TableHead className="hidden lg:table-cell">Dirección</TableHead>
                  <TableHead>Mascotas</TableHead>
                  <TableHead className="hidden sm:table-cell">WhatsApp</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => {
                  const mascotasCliente = getMascotasByCliente(cliente.mascotas)
                  return (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {cliente.nombre.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{cliente.nombre}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {cliente.telefono}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {cliente.telefono}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {cliente.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[200px]">{cliente.direccion}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              onClick={() => setSelectedCliente(cliente)}
                            >
                              <div className="flex items-center gap-1">
                                <PawPrint className="h-4 w-4 text-primary" />
                                <span className="font-medium">{mascotasCliente.length}</span>
                              </div>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Mascotas de {cliente.nombre}</DialogTitle>
                              <DialogDescription>
                                {mascotasCliente.length} mascota(s) registrada(s)
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[400px]">
                              <div className="space-y-3">
                                {mascotasCliente.map((mascota) => (
                                  <div
                                    key={mascota.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                          {mascota.nombre[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{mascota.nombre}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {mascota.especie} • {mascota.raza}
                                        </p>
                                      </div>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                      <Link href={`/mascotas/${mascota.id}`}>
                                        Ver ficha
                                      </Link>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {cliente.consentimientoWhatsApp ? (
                          <Badge variant="outline" className="gap-1 text-success border-success/50">
                            <CheckCircle className="h-3 w-3" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            <XCircle className="h-3 w-3" />
                            No
                          </Badge>
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Enviar WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/recordatorios">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Configurar WhatsApp
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openPetFor(cliente.id)}>
                              <PawPrint className="mr-2 h-4 w-4" />
                              Agregar mascota
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
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

      <QuickCreateClientDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        onNextPet={(id) => openPetFor(id)}
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
