import { Suspense } from "react"
import { AppLayout } from "@/components/layout"
import { BuscarEstudiosFlow } from "@/components/estudios"

export default function BuscarEstudiosPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <BuscarEstudiosFlow />
      </Suspense>
    </AppLayout>
  )
}
