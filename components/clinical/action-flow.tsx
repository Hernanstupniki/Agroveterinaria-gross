"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { ArrowLeft, ClipboardList, FileText, PawPrint, Search, UserPlus, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { clientes, mascotas } from "@/lib/mock-data"
import { getMascotaData, type MascotaData } from "@/lib/mascota-store"

type Client = (typeof clientes)[number]
export type ClinicalActionSelection = { client: Client; pet: MascotaData }

interface ClinicalActionFlowProps {
  title: string
  description: string
  actionLabel: string
  icon: LucideIcon
  children: (selection: ClinicalActionSelection) => ReactNode
}

export function ClinicalActionFlow({
  title,
  description,
  actionLabel,
  icon: Icon,
  children,
}: ClinicalActionFlowProps) {
  const searchParams = useSearchParams()
  const initialClientId = Number(searchParams.get("clienteId"))
  const initialPetId = Number(searchParams.get("mascotaId"))
  const initialClient = clientes.some((client) => client.id === initialClientId) ? initialClientId : null
  const initialPet = mascotas.some((pet) => pet.id === initialPetId && (!initialClient || pet.clienteId === initialClient))
    ? initialPetId
    : null
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<number | null>(initialClient)
  const [selectedPetId, setSelectedPetId] = useState<number | null>(initialPet)

  const selectedClient = clientes.find((client) => client.id === selectedClientId) || null
  const selectedPetRaw = mascotas.find((pet) => pet.id === selectedPetId) || null
  const selectedPet = selectedPetRaw ? getMascotaData(selectedPetRaw.id) : null

  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return clientes

    return clientes.filter((client) => {
      const clientPets = mascotas.filter((pet) => client.mascotas.includes(pet.id))
      return (
        client.nombre.toLowerCase().includes(term) ||
        client.telefono.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        clientPets.some((pet) => pet.nombre.toLowerCase().includes(term))
      )
    })
  }, [searchTerm])

  const selectedClientPets = selectedClient
    ? mascotas.filter((pet) => selectedClient.mascotas.includes(pet.id))
    : []

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <Icon className="h-4 w-4" />
            Flujo guiado
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="max-w-2xl text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button variant="outline" className="h-12 rounded-xl px-4 text-center font-semibold leading-tight" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <FlowStep active={!selectedClient} done={Boolean(selectedClient)} number="1" label="Elegir cliente" />
        <FlowStep active={Boolean(selectedClient && !selectedPet)} done={Boolean(selectedPet)} number="2" label="Elegir mascota" />
        <FlowStep active={Boolean(selectedClient && selectedPet)} done={false} number="3" label={actionLabel} />
      </div>

      {!selectedClient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Buscar cliente o mascota
            </CardTitle>
            <CardDescription>
              Seleccioná un cliente existente. Si no está cargado, podés ir a Clientes y crearlo con sus mascotas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Button className="min-h-14 rounded-2xl bg-primary px-7 py-4 text-center text-base font-bold leading-tight text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90" asChild>
                <Link href="/clientes/agregar">
                  <UserPlus className="mr-2 h-5 w-5 shrink-0" />
                  Crear cliente con mascota
                </Link>
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-12 pl-10"
                placeholder="Buscar por cliente, teléfono, email o mascota..."
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredClients.map((client) => {
                const clientPets = mascotas.filter((pet) => client.mascotas.includes(pet.id))

                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      setSelectedClientId(client.id)
                      setSelectedPetId(null)
                    }}
                    className="rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {client.nombre.split(" ").map((part) => part[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{client.nombre}</p>
                        <p className="text-sm text-muted-foreground">{client.telefono}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {clientPets.map((pet) => (
                            <Badge key={pet.id} variant="outline" className="text-xs">
                              {pet.nombre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

          </CardContent>
        </Card>
      )}

      {selectedClient && !selectedPet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-primary" />
              Mascotas de {selectedClient.nombre}
            </CardTitle>
            <CardDescription>Elegí la mascota sobre la que vas a cargar la acción clínica.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <Button variant="outline" className="min-h-14 rounded-2xl px-7 py-4 text-center text-base font-bold leading-tight" onClick={() => setSelectedClientId(null)}>
                Cambiar cliente
              </Button>
              <Button className="min-h-14 rounded-2xl bg-primary px-7 py-4 text-center text-base font-bold leading-tight hover:bg-primary/90" asChild>
                <Link href={`/clientes/agregar?clienteId=${selectedClient.id}`}>
                  <PawPrint className="mr-2 h-5 w-5 shrink-0" />
                  Agregar mascota a este cliente
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {selectedClientPets.map((pet) => (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => setSelectedPetId(pet.id)}
                  className="rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {pet.nombre[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{pet.nombre}</p>
                      <p className="text-sm text-muted-foreground">{pet.especie} · {pet.raza}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{pet.estadoGeneral}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

          </CardContent>
        </Card>
      )}

      {selectedClient && selectedPet && (
        <div className="space-y-4">
          <Card className="overflow-hidden border-primary/20 shadow-sm">
            <CardContent className="p-0">
              <div className="grid xl:grid-cols-[auto_1fr_auto] xl:items-center divide-y xl:divide-y-0 xl:divide-x">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/10">
                    <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                      {selectedPet.nombre[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold leading-tight">{selectedPet.nombre}</h2>
                      {selectedPet.estadoGeneral !== "Saludable" && (
                        <Badge className="rounded-full bg-destructive px-2 py-0 text-xs text-destructive-foreground">
                          {selectedPet.estadoGeneral}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedPet.especie} · {selectedPet.raza}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedPet.edad} · {selectedPet.sexo} · {selectedPet.peso} kg{selectedPet.esterilizado ? " · Esterilizado" : ""}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 space-y-1.5 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{selectedClient.nombre}</span>
                    {" · "}{selectedClient.telefono}
                  </p>
                  {(selectedPet.alergias.length > 0 || selectedPet.antecedentes.length > 0) && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPet.alergias.length > 0 && (
                        <span className="rounded-full border border-destructive/25 bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
                          Alergia: {selectedPet.alergias.join(", ")}
                        </span>
                      )}
                      {selectedPet.antecedentes.length > 0 && (
                        <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">
                          Antecedente: {selectedPet.antecedentes.join(", ")}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Última consulta:</span> {selectedPet.ultimaConsulta || "-"}
                    <span className="mx-1.5">·</span>
                    <span className="font-semibold text-foreground">Diagnóstico:</span> {selectedPet.ultimoDiagnostico || "-"}
                  </p>
                </div>

                <div className="flex flex-wrap xl:flex-col gap-2 px-4 py-3">
                  <Button size="sm" className="h-8 rounded-lg bg-primary px-3 text-xs font-bold hover:bg-primary/90" onClick={() => setSelectedPetId(null)}>
                    Cambiar mascota
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg px-3 text-xs font-semibold" asChild>
                    <a href={`/mascotas/${selectedPet.id}`} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-1.5 h-3.5 w-3.5" />
                      Ver ficha
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg px-3 text-xs font-semibold" asChild>
                    <Link href={`/historial-clinico/ver?clienteId=${selectedClient.id}&mascotaId=${selectedPet.id}`} target="_blank" rel="noopener noreferrer">
                      <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                      Historia clínica
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {children({ client: selectedClient, pet: selectedPet })}
        </div>
      )}
    </div>
  )
}

function FlowStep({ number, label, active, done }: { number: string; label: string; active: boolean; done: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 ${
        active || done ? "border-primary/30 bg-primary/5" : "bg-card"
      }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
          active || done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {number}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
