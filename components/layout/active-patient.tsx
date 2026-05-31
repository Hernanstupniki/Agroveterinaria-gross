"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface ActivePatient {
  id: number
  name: string
  species?: string
  breed?: string
  owner?: string
}

interface ActivePatientCtx {
  patient: ActivePatient | null
  setPatient: (patient: ActivePatient | null) => void
}

const STORAGE_KEY = "agro.activePatient"
const ActivePatientContext = createContext<ActivePatientCtx | null>(null)

/**
 * Shares the "paciente activo" across the header selector and the Principal
 * "Ver ficha" card. Persisted to localStorage (mock-only, no backend).
 */
export function ActivePatientProvider({ children }: { children: ReactNode }) {
  const [patient, setPatientState] = useState<ActivePatient | null>(null)

  // Read once on mount (client-only) to avoid hydration mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setPatientState(JSON.parse(raw) as ActivePatient)
    } catch {
      /* ignore */
    }
  }, [])

  const setPatient = (next: ActivePatient | null) => {
    setPatientState(next)
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  return (
    <ActivePatientContext.Provider value={{ patient, setPatient }}>
      {children}
    </ActivePatientContext.Provider>
  )
}

export function useActivePatient(): ActivePatientCtx {
  const ctx = useContext(ActivePatientContext)
  // Safe fallback so the hook can be used outside the provider without crashing.
  if (!ctx) return { patient: null, setPatient: () => {} }
  return ctx
}
