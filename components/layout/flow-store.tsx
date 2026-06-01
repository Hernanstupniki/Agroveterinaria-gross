"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { clientes as mockClientes, mascotas as mockMascotas } from "@/lib/mock-data"

// Minimal shape for the selector — extends mock types
type Cliente = (typeof mockClientes)[number]
type Mascota = (typeof mockMascotas)[number]

interface FlowStore {
  clientes: Cliente[]
  mascotas: Mascota[]
  addCliente: (data: {
    nombre: string
    telefono: string
    whatsapp: string
    direccion: string
    observaciones: string
    consentimientoWhatsApp: boolean
  }) => number
  addMascota: (data: {
    nombre: string
    especie: string
    raza: string
    sexo: string
    fechaNacimiento: string
    peso: string
    estadoGeneral: string
    alergias: string
    antecedentes: string
    clienteId: number
    dueno: string
  }) => number
}

const Ctx = createContext<FlowStore | null>(null)

export function FlowStoreProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes)
  const [mascotas, setMascotas] = useState<Mascota[]>(mockMascotas)

  const addCliente: FlowStore["addCliente"] = (data) => {
    const newId = Math.max(...clientes.map((c) => c.id)) + 1
    const nuevo: Cliente = {
      id: newId,
      nombre: data.nombre,
      telefono: data.telefono,
      whatsapp: data.whatsapp,
      direccion: data.direccion,
      email: "",
      mascotas: [],
      observaciones: data.observaciones,
      consentimientoWhatsApp: data.consentimientoWhatsApp,
    }
    setClientes((prev) => [nuevo, ...prev])
    return newId
  }

  const addMascota: FlowStore["addMascota"] = (data) => {
    const newId = Math.max(...mascotas.map((m) => m.id)) + 1
    const nuevo: Mascota = {
      id: newId,
      nombre: data.nombre,
      especie: data.especie,
      raza: data.raza,
      fechaNacimiento: data.fechaNacimiento,
      edad: "Recién registrado",
      sexo: data.sexo,
      peso: data.peso,
      color: "",
      clienteId: data.clienteId,
      dueno: data.dueno,
      estadoGeneral: data.estadoGeneral,
      chip: "",
      esterilizado: false,
      alergias: data.alergias ? data.alergias.split(",").map((s) => s.trim()) : [],
      antecedentes: data.antecedentes,
      ultimaConsulta: "-",
      ultimoDiagnostico: "-",
      foto: null,
    }
    setMascotas((prev) => [nuevo, ...prev])
    // Update the client's mascotas list
    setClientes((prev) =>
      prev.map((c) => (c.id === data.clienteId ? { ...c, mascotas: [...c.mascotas, newId] } : c)),
    )
    return newId
  }

  return <Ctx.Provider value={{ clientes, mascotas, addCliente, addMascota }}>{children}</Ctx.Provider>
}

export function useFlowStore(): FlowStore {
  const ctx = useContext(Ctx)
  if (!ctx) {
    // Fallback outside provider (e.g. section pages before provider wraps them)
    return {
      clientes: mockClientes,
      mascotas: mockMascotas,
      addCliente: () => 0,
      addMascota: () => 0,
    }
  }
  return ctx
}
