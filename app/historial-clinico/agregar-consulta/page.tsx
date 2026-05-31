import { Suspense } from "react"
import { AppLayout } from "@/components/layout"
import { ConsultaRegistrationFlow } from "@/components/historial-clinico"

export default function AgregarConsultaPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <ConsultaRegistrationFlow />
      </Suspense>
    </AppLayout>
  )
}