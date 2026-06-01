import { Suspense } from "react"
import { AppLayout } from "@/components/layout"
import { NuevoClienteForm } from "@/components/clientes/nuevo-cliente-form"

export default function AgregarClientePage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <NuevoClienteForm />
      </Suspense>
    </AppLayout>
  )
}
