"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  animalBreedsMock,
  createAnimalBreedMock,
  createAnimalTypeMock,
  describeApplicability,
  getAnimalBreeds,
  getAnimalTypes,
  getPetTaxonomy,
  lifeStagePresets,
  protocolMatchesPet,
  type LifeStageId,
  type ProtocolApplicability,
} from "@/lib/animal-taxonomy"

export function PetTaxonomySummary({ pet }: { pet: { especie: string; raza?: string; edad?: string } }) {
  const taxonomy = getPetTaxonomy(pet)

  return (
    <div className="grid gap-2 rounded-lg border bg-background p-3 text-sm md:grid-cols-3">
      <Info label="Tipo de animal" value={taxonomy.animalTypeName} />
      <Info label="Raza / categoria" value={taxonomy.breedName} />
      <Info label="Etapa de vida" value={taxonomy.lifeStageLabel} />
    </div>
  )
}

export function CompatibilityNotice({
  protocol,
  pet,
}: {
  protocol?: ProtocolApplicability | null
  pet: { especie: string; raza?: string; edad?: string }
}) {
  if (!protocol) return null
  const taxonomy = getPetTaxonomy(pet)
  const compatible = protocolMatchesPet(protocol, taxonomy)
  if (compatible) {
    return (
      <div className="rounded-lg border border-success/25 bg-success/10 p-3 text-sm text-success">
        Protocolo compatible con {taxonomy.animalTypeName}, {taxonomy.breedName}, {taxonomy.lifeStageLabel}.
      </div>
    )
  }

  return (
    <div className="flex gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-semibold">Protocolo no compatible con la mascota seleccionada.</p>
        <p className="text-muted-foreground">Podés continuar como demo, pero el sistema real debería pedir confirmación manual.</p>
      </div>
    </div>
  )
}

export function ApplicabilityBadges({ protocol }: { protocol: ProtocolApplicability }) {
  const labels = describeApplicability(protocol)

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs">
      <Badge variant="outline">{labels.animalNames}</Badge>
      <Badge variant="outline">{labels.breedNames}</Badge>
      <Badge variant="outline">{labels.stageNames}</Badge>
    </div>
  )
}

export function TaxonomyApplicabilityEditor({
  initial,
}: {
  initial?: Partial<ProtocolApplicability>
}) {
  const [animalTypesVersion, setAnimalTypesVersion] = useState(0)
  const [breedVersion, setBreedVersion] = useState(0)
  const [newTypeName, setNewTypeName] = useState("")
  const [newBreedName, setNewBreedName] = useState("")
  const [message, setMessage] = useState("")
  const [appliesToAllAnimalTypes, setAppliesToAllAnimalTypes] = useState(initial?.appliesToAllAnimalTypes ?? false)
  const [appliesToAllBreeds, setAppliesToAllBreeds] = useState(initial?.appliesToAllBreeds ?? true)
  const [appliesToAllLifeStages, setAppliesToAllLifeStages] = useState(initial?.appliesToAllLifeStages ?? false)
  const [selectedAnimalTypeIds, setSelectedAnimalTypeIds] = useState<string[]>(initial?.animalTypeIds || ["perro"])
  const [selectedBreedIds, setSelectedBreedIds] = useState<string[]>(initial?.breedIds || [])
  const [selectedLifeStages, setSelectedLifeStages] = useState<LifeStageId[]>(initial?.lifeStages || ["adult"])

  const animalTypes = useMemo(() => getAnimalTypes(), [animalTypesVersion])
  const breeds = useMemo(() => getAnimalBreeds(selectedAnimalTypeIds[0]), [breedVersion, selectedAnimalTypeIds])
  const canCreateBreed = selectedAnimalTypeIds.length > 0 && !appliesToAllAnimalTypes

  function toggleValue<T extends string>(value: T, values: T[], setter: (next: T[]) => void) {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  }

  function handleCreateType() {
    const result = createAnimalTypeMock(newTypeName)
    if (result.reason === "duplicate") {
      setMessage("Ese tipo de animal ya existe.")
      return
    }
    if (result.item) {
      setSelectedAnimalTypeIds((current) => [...current, result.item!.id])
      setNewTypeName("")
      setAnimalTypesVersion((version) => version + 1)
      setMessage(`Tipo creado: ${result.item.name}`)
    }
  }

  function handleCreateBreed() {
    const animalTypeId = selectedAnimalTypeIds[0]
    if (!animalTypeId) return
    const result = createAnimalBreedMock(animalTypeId, newBreedName)
    if (result.reason === "duplicate") {
      setMessage("Esa raza/categoria ya existe para el tipo seleccionado.")
      return
    }
    if (result.item) {
      setSelectedBreedIds((current) => [...current, result.item!.id])
      setNewBreedName("")
      setBreedVersion((version) => version + 1)
      setMessage(`Raza/categoria creada: ${result.item.name}`)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border bg-background p-4">
      <div>
        <h3 className="font-semibold">Aplicabilidad clínica</h3>
        <p className="text-sm text-muted-foreground">Definí para qué animal, raza/categoría y etapa de vida aplica.</p>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={appliesToAllAnimalTypes} onCheckedChange={(checked) => setAppliesToAllAnimalTypes(Boolean(checked))} />
          Aplica a todos los tipos de animal
        </label>
        <div className="flex flex-wrap gap-2">
          {animalTypes.map((type) => (
            <Button
              key={type.id}
              type="button"
              variant={!appliesToAllAnimalTypes && selectedAnimalTypeIds.includes(type.id) ? "default" : "outline"}
              className="h-10 rounded-xl px-4"
              disabled={appliesToAllAnimalTypes}
              onClick={() => toggleValue(type.id, selectedAnimalTypeIds, setSelectedAnimalTypeIds)}
            >
              {type.name}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input value={newTypeName} onChange={(event) => setNewTypeName(event.target.value)} placeholder="Crear tipo: Cabra" />
          <Button type="button" className="h-10 bg-primary px-4 font-bold hover:bg-primary/90" onClick={handleCreateType}>
            <Plus className="mr-2 h-4 w-4" />
            Crear tipo
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={appliesToAllBreeds} onCheckedChange={(checked) => setAppliesToAllBreeds(Boolean(checked))} />
          Aplica a todas las razas/categorías del tipo seleccionado
        </label>
        <div className="flex flex-wrap gap-2">
          {(breeds.length ? breeds : animalBreedsMock.slice(0, 4)).map((breed) => (
            <Button
              key={breed.id}
              type="button"
              variant={!appliesToAllBreeds && selectedBreedIds.includes(breed.id) ? "default" : "outline"}
              className="h-10 rounded-xl px-4"
              disabled={appliesToAllBreeds}
              onClick={() => toggleValue(breed.id, selectedBreedIds, setSelectedBreedIds)}
            >
              {breed.name}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={newBreedName}
            onChange={(event) => setNewBreedName(event.target.value)}
            placeholder="Crear raza/categoria"
            disabled={!canCreateBreed}
          />
          <Button type="button" variant="outline" className="h-10 px-4 font-bold" disabled={!canCreateBreed} onClick={handleCreateBreed}>
            <Plus className="mr-2 h-4 w-4" />
            Crear raza
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={appliesToAllLifeStages} onCheckedChange={(checked) => setAppliesToAllLifeStages(Boolean(checked))} />
          Aplica a todas las etapas
        </label>
        <div className="flex flex-wrap gap-2">
          {lifeStagePresets.map((stage) => (
            <Button
              key={stage.id}
              type="button"
              variant={!appliesToAllLifeStages && selectedLifeStages.includes(stage.id) ? "default" : "outline"}
              className="h-10 rounded-xl px-4"
              disabled={appliesToAllLifeStages}
              onClick={() => toggleValue(stage.id, selectedLifeStages, setSelectedLifeStages)}
            >
              {stage.label}
            </Button>
          ))}
        </div>
      </div>

      {message && <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{message}</p>}
      {!appliesToAllAnimalTypes && selectedAnimalTypeIds.length === 0 && (
        <p className="text-sm font-medium text-destructive">Seleccioná al menos un tipo de animal o marcá aplica a todos.</p>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/35 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-words font-medium leading-tight">{value}</p>
    </div>
  )
}
