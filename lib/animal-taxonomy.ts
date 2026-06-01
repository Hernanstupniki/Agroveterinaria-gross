export type LifeStageId = "puppy" | "adult" | "senior" | "all"

export interface AnimalType {
  id: string
  name: string
  active: boolean
}

export interface AnimalBreed {
  id: string
  animalTypeId: string
  name: string
  active: boolean
}

export interface ProtocolApplicability {
  animalTypeIds: string[]
  breedIds: string[]
  lifeStages: LifeStageId[]
  appliesToAllAnimalTypes: boolean
  appliesToAllBreeds: boolean
  appliesToAllLifeStages: boolean
}

export interface PetTaxonomy {
  animalTypeId: string
  animalTypeName: string
  breedId: string | null
  breedName: string
  lifeStage: LifeStageId
  lifeStageLabel: string
}

export const animalTypesMock: AnimalType[] = [
  { id: "perro", name: "Perro", active: true },
  { id: "gato", name: "Gato", active: true },
  { id: "vaca", name: "Vaca", active: true },
  { id: "caballo", name: "Caballo", active: true },
  { id: "conejo", name: "Conejo", active: true },
  { id: "otro", name: "Otro", active: true },
]

export const animalBreedsMock: AnimalBreed[] = [
  { id: "golden-retriever", animalTypeId: "perro", name: "Golden Retriever", active: true },
  { id: "bulldog-frances", animalTypeId: "perro", name: "Bulldog Frances", active: true },
  { id: "beagle", animalTypeId: "perro", name: "Beagle", active: true },
  { id: "pastor-aleman", animalTypeId: "perro", name: "Pastor Aleman", active: true },
  { id: "mestizo-perro", animalTypeId: "perro", name: "Mestizo", active: true },
  { id: "siames", animalTypeId: "gato", name: "Siames", active: true },
  { id: "persa", animalTypeId: "gato", name: "Persa", active: true },
  { id: "mestizo-gato", animalTypeId: "gato", name: "Mestizo", active: true },
  { id: "holando", animalTypeId: "vaca", name: "Holando", active: true },
  { id: "hereford", animalTypeId: "vaca", name: "Hereford", active: true },
  { id: "brangus", animalTypeId: "vaca", name: "Brangus", active: true },
]

export const lifeStagePresets: { id: LifeStageId; label: string }[] = [
  { id: "puppy", label: "Cachorro / cria" },
  { id: "adult", label: "Adulto" },
  { id: "senior", label: "Senior / geronte" },
  { id: "all", label: "Todas las etapas" },
]

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function slugify(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export function getAnimalTypes() {
  return animalTypesMock.filter((type) => type.active)
}

export function getAnimalBreeds(animalTypeId?: string) {
  return animalBreedsMock.filter((breed) => breed.active && (!animalTypeId || breed.animalTypeId === animalTypeId))
}

export function createAnimalTypeMock(name: string) {
  const cleanName = name.trim()
  if (!cleanName) return { item: null, created: false, reason: "empty" as const }

  const existing = animalTypesMock.find((type) => normalize(type.name) === normalize(cleanName))
  if (existing) return { item: existing, created: false, reason: "duplicate" as const }

  const item = { id: slugify(cleanName), name: cleanName, active: true }
  animalTypesMock.push(item)
  return { item, created: true, reason: "created" as const }
}

export function createAnimalBreedMock(animalTypeId: string, name: string) {
  const cleanName = name.trim()
  if (!cleanName) return { item: null, created: false, reason: "empty" as const }

  const existing = animalBreedsMock.find(
    (breed) => breed.animalTypeId === animalTypeId && normalize(breed.name) === normalize(cleanName),
  )
  if (existing) return { item: existing, created: false, reason: "duplicate" as const }

  const item = { id: `${animalTypeId}-${slugify(cleanName)}`, animalTypeId, name: cleanName, active: true }
  animalBreedsMock.push(item)
  return { item, created: true, reason: "created" as const }
}

export function getLifeStageLabel(lifeStage: LifeStageId) {
  return lifeStagePresets.find((stage) => stage.id === lifeStage)?.label || "Adulto"
}

export function resolveAnimalTypeId(species: string) {
  const found = animalTypesMock.find((type) => normalize(type.name) === normalize(species))
  return found?.id || "otro"
}

export function resolveBreedId(animalTypeId: string, breedName?: string) {
  if (!breedName) return null
  return animalBreedsMock.find((breed) => breed.animalTypeId === animalTypeId && normalize(breed.name) === normalize(breedName))?.id || null
}

export function inferLifeStageFromAge(ageText?: string): LifeStageId {
  const text = normalize(ageText || "")
  const number = Number(text.match(/\d+/)?.[0] || 0)
  if (text.includes("mes") || number < 1) return "puppy"
  if (number >= 7) return "senior"
  return "adult"
}

export function getPetTaxonomy(pet: { especie: string; raza?: string; edad?: string; animalTypeId?: string; breedId?: string | null; lifeStage?: LifeStageId }): PetTaxonomy {
  const animalTypeId = pet.animalTypeId || resolveAnimalTypeId(pet.especie)
  const animalType = animalTypesMock.find((type) => type.id === animalTypeId) || animalTypesMock.at(-1)!
  const breedId = pet.breedId || resolveBreedId(animalTypeId, pet.raza)
  const breed = animalBreedsMock.find((item) => item.id === breedId)
  const lifeStage = pet.lifeStage || inferLifeStageFromAge(pet.edad)

  return {
    animalTypeId,
    animalTypeName: animalType.name,
    breedId: breed?.id || null,
    breedName: breed?.name || pet.raza || "Sin categoria",
    lifeStage,
    lifeStageLabel: getLifeStageLabel(lifeStage),
  }
}

export function protocolMatchesPet(protocol: ProtocolApplicability, petTaxonomy: PetTaxonomy) {
  const matchesAnimal = protocol.appliesToAllAnimalTypes || protocol.animalTypeIds.includes(petTaxonomy.animalTypeId)
  const matchesBreed = protocol.appliesToAllBreeds || !petTaxonomy.breedId || protocol.breedIds.includes(petTaxonomy.breedId)
  const matchesStage = protocol.appliesToAllLifeStages || protocol.lifeStages.includes("all") || protocol.lifeStages.includes(petTaxonomy.lifeStage)
  return matchesAnimal && matchesBreed && matchesStage
}

export function sortProtocolsByCompatibility<T extends ProtocolApplicability>(protocols: T[], petTaxonomy: PetTaxonomy) {
  return [...protocols].sort((a, b) => Number(protocolMatchesPet(b, petTaxonomy)) - Number(protocolMatchesPet(a, petTaxonomy)))
}

export function filterCompatibleProtocols<T extends ProtocolApplicability>(protocols: T[], petTaxonomy: PetTaxonomy) {
  return protocols.filter((protocol) => protocolMatchesPet(protocol, petTaxonomy))
}

export function describeApplicability(protocol: ProtocolApplicability) {
  const animalNames = protocol.appliesToAllAnimalTypes
    ? "Todos los animales"
    : protocol.animalTypeIds.map((id) => animalTypesMock.find((type) => type.id === id)?.name || id).join(", ")
  const breedNames = protocol.appliesToAllBreeds
    ? "Todas las razas/categorias"
    : protocol.breedIds.map((id) => animalBreedsMock.find((breed) => breed.id === id)?.name || id).join(", ")
  const stageNames = protocol.appliesToAllLifeStages || protocol.lifeStages.includes("all")
    ? "Todas las etapas"
    : protocol.lifeStages.map(getLifeStageLabel).join(", ")

  return { animalNames, breedNames, stageNames }
}
