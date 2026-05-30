"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, UserPlus, PawPrint, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { clientes, mascotas } from "@/lib/mock-data"

interface ClientPetSelectorProps {
  clienteId: number | null
  mascotaId?: number | null
  onClienteChange: (id: number | null) => void
  onMascotaChange?: (id: number | null) => void
  /** Open the quick-create-client flow. */
  onCreateCliente?: () => void
  /** Open the quick-create-pet flow for the given client. */
  onCreateMascota?: (clienteId: number | null) => void
  /** Also require selecting a pet (shows the pet picker). */
  withMascota?: boolean
}

/**
 * Scalable client → pet picker with inline creation. Lets a clinical flow pick
 * (or create) the owner and patient without leaving the form. (AGENTS.md §UX.)
 */
export function ClientPetSelector({
  clienteId,
  mascotaId,
  onClienteChange,
  onMascotaChange,
  onCreateCliente,
  onCreateMascota,
  withMascota = true,
}: ClientPetSelectorProps) {
  const [clientOpen, setClientOpen] = useState(false)
  const [petOpen, setPetOpen] = useState(false)

  const cliente = clientes.find((c) => c.id === clienteId)
  const mascotasDelCliente = mascotas.filter((m) => m.clienteId === clienteId)
  const mascota = mascotas.find((m) => m.id === mascotaId)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Client */}
      <div className="space-y-2">
        <Label>Cliente</Label>
        <Popover open={clientOpen} onOpenChange={setClientOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="h-11 w-full justify-between rounded-xl font-normal"
            >
              <span className="flex items-center gap-2 truncate">
                <UserPlus className="h-4 w-4 shrink-0 text-primary" />
                {cliente ? cliente.nombre : "Buscar cliente..."}
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar por nombre o teléfono..." />
              <CommandList>
                <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                <CommandGroup heading="Clientes">
                  {clientes.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={`${c.nombre} ${c.telefono}`}
                      onSelect={() => {
                        onClienteChange(c.id)
                        onMascotaChange?.(null)
                        setClientOpen(false)
                      }}
                      className="flex items-center gap-2"
                    >
                      <Check className={cn("h-4 w-4", clienteId === c.id ? "opacity-100" : "opacity-0")} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{c.nombre}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.telefono}</p>
                      </div>
                      {c.consentimientoWhatsApp && (
                        <Badge variant="outline" className="text-[10px] text-success border-success/40">WA</Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
                {onCreateCliente && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        value="__crear-cliente"
                        onSelect={() => {
                          setClientOpen(false)
                          onCreateCliente()
                        }}
                        className="text-primary"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Crear nuevo cliente
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {cliente && (
          <p className="text-xs text-muted-foreground">
            {cliente.telefono} · {mascotasDelCliente.length} mascota(s)
          </p>
        )}
      </div>

      {/* Pet */}
      {withMascota && (
        <div className="space-y-2">
          <Label>Mascota</Label>
          <Popover open={petOpen} onOpenChange={setPetOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                disabled={!clienteId}
                className="h-11 w-full justify-between rounded-xl font-normal"
              >
                <span className="flex items-center gap-2 truncate">
                  <PawPrint className="h-4 w-4 shrink-0 text-primary" />
                  {mascota ? mascota.nombre : clienteId ? "Elegir mascota..." : "Elegí un cliente primero"}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar mascota..." />
                <CommandList>
                  <CommandEmpty>Este cliente no tiene mascotas.</CommandEmpty>
                  {mascotasDelCliente.length > 0 && (
                    <CommandGroup heading="Mascotas del cliente">
                      {mascotasDelCliente.map((m) => (
                        <CommandItem
                          key={m.id}
                          value={m.nombre}
                          onSelect={() => {
                            onMascotaChange?.(m.id)
                            setPetOpen(false)
                          }}
                          className="flex items-center gap-2"
                        >
                          <Check className={cn("h-4 w-4", mascotaId === m.id ? "opacity-100" : "opacity-0")} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{m.nombre}</p>
                            <p className="truncate text-xs text-muted-foreground">{m.especie} · {m.raza}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {onCreateMascota && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          value="__crear-mascota"
                          onSelect={() => {
                            setPetOpen(false)
                            onCreateMascota(clienteId)
                          }}
                          className="text-primary"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Crear mascota para este cliente
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}
