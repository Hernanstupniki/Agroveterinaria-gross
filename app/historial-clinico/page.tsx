import { HistorialClinico } from "@/components/historial-clinico"

export const metadata = {
  title: "Historial Clínico",
  description: "Consultá y registrá eventos clínicos de una mascota.",
}

export default function HistorialClinicoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <HistorialClinico />
    </main>
  )
}