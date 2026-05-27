"use client"

import Link from "next/link"
import { useState } from "react"
import { Search, Bell, User, ChevronDown, PawPrint } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { mascotas } from "@/lib/mock-data"

const patientOptions = mascotas.map((pet) => ({
  id: pet.id,
  name: pet.nombre,
  species: pet.especie,
  breed: pet.raza,
  owner: pet.dueno,
  status: pet.estadoGeneral,
}))

const notifications = [
  { id: 1, text: "Turno confirmado: Luna a las 10:30", time: "Hace 5 min", unread: true },
  { id: 2, text: "Vacuna vencida: Rocky - Antirrábica", time: "Hace 1 hora", unread: true },
  { id: 3, text: "Resultado de estudio disponible: Milo", time: "Hace 2 horas", unread: false },
]

export function Topbar() {
  const [petSelectorOpen, setPetSelectorOpen] = useState(false)
  const [selectedPet, setSelectedPet] = useState<typeof patientOptions[0] | null>(null)
  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
      <div className="w-10 lg:hidden" />

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar mascota, cliente, turno..."
          className="pl-9 bg-muted border-0"
        />
      </div>

      <div className="hidden items-center gap-2 lg:flex">
        <Popover open={petSelectorOpen} onOpenChange={setPetSelectorOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={petSelectorOpen}
              title="Seleccioná una mascota para acceder rápidamente a su ficha clínica y datos relacionados."
              className="h-11 min-w-[250px] justify-between border-primary/25 bg-primary/5 hover:bg-primary/10"
            >
              <div className="flex min-w-0 items-center gap-2 text-left">
                <PawPrint className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase leading-none text-primary">
                    Paciente activo
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {selectedPet ? selectedPet.name : "Ver ficha"}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-0" align="end">
            <Command>
              <div className="border-b px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Seleccioná una mascota para acceder rápidamente a su ficha clínica y datos relacionados.
                </p>
              </div>
              <CommandInput placeholder="Buscar paciente, dueño o raza..." />
              <CommandList>
                <CommandEmpty>No se encontraron mascotas.</CommandEmpty>
                <CommandGroup heading="Predeterminado">
                  <CommandItem
                    value="ver ficha sin paciente activo"
                    onSelect={() => {
                      setSelectedPet(null)
                      setPetSelectorOpen(false)
                    }}
                    className="flex cursor-pointer items-center gap-3 py-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-primary">
                      <PawPrint className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">Ver ficha</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        Sin paciente activo seleccionado
                      </span>
                    </div>
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Pacientes recientes">
                  {patientOptions.map((pet) => (
                    <CommandItem
                      key={pet.id}
                      value={`${pet.name} ${pet.owner} ${pet.breed}`}
                      onSelect={() => {
                        setSelectedPet(pet)
                        setPetSelectorOpen(false)
                      }}
                      className="flex cursor-pointer items-center gap-3 py-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {pet.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pet.name}</span>
                          {selectedPet?.id === pet.id && (
                            <Badge className="bg-primary text-primary-foreground">Activo</Badge>
                          )}
                        </div>
                        <span className="block truncate text-xs text-muted-foreground">
                          {pet.breed} · {pet.owner}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedPet ? (
          <Button size="sm" className="h-11 bg-primary hover:bg-primary/90" asChild>
            <Link href={`/mascotas/${selectedPet.id}`}>
              Ver ficha
            </Link>
          </Button>
        ) : (
          <Button size="sm" className="h-11 bg-primary hover:bg-primary/90" disabled>
            Ver ficha
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[320px]">
          <DropdownMenuLabel className="flex items-center justify-between">
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} nuevas
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 py-3">
              <div className="flex items-center gap-2 w-full">
                {notification.unread && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
                <span className={notification.unread ? "font-medium" : ""}>
                  {notification.text}
                </span>
              </div>
              <span className="text-xs text-muted-foreground ml-4">
                {notification.time}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-primary font-medium">
            Ver todas las notificaciones
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                DG
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">Dr. García</span>
              <span className="text-xs text-muted-foreground">Veterinario</span>
            </div>
            <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>Configuración</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
