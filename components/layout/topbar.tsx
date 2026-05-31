"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Search, Bell, User, ChevronDown, PawPrint, Check } from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { mascotas } from "@/lib/mock-data"
import { useActivePatient } from "./active-patient"

const patientOptions = mascotas.map((pet) => ({
  id: pet.id,
  name: pet.nombre,
  species: pet.especie,
  breed: pet.raza,
  owner: pet.dueno,
}))

const notifications = [
  { id: 1, text: "Turno confirmado: Luna a las 10:30", time: "Hace 5 min", unread: true },
  { id: 2, text: "Vacuna vencida: Rocky - Antirrábica", time: "Hace 1 hora", unread: true },
  { id: 3, text: "Resultado de estudio disponible: Milo", time: "Hace 2 horas", unread: false },
]

export function Topbar() {
  const [patientOpen, setPatientOpen] = useState(false)
  const { patient, setPatient } = useActivePatient()
  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-[#5A003D] bg-[linear-gradient(100deg,#6F004E_0%,#5A003D_100%)] px-3 text-white shadow-sm lg:h-[68px] lg:gap-4 lg:px-6">
      {/* Global search */}
      <div className="relative w-full max-w-xs sm:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
        <Input
          placeholder="Buscar mascota, cliente, turno..."
          className="h-10 rounded-xl border-white/15 bg-white/10 pl-9 text-white placeholder:text-white/55 focus-visible:ring-white/40"
        />
      </div>

      {/* Active patient selector */}
      <Popover open={patientOpen} onOpenChange={setPatientOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={patientOpen}
            className="hidden h-10 min-w-[210px] justify-between rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white md:flex"
          >
            <span className="flex min-w-0 items-center gap-2 text-left">
              <PawPrint className="h-4 w-4 shrink-0 text-secondary" />
              <span className="min-w-0">
                <span className="block text-[10px] font-medium uppercase leading-none text-white/70">
                  Paciente activo
                </span>
                <span className="block truncate text-sm font-semibold leading-tight">
                  {patient ? patient.name : "Sin seleccionar"}
                </span>
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar paciente, dueño o raza..." />
            <CommandList>
              <CommandEmpty>No se encontraron mascotas.</CommandEmpty>
              {patient && (
                <CommandGroup heading="Activo">
                  <CommandItem
                    value="__limpiar"
                    onSelect={() => {
                      setPatient(null)
                      setPatientOpen(false)
                    }}
                    className="text-muted-foreground"
                  >
                    Quitar paciente activo
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup heading="Pacientes">
                {patientOptions.map((pet) => (
                  <CommandItem
                    key={pet.id}
                    value={`${pet.name} ${pet.owner} ${pet.breed}`}
                    onSelect={() => {
                      setPatient(pet)
                      setPatientOpen(false)
                    }}
                    className="flex items-center gap-3 py-2"
                  >
                    <Check className={cn("h-4 w-4", patient?.id === pet.id ? "opacity-100" : "opacity-0")} />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">{pet.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{pet.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{pet.breed} · {pet.owner}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Right group */}
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 hover:text-white">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[320px]">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notificaciones
              {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount} nuevas</Badge>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-3">
                <div className="flex w-full items-center gap-2">
                  {n.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                  <span className={n.unread ? "font-medium" : ""}>{n.text}</span>
                </div>
                <span className="ml-4 text-xs text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center font-medium text-primary" asChild>
              <Link href="/recordatorios">Ver todas</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 text-white hover:bg-white/10 hover:text-white">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="bg-white/15 text-sm text-white">DG</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start lg:flex">
                <span className="text-sm font-medium leading-none">Dr. García</span>
                <span className="text-xs text-white/70">Veterinario</span>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-white/70 lg:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/configuracion">Configuración</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logo (cream capsule for contrast on the magenta header) */}
        <Link
          href="/"
          aria-label="Ir a Principal"
          className="ml-1 flex h-11 items-center rounded-xl bg-[#FFFDF9] px-2.5 shadow-sm ring-1 ring-black/5 transition-transform hover:scale-[1.02] sm:ml-2 sm:px-3"
        >
          <Image
            src="/agroveterinaria-gross.png"
            alt="Agroveterinaria Gross"
            width={150}
            height={40}
            className="h-7 w-auto object-contain sm:h-8"
            priority
          />
        </Link>
      </div>
    </header>
  )
}
