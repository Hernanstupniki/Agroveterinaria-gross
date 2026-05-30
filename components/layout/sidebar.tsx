"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  PawPrint,
  BookOpen,
  Syringe,
  FileText,
  Pill,
  Calendar,
  Scissors,
  MessageCircle,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Canonical navigation: action-first, Resumen near the end, Configuración last.
const menuItems = [
  { href: "/", label: "Principal", icon: Home },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/mascotas", label: "Mascotas", icon: PawPrint },
  { href: "/historial", label: "Historia Clínica", icon: BookOpen },
  { href: "/vacunas", label: "Vacunas", icon: Syringe },
  { href: "/tratamientos", label: "Tratamientos", icon: Pill },
  { href: "/cirugias", label: "Cirugías", icon: Scissors },
  { href: "/turnos", label: "Turnos", icon: Calendar },
  { href: "/estudios", label: "Estudios y Archivos", icon: FileText },
  { href: "/recordatorios", label: "Recordatorios WhatsApp", icon: MessageCircle },
  { href: "/resumen", label: "Resumen", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
]

function SidebarContent({ collapsed, onToggle }: { collapsed: boolean; onToggle?: () => void }) {
  const pathname = usePathname()
  
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <Link href="/" className={cn(
        "relative flex items-center overflow-hidden border-b border-white/40 bg-[radial-gradient(circle_at_18%_28%,rgba(201,217,47,0.16),transparent_38%),radial-gradient(circle_at_84%_72%,rgba(179,0,122,0.075),transparent_36%),linear-gradient(145deg,#fffff7_0%,#fffefe_48%,#fff7fc_100%)] shadow-[inset_0_-1px_0_rgba(179,0,122,0.09)] after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-[linear-gradient(90deg,#c9d92f,#b3007a)]",
        "cursor-pointer transition-all duration-200 hover:brightness-[1.03] hover:shadow-[inset_0_-1px_0_rgba(179,0,122,0.09),0_8px_24px_rgba(179,0,122,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        collapsed ? "h-16 justify-center px-2 py-2" : "h-24 px-5 py-4"
      )} title="Ir a Principal" aria-label="Ir a Principal">
        <div className="relative z-10 flex h-full w-full items-center justify-center px-1 drop-shadow-[0_8px_18px_rgba(179,0,122,0.16)]">
          <Image
            src="/agroveterinaria-gross.png"
            alt="Agroveterinaria Gross"
            width={collapsed ? 54 : 220}
            height={collapsed ? 54 : 92}
            className="h-full w-full object-contain"
            priority
          />
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scrollbar px-2 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    collapsed && "justify-center px-2",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-secondary" />
                  )}
                  <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-secondary" : "group-hover:text-secondary/80")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      {onToggle && (
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[260px]"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-3 left-3 z-50 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] p-0 bg-sidebar border-sidebar-border">
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>
    </>
  )
}
