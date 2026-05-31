import { Suspense } from "react"
import { AppLayout } from "@/components/layout"
import { HistorialClinico } from "@/components/historial-clinico"

export default function VerHistorialClinicoPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <HistorialClinico />
      </Suspense>
    </AppLayout>
  )
}