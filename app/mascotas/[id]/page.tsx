import { AppLayout } from "@/components/layout"
import { FichaMascota } from "@/components/mascotas/ficha-mascota"

export default function MascotaDetalle({ params }: { params: { id: string } }) {
  return (
    <AppLayout>
      <FichaMascota mascotaId={parseInt(params.id)} />
    </AppLayout>
  )
}
