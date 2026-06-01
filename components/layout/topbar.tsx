"use client"

import Image from "next/image"
import Link from "next/link"
import { Search, Bell, User, ChevronDown, Settings } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

const notifications = [
  { id: 1, text: "Turno confirmado: Luna a las 10:30", time: "Hace 5 min", unread: true },
  { id: 2, text: "Vacuna vencida: Rocky - Antirrábica", time: "Hace 1 hora", unread: true },
  { id: 3, text: "Resultado de estudio disponible: Milo", time: "Hace 2 horas", unread: false },
]

export function Topbar() {
  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-[#5A003D] bg-[linear-gradient(100deg,#6F004E_0%,#5A003D_100%)] px-3 text-white shadow-sm lg:h-[68px] lg:gap-4 lg:px-6">
      {/* Logo (cream capsule — left side) */}
      <Link
        href="/"
        aria-label="Ir a Principal"
        className="flex h-11 shrink-0 items-center rounded-xl bg-[#FFFDF9] px-2.5 shadow-sm ring-1 ring-black/5 transition-transform hover:scale-[1.02] sm:px-3"
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

      {/* Global search */}
      <div className="relative w-full max-w-xs sm:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
        <Input
          placeholder="Buscar mascota, cliente, turno..."
          className="h-10 rounded-xl border-white/15 bg-white/10 pl-9 text-white placeholder:text-white/55 focus-visible:ring-white/40"
        />
      </div>

      {/* Right group */}
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {/* Configuración — relocated here as a gear */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <Link href="/configuracion" aria-label="Configuración" title="Configuración">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>

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

      </div>
    </header>
  )
}
