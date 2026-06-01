import { Suspense } from "react"
import { AppLayout } from "@/components/layout"
import { NuevaAtencionFlow } from "@/components/atencion"

export default function NuevaAtencionPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <NuevaAtencionFlow />
      </Suspense>
    </AppLayout>
  )
}