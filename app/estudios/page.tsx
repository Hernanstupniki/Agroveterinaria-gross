import { Suspense } from "react"
import { AppLayout } from "@/components/layout"
import { EstudiosPage } from "@/components/estudios"

export default function Estudios() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <EstudiosPage />
      </Suspense>
    </AppLayout>
  )
}
