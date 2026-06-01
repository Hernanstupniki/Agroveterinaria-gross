"use client"

/**
 * Store clínico en memoria con persistencia en localStorage.
 *
 * Es la capa de datos del prototipo: se siembra desde lib/mock-data en el primer
 * arranque y todo lo que se carga (clientes, mascotas, vacunas, tratamientos,
 * cirugías, turnos e historial) queda guardado en el navegador.
 *
 * Está pensada para enchufarse a una base de datos real más adelante: las
 * operaciones (addCliente, addTratamiento, etc.) son el único punto de escritura,
 * así que reemplazar localStorage por llamadas a una API no toca la UI.
 */

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  clientes as seedClientes,
  mascotas as seedMascotas,
  turnosHoy as seedTurnos,
  tratamientosActivos as seedTratamientos,
  vacunasClinicas as seedVacunas,
  historialLuna,
} from "@/lib/mock-data"

const STORAGE_KEY = "agrovet-clinic-store-v1"

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface Cliente {
  id: number
  nombre: string
  telefono: string
  whatsapp?: string
  direccion?: string
  email?: string
  observaciones?: string
  mascotas: number[]
}

/**
 * Etapa de vida del animal (relevante para recordatorios y plan de vacunas).
 * Sigue el estándar AAHA/WSAVA: Cachorro → Joven → Adulto → Senior.
 * "Senior" reemplaza al término antiguo "geronte / geriátrico".
 */
export type EtapaVida = "Cachorro" | "Joven" | "Adulto" | "Senior"

export interface Mascota {
  id: number
  nombre: string
  especie: string
  raza?: string
  sexo?: string
  fechaNacimiento?: string
  edad?: string
  etapaVida?: EtapaVida
  peso?: string
  clienteId: number
  dueno: string
}

export type TipoHistorial = "Vacuna" | "Tratamiento" | "Cirugía" | "Consulta" | "Turno"

export interface HistorialEntry {
  id: number
  mascotaId: number
  fecha: string
  tipo: TipoHistorial
  titulo: string
  detalle?: string
  veterinario?: string
}

export type EstadoTratamiento = "Activo" | "Finalizado"

export interface Tratamiento {
  id: number
  mascotaId: number
  mascota: string
  diagnostico: string
  medicamento?: string
  dosis?: string
  frecuencia?: string
  duracion?: string
  indicaciones?: string
  fechaInicio: string
  proximoControl?: string
  veterinario?: string
  estado: EstadoTratamiento
}

export interface Consulta {
  id: number
  mascotaId: number
  mascota: string
  fecha: string
  motivo: string
  peso?: string
  diagnostico?: string
  indicaciones?: string
  proximoControl?: string
  veterinario?: string
}

export interface Vacuna {
  id: number
  mascotaId: number
  mascota: string
  dueno: string
  vacuna: string
  estado: "Aplicada" | "Próxima" | "Pendiente" | "Vencida"
  fechaAplicada?: string | null
  proximaFecha?: string | null
  veterinario?: string | null
  observaciones?: string
}

export type EstadoTurno = "Pendiente" | "Confirmado" | "En atención" | "Finalizado"

export interface Turno {
  id: number
  mascotaId: number
  mascota: string
  dueno: string
  fecha: string
  hora: string
  motivo: string
  profesional?: string
  estado: EstadoTurno
}

export type EstadoCirugia = "Programada" | "Pendiente confirmación" | "Realizada"

export interface Cirugia {
  id: number
  mascotaId: number
  mascota: string
  dueno: string
  tipo: string
  fecha: string
  hora: string
  veterinario?: string
  estado: EstadoCirugia
  turnoId: number | null
}

interface ClinicData {
  clientes: Cliente[]
  mascotas: Mascota[]
  historial: HistorialEntry[]
  consultas: Consulta[]
  tratamientos: Tratamiento[]
  vacunas: Vacuna[]
  turnos: Turno[]
  cirugias: Cirugia[]
}

// ---------------------------------------------------------------------------
// Siembra inicial desde mock-data
// ---------------------------------------------------------------------------

const hoy = () => new Date().toISOString().slice(0, 10)

function buildSeed(): ClinicData {
  const clientes: Cliente[] = seedClientes.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    telefono: c.telefono,
    whatsapp: c.whatsapp,
    direccion: c.direccion,
    email: c.email,
    observaciones: c.observaciones,
    mascotas: [...c.mascotas],
  }))

  const mascotas: Mascota[] = seedMascotas.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    especie: m.especie,
    raza: m.raza,
    sexo: m.sexo,
    fechaNacimiento: m.fechaNacimiento,
    edad: m.edad,
    peso: m.peso,
    clienteId: m.clienteId,
    dueno: m.dueno,
  }))

  // El historial mock sólo existe para Luna (id 1). Lo normalizamos.
  const historial: HistorialEntry[] = historialLuna.map((h, i) => ({
    id: i + 1,
    mascotaId: 1,
    fecha: h.fecha,
    tipo: (h.tipo as TipoHistorial) ?? "Consulta",
    titulo: h.motivo ?? h.procedimiento ?? h.vacuna ?? h.tipo,
    detalle: h.diagnostico ?? h.tratamiento ?? h.observaciones ?? undefined,
    veterinario: h.veterinario,
  }))

  const tratamientos: Tratamiento[] = seedTratamientos.map((t) => ({
    id: t.id,
    mascotaId: t.mascotaId,
    mascota: t.mascota,
    diagnostico: t.diagnostico,
    medicamento: t.medicamento,
    dosis: t.dosis,
    frecuencia: t.frecuencia,
    duracion: t.duracion,
    indicaciones: t.indicaciones,
    fechaInicio: t.fechaInicio,
    proximoControl: t.proximoControl ?? undefined,
    estado: (t.estado as EstadoTratamiento) ?? "Activo",
  }))

  const vacunas: Vacuna[] = seedVacunas.map((v) => ({
    id: typeof v.id === "string" ? parseInt(v.id.replace(/\D/g, ""), 10) : v.id,
    mascotaId: v.mascotaId,
    mascota: v.mascota,
    dueno: v.dueno,
    vacuna: v.vacuna,
    estado: v.estado,
    fechaAplicada: v.fechaAplicada,
    proximaFecha: v.proximaFecha,
    veterinario: v.veterinario,
    observaciones: v.observaciones,
  }))

  const turnos: Turno[] = seedTurnos.map((t) => ({
    id: t.id,
    mascotaId: t.mascotaId,
    mascota: t.mascota,
    dueno: t.dueno,
    fecha: hoy(),
    hora: t.hora,
    motivo: t.motivo,
    profesional: t.profesional,
    estado: (t.estado as EstadoTurno) ?? "Pendiente",
  }))

  return { clientes, mascotas, historial, consultas: [], tratamientos, vacunas, turnos, cirugias: [] }
}

function nextId(items: { id: number }[]): number {
  return items.reduce((max, it) => Math.max(max, it.id), 0) + 1
}

// ---------------------------------------------------------------------------
// Contexto
// ---------------------------------------------------------------------------

interface ClinicStore extends ClinicData {
  // Lecturas derivadas
  mascotasDeCliente: (clienteId: number) => Mascota[]
  historialDeMascota: (mascotaId: number) => HistorialEntry[]
  turnosDeMascota: (mascotaId: number) => Turno[]
  tieneTurnoAgendado: (mascotaId: number) => boolean

  // Escrituras
  addCliente: (data: { nombre: string; telefono: string; whatsapp?: string; direccion?: string; email?: string; observaciones?: string }) => Cliente
  addMascota: (data: { nombre: string; especie: string; raza?: string; sexo?: string; fechaNacimiento?: string; etapaVida?: EtapaVida; peso?: string; clienteId: number }) => Mascota
  addTurno: (data: { mascotaId: number; fecha: string; hora: string; motivo: string; profesional?: string }) => Turno
  addConsulta: (data: { mascotaId: number; motivo: string; peso?: string; diagnostico?: string; indicaciones?: string; proximoControl?: string; veterinario?: string }) => Consulta
  addVacuna: (data: { mascotaId: number; vacuna: string; fechaAplicada?: string; proximaFecha?: string; veterinario?: string; observaciones?: string }) => Vacuna
  addTratamiento: (data: { mascotaId: number; diagnostico: string; medicamento?: string; dosis?: string; frecuencia?: string; duracion?: string; indicaciones?: string; proximoControl?: string; veterinario?: string }) => Tratamiento
  /** Devuelve { ok: false } si la mascota no tiene un turno agendado. */
  addCirugia: (data: { mascotaId: number; tipo: string; fecha: string; hora: string; veterinario?: string }) => { ok: true; cirugia: Cirugia } | { ok: false; motivo: string }
  finalizarTratamiento: (id: number) => void
  resetStore: () => void
}

const Ctx = createContext<ClinicStore | null>(null)

export function ClinicStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ClinicData>(buildSeed)
  const [hydrated, setHydrated] = useState(false)

  // Cargar desde localStorage al montar (evita mismatch de SSR).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setData(JSON.parse(raw))
    } catch {
      /* ignorar datos corruptos: usamos la siembra */
    }
    setHydrated(true)
  }, [])

  // Persistir en cada cambio (una vez hidratado).
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* sin espacio / modo privado: seguimos en memoria */
    }
  }, [data, hydrated])

  const store = useMemo<ClinicStore>(() => {
    const mascotaNombre = (id: number) => data.mascotas.find((m) => m.id === id)?.nombre ?? ""
    const duenoDeMascota = (id: number) => data.mascotas.find((m) => m.id === id)?.dueno ?? ""

    return {
      ...data,

      mascotasDeCliente: (clienteId) => data.mascotas.filter((m) => m.clienteId === clienteId),
      historialDeMascota: (mascotaId) =>
        data.historial
          .filter((h) => h.mascotaId === mascotaId)
          .sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
      turnosDeMascota: (mascotaId) => data.turnos.filter((t) => t.mascotaId === mascotaId),
      tieneTurnoAgendado: (mascotaId) =>
        data.turnos.some((t) => t.mascotaId === mascotaId && t.estado !== "Finalizado"),

      addCliente: (d) => {
        const nuevo: Cliente = { id: nextId(data.clientes), mascotas: [], ...d }
        setData((prev) => ({ ...prev, clientes: [...prev.clientes, nuevo] }))
        return nuevo
      },

      addMascota: (d) => {
        const cliente = data.clientes.find((c) => c.id === d.clienteId)
        const nueva: Mascota = {
          id: nextId(data.mascotas),
          nombre: d.nombre,
          especie: d.especie,
          raza: d.raza,
          sexo: d.sexo,
          fechaNacimiento: d.fechaNacimiento,
          etapaVida: d.etapaVida,
          peso: d.peso,
          clienteId: d.clienteId,
          dueno: cliente?.nombre ?? "",
        }
        setData((prev) => ({
          ...prev,
          mascotas: [...prev.mascotas, nueva],
          clientes: prev.clientes.map((c) =>
            c.id === d.clienteId ? { ...c, mascotas: [...c.mascotas, nueva.id] } : c,
          ),
        }))
        return nueva
      },

      addTurno: (d) => {
        const nuevo: Turno = {
          id: nextId(data.turnos),
          mascotaId: d.mascotaId,
          mascota: mascotaNombre(d.mascotaId),
          dueno: duenoDeMascota(d.mascotaId),
          fecha: d.fecha,
          hora: d.hora,
          motivo: d.motivo,
          profesional: d.profesional,
          estado: "Confirmado",
        }
        setData((prev) => ({
          ...prev,
          turnos: [...prev.turnos, nuevo],
          historial: [
            ...prev.historial,
            {
              id: nextId(prev.historial),
              mascotaId: d.mascotaId,
              fecha: d.fecha,
              tipo: "Turno",
              titulo: `Turno agendado: ${d.motivo}`,
              detalle: `${d.fecha} ${d.hora}`,
              veterinario: d.profesional,
            },
          ],
        }))
        return nuevo
      },

      addConsulta: (d) => {
        const nueva: Consulta = {
          id: nextId(data.consultas),
          mascotaId: d.mascotaId,
          mascota: mascotaNombre(d.mascotaId),
          fecha: hoy(),
          motivo: d.motivo,
          peso: d.peso,
          diagnostico: d.diagnostico,
          indicaciones: d.indicaciones,
          proximoControl: d.proximoControl,
          veterinario: d.veterinario,
        }
        setData((prev) => ({
          ...prev,
          consultas: [...prev.consultas, nueva],
          // Si registraron peso en la consulta, actualizamos el de la mascota.
          mascotas: d.peso
            ? prev.mascotas.map((m) => (m.id === d.mascotaId ? { ...m, peso: d.peso } : m))
            : prev.mascotas,
          historial: [
            ...prev.historial,
            {
              id: nextId(prev.historial),
              mascotaId: d.mascotaId,
              fecha: nueva.fecha,
              tipo: "Consulta",
              titulo: `Consulta: ${d.motivo}`,
              detalle:
                [d.diagnostico, d.indicaciones, d.peso ? `Peso: ${d.peso} kg` : ""]
                  .filter(Boolean)
                  .join(" · ") || undefined,
              veterinario: d.veterinario,
            },
          ],
        }))
        return nueva
      },

      addVacuna: (d) => {
        const nueva: Vacuna = {
          id: nextId(data.vacunas),
          mascotaId: d.mascotaId,
          mascota: mascotaNombre(d.mascotaId),
          dueno: duenoDeMascota(d.mascotaId),
          vacuna: d.vacuna,
          estado: "Aplicada",
          fechaAplicada: d.fechaAplicada ?? hoy(),
          proximaFecha: d.proximaFecha ?? null,
          veterinario: d.veterinario ?? null,
          observaciones: d.observaciones,
        }
        setData((prev) => ({
          ...prev,
          vacunas: [...prev.vacunas, nueva],
          historial: [
            ...prev.historial,
            {
              id: nextId(prev.historial),
              mascotaId: d.mascotaId,
              fecha: nueva.fechaAplicada!,
              tipo: "Vacuna",
              titulo: `Vacuna aplicada: ${d.vacuna}`,
              detalle: d.proximaFecha ? `Próxima dosis: ${d.proximaFecha}` : undefined,
              veterinario: d.veterinario,
            },
          ],
        }))
        return nueva
      },

      addTratamiento: (d) => {
        const nuevo: Tratamiento = {
          id: nextId(data.tratamientos),
          mascotaId: d.mascotaId,
          mascota: mascotaNombre(d.mascotaId),
          diagnostico: d.diagnostico,
          medicamento: d.medicamento,
          dosis: d.dosis,
          frecuencia: d.frecuencia,
          duracion: d.duracion,
          indicaciones: d.indicaciones,
          fechaInicio: hoy(),
          proximoControl: d.proximoControl,
          veterinario: d.veterinario,
          estado: "Activo",
        }
        setData((prev) => ({
          ...prev,
          tratamientos: [...prev.tratamientos, nuevo],
          historial: [
            ...prev.historial,
            {
              id: nextId(prev.historial),
              mascotaId: d.mascotaId,
              fecha: nuevo.fechaInicio,
              tipo: "Tratamiento",
              titulo: `Tratamiento iniciado: ${d.diagnostico}`,
              detalle: [d.medicamento, d.dosis, d.frecuencia].filter(Boolean).join(" · ") || undefined,
              veterinario: d.veterinario,
            },
          ],
        }))
        return nuevo
      },

      addCirugia: (d) => {
        const turno = data.turnos.find((t) => t.mascotaId === d.mascotaId && t.estado !== "Finalizado")
        if (!turno) {
          return {
            ok: false,
            motivo: "La mascota no tiene un turno agendado. Para programar una cirugía primero hay que agendar un turno.",
          }
        }
        const nueva: Cirugia = {
          id: nextId(data.cirugias),
          mascotaId: d.mascotaId,
          mascota: mascotaNombre(d.mascotaId),
          dueno: duenoDeMascota(d.mascotaId),
          tipo: d.tipo,
          fecha: d.fecha,
          hora: d.hora,
          veterinario: d.veterinario,
          estado: "Programada",
          turnoId: turno.id,
        }
        setData((prev) => ({
          ...prev,
          cirugias: [...prev.cirugias, nueva],
          historial: [
            ...prev.historial,
            {
              id: nextId(prev.historial),
              mascotaId: d.mascotaId,
              fecha: d.fecha,
              tipo: "Cirugía",
              titulo: `Cirugía programada: ${d.tipo}`,
              detalle: `${d.fecha} ${d.hora}`,
              veterinario: d.veterinario,
            },
          ],
        }))
        return { ok: true, cirugia: nueva }
      },

      finalizarTratamiento: (id) =>
        setData((prev) => ({
          ...prev,
          tratamientos: prev.tratamientos.map((t) =>
            t.id === id ? { ...t, estado: "Finalizado" as EstadoTratamiento } : t,
          ),
        })),

      resetStore: () => {
        setData(buildSeed())
      },
    }
  }, [data])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useClinic(): ClinicStore {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useClinic debe usarse dentro de <ClinicStoreProvider>")
  return ctx
}
