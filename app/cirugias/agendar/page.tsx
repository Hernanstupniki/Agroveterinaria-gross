import { Suspense } from "react"
import { AppLayout } from "@/components/layout"
import { ScheduleSurgeryFlow } from "@/components/cirugias"

export default function AgendarCirugiaPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <ScheduleSurgeryFlow />
      </Suspense>
    </AppLayout>
  )
}
