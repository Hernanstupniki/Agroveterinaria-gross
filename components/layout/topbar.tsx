"use client"

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

const recentPets = [
  { id: 1, name: "Luna", species: "Perro", breed: "Golden Retriever", owner: "María García" },
  { id: 2, name: "Simón", species: "Gato", breed: "Siamés", owner: "Carlos López" },
  { id: 3, name: "Rocky", species: "Perro", breed: "Bulldog Francés", owner: "Ana Martínez" },
  { id: 4, name: "Milo", species: "Perro", breed: "Beagle", owner: "Juan Rodríguez" },
]

const notifications = [
  { id: 1, text: "Turno confirmado: Luna a las 10:30", time: "Hace 5 min", unread: true },
  { id: 2, text: "Vacuna vencida: Rocky - Antirrábica", time: "Hace 1 hora", unread: true },
  { id: 3, text: "Resultado de estudio disponible: Milo", time: "Hace 2 horas", unread: false },
]

export function Topbar() {
  const [petSelectorOpen, setPetSelectorOpen] = useState(false)
  const [selectedPet, setSelectedPet] = useState<typeof recentPets[0] | null>(null)
  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
      {/* Mobile spacer for hamburger */}
      <div className="w-10 lg:hidden" />
      
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar mascota, cliente, turno..."
          className="pl-9 bg-muted border-0"
        />
      </div>

      {/* Quick Pet Selector */}
      <Popover open={petSelectorOpen} onOpenChange={setPetSelectorOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={petSelectorOpen}
            className="hidden md:flex items-center gap-2 min-w-[200px] justify-between"
          >
            <div className="flex items-center gap-2">
              <PawPrint className="h-4 w-4 text-primary" />
              <span className="truncate">
                {selectedPet ? selectedPet.name : "Seleccionar mascota"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="end">
          <Command>
            <CommandInput placeholder="Buscar mascota..." />
            <CommandList>
              <CommandEmpty>No se encontraron mascotas.</CommandEmpty>
              <CommandGroup heading="Recientes">
                {recentPets.map((pet) => (
                  <CommandItem
                    key={pet.id}
                    onSelect={() => {
                      setSelectedPet(pet)
                      setPetSelectorOpen(false)
                    }}
                    className="flex items-center gap-3 py-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {pet.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{pet.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {pet.breed} • {pet.owner}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Notifications */}
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

      {/* User Menu */}
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
