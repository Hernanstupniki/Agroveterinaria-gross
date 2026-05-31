import { Topbar } from "./topbar"
import { ActivePatientProvider } from "./active-patient"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActivePatientProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </ActivePatientProvider>
  )
}
