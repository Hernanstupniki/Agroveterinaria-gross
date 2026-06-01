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
  Stethoscope,
  ArrowLeft,
  Plus,
  PawPrint,
  Check,
  CalendarPlus,
  LogOut,
  AlertTriangle,
  ChevronRight,
  FileText,
} from "lucide-react"
import { useClinic, type Mascota, type EtapaVida } from "@/lib/clinic-store"
import { useAuth } from "@/lib/auth-context"
import { configuracion } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Accion = "consulta" | "vacuna" | "tratamiento" | "cirugia"

type Vista =
  | { paso: "home" }
  | { paso: "clientes" }
  | { paso: "cliente-detalle"; clienteId: number }
  | { paso: "historia"; mascotaId: number }
  | { paso: "nuevo-cliente"; volverAccion: Accion | null; desdeGestion?: boolean }
  | { paso: "elegir-cliente"; accion: Accion }
  | { paso: "elegir-mascota"; accion: Accion; clienteId: number }
  | { paso: "nueva-mascota"; accion: Accion | null; clienteId: number }
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
  consulta: { titulo: "Consulta", icon: Stethoscope },
  vacuna: { titulo: "Vacuna", icon: Syringe },
  tratamiento: { titulo: "Tratamiento", icon: Pill },
  cirugia: { titulo: "Cirugía", icon: Scissors },
}

// Iconos para la línea de tiempo de la historia clínica.
const iconoHistorial: Record<string, React.ElementType> = {
  Consulta: Stethoscope,
  Vacuna: Syringe,
  Tratamiento: Pill,
  Cirugía: Scissors,
  Turno: CalendarPlus,
}

// Los animales que más van a la veterinaria, para elegir con un toque.
const ANIMALES_COMUNES = ["Perro", "Gato", "Conejo", "Ave"]

/** Selector de especie: 4 animales comunes + "Otro…" para escribir cualquier otro. */
function SelectorEspecie({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [modoOtro, setModoOtro] = useState(false)
  const esOtro = modoOtro || (!!value && !ANIMALES_COMUNES.includes(value))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {ANIMALES_COMUNES.map((a) => (
          <Opcion
            key={a}
            activo={!esOtro && value === a}
            onClick={() => {
              setModoOtro(false)
              onChange(a)
            }}
          >
            {a}
          </Opcion>
        ))}
        <Opcion
          activo={esOtro}
          onClick={() => {
            setModoOtro(true)
            onChange("")
          }}
        >
          Otro…
        </Opcion>
      </div>
      {esOtro && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribí el animal (ej: Tortuga, Hurón, Caballo...)"
          className="h-12 text-base"
          autoFocus
        />
      )}
    </div>
  )
}

// Etapa de vida según el estándar profesional AAHA/WSAVA (4 etapas).
// "Senior" reemplaza al término antiguo "geronte / geriátrico".
const ETAPAS_VIDA: { value: EtapaVida; label: string }[] = [
  { value: "Cachorro", label: "Cachorro / Cría" },
  { value: "Joven", label: "Joven" },
  { value: "Adulto", label: "Adulto" },
  { value: "Senior", label: "Senior" },
]

/** Selector de etapa de vida del animal. */
function SelectorEtapa({ value, onChange }: { value: EtapaVida | ""; onChange: (v: EtapaVida) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {ETAPAS_VIDA.map((e) => (
        <Opcion key={e.value} activo={value === e.value} onClick={() => onChange(e.value)}>
          {e.label}
        </Opcion>
      ))}
    </div>
  )
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

        {vista.paso === "clientes" && (
          <GestionClientes
            onVolver={irHome}
            onElegir={(clienteId) => setVista({ paso: "cliente-detalle", clienteId })}
            onNuevo={() => setVista({ paso: "nuevo-cliente", volverAccion: null, desdeGestion: true })}
          />
        )}

        {vista.paso === "cliente-detalle" && (
          <ClienteDetalle
            clienteId={vista.clienteId}
            onVolver={() => setVista({ paso: "clientes" })}
            onNuevaMascota={() => setVista({ paso: "nueva-mascota", accion: null, clienteId: vista.clienteId })}
            onVerHistoria={(mascotaId) => setVista({ paso: "historia", mascotaId })}
          />
        )}

        {vista.paso === "historia" && (
          <MascotaHistoria
            mascotaId={vista.mascotaId}
            onVolver={() => {
              const clienteId = clinic.mascotas.find((m) => m.id === vista.mascotaId)?.clienteId
              setVista(clienteId ? { paso: "cliente-detalle", clienteId } : { paso: "clientes" })
            }}
          />
        )}

        {vista.paso === "nuevo-cliente" && (
          <NuevoClienteForm
            onVolver={vista.desdeGestion ? () => setVista({ paso: "clientes" }) : irHome}
            onListo={(clienteId, mascotaId) => {
              if (vista.volverAccion) {
                // Venía de una acción: ya tenemos cliente y mascota, vamos directo a cargarla.
                setVista({ paso: "cargar", accion: vista.volverAccion, mascotaId })
              } else if (vista.desdeGestion) {
                // Desde la sección Clientes: vamos a la ficha del cliente recién creado.
                setVista({ paso: "cliente-detalle", clienteId })
              } else {
                setVista({
                  paso: "listo",
                  titulo: "¡Cliente y mascota guardados!",
                  detalle: "Ya podés registrarle vacunas, tratamientos y cirugías.",
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
            onVolver={() =>
              vista.accion
                ? setVista({ paso: "elegir-mascota", accion: vista.accion, clienteId: vista.clienteId })
                : setVista({ paso: "cliente-detalle", clienteId: vista.clienteId })
            }
            onListo={(mascotaId) =>
              vista.accion
                ? setVista({ paso: "cargar", accion: vista.accion!, mascotaId })
                : setVista({ paso: "cliente-detalle", clienteId: vista.clienteId })
            }
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
          titulo="Clientes"
          descripcion="Buscar clientes, agregar nuevos y sus mascotas"
          onClick={() => setVista({ paso: "clientes" })}
        />
        <BotonGrande
          icon={Stethoscope}
          titulo="Consulta"
          descripcion="Atender: motivo, peso, diagnóstico"
          onClick={() => setVista({ paso: "elegir-cliente", accion: "consulta" })}
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
  onListo: (clienteId: number, mascotaId: number) => void
}) {
  const clinic = useClinic()
  // Datos del cliente
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  // Datos de la mascota (siempre se cargan junto al cliente)
  const [mascotaNombre, setMascotaNombre] = useState("")
  const [especie, setEspecie] = useState("")
  const [etapa, setEtapa] = useState<EtapaVida | "">("")
  const [raza, setRaza] = useState("")

  const completo = nombre.trim() && mascotaNombre.trim() && especie

  const guardar = () => {
    if (!completo) return
    const cliente = clinic.addCliente({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      whatsapp: telefono.replace(/\D/g, ""),
      direccion: direccion.trim() || undefined,
    })
    const mascota = clinic.addMascota({
      nombre: mascotaNombre.trim(),
      especie,
      raza: raza.trim() || undefined,
      etapaVida: etapa || undefined,
      clienteId: cliente.id,
    })
    onListo(cliente.id, mascota.id)
  }

  return (
    <div className="space-y-6">
      <Encabezado titulo="Nuevo cliente y su mascota" onVolver={onVolver} />

      {/* Datos del cliente */}
      <Card className="space-y-5 p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Users className="h-4 w-4" /> Datos del cliente
        </p>
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
      </Card>

      {/* Datos de la mascota */}
      <Card className="space-y-5 p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <PawPrint className="h-4 w-4" /> Su mascota
        </p>
        <Campo label="Nombre de la mascota" requerido>
          <Input
            value={mascotaNombre}
            onChange={(e) => setMascotaNombre(e.target.value)}
            placeholder="Ej: Luna"
            className="h-12 text-base"
          />
        </Campo>
        <Campo label="Especie" requerido>
          <SelectorEspecie value={especie} onChange={setEspecie} />
        </Campo>
        <Campo label="Etapa de vida">
          <SelectorEtapa value={etapa} onChange={setEtapa} />
        </Campo>
        <Campo label="Raza">
          <Input
            value={raza}
            onChange={(e) => setRaza(e.target.value)}
            placeholder="Ej: Golden Retriever"
            className="h-12 text-base"
          />
        </Campo>
      </Card>

      <Button size="lg" onClick={guardar} disabled={!completo} className="h-14 w-full text-base">
        <Check className="h-5 w-5" />
        Guardar cliente y mascota
      </Button>
    </div>
  )
}

function GestionClientes({
  onVolver,
  onElegir,
  onNuevo,
}: {
  onVolver: () => void
  onElegir: (clienteId: number) => void
  onNuevo: () => void
}) {
  const clinic = useClinic()
  const [busqueda, setBusqueda] = useState("")

  const lista = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    return clinic.clientes.filter(
      (c) => !q || c.nombre.toLowerCase().includes(q) || c.telefono.includes(q),
    )
  }, [clinic.clientes, busqueda])

  return (
    <div className="space-y-6">
      <Encabezado titulo="Clientes" onVolver={onVolver} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="h-16 text-lg"
          autoFocus
        />
        <Button
          size="lg"
          onClick={onNuevo}
          className="h-16 shrink-0 gap-3 px-8 text-lg font-bold shadow-md sm:min-w-[230px]"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
          Nuevo cliente
        </Button>
      </div>

      <div className="grid gap-3">
        {lista.map((c) => {
          const mascotas = clinic.mascotasDeCliente(c.id)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onElegir(c.id)}
              className="flex items-center justify-between rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div className="min-w-0">
                <p className="text-lg font-semibold">{c.nombre}</p>
                <p className="text-sm text-muted-foreground">{c.telefono || "Sin teléfono"}</p>
                {mascotas.length > 0 && (
                  <p className="mt-1 truncate text-sm text-primary">
                    {mascotas.map((m) => m.nombre).join(", ")}
                  </p>
                )}
              </div>
              <span className="shrink-0 pl-3 text-sm font-medium text-muted-foreground">
                {mascotas.length} mascota(s)
              </span>
            </button>
          )
        })}
        {lista.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No hay clientes con ese nombre. Tocá “Nuevo cliente” para agregarlo.
          </p>
        )}
      </div>
    </div>
  )
}

function ClienteDetalle({
  clienteId,
  onVolver,
  onNuevaMascota,
  onVerHistoria,
}: {
  clienteId: number
  onVolver: () => void
  onNuevaMascota: () => void
  onVerHistoria: (mascotaId: number) => void
}) {
  const clinic = useClinic()
  const cliente = clinic.clientes.find((c) => c.id === clienteId)
  const mascotas = clinic.mascotasDeCliente(clienteId)

  return (
    <div className="space-y-6">
      <Encabezado titulo={cliente?.nombre ?? "Cliente"} onVolver={onVolver} />

      {/* Datos de contacto */}
      <Card className="space-y-1 p-5">
        <p className="text-sm text-muted-foreground">Teléfono</p>
        <p className="text-base font-medium">{cliente?.telefono || "—"}</p>
        {cliente?.direccion && (
          <>
            <p className="mt-2 text-sm text-muted-foreground">Dirección</p>
            <p className="text-base font-medium">{cliente.direccion}</p>
          </>
        )}
      </Card>

      {/* Mascotas del cliente */}
      <div>
        <p className="mb-3 text-sm font-semibold text-muted-foreground">
          Mascotas ({mascotas.length})
        </p>
        <div className="grid gap-3">
          {mascotas.map((m) => {
            const ultima = clinic.historialDeMascota(m.id)[0]
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onVerHistoria(m.id)}
                className="flex items-center gap-4 rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PawPrint className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold">{m.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.especie}
                    {m.raza ? ` · ${m.raza}` : ""}
                    {m.etapaVida ? ` · ${m.etapaVida}` : ""}
                  </p>
                  {ultima && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      Último: {ultima.titulo} ({ultima.fecha})
                    </p>
                  )}
                </div>
                <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                  Ver historia
                  <ChevronRight className="h-4 w-4" />
                </span>
              </button>
            )
          })}
          {mascotas.length === 0 && (
            <p className="py-4 text-center text-muted-foreground">
              Este cliente todavía no tiene mascotas cargadas.
            </p>
          )}
          <Button size="lg" onClick={onNuevaMascota} className="h-14 gap-2 text-base">
            <Plus className="h-5 w-5" />
            Registrar nueva mascota
          </Button>
        </div>
      </div>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="h-16 text-lg"
          autoFocus
        />
        <Button
          size="lg"
          onClick={onNuevo}
          className="h-16 shrink-0 gap-3 px-8 text-lg font-bold shadow-md sm:min-w-[230px]"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
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
                {m.etapaVida ? ` · ${m.etapaVida}` : ""}
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
  const [etapa, setEtapa] = useState<EtapaVida | "">("")
  const [raza, setRaza] = useState("")

  const guardar = () => {
    if (!nombre.trim() || !especie) return
    const mascota = clinic.addMascota({
      nombre: nombre.trim(),
      especie,
      raza: raza.trim() || undefined,
      etapaVida: etapa || undefined,
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
          <SelectorEspecie value={especie} onChange={setEspecie} />
        </Campo>
        <Campo label="Etapa de vida">
          <SelectorEtapa value={etapa} onChange={setEtapa} />
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
          {accion === "consulta" && <FormConsulta mascota={mascota} onListo={onListo} />}
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

const motivosFrecuentes = [
  "Control / Revisación",
  "No come / Decaído",
  "Vómitos / Diarrea",
  "Herida / Golpe",
  "Piel / Rascado",
]

function FormConsulta({
  mascota,
  onListo,
}: {
  mascota: Mascota
  onListo: (titulo: string, detalle: string) => void
}) {
  const clinic = useClinic()
  const [motivo, setMotivo] = useState("")
  const [otroActivo, setOtroActivo] = useState(false)
  const [otro, setOtro] = useState("")
  const [peso, setPeso] = useState("")
  const [diagnostico, setDiagnostico] = useState("")
  const [indicaciones, setIndicaciones] = useState("")
  const [proximoControl, setProximoControl] = useState("")

  const motivoFinal = otroActivo ? otro.trim() : motivo

  const guardar = () => {
    if (!motivoFinal) return
    clinic.addConsulta({
      mascotaId: mascota.id,
      motivo: motivoFinal,
      peso: peso.trim() || undefined,
      diagnostico: diagnostico.trim() || undefined,
      indicaciones: indicaciones.trim() || undefined,
      proximoControl: proximoControl || undefined,
    })
    onListo("¡Consulta registrada!", `Quedó en la historia de ${mascota.nombre}.`)
  }

  return (
    <Card className="space-y-5 p-6">
      <Campo label="¿Por qué viene?" requerido>
        <div className="flex flex-wrap gap-3">
          {motivosFrecuentes.map((m) => (
            <Opcion
              key={m}
              activo={!otroActivo && motivo === m}
              onClick={() => {
                setOtroActivo(false)
                setMotivo(m)
              }}
            >
              {m}
            </Opcion>
          ))}
          <Opcion activo={otroActivo} onClick={() => setOtroActivo(true)}>
            Otro…
          </Opcion>
        </div>
        {otroActivo && (
          <Input
            value={otro}
            onChange={(e) => setOtro(e.target.value)}
            placeholder="Escribí el motivo"
            className="mt-3 h-12 text-base"
            autoFocus
          />
        )}
      </Campo>
      <Campo label="Peso (kg)">
        <Input
          type="number"
          inputMode="decimal"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          placeholder="Ej: 28.5"
          className="h-12 text-base"
        />
      </Campo>
      <Campo label="Diagnóstico (opcional)">
        <Input
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
          placeholder="Ej: Otitis externa"
          className="h-12 text-base"
        />
      </Campo>
      <Campo label="Indicaciones (opcional)">
        <Textarea
          value={indicaciones}
          onChange={(e) => setIndicaciones(e.target.value)}
          placeholder="Ej: Limpiar el oído 2 veces por día durante 7 días"
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
      <Button size="lg" onClick={guardar} disabled={!motivoFinal} className="h-14 w-full text-base">
        <Check className="h-5 w-5" />
        Guardar en la historia
      </Button>
    </Card>
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
  const [vacunas, setVacunas] = useState<string[]>([])
  const [proxima, setProxima] = useState("")

  const toggle = (v: string) =>
    setVacunas((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))

  const guardar = () => {
    if (vacunas.length === 0) return
    vacunas.forEach((v) =>
      clinic.addVacuna({ mascotaId: mascota.id, vacuna: v, fechaAplicada: hoy(), proximaFecha: proxima || undefined }),
    )
    const titulo = vacunas.length === 1 ? "¡Vacuna registrada!" : "¡Vacunas registradas!"
    const detalle =
      vacunas.length === 1
        ? `${vacunas[0]} quedó en la historia de ${mascota.nombre}.`
        : `${vacunas.length} vacunas (${vacunas.join(", ")}) quedaron en la historia de ${mascota.nombre}.`
    onListo(titulo, detalle)
  }

  return (
    <Card className="space-y-5 p-6">
      <Campo label="¿Qué vacunas le pusiste?" requerido>
        <p className="-mt-1 text-sm text-muted-foreground">Podés elegir varias 👇</p>
        <div className="flex flex-wrap gap-3">
          {configuracion.tiposVacunas.map((v) => (
            <Opcion key={v} activo={vacunas.includes(v)} onClick={() => toggle(v)}>
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
      <Button size="lg" onClick={guardar} disabled={vacunas.length === 0} className="h-14 w-full text-base">
        <Check className="h-5 w-5" />
        Guardar {vacunas.length > 0 ? `${vacunas.length} ` : ""}en la historia
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
  const [diagnosticos, setDiagnosticos] = useState<string[]>([])
  const [otroActivo, setOtroActivo] = useState(false)
  const [otro, setOtro] = useState("")
  const [medicamento, setMedicamento] = useState("")
  const [indicaciones, setIndicaciones] = useState("")
  const [proximoControl, setProximoControl] = useState("")

  const toggle = (t: string) =>
    setDiagnosticos((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  // Lista final: chips elegidos + lo escrito en "Otro" (si está activo y tiene texto)
  const seleccionados = [...diagnosticos, ...(otroActivo && otro.trim() ? [otro.trim()] : [])]

  const guardar = () => {
    if (seleccionados.length === 0) return
    // Un tratamiento por cada cosa elegida, así cada uno se controla por separado.
    seleccionados.forEach((d) =>
      clinic.addTratamiento({
        mascotaId: mascota.id,
        diagnostico: d,
        medicamento: medicamento.trim() || undefined,
        indicaciones: indicaciones.trim() || undefined,
        proximoControl: proximoControl || undefined,
      }),
    )
    const titulo = seleccionados.length === 1 ? "¡Tratamiento cargado!" : "¡Tratamientos cargados!"
    const detalle =
      seleccionados.length === 1
        ? `Quedó activo en la historia de ${mascota.nombre} y se controla desde acá.`
        : `${seleccionados.length} tratamientos (${seleccionados.join(", ")}) quedaron activos en la historia de ${mascota.nombre}.`
    onListo(titulo, detalle)
  }

  return (
    <Card className="space-y-5 p-6">
      <Campo label="¿Qué tratamiento(s)?" requerido>
        <p className="-mt-1 text-sm text-muted-foreground">Podés elegir varios 👇</p>
        <div className="flex flex-wrap gap-3">
          {tratamientosFrecuentes.map((t) => (
            <Opcion key={t} activo={diagnosticos.includes(t)} onClick={() => toggle(t)}>
              {t}
            </Opcion>
          ))}
          <Opcion activo={otroActivo} onClick={() => setOtroActivo((v) => !v)}>
            Otro…
          </Opcion>
        </div>
        {otroActivo && (
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
      <Button
        size="lg"
        onClick={guardar}
        disabled={seleccionados.length === 0}
        className="h-14 w-full text-base"
      >
        <Check className="h-5 w-5" />
        Guardar {seleccionados.length > 1 ? `${seleccionados.length} ` : ""}en la historia
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

function MascotaHistoria({ mascotaId, onVolver }: { mascotaId: number; onVolver: () => void }) {
  const clinic = useClinic()
  const mascota = clinic.mascotas.find((m) => m.id === mascotaId)
  const items = clinic.historialDeMascota(mascotaId)

  if (!mascota) return null

  return (
    <div className="space-y-6">
      <Encabezado titulo={`Historia de ${mascota.nombre}`} onVolver={onVolver} />

      {/* Ficha resumida de la mascota */}
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PawPrint className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">{mascota.nombre}</p>
            <p className="text-sm text-muted-foreground">
              {mascota.especie}
              {mascota.raza ? ` · ${mascota.raza}` : ""}
              {mascota.etapaVida ? ` · ${mascota.etapaVida}` : ""}
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>
            Dueño: <span className="font-medium text-foreground">{mascota.dueno}</span>
          </p>
          {mascota.peso && (
            <p>
              Peso: <span className="font-medium text-foreground">{mascota.peso} kg</span>
            </p>
          )}
        </div>
      </Card>

      {/* Línea de tiempo */}
      {items.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
          Todavía no hay registros en la historia de {mascota.nombre}.
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((h) => {
            const Icono = iconoHistorial[h.tipo] ?? FileText
            return (
              <Card key={h.id} className="flex gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icono className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{h.titulo}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{h.fecha}</span>
                  </div>
                  {h.detalle && <p className="mt-0.5 text-sm text-muted-foreground">{h.detalle}</p>}
                  {h.veterinario && <p className="mt-0.5 text-xs text-muted-foreground">{h.veterinario}</p>}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
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
