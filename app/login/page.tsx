"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Stethoscope, LayoutDashboard } from "lucide-react"
import { useAuth, type Rol } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [entrando, setEntrando] = useState<Rol | null>(null)

  const entrar = (rol: Rol, nombre: string) => {
    setEntrando(rol)
    login({ nombre, rol })
    router.replace(rol === "veterinario" ? "/asistente" : "/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-[radial-gradient(circle_at_15%_20%,rgba(201,217,47,0.12),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(179,0,122,0.10),transparent_40%)] p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image
          src="/agroveterinaria-gross.png"
          alt="Agroveterinaria Gross"
          width={260}
          height={108}
          className="h-auto w-[220px] object-contain"
          priority
        />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">¿Cómo querés entrar?</h1>
        <p className="text-muted-foreground">Elegí tu forma de trabajar</p>
      </div>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => entrar("veterinario", "Veterinario/a")}
          disabled={entrando !== null}
          className="group text-left outline-none focus-visible:ring-4 focus-visible:ring-primary/30 rounded-xl"
        >
          <Card className="flex h-full flex-col items-center gap-4 rounded-xl border-2 border-primary/20 p-8 text-center transition-all hover:border-primary hover:shadow-lg group-disabled:opacity-60">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Stethoscope className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Veterinario</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pantalla simple. Cargá clientes, vacunas, tratamientos y cirugías con botones grandes.
              </p>
            </div>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => entrar("admin", "Administración")}
          disabled={entrando !== null}
          className="group text-left outline-none focus-visible:ring-4 focus-visible:ring-primary/30 rounded-xl"
        >
          <Card className="flex h-full flex-col items-center gap-4 rounded-xl border-2 border-primary/20 p-8 text-center transition-all hover:border-primary hover:shadow-lg group-disabled:opacity-60">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <LayoutDashboard className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Administración</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Dashboard completo con todas las secciones, reportes y gestión.
              </p>
            </div>
          </Card>
        </button>
      </div>
    </div>
  )
}
