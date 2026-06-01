import { AppLayout } from "@/components/layout"
import { AtencionLandingPage } from "@/components/atencion"

export const metadata = {
  title: "Nueva Atencion",
  description: "Centro de atencion clinica unificada.",
}

export default function AtencionPage() {
  return (
    <AppLayout>
      <AtencionLandingPage />
    </AppLayout>
  )
}