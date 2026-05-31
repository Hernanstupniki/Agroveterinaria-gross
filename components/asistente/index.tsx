"use client"

/**
 * Modo simple para veterinarios: pura botonera.
 *
 * Flujo guiado: elegís una acción (Cliente / Vacuna / Tratamiento / Cirugía),
 * después el cliente y la mascota, cargás los datos y todo queda registrado en
 * la historia clínica. Al terminar, volvés solo a la pantalla de botones.
 *
 * Pensado para que lo use cualquiera: textos cortos, botones grandes y lo máximo
 * posible elegible con un toque.
 */

import { useMemo, useState } from "react"
import Image from "next/image"
import {
  Users,
  Syringe,
  Pill,
  Scissors,
  ArrowLeft,
  Plus,
  PawPrint,
  Check,
  CalendarPlus,
  LogOut,
  AlertTriangle,
} from "lucide-react"
import { useClinic, type Mascota } from "@/lib/clinic-store"
import { useAuth } from "@/lib/auth-context"
import { configuracion } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Accion = "vacuna" | "tratamiento" | "cirugia"

type Vista =
  | { paso: "home" }
  | { paso: "nuevo-cliente"; volverAccion: Accion | null }
  | { paso: "elegir-cliente"; accion: Accion }
  | { paso: "elegir-mascota"; accion: Accion; clienteId: number }
  | { paso: "nueva-mascota"; accion: Accion; clienteId: number }
  | { paso: "cargar"; accion: Accion; mascotaId: number }
  | { paso: "listo"; titulo: string; detalle: string }

const hoy = () => new Date().toISOString().slice(0, 10)

const tratamientosFrecuentes = [
  "Leishmaniasis",
  "Desparasitación",
  "Antipulgas / Garrapatas",
  "Otitis",
  "Dermatitis",
  "Gastroenteritis",
]

// ---------------------------------------------------------------------------
// Piezas reutilizables
// ---------------------------------------------------------------------------

function BotonGrande({
  icon: Icon,
  titulo,
  descripcion,
  onClick,
}: {
  icon: React.ElementType
  titulo: string
  descripcion: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="group text-left outline-none">
      <Card className="flex h-full flex-col items-center gap-4 rounded-xl border-2 border-primary/15 p-8 text-center transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg group-focus-visible:ring-4 group-focus-visible:ring-primary/30">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{titulo}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>
        </div>
      </Card>
    </button>
  )
}

function Encabezado({ titulo, onVolver }: { titulo: string; onVolver: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="lg" onClick={onVolver} className="h-12 gap-2">
        <ArrowLeft className="h-5 w-5" />
        Volver
      </Button>
      <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
    </div>
  )
}

/** Botón seleccionable estilo "chip grande" para elegir opciones con un toque. */
function Opcion({
  activo,
  onClick,
  children,
}: {
  activo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border-2 px-5 py-3 text-base font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        activo
          ? "border-primary bg-primary text-primary-foreground shadow"
          : "border-border bg-background hover:border-primary/50 hover:bg-primary/5",
      )}
    >
      {children}
    </button>
  )
}

const accionMeta: Record<Accion, { titulo: string; icon: React.ElementType }> = {
  vacuna: { titulo: "Vacuna", icon: Syringe },
  tratamiento: { titulo: "Tratamiento", icon: Pill },
  cirugia: { titulo: "Cirugía", icon: Scissors },
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function Asistente() {
  const clinic = useClinic()
  const { usuario, logout } = useAuth()
  const [vista, setVista] = useState<Vista>({ paso: "home" })

  const irHome = () => setVista({ paso: "home" })

  return (
    <div className="min-h-screen bg-background">
      {/* Barra superior mínima */}
      <header className="flex h-20 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
        <button type="button" onClick={irHome} className="flex items-center gap-3 outline-none">
          <Image
            src="/agroveterinaria-gross.png"
            alt="Agroveterinaria Gross"
            width={150}
            height={62}
            className="h-12 w-auto object-contain"
            priority
          />
        </button>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {usuario?.nombre} · Modo simple
          </span>
          <Button variant="outline" size="lg" onClick={logout} className="h-12 gap-2">
            <LogOut className="h-5 w-5" />
            Salir
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 lg:p-8">
        {vista.paso === "home" && <Home setVista={setVista} />}

        {vista.paso === "nuevo-cliente" && (
          <NuevoClienteForm
            onVolver={irHome}
            onListo={(clienteId) => {
              if (vista.volverAccion) {
                setVista({ paso: "elegir-mascota", accion: vista.volverAccion, clienteId })
              } else {
                setVista({
                  paso: "listo",
                  titulo: "¡Cliente guardado!",
                  detalle: "Ya podés cargarle mascotas y atenciones.",
                })
              }
            }}
          />
        )}

        {vista.paso === "elegir-cliente" && (
          <ElegirCliente
            accion={vista.accion}
            onVolver={irHome}
            onElegir={(clienteId) => setVista({ paso: "elegir-mascota", accion: vista.accion, clienteId })}
            onNuevo={() => setVista({ paso: "nuevo-cliente", volverAccion: vista.accion })}
          />
        )}

        {vista.paso === "elegir-mascota" && (
          <ElegirMascota
            accion={vista.accion}
            clienteId={vista.clienteId}
            onVolver={() => setVista({ paso: "elegir-cliente", accion: vista.accion })}
            onElegir={(mascotaId) => setVista({ paso: "cargar", accion: vista.accion, mascotaId })}
            onNueva={() => setVista({ paso: "nueva-mascota", accion: vista.accion, clienteId: vista.clienteId })}
          />
        )}

        {vista.paso === "nueva-mascota" && (
          <NuevaMascotaForm
            clienteId={vista.clienteId}
            onVolver={() => setVista({ paso: "elegir-mascota", accion: vista.accion, clienteId: vista.clienteId })}
            onListo={(mascotaId) => setVista({ paso: "cargar", accion: vista.accion, mascotaId })}
          />
        )}

        {vista.paso === "cargar" && (
          <CargarAccion
            accion={vista.accion}
            mascotaId={vista.mascotaId}
            onVolver={() =>
              setVista({
                paso: "elegir-mascota",
                accion: vista.accion,
                clienteId: clinic.mascotas.find((m) => m.id === vista.mascotaId)?.clienteId ?? 0,
              })
            }
            onListo={(titulo, detalle) => setVista({ paso: "listo", titulo, detalle })}
          />
        )}

        {vista.paso === "listo" && (
          <Listo titulo={vista.titulo} detalle={vista.detalle} onVolver={irHome} />
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pantallas
// ---------------------------------------------------------------------------

function Home({ setVista }: { setVista: (v: Vista) => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">¿Qué querés hacer?</h1>
        <p className="mt-2 text-muted-foreground">Tocá una opción para empezar</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <BotonGrande
          icon={Users}
          titulo="Nuevo cliente"
          descripcion="Agregar un cliente y su mascota"
          onClick={() => setVista({ paso: "nuevo-cliente", volverAccion: null })}
        />
        <BotonGrande
          icon={Syringe}
          titulo="Vacuna"
          descripcion="Registrar una vacuna aplicada"
          onClick={() => setVista({ paso: "elegir-cliente", accion: "vacuna" })}
        />
        <BotonGrande
          icon={Pill}
          titulo="Tratamiento"
          descripcion="Iniciar y registrar un tratamiento"
          onClick={() => setVista({ paso: "elegir-cliente", accion: "tratamiento" })}
        />
        <BotonGrande
          icon={Scissors}
          titulo="Cirugía"
          descripcion="Programar una cirugía"
          onClick={() => setVista({ paso: "elegir-cliente", accion: "cirugia" })}
        />
      </div>
    </div>
  )
}

function NuevoClienteForm({
  onVolver,
  onListo,
}: {
  onVolver: () => void
  onListo: (clienteId: number) => void
}) {
  const clinic = useClinic()
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")

  const guardar = () => {
    if (!nombre.trim()) return
    const cliente = clinic.addCliente({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      whatsapp: telefono.replace(/\D/g, ""),
      direccion: direccion.trim() || undefined,
    })
    onListo(cliente.id)
  }

  return (
    <div className="space-y-6">
      <Encabezado titulo="Nuevo cliente" onVolver={onVolver} />
      <Card className="space-y-5 p-6">
        <Campo label="Nombre y apellido" requerido>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: María García"
            className="h-12 text-base"
            autoFocus
          />
        </Campo>
        <Campo label="Teléfono / WhatsApp">
          <Input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 376 456 7890"
            inputMode="tel"
            className="h-12 text-base"
          />
        </Campo>
        <Campo label="Dirección">
          <Input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ej: Av. Corrientes 1234"
            className="h-12 text-base"
          />
        </Campo>
        <Button size="lg" onClick={guardar} disabled={!nombre.trim()} className="h-14 w-full text-base">
          <Check className="h-5 w-5" />
          Guardar cliente
        </Button>
      </Card>
    </div>
  )
}

function ElegirCliente({
  accion,
  onVolver,
  onElegir,
  onNuevo,
}: {
  accion: Accion
  onVolver: () => void
  onElegir: (clienteId: number) => void
  onNuevo: () => void
}) {
  const clinic = useClinic()
  const [busqueda, setBusqueda] = useState("")

  const lista = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    return clinic.clientes.filter((c) => !q || c.nombre.toLowerCase().includes(q) || c.telefono.includes(q))
  }, [clinic.clientes, busqueda])

  return (
    <div className="space-y-6">
      <Encabezado titulo={`${accionMeta[accion].titulo}: elegí el cliente`} onVolver={onVolver} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="h-12 text-base"
          autoFocus
        />
        <Button size="lg" variant="secondary" onClick={onNuevo} className="h-12 gap-2">
          <Plus className="h-5 w-5" />
          Nuevo cliente
        </Button>
      </div>

      <div className="grid gap-3">
        {lista.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onElegir(c.id)}
            className="flex items-center justify-between rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <div>
              <p className="text-lg font-semibold">{c.nombre}</p>
              <p className="text-sm text-muted-foreground">{c.telefono || "Sin teléfono"}</p>
            </div>
            <span className="text-sm font-medium text-primary">
              {clinic.mascotasDeCliente(c.id).length} mascota(s)
            </span>
          </button>
        ))}
        {lista.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No hay clientes con ese nombre. Tocá “Nuevo cliente” para agregarlo.
          </p>
        )}
      </div>
    </div>
  )
}

function ElegirMascota({
  accion,
  clienteId,
  onVolver,
  onElegir,
  onNueva,
}: {
  accion: Accion
  clienteId: number
  onVolver: () => void
  onElegir: (mascotaId: number) => void
  onNueva: () => void
}) {
  const clinic = useClinic()
  const cliente = clinic.clientes.find((c) => c.id === clienteId)
  const mascotas = clinic.mascotasDeCliente(clienteId)

  return (
    <div className="space-y-6">
      <Encabezado titulo={`Mascotas de ${cliente?.nombre ?? ""}`} onVolver={onVolver} />

      <div className="grid gap-3">
        {mascotas.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onElegir(m.id)}
            className="flex items-center gap-4 rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PawPrint className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">{m.nombre}</p>
              <p className="text-sm text-muted-foreground">
                {m.especie}
                {m.raza ? ` · ${m.raza}` : ""}
              </p>
            </div>
          </button>
        ))}
        {mascotas.length === 0 && (
          <p className="py-6 text-center text-muted-foreground">Este cliente todavía no tiene mascotas cargadas.</p>
        )}
        <Button size="lg" variant="secondary" onClick={onNueva} className="h-14 gap-2 text-base">
          <Plus className="h-5 w-5" />
          Nueva mascota
        </Button>
      </div>
    </div>
  )
}

function NuevaMascotaForm({
  clienteId,
  onVolver,
  onListo,
}: {
  clienteId: number
  onVolver: () => void
  onListo: (mascotaId: number) => void
}) {
  const clinic = useClinic()
  const [nombre, setNombre] = useState("")
  const [especie, setEspecie] = useState("")
  const [raza, setRaza] = useState("")

  const guardar = () => {
    if (!nombre.trim() || !especie) return
    const mascota = clinic.addMascota({
      nombre: nombre.trim(),
      especie,
      raza: raza.trim() || undefined,
      clienteId,
    })
    onListo(mascota.id)
  }

  return (
    <div className="space-y-6">
      <Encabezado titulo="Nueva mascota" onVolver={onVolver} />
      <Card className="space-y-5 p-6">
        <Campo label="Nombre" requerido>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Luna"
            className="h-12 text-base"
            autoFocus
          />
        </Campo>
        <Campo label="Especie" requerido>
          <div className="flex flex-wrap gap-3">
            {["Perro", "Gato", "Otro"].map((op) => (
              <Opcion key={op} activo={especie === op} onClick={() => setEspecie(op)}>
                {op}
              </Opcion>
            ))}
          </div>
        </Campo>
        <Campo label="Raza">
          <Input
            value={raza}
            onChange={(e) => setRaza(e.target.value)}
            placeholder="Ej: Golden Retriever"
            className="h-12 text-base"
          />
        </Campo>
        <Button
          size="lg"
          onClick={guardar}
          disabled={!nombre.trim() || !especie}
          className="h-14 w-full text-base"
        >
          <Check className="h-5 w-5" />
          Guardar mascota
        </Button>
      </Card>
    </div>
  )
}

function CargarAccion({
  accion,
  mascotaId,
  onVolver,
  onListo,
}: {
  accion: Accion
  mascotaId: number
  onVolver: () => void
  onListo: (titulo: string, detalle: string) => void
}) {
  const clinic = useClinic()
  const mascota = clinic.mascotas.find((m) => m.id === mascotaId) as Mascota
  const historial = clinic.historialDeMascota(mascotaId).slice(0, 4)

  return (
    <div className="space-y-6">
      <Encabezado titulo={`${accionMeta[accion].titulo} · ${mascota?.nombre ?? ""}`} onVolver={onVolver} />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          {accion === "vacuna" && <FormVacuna mascota={mascota} onListo={onListo} />}
          {accion === "tratamiento" && <FormTratamiento mascota={mascota} onListo={onListo} />}
          {accion === "cirugia" && <FormCirugia mascota={mascota} onListo={onListo} />}
        </div>

        {/* Idea de uso: lo último que pasó con la mascota, siempre a la vista */}
        <Card className="h-fit space-y-3 p-5">
          <p className="text-sm font-semibold text-muted-foreground">Última actividad de {mascota?.nombre}</p>
          {historial.length === 0 && <p className="text-sm text-muted-foreground">Sin registros todavía.</p>}
          {historial.map((h) => (
            <div key={h.id} className="border-l-2 border-primary/30 pl-3">
              <p className="text-sm font-medium">{h.titulo}</p>
              <p className="text-xs text-muted-foreground">{h.fecha}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

function FormVacuna({
  mascota,
  onListo,
}: {
  mascota: Mascota
  onListo: (titulo: string, detalle: string) => void
}) {
  const clinic = useClinic()
  const [vacuna, setVacuna] = useState("")
  const [proxima, setProxima] = useState("")

  const guardar = () => {
    if (!vacuna) return
    clinic.addVacuna({ mascotaId: mascota.id, vacuna, fechaAplicada: hoy(), proximaFecha: proxima || undefined })
    onListo("¡Vacuna registrada!", `${vacuna} quedó en la historia de ${mascota.nombre}.`)
  }

  return (
    <Card className="space-y-5 p-6">
      <Campo label="¿Qué vacuna le pusiste?" requerido>
        <div className="flex flex-wrap gap-3">
          {configuracion.tiposVacunas.map((v) => (
            <Opcion key={v} activo={vacuna === v} onClick={() => setVacuna(v)}>
              {v}
            </Opcion>
          ))}
        </div>
      </Campo>
      <Campo label="Próxima dosis (opcional)">
        <Input
          type="date"
          value={proxima}
          onChange={(e) => setProxima(e.target.value)}
          className="h-12 text-base"
        />
      </Campo>
      <Button size="lg" onClick={guardar} disabled={!vacuna} className="h-14 w-full text-base">
        <Check className="h-5 w-5" />
        Guardar en la historia
      </Button>
    </Card>
  )
}

function FormTratamiento({
  mascota,
  onListo,
}: {
  mascota: Mascota
  onListo: (titulo: string, detalle: string) => void
}) {
  const clinic = useClinic()
  const [diagnostico, setDiagnostico] = useState("")
  const [otro, setOtro] = useState("")
  const [medicamento, setMedicamento] = useState("")
  const [indicaciones, setIndicaciones] = useState("")
  const [proximoControl, setProximoControl] = useState("")

  const nombre = diagnostico === "__otro__" ? otro.trim() : diagnostico

  const guardar = () => {
    if (!nombre) return
    clinic.addTratamiento({
      mascotaId: mascota.id,
      diagnostico: nombre,
      medicamento: medicamento.trim() || undefined,
      indicaciones: indicaciones.trim() || undefined,
      proximoControl: proximoControl || undefined,
    })
    onListo("¡Tratamiento cargado!", `Quedó activo en la historia de ${mascota.nombre} y se controla desde acá.`)
  }

  return (
    <Card className="space-y-5 p-6">
      <Campo label="¿Qué tratamiento?" requerido>
        <div className="flex flex-wrap gap-3">
          {tratamientosFrecuentes.map((t) => (
            <Opcion key={t} activo={diagnostico === t} onClick={() => setDiagnostico(t)}>
              {t}
            </Opcion>
          ))}
          <Opcion activo={diagnostico === "__otro__"} onClick={() => setDiagnostico("__otro__")}>
            Otro…
          </Opcion>
        </div>
        {diagnostico === "__otro__" && (
          <Input
            value={otro}
            onChange={(e) => setOtro(e.target.value)}
            placeholder="Escribí el tratamiento"
            className="mt-3 h-12 text-base"
            autoFocus
          />
        )}
      </Campo>
      <Campo label="Medicamento (opcional)">
        <Input
          value={medicamento}
          onChange={(e) => setMedicamento(e.target.value)}
          placeholder="Ej: Milteforan"
          className="h-12 text-base"
        />
      </Campo>
      <Campo label="Indicaciones (opcional)">
        <Textarea
          value={indicaciones}
          onChange={(e) => setIndicaciones(e.target.value)}
          placeholder="Ej: 1 vez por día con comida, durante 28 días"
          className="min-h-20 text-base"
        />
      </Campo>
      <Campo label="Próximo control (opcional)">
        <Input
          type="date"
          value={proximoControl}
          onChange={(e) => setProximoControl(e.target.value)}
          className="h-12 text-base"
        />
      </Campo>
      <Button size="lg" onClick={guardar} disabled={!nombre} className="h-14 w-full text-base">
        <Check className="h-5 w-5" />
        Guardar en la historia
      </Button>
    </Card>
  )
}

function FormCirugia({
  mascota,
  onListo,
}: {
  mascota: Mascota
  onListo: (titulo: string, detalle: string) => void
}) {
  const clinic = useClinic()
  const tieneTurno = clinic.tieneTurnoAgendado(mascota.id)

  const [tipo, setTipo] = useState("")
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [error, setError] = useState("")

  // Mini-formulario para agendar el turno previo (requisito para operar).
  const [turnoFecha, setTurnoFecha] = useState(hoy())
  const [turnoHora, setTurnoHora] = useState("09:00")

  const agendarTurno = () => {
    clinic.addTurno({
      mascotaId: mascota.id,
      fecha: turnoFecha,
      hora: turnoHora,
      motivo: "Evaluación prequirúrgica",
    })
    setError("")
  }

  const guardar = () => {
    if (!tipo || !fecha || !hora) return
    const res = clinic.addCirugia({ mascotaId: mascota.id, tipo, fecha, hora })
    if (!res.ok) {
      setError(res.motivo)
      return
    }
    onListo("¡Cirugía programada!", `${tipo} para ${mascota.nombre} el ${fecha} a las ${hora}.`)
  }

  return (
    <Card className="space-y-5 p-6">
      {/* Aviso de requisito: para operar tiene que haber un turno agendado */}
      {!tieneTurno && (
        <div className="space-y-3 rounded-lg border-2 border-warning/40 bg-warning/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="font-semibold">Primero hay que agendar un turno</p>
              <p className="text-sm text-muted-foreground">
                {mascota.nombre} no tiene un turno agendado. No se puede programar la cirugía sin un turno previo.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs">Fecha del turno</Label>
              <Input
                type="date"
                value={turnoFecha}
                onChange={(e) => setTurnoFecha(e.target.value)}
                className="h-11"
              />
            </div>
            <div>
              <Label className="text-xs">Hora</Label>
              <Input type="time" value={turnoHora} onChange={(e) => setTurnoHora(e.target.value)} className="h-11" />
            </div>
            <Button size="lg" onClick={agendarTurno} className="h-11 gap-2">
              <CalendarPlus className="h-5 w-5" />
              Agendar turno
            </Button>
          </div>
        </div>
      )}

      <Campo label="¿Qué cirugía?" requerido>
        <div className="flex flex-wrap gap-3">
          {configuracion.tiposCirugia.map((c) => (
            <Opcion key={c} activo={tipo === c} onClick={() => setTipo(c)}>
              {c}
            </Opcion>
          ))}
        </div>
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Fecha" requerido>
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="h-12 text-base" />
        </Campo>
        <Campo label="Hora" requerido>
          <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="h-12 text-base" />
        </Campo>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button
        size="lg"
        onClick={guardar}
        disabled={!tipo || !fecha || !hora || !tieneTurno}
        className="h-14 w-full text-base"
      >
        <Check className="h-5 w-5" />
        Programar cirugía
      </Button>
    </Card>
  )
}

function Listo({ titulo, detalle, onVolver }: { titulo: string; detalle: string; onVolver: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="h-12 w-12" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{titulo}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{detalle}</p>
      </div>
      <Button size="lg" onClick={onVolver} className="h-14 px-10 text-base">
        Volver al inicio
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------

function Campo({
  label,
  requerido,
  children,
}: {
  label: string
  requerido?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-base">
        {label}
        {requerido && <span className="ml-1 text-primary">*</span>}
      </Label>
      {children}
    </div>
  )
}
