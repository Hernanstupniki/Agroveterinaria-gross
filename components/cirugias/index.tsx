"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { AlertTriangle, CalendarClock, Clock, ClipboardList, Plus, RotateCcw, Scissors, Settings, ShieldCheck, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ClinicalActionFlow } from "@/components/clinical/action-flow"
import { cirugias, clientes, mascotas, profesionales } from "@/lib/mock-data"

const scheduledStates = ["Programada", "Pendiente confirmacion", "Pendiente confirmación", "En preparacion", "En preparación", "Reprogramada"]

const surgeryProtocols = [
  {
    id: "castracion",
    name: "Castración",
    duration: "45 a 60 minutos",
    requirements: "Ayuno, consentimiento informado y control prequirurgico.",
    indications: "Verificar edad, peso, estado general y medicacion actual.",
    postop: "Control de herida, analgesia y retiro de puntos si corresponde.",
  },
  {
    id: "limpieza-dental",
    name: "Limpieza dental",
    duration: "60 minutos",
    requirements: "Evaluacion anestesica y revision oral previa.",
    indications: "Registrar piezas comprometidas y posible extraccion.",
    postop: "Control de dolor, dieta blanda y reevaluacion oral.",
  },
  {
    id: "extraccion",
    name: "Extracción",
    duration: "30 a 90 minutos",
    requirements: "Diagnostico, imagen si corresponde y consentimiento.",
    indications: "Definir pieza/tejido, riesgo y medicacion indicada.",
    postop: "Seguimiento de cicatrizacion y signos de alarma.",
  },
  {
    id: "cirugia-menor",
    name: "Cirugía menor",
    duration: "30 a 45 minutos",
    requirements: "Evaluacion clinica, antisepsia y consentimiento.",
    indications: "Registrar zona, tecnica y materiales.",
    postop: "Control local y recordatorio de revision.",
  },
]

const statusStyles: Record<string, string> = {
  Programada: "bg-primary text-primary-foreground",
  "Pendiente confirmación": "bg-warning text-warning-foreground",
  "Pendiente confirmacion": "bg-warning text-warning-foreground",
  "En preparación": "bg-secondary text-secondary-foreground",
  "En preparacion": "bg-secondary text-secondary-foreground",
  Realizada: "bg-success text-success-foreground",
  Cancelada: "bg-destructive text-destructive-foreground",
  Reprogramada: "bg-muted text-muted-foreground",
}

function isScheduled(status: string) {
  const normalized = status.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return scheduledStates.some((state) => state.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalized)
}

export default function CirugiasScreen() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            <Scissors className="h-4 w-4" />
            Cirugías
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-normal">Que queres hacer con cirugías?</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Agenda, pendientes, registro de cirugías ya agendadas y protocolos quirúrgicos en pantallas separadas.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard
          icon={CalendarClock}
          title="Agendar cirugía"
          description="Crear el evento quirúrgico antes de registrar la realización."
          buttonLabel="Agendar cirugía"
          href="/cirugias/agendar"
        />
        <ActionCard
          icon={ClipboardList}
          title="Cirugías pendientes"
          description="Ver agendadas, próximas, en preparación o reprogramadas."
          buttonLabel="Ver pendientes"
          href="/cirugias/pendientes"
        />
        <ActionCard
          icon={ShieldCheck}
          title="Registrar cirugía agendada"
          description="Registrar como realizada solo si existe agenda previa."
          buttonLabel="Registrar cirugía"
          href="/cirugias/registrar"
        />
        <ActionCard
          icon={Settings}
          title="Protocolos de cirugía"
          description="Configurar procedimientos frecuentes y criterios clínicos."
          buttonLabel="Abrir protocolos"
          href="/cirugias/esquemas"
        />
      </div>
    </div>
  )
}

export function ScheduleSurgeryFlow() {
  return (
    <ClinicalActionFlow
      title="Agendar cirugía"
      description="Elegí cliente y mascota para crear un turno quirúrgico antes del registro."
      actionLabel="Agendar cirugía"
      icon={Scissors}
    >
      {({ client, pet }) => <ScheduleSurgeryForm key={pet.id} client={client} pet={pet} />}
    </ClinicalActionFlow>
  )
}

export function RegisterScheduledSurgeryFlow() {
  return (
    <ClinicalActionFlow
      title="Registrar cirugía agendada"
      description="Seleccioná una cirugía ya agendada para marcarla como realizada."
      actionLabel="Registrar cirugía"
      icon={ShieldCheck}
    >
      {({ client, pet }) => {
        const petSurgeries = cirugias.filter((cirugia) => cirugia.mascotaId === pet.id)
        const scheduledSurgeries = petSurgeries.filter((cirugia) => isScheduled(cirugia.estado))

        return (
          <Card className={scheduledSurgeries.length ? "border-success/25 bg-success/5" : "border-destructive/30 bg-destructive/5"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {scheduledSurgeries.length ? (
                  <ShieldCheck className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                Registrar cirugía ya agendada
              </CardTitle>
              <CardDescription>
                Cliente: {client.nombre}. Mascota: {pet.nombre}. La agenda quirúrgica es obligatoria.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledSurgeries.length > 0 ? (
                scheduledSurgeries.map((cirugia) => (
                  <div key={cirugia.id} className="rounded-lg border bg-card p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold">{cirugia.tipo}</p>
                        <p className="text-sm text-muted-foreground">
                          Turno quirúrgico: {cirugia.fecha} - {cirugia.hora}
                        </p>
                      </div>
                      <Button className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90" asChild>
                        <Link href="/">Registrar realizada y volver al inicio</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-destructive/30 bg-background p-4">
                  <p className="font-semibold text-destructive">
                    Para registrar una cirugía primero debe estar agendada.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Usá Agendar cirugía para crear el turno quirúrgico de {pet.nombre}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      }}
    </ClinicalActionFlow>
  )
}

export function PendingSurgeries() {
  const pendingSurgeries = cirugias.filter((cirugia) => isScheduled(cirugia.estado))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Cirugías pendientes
        </CardTitle>
        <CardDescription>
          Agendadas, próximas, en preparación y reprogramadas con acciones clínicas directas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 xl:grid-cols-2">
          {pendingSurgeries.map((cirugia) => {
            const pet = mascotas.find((item) => item.id === cirugia.mascotaId)
            const client = pet ? clientes.find((item) => item.id === pet.clienteId) : null

            return (
              <article key={cirugia.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{cirugia.tipo}</h3>
                      <Badge className={statusStyles[cirugia.estado] || "bg-muted"}>{cirugia.estado}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {client?.nombre || cirugia.dueno} - {pet?.nombre || cirugia.mascota}
                    </p>
                  </div>
                  <Badge variant="outline">{cirugia.fecha} - {cirugia.hora}</Badge>
                </div>

                <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
                  <Info label="Cliente" value={client?.nombre || cirugia.dueno} />
                  <Info label="Mascota" value={pet?.nombre || cirugia.mascota} />
                  <Info label="Veterinario" value={cirugia.veterinario} />
                  <Info label="Estado" value={cirugia.estado} />
                  <Info label="Consentimiento" value={cirugia.consentimiento.firmado ? "Firmado" : "Pendiente"} />
                  <Info label="Observaciones" value={cirugia.prequirurgico?.observaciones || "A completar"} />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <Button className="h-12 rounded-xl bg-primary font-bold hover:bg-primary/90" asChild>
                    <Link href={`/cirugias/registrar?clienteId=${client?.id || ""}&mascotaId=${pet?.id || ""}`}>
                      Registrar como realizada
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-12 rounded-xl font-bold">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reprogramar
                  </Button>
                  <Button variant="destructive" className="h-12 rounded-xl font-bold">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function SurgeryProtocols() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Protocolos de cirugía
        </CardTitle>
        <CardDescription>
          Configuración del sistema para procedimientos frecuentes, requisitos y seguimiento postoperatorio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Nombre del procedimiento" placeholder="Ej: Castración" />
            <Field label="Duración estimada" placeholder="Ej: 45 minutos" />
            <Field label="Requisitos previos" placeholder="Ayuno, estudios, consentimiento..." />
            <Field label="Controles posteriores" placeholder="Ej: control a 48 hs y 7 días" />
          </div>
          <div className="mt-4 space-y-2">
            <Label>Indicaciones y observaciones</Label>
            <Textarea className="bg-background" placeholder="Indicaciones prequirúrgicas, materiales, alertas y seguimiento..." />
          </div>
          <Button className="mt-4 h-14 rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Crear protocolo de cirugía
          </Button>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {surgeryProtocols.map((protocol) => (
            <article key={protocol.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{protocol.name}</h3>
                <Badge className="bg-success text-success-foreground">Activo</Badge>
              </div>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <Info label="Duración" value={protocol.duration} />
                <Info label="Requisitos" value={protocol.requirements} />
                <Info label="Indicaciones" value={protocol.indications} />
                <Info label="Postoperatorio" value={protocol.postop} />
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ScheduleSurgeryForm({
  client,
  pet,
}: {
  client: { nombre: string }
  pet: { nombre: string; especie: string }
}) {
  const veterinarios = profesionales.filter((profesional) => profesional.rol === "Veterinario")

  return (
    <Card className="border-primary/30 bg-primary/5 shadow-sm">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Plus className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl">Agendar cirugía</CardTitle>
        <CardDescription>Crea el evento de agenda antes de permitir el registro quirúrgico.</CardDescription>
      </CardHeader>
      <CardContent className="mx-auto grid w-full max-w-5xl gap-4">
        <div className="rounded-lg border bg-background p-3 text-sm">
          <p className="font-semibold">{client.nombre}</p>
          <p className="text-muted-foreground">
            {pet.nombre} - {pet.especie}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Tipo de cirugía" placeholder="Ej: Castración, extirpación, limpieza dental" />
          <Field label="Veterinario" placeholder={veterinarios.map((veterinario) => veterinario.nombre).join(" / ")} />
          <Field label="Fecha" placeholder="AAAA-MM-DD" />
          <Field label="Hora" placeholder="HH:MM" />
          <Field label="Duración estimada" placeholder="Ej: 45 minutos" />
          <Field label="Riesgo" placeholder="Bajo / Moderado / Alto" />
        </div>
        <div className="space-y-2">
          <Label>Notas preoperatorias</Label>
          <Textarea placeholder="Ayuno, estudios requeridos, consentimiento, observaciones..." />
        </div>

        <div className="rounded-lg border border-primary/20 bg-background p-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-primary">
            <Clock className="h-4 w-4" />
            Estado inicial: agendada
          </div>
          <p className="mt-1 text-muted-foreground">
            Luego se podrá pasar a en preparación, realizada, cancelada o reprogramada.
          </p>
        </div>

        <Button className="h-14 w-full bg-primary text-base font-bold hover:bg-primary/90" asChild>
          <Link href="/">Agendar cirugía y volver al inicio</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function ActionCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  href,
}: {
  icon: LucideIcon
  title: string
  description: string
  buttonLabel: string
  href: string
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
        <CardContent className="flex h-full flex-col gap-5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="mt-auto flex h-14 items-center justify-center rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground group-hover:bg-primary/90">
            {buttonLabel}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input className="bg-background" placeholder={placeholder} />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/35 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  )
}
