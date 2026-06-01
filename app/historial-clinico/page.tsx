import { AppLayout } from "@/components/layout"
import { HistorialClinicoPage } from "@/components/historial-clinico"

export const metadata = {
  title: "Historial Clinico",
  description: "Consulta y registra eventos clinicos de una mascota.",
}

export default function HistorialClinicoPageRoute() {
  return (
    <AppLayout>
      <HistorialClinicoPage />
    </AppLayout>
  )
}