import { Suspense } from "react"
import { AppLayout } from "@/components/layout"
import { TreatmentRegistrationFlow } from "@/components/tratamientos"

export default function RegistrarTratamientoPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <TreatmentRegistrationFlow />
      </Suspense>
    </AppLayout>
  )
}
