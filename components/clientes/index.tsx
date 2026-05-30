"use client"

import { useState } from "react"
import Link from "next/link"
import {
  FileHeart,
  Mail,
  MapPin,
  MessageCircle,
  PawPrint,
  Phone,
  Pill,
  Plus,
  Scissors,
  Search,
  Stethoscope,
  Syringe,
  UserPlus,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NewClientDialog } from "@/components/clientes/new-client-dialog"
import { clientes, mascotas } from "@/lib/mock-data"

type Client = (typeof clientes)[number]

export function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCliente, setSelectedCliente] = useState<Client>(clientes[0])

  const filteredClientes = clientes.filter((cliente) => {
    const term = searchTerm.toLowerCase().trim()
    const clienteMascotas = mascotas.filter((mascota) => cliente.mascotas.includes(mascota.id))

    return (
      !term ||
      cliente.nombre.toLowerCase().includes(term) ||
      cliente.telefono.toLowerCase().includes(term) ||
      cliente.email.toLowerCase().includes(term) ||
      clienteMascotas.some((mascota) => mascota.nombre.toLowerCase().includes(term))
    )
  })

  const mascotasCliente = mascotas.filter((mascota) => selectedCliente.mascotas.includes(mascota.id))

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <Users className="h-4 w-4" />
            Clientes y mascotas
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="max-w-2xl text-muted-foreground">
              Gestiona dueños, mascotas vinculadas y accesos a historia clinica desde un solo lugar.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <NewClientDialog
          trigger={
            <Button className="h-20 w-full max-w-xl rounded-xl bg-primary px-8 text-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 sm:text-2xl">
              <UserPlus className="mr-3 h-7 w-7" />
              Nuevo cliente
            </Button>
          }
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Ingresar cliente
            </CardTitle>
            <CardDescription>Busca por cliente, telefono, email o nombre de mascota.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-11 pl-10"
                placeholder="Buscar cliente o mascota..."
              />
            </div>

            <div className="space-y-2">
              {filteredClientes.map((cliente) => {
                const clienteMascotas = mascotas.filter((mascota) => cliente.mascotas.includes(mascota.id))
                const isSelected = selectedCliente.id === cliente.id

                return (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => setSelectedCliente(cliente)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      isSelected ? "border-primary/40 bg-primary/5" : "bg-card hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {cliente.nombre.split(" ").map((part) => part[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{cliente.nombre}</p>
                        <p className="text-sm text-muted-foreground">{cliente.telefono}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {clienteMascotas.map((mascota) => (
                            <Badge key={mascota.id} variant="outline" className="text-xs">
                              {mascota.nombre}
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

        <div className="space-y-5">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedCliente.nombre}</CardTitle>
                  <CardDescription>Ficha del cliente y mascotas vinculadas</CardDescription>
                </div>
                <Button className="h-14 rounded-xl bg-primary px-5 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90">
                  <PawPrint className="mr-2 h-5 w-5" />
                  Agregar mascota
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ContactItem icon={Phone} label="Telefono" value={selectedCliente.telefono} />
              <ContactItem icon={Mail} label="Email" value={selectedCliente.email} />
              <ContactItem icon={MapPin} label="Direccion" value={selectedCliente.direccion} />
              <ContactItem
                icon={MessageCircle}
                label="WhatsApp"
                value={selectedCliente.consentimientoWhatsApp ? "Habilitado" : "Sin consentimiento"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-primary" />
                Mascotas asociadas
              </CardTitle>
              <CardDescription>
                Desde cada mascota se accede a ficha clinica, vacunas, tratamientos y cirugías.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-2">
                {mascotasCliente.map((mascota) => (
                  <article key={mascota.id} className="rounded-lg border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {mascota.nombre[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{mascota.nombre}</h3>
                          <Badge variant="outline">{mascota.estadoGeneral}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {mascota.especie} - {mascota.raza} - {mascota.edad}
                        </p>
                        <p className="mt-2 text-sm">
                          Ultimo diagnostico: <span className="font-medium">{mascota.ultimoDiagnostico}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <Button className="h-12 justify-center rounded-xl bg-primary px-4 font-bold hover:bg-primary/90" asChild>
                        <Link href={`/mascotas/${mascota.id}`}>
                          <FileHeart className="mr-2 h-4 w-4" />
                          Ficha
                        </Link>
                      </Button>
                      <Button className="h-12 justify-center rounded-xl bg-primary px-4 font-bold hover:bg-primary/90" asChild>
                        <Link href={`/vacunas/registrar?clienteId=${selectedCliente.id}&mascotaId=${mascota.id}`}>
                          <Syringe className="mr-2 h-4 w-4" />
                          Vacunas
                        </Link>
                      </Button>
                      <Button className="h-12 justify-center rounded-xl bg-primary px-4 font-bold hover:bg-primary/90" asChild>
                        <Link href={`/tratamientos/registrar?clienteId=${selectedCliente.id}&mascotaId=${mascota.id}`}>
                          <Pill className="mr-2 h-4 w-4" />
                          Tratamientos
                        </Link>
                      </Button>
                      <Button className="h-12 justify-center rounded-xl bg-primary px-4 font-bold hover:bg-primary/90" asChild>
                        <Link href={`/cirugias/agendar?clienteId=${selectedCliente.id}&mascotaId=${mascota.id}`}>
                          <Scissors className="mr-2 h-4 w-4" />
                          Cirugías
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-primary">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Atencion rapida del cliente seleccionado</p>
                  <p className="text-sm text-muted-foreground">
                    Elegi una mascota y carga lo ocurrido desde el modulo clinico correspondiente.
                  </p>
                </div>
              </div>
              <Button className="h-12 bg-primary px-5 font-bold hover:bg-primary/90" asChild>
                <Link href="/tratamientos">Iniciar carga clinica</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input placeholder={placeholder} />
    </div>
  )
}

function ContactItem({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/25 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  )
}
