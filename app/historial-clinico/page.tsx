import { Suspense } from "react"
import { AppLayout } from "@/components/layout"
import { HistorialClinico } from "@/components/historial-clinico"

export const metadata = {
  title: "Historial Clinico",
  description: "Consulta y registra eventos clinicos de una mascota.",
}

export default function HistorialClinicoPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <HistorialClinico />
      </Suspense>
    </AppLayout>
  )
}