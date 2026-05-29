"use client"

import { Search, Bell, User, ChevronDown } from "lucide-react"
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
  { id: 2, text: "Vacuna vencida: Rocky - Antirrabica", time: "Hace 1 hora", unread: true },
  { id: 3, text: "Resultado de estudio disponible: Milo", time: "Hace 2 horas", unread: false },
]

export function Topbar() {
  const unreadCount = notifications.filter((notification) => notification.unread).length

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
      <div className="w-10 lg:hidden" />

      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar mascota, cliente, turno..."
          className="border-0 bg-muted pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-[10px]">
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
              <div className="flex w-full items-center gap-2">
                {notification.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                <span className={notification.unread ? "font-medium" : ""}>{notification.text}</span>
              </div>
              <span className="ml-4 text-xs text-muted-foreground">{notification.time}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center font-medium text-primary">
            Ver todas las notificaciones
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-primary text-sm text-primary-foreground">DG</AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start md:flex">
              <span className="text-sm font-medium">Dr. Garcia</span>
              <span className="text-xs text-muted-foreground">Veterinario</span>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>Configuracion</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Cerrar sesion</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
