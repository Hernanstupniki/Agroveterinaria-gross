"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { FileText, HeartPulse, Home, Pill, Scissors, Syringe, Users, ClipboardList, ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const menuItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/atencion/nueva", label: "Nueva atención", icon: HeartPulse },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/historial-clinico", label: "Historial clínico", icon: ClipboardList },
  { href: "/vacunas", label: "Vacunas", icon: Syringe },
  { href: "/tratamientos", label: "Tratamientos", icon: Pill },
  { href: "/cirugias", label: "Cirugías", icon: Scissors },
  { href: "/estudios", label: "Estudios y Archivos", icon: FileText },
]

function SidebarContent({ collapsed, onToggle }: { collapsed: boolean; onToggle?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link
        href="/"
        className={cn(
          "relative flex items-center overflow-hidden border-b border-white/40 bg-[radial-gradient(circle_at_18%_28%,rgba(201,217,47,0.16),transparent_38%),radial-gradient(circle_at_84%_72%,rgba(179,0,122,0.075),transparent_36%),linear-gradient(145deg,#fffff7_0%,#fffefe_48%,#fff7fc_100%)] shadow-[inset_0_-1px_0_rgba(179,0,122,0.09)] after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-[linear-gradient(90deg,#c9d92f,#b3007a)]",
          "cursor-pointer transition-all duration-200 hover:brightness-[1.03] hover:shadow-[inset_0_-1px_0_rgba(179,0,122,0.09),0_8px_24px_rgba(179,0,122,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          collapsed ? "h-14 justify-center px-2 py-2" : "h-20 px-4 py-3",
        )}
        title="Ir al inicio"
        aria-label="Ir al inicio"
      >
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

      <nav className="flex-1 overflow-hidden px-2 py-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    collapsed && "justify-center px-2",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-secondary")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

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
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[260px]",
        )}
      >
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>

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
