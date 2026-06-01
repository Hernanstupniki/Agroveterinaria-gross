import type { ClinicalPreset } from "./clinical-presets"

export interface GeneratedControl {
  id: string
  dueDate: string
  status: "pendiente" | "pausado" | "cancelado"
  title: string
  reminderDate?: string | null
}

export function addPresetToDate(date: string, preset: ClinicalPreset) {
  if (!date || preset.unit === "lifetime") return null

  const result = new Date(`${date}T00:00:00`)
  if (preset.unit === "days") result.setDate(result.getDate() + preset.value)
  if (preset.unit === "weeks") result.setDate(result.getDate() + preset.value * 7)
  if (preset.unit === "months") result.setMonth(result.getMonth() + preset.value)
  if (preset.unit === "years") result.setFullYear(result.getFullYear() + preset.value)
  if (preset.unit === "minutes") result.setMinutes(result.getMinutes() + preset.value)
  if (preset.unit === "halfDay") result.setHours(result.getHours() + 4)

  return result.toISOString().slice(0, 10)
}

export function calculateReminderDate(dueDate?: string | null, reminderPreset?: ClinicalPreset | null) {
  if (!dueDate || !reminderPreset) return null
  if (reminderPreset.value === 0) return dueDate

  const result = new Date(`${dueDate}T00:00:00`)
  if (reminderPreset.unit === "days") result.setDate(result.getDate() - reminderPreset.value)
  if (reminderPreset.unit === "weeks") result.setDate(result.getDate() - reminderPreset.value * 7)
  return result.toISOString().slice(0, 10)
}

export function generateControls({
  startDate,
  durationPreset,
  frequencyPreset,
  reminderPreset,
  label,
  status = "pendiente",
}: {
  startDate: string
  durationPreset: ClinicalPreset
  frequencyPreset: ClinicalPreset
  reminderPreset?: ClinicalPreset
  label: string
  status?: GeneratedControl["status"]
}) {
  const endDate = addPresetToDate(startDate, durationPreset)
  if (!endDate) return []

  const controls: GeneratedControl[] = []
  let cursor = addPresetToDate(startDate, frequencyPreset)
  let index = 1

  while (cursor && cursor <= endDate && controls.length < 24) {
    controls.push({
      id: `${label.toLowerCase().replace(/\s+/g, "-")}-${cursor}`,
      dueDate: cursor,
      status,
      title: `${label} ${index}`,
      reminderDate: calculateReminderDate(cursor, reminderPreset),
    })
    cursor = addPresetToDate(cursor, frequencyPreset)
    index += 1
  }

  return dedupeMockEvents(controls)
}

export function generateLifetimeControls({
  startDate,
  frequencyPreset,
  reminderPreset,
  windowMonths = 6,
  label,
  status = "pendiente",
}: {
  startDate: string
  frequencyPreset: ClinicalPreset
  reminderPreset?: ClinicalPreset
  windowMonths?: number
  label: string
  status?: GeneratedControl["status"]
}) {
  return generateControls({
    startDate,
    durationPreset: { id: "window", label: `${windowMonths} meses`, value: windowMonths, unit: "months" },
    frequencyPreset,
    reminderPreset,
    label,
    status,
  })
}

export function generateSurgeryFollowUps({
  surgeryDate,
  followUpDuration,
  frequencyPreset,
  reminderPreset,
}: {
  surgeryDate: string
  followUpDuration: ClinicalPreset
  frequencyPreset: ClinicalPreset
  reminderPreset?: ClinicalPreset
}) {
  return generateControls({
    startDate: surgeryDate,
    durationPreset: followUpDuration,
    frequencyPreset,
    reminderPreset,
    label: "Control postoperatorio",
  })
}

export function dedupeMockEvents<T extends { id: string }>(events: T[]) {
  const seen = new Set<string>()
  return events.filter((event) => {
    if (seen.has(event.id)) return false
    seen.add(event.id)
    return true
  })
}
