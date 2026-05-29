import { Suspense } from "react"
import { AppLayout } from "@/components/layout"
import { RegisterScheduledSurgeryFlow } from "@/components/cirugias"

export default function RegistrarCirugiaPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <RegisterScheduledSurgeryFlow />
      </Suspense>
    </AppLayout>
  )
}
