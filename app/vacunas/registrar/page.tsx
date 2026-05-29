import { Suspense } from "react"
import { AppLayout } from "@/components/layout"
import { VaccineRegistrationFlow } from "@/components/vacunas"

export default function RegistrarVacunaPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <VaccineRegistrationFlow />
      </Suspense>
    </AppLayout>
  )
}
