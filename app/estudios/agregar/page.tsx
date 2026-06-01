import { Suspense } from "react"
import { AppLayout } from "@/components/layout"
import { AgregarEstudioFlow } from "@/components/estudios"

export default function AgregarEstudioPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <AgregarEstudioFlow />
      </Suspense>
    </AppLayout>
  )
}
