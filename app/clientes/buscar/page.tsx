import { AppLayout } from "@/components/layout"
import { ClientesPage as ClientesSearchPage } from "@/components/clientes"

export default function BuscarClientePage() {
  return (
    <AppLayout>
      <ClientesSearchPage />
    </AppLayout>
  )
}