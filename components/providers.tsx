"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { ClinicStoreProvider } from "@/lib/clinic-store"

/** Rutas que puede ver el rol "veterinario" (modo simple). El resto es sólo admin. */
function vetPuedeVer(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/asistente")
}

function RoleGate({ children }: { children: React.ReactNode }) {
  const { usuario, hydrated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!hydrated) return

    // Sin sesión: todo lleva al login.
    if (!usuario) {
      if (pathname !== "/login") router.replace("/login")
      return
    }

    // Con sesión y parado en el login: mandar a la pantalla del rol.
    if (pathname === "/login") {
      router.replace(usuario.rol === "veterinario" ? "/asistente" : "/")
      return
    }

    // Veterinario intentando entrar a una ruta de admin: lo devolvemos al modo simple.
    if (usuario.rol === "veterinario" && !vetPuedeVer(pathname)) {
      router.replace("/asistente")
    }
  }, [usuario, hydrated, pathname, router])

  // Evitar parpadeo de contenido protegido mientras hidrata o redirige.
  if (!hydrated) return null
  if (!usuario && pathname !== "/login") return null
  if (usuario && usuario.rol === "veterinario" && !vetPuedeVer(pathname)) return null

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClinicStoreProvider>
        <RoleGate>{children}</RoleGate>
      </ClinicStoreProvider>
    </AuthProvider>
  )
}
