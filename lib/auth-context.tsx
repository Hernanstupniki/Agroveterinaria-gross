"use client"

/**
 * Autenticación por rol (mock, persistida en localStorage).
 *
 * Define dos modos de acceso:
 *  - "veterinario": entra al modo simple (/asistente), pura botonera.
 *  - "admin": entra al dashboard completo (/).
 *
 * Es un login de prototipo: no valida contraseñas contra un backend. Está
 * aislado en este contexto para poder reemplazarlo por auth real sin tocar la UI.
 */

import { createContext, useContext, useEffect, useState } from "react"

const STORAGE_KEY = "agrovet-auth-v1"

export type Rol = "veterinario" | "admin"

export interface Usuario {
  nombre: string
  rol: Rol
}

interface AuthContextValue {
  usuario: Usuario | null
  hydrated: boolean
  login: (usuario: Usuario) => void
  logout: () => void
}

const Ctx = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUsuario(JSON.parse(raw))
    } catch {
      /* ignorar */
    }
    setHydrated(true)
  }, [])

  const login = (u: Usuario) => {
    setUsuario(u)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    } catch {
      /* ignorar */
    }
  }

  const logout = () => {
    setUsuario(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignorar */
    }
  }

  return <Ctx.Provider value={{ usuario, hydrated, login, logout }}>{children}</Ctx.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  return ctx
}
