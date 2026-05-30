"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  animalBreedsMock,
  animalTypesMock,
  getAnimalBreeds,
  type LifeStageId,
  type ProtocolApplicability,
} from "@/lib/animal-taxonomy"

type StatusFilter = "all" | "active" | "inactive"

export interface ProtocolSearchFilterState {
  search: string
  animalTypeId: string
  breedId: string
  lifeStage: LifeStageId | "all"
  status: StatusFilter
}

export function defaultFilterState(): ProtocolSearchFilterState {
  return {
    search: "",
    animalTypeId: "all",
    breedId: "all",
    lifeStage: "all",
    status: "all",
  }
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function getSearchableFields(protocol: ProtocolApplicability & Record<string, unknown>): string[] {
  const fields: string[] = []
  const textKeys = [
    "name",
    "description",
    "observations",
    "requirements",
    "preInstructions",
    "postInstructions",
    "indications",
    "species",
  ]
  for (const key of textKeys) {
    const val = protocol[key]
    if (typeof val === "string" && val) fields.push(val)
  }
  const possibleStates = protocol.possibleStates
  if (Array.isArray(possibleStates)) fields.push(possibleStates.join(" "))

  const { animalNames, breedNames, stageNames } = resolveApplicabilityTexts(protocol)
  fields.push(animalNames, breedNames, stageNames)

  for (const at of animalTypesMock) {
    if (protocol.animalTypeIds?.includes(at.id)) fields.push(at.name)
  }
  for (const breed of animalBreedsMock) {
    if (protocol.breedIds?.includes(breed.id)) fields.push(breed.name)
  }
  for (const ls of protocol.lifeStages ?? []) {
    const preset = lifeStagePresets.find((p) => p.id === ls)
    if (preset) fields.push(preset.label)
  }

  return fields
}

const lifeStagePresets: { id: LifeStageId | "all"; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "puppy", label: "Cachorro / cria" },
  { id: "adult", label: "Adulto" },
  { id: "senior", label: "Senior / geronte" },
]

function resolveApplicabilityTexts(protocol: ProtocolApplicability) {
  const animalNames = protocol.appliesToAllAnimalTypes
    ? "Todos los animales"
    : protocol.animalTypeIds
        .map((id) => animalTypesMock.find((t) => t.id === id)?.name || id)
        .join(", ")
  const breedNames = protocol.appliesToAllBreeds
    ? "Todas las razas/categorias"
    : protocol.breedIds
        .map((id) => animalBreedsMock.find((b) => b.id === id)?.name || id)
        .join(", ")
  const stageNames =
    protocol.appliesToAllLifeStages || protocol.lifeStages.includes("all")
      ? "Todas las etapas"
      : protocol.lifeStages
          .map((ls) => lifeStagePresets.find((p) => p.id === ls)?.label || ls)
          .join(", ")
  return { animalNames, breedNames, stageNames }
}

export function filterProtocols<T extends ProtocolApplicability & { active?: boolean }>(
  protocols: T[],
  filter: ProtocolSearchFilterState,
): T[] {
  return protocols.filter((protocol) => {
    const protocolActive = protocol.active !== false
    if (filter.status === "active" && !protocolActive) return false
    if (filter.status === "inactive" && protocolActive) return false

    if (filter.animalTypeId !== "all") {
      if (!protocol.appliesToAllAnimalTypes && !protocol.animalTypeIds.includes(filter.animalTypeId)) return false
    }

    if (filter.breedId !== "all") {
      if (!protocol.appliesToAllBreeds && !protocol.breedIds.includes(filter.breedId)) return false
    }

    if (filter.lifeStage !== "all") {
      if (!protocol.appliesToAllLifeStages && !protocol.lifeStages.includes("all") && !protocol.lifeStages.includes(filter.lifeStage)) return false
    }

    if (filter.search) {
      const searchNorm = normalizeText(filter.search)
      const searchable = getSearchableFields(protocol as ProtocolApplicability & Record<string, unknown>)
      const combined = searchable.map(normalizeText).join(" ")
      if (!combined.includes(searchNorm)) return false
    }

    return true
  })
}

interface ProtocolSearchFilterProps {
  filter: ProtocolSearchFilterState
  onFilterChange: (filter: ProtocolSearchFilterState) => void
  totalCount: number
  filteredCount: number
  searchPlaceholder?: string
}

export function ProtocolSearchFilter({
  filter,
  onFilterChange,
  totalCount,
  filteredCount,
  searchPlaceholder = "Buscar protocolo por nombre, animal, etapa o indicacion...",
}: ProtocolSearchFilterProps) {
  const availableBreeds = useMemo(() => {
    if (filter.animalTypeId === "all") return []
    return getAnimalBreeds(filter.animalTypeId)
  }, [filter.animalTypeId])

  const hasActiveFilters =
    filter.search !== "" ||
    filter.animalTypeId !== "all" ||
    filter.breedId !== "all" ||
    filter.lifeStage !== "all" ||
    filter.status !== "all"

  function update(partial: Partial<ProtocolSearchFilterState>) {
    const next = { ...filter, ...partial }
    if (partial.animalTypeId && partial.animalTypeId !== filter.animalTypeId) {
      next.breedId = "all"
    }
    onFilterChange(next)
  }

  function clearFilters() {
    onFilterChange(defaultFilterState())
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-12 rounded-xl pl-10 text-base"
          placeholder={searchPlaceholder}
          value={filter.search}
          onChange={(e) => update({ search: e.target.value })}
        />
        {filter.search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => update({ search: "" })}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filter.animalTypeId} onValueChange={(v) => update({ animalTypeId: v })}>
          <SelectTrigger className="h-10 w-[150px] rounded-lg">
            <SelectValue placeholder="Animal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {animalTypesMock.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filter.breedId} onValueChange={(v) => update({ breedId: v })}>
          <SelectTrigger className="h-10 w-[170px] rounded-lg">
            <SelectValue placeholder="Raza/categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {availableBreeds.map((breed) => (
              <SelectItem key={breed.id} value={breed.id}>
                {breed.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filter.lifeStage} onValueChange={(v) => update({ lifeStage: v as LifeStageId | "all" })}>
          <SelectTrigger className="h-10 w-[170px] rounded-lg">
            <SelectValue placeholder="Etapa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las etapas</SelectItem>
            <SelectItem value="puppy">Cachorro / cria</SelectItem>
            <SelectItem value="adult">Adulto</SelectItem>
            <SelectItem value="senior">Senior / geronte</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filter.status} onValueChange={(v) => update({ status: v as StatusFilter })}>
          <SelectTrigger className="h-10 w-[130px] rounded-lg">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-10 rounded-lg text-muted-foreground" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredCount === totalCount
          ? `${totalCount} protocolo${totalCount !== 1 ? "s" : ""} encontrado${totalCount !== 1 ? "s" : ""}`
          : `${filteredCount} de ${totalCount} protocolo${totalCount !== 1 ? "s" : ""} encontrado${totalCount !== 1 ? "s" : ""}`}
      </p>
    </div>
  )
}
