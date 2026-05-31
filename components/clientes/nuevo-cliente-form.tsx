"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, PawPrint, Plus, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { clientes } from "@/lib/mock-data"

interface PetFormData {
  nombre: string
  especie: string
  raza: string
  nacimiento: string
  peso: string
  sexo: string
  antecedentes: string
}

export function NuevoClienteForm() {
  const searchParams = useSearchParams()
  const selectedClientId = Number(searchParams.get("clienteId"))
  const selectedClient = clientes.find((client) => client.id === selectedClientId) || null
  const [nombre, setNombre] = useState(selectedClient?.nombre || "")
  const [telefono, setTelefono] = useState(selectedClient?.telefono || "")
  const [email, setEmail] = useState(selectedClient?.email || "")
  const [direccion, setDireccion] = useState(selectedClient?.direccion || "")
  const [petForms, setPetForms] = useState<PetFormData[]>([
    { nombre: "", especie: "", raza: "", nacimiento: "", peso: "", sexo: "", antecedentes: "" },
  ])

  function addPet() {
    setPetForms((forms) => [
      ...forms,
      { nombre: "", especie: "", raza: "", nacimiento: "", peso: "", sexo: "", antecedentes: "" },
    ])
  }

  function removePet(index: number) {
    setPetForms((forms) => forms.filter((_, i) => i !== index))
  }

  function updatePet(index: number, field: keyof PetFormData, value: string) {
    setPetForms((forms) =>
      forms.map((form, i) => (i === index ? { ...form, [field]: value } : form)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" className="h-11 rounded-xl px-4 font-bold" asChild>
          <Link href="/clientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Clientes
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            <UserPlus className="h-4 w-4" />
            {selectedClient ? "Agregar mascota" : "Nuevo cliente"}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-normal">
              {selectedClient ? `Agregar mascota a ${selectedClient.nombre}` : "Agregar cliente"}
            </h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              {selectedClient
                ? "El cliente queda preseleccionado para cargar una nueva mascota vinculada."
                : "Carga los datos del cliente y vincula sus mascotas en una sola operacion."}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Datos del cliente
          </CardTitle>
          <CardDescription>
            Informacion de contacto del dueno o responsable.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nombre del cliente</Label>
            <Input
              className="h-11 rounded-xl"
              placeholder="Ej: Maria Garcia"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Telefono / WhatsApp</Label>
            <Input
              className="h-11 rounded-xl"
              placeholder="(376) XXX XXXX"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              className="h-11 rounded-xl"
              placeholder="cliente@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Direccion</Label>
            <Input
              className="h-11 rounded-xl"
              placeholder="Direccion del cliente"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-primary" />
                Mascotas vinculadas
              </CardTitle>
              <CardDescription>
                La mascota se carga junto al cliente, sin ir a otro modulo.
              </CardDescription>
            </div>
            <Button
              type="button"
              className="h-12 rounded-xl bg-primary px-5 font-bold hover:bg-primary/90"
              onClick={addPet}
            >
              <Plus className="mr-2 h-4 w-4" />
              Otra mascota
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {petForms.map((pet, index) => (
            <div key={index} className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <PawPrint className="h-4 w-4" />
                  Mascota {index + 1}
                </div>
                {petForms.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive hover:text-destructive"
                    onClick={() => removePet(index)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Eliminar
                  </Button>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    className="h-10 rounded-xl"
                    placeholder="Ej: Luna"
                    value={pet.nombre}
                    onChange={(e) => updatePet(index, "nombre", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Especie</Label>
                  <Input
                    className="h-10 rounded-xl"
                    placeholder="Perro, gato..."
                    value={pet.especie}
                    onChange={(e) => updatePet(index, "especie", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Raza</Label>
                  <Input
                    className="h-10 rounded-xl"
                    placeholder="Raza"
                    value={pet.raza}
                    onChange={(e) => updatePet(index, "raza", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nacimiento</Label>
                  <Input
                    className="h-10 rounded-xl"
                    placeholder="AAAA-MM-DD"
                    value={pet.nacimiento}
                    onChange={(e) => updatePet(index, "nacimiento", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input
                    className="h-10 rounded-xl"
                    placeholder="Kg"
                    value={pet.peso}
                    onChange={(e) => updatePet(index, "peso", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Input
                    className="h-10 rounded-xl"
                    placeholder="Hembra / Macho"
                    value={pet.sexo}
                    onChange={(e) => updatePet(index, "sexo", e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label>Antecedentes o alertas</Label>
                <Textarea
                  className="rounded-xl"
                  placeholder="Alergias, antecedentes, observaciones clinicas..."
                  value={pet.antecedentes}
                  onChange={(e) => updatePet(index, "antecedentes", e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        className="h-14 w-full rounded-xl bg-primary px-6 text-base font-bold shadow-md shadow-primary/15 hover:bg-primary/90"
      >
        <UserPlus className="mr-2 h-5 w-5" />
        Guardar cliente y mascotas
      </Button>
    </div>
  )
}
