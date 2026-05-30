export type ClinicalPresetUnit = "days" | "weeks" | "months" | "years" | "lifetime" | "minutes" | "halfDay"

export interface ClinicalPreset {
  id: string
  label: string
  value: number
  unit: ClinicalPresetUnit
}

export const durationPresets: ClinicalPreset[] = [
  { id: "1-day", label: "1 dia", value: 1, unit: "days" },
  { id: "2-days", label: "2 dias", value: 2, unit: "days" },
  { id: "3-days", label: "3 dias", value: 3, unit: "days" },
  { id: "4-days", label: "4 dias", value: 4, unit: "days" },
  { id: "5-days", label: "5 dias", value: 5, unit: "days" },
  { id: "1-week", label: "1 semana", value: 1, unit: "weeks" },
  { id: "2-weeks", label: "2 semanas", value: 2, unit: "weeks" },
  { id: "3-weeks", label: "3 semanas", value: 3, unit: "weeks" },
  { id: "6-weeks", label: "6 semanas", value: 6, unit: "weeks" },
  { id: "1-month", label: "1 mes", value: 1, unit: "months" },
  { id: "2-months", label: "2 meses", value: 2, unit: "months" },
  { id: "3-months", label: "3 meses", value: 3, unit: "months" },
  { id: "6-months", label: "6 meses", value: 6, unit: "months" },
  { id: "1-year", label: "1 ano", value: 1, unit: "years" },
  { id: "lifetime", label: "De por vida", value: 0, unit: "lifetime" },
]

export const controlFrequencyPresets: ClinicalPreset[] = [
  { id: "daily", label: "Diario", value: 1, unit: "days" },
  { id: "every-2-days", label: "Cada 2 dias", value: 2, unit: "days" },
  { id: "every-3-days", label: "Cada 3 dias", value: 3, unit: "days" },
  { id: "every-4-days", label: "Cada 4 dias", value: 4, unit: "days" },
  { id: "weekly", label: "Semanal", value: 1, unit: "weeks" },
  { id: "every-2-weeks", label: "Cada 2 semanas", value: 2, unit: "weeks" },
  { id: "monthly", label: "Mensual", value: 1, unit: "months" },
  { id: "every-2-months", label: "Cada 2 meses", value: 2, unit: "months" },
  { id: "every-3-months", label: "Cada 3 meses", value: 3, unit: "months" },
  { id: "every-6-months", label: "Cada 6 meses", value: 6, unit: "months" },
]

export const reminderPresets: ClinicalPreset[] = [
  { id: "same-day", label: "El mismo dia", value: 0, unit: "days" },
  { id: "1-day-before", label: "1 dia antes", value: 1, unit: "days" },
  { id: "2-days-before", label: "2 dias antes", value: 2, unit: "days" },
  { id: "3-days-before", label: "3 dias antes", value: 3, unit: "days" },
  { id: "1-week-before", label: "1 semana antes", value: 1, unit: "weeks" },
]

export const surgeryDurationPresets: ClinicalPreset[] = [
  { id: "30-min", label: "30 minutos", value: 30, unit: "minutes" },
  { id: "45-min", label: "45 minutos", value: 45, unit: "minutes" },
  { id: "1-hour", label: "1 hora", value: 60, unit: "minutes" },
  { id: "90-min", label: "1 hora y media", value: 90, unit: "minutes" },
  { id: "2-hours", label: "2 horas", value: 120, unit: "minutes" },
  { id: "half-day", label: "Media jornada", value: 1, unit: "halfDay" },
]

export const surgeryFollowUpDurationPresets: ClinicalPreset[] = [
  { id: "3-days", label: "3 dias", value: 3, unit: "days" },
  { id: "1-week", label: "1 semana", value: 1, unit: "weeks" },
  { id: "2-weeks", label: "2 semanas", value: 2, unit: "weeks" },
  { id: "1-month", label: "1 mes", value: 1, unit: "months" },
]

export function getPreset(id: string, presets: ClinicalPreset[]) {
  return presets.find((preset) => preset.id === id) || presets[0]
}
