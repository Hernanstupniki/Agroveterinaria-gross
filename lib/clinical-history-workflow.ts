import { buildSurgeryFollowUps, inferSurgeryProtocol } from "./surgery-workflow"
import { activeTreatmentsSeed, buildActiveTreatmentView } from "./treatment-workflow"
import { buildPetVaccinationHistory, buildPetVaccineSchedule, vaccineDoses, vaccineSchemes } from "./vaccine-workflow"
import { cirugias } from "./mock-data"

export type ClinicalHistoryMockType = "vaccine" | "treatment" | "surgery" | "control" | "reminder"

export interface ClinicalHistoryMockEvent {
  id: string
  clientId: number
  petId: number
  type: ClinicalHistoryMockType
  date: string
  title: string
  description: string
  status?: string
}

export function buildMockClinicalHistory(petId: number): ClinicalHistoryMockEvent[] {
  const vaccineEvents = buildPetVaccinationHistory(petId).flatMap((record) => {
    const events: ClinicalHistoryMockEvent[] = [
      {
        id: `history-vaccine-${record.id}`,
        clientId: record.clientId,
        petId: record.petId,
        type: "vaccine",
        date: record.appliedAt,
        title: `${record.vaccine?.name || "Vacuna"} - ${record.dose?.name || "Dosis"}`,
        description: `Aplicada por ${record.appliedBy}. ${record.observations}`,
        status: record.origin === "carga_historica" ? "Historico" : "Aplicada hoy",
      },
    ]

    if (record.next) {
      events.push({
        id: `history-vaccine-reminder-${record.id}`,
        clientId: record.clientId,
        petId: record.petId,
        type: "reminder",
        date: record.next.reminder.reminderDate || record.next.estimatedAt,
        title: `Recordatorio ${record.vaccine?.name || "Vacuna"}`,
        description: `Proxima dosis ${record.next.dose.name} estimada para ${record.next.estimatedAt}.`,
        status: "preparado",
      })
    }

    return events
  })

  const scheduleEvents = buildPetVaccineSchedule(petId).map((item) => {
    const vaccine = vaccineSchemes.find((scheme) => scheme.id === item.vaccineId)
    const dose = vaccineDoses.find((vaccineDose) => vaccineDose.id === item.doseId)

    return {
      id: `history-vaccine-schedule-${item.id}`,
      clientId: item.clientId,
      petId: item.petId,
      type: "vaccine" as ClinicalHistoryMockType,
      date: item.estimatedAt,
      title: `${vaccine?.name || "Vacuna"} pendiente`,
      description: `Dosis ${dose?.name || "pendiente"} calculada por esquema mock.`,
      status: item.status,
    }
  })

  const treatmentEvents = activeTreatmentsSeed
    .filter((treatment) => treatment.petId === petId)
    .flatMap((treatment) => {
      const view = buildActiveTreatmentView(treatment)
      const events: ClinicalHistoryMockEvent[] = [
        {
          id: `history-treatment-${treatment.id}`,
          clientId: treatment.clientId,
          petId: treatment.petId,
          type: "treatment",
          date: treatment.startedAt,
          title: treatment.name,
          description: `${view.protocol?.description || "Tratamiento demo"}. ${treatment.observations}`,
          status: treatment.status,
        },
      ]

      view.generatedControls.slice(0, 6).forEach((control) => {
        events.push({
          id: `history-treatment-control-${control.id}`,
          clientId: treatment.clientId,
          petId: treatment.petId,
          type: "control",
          date: control.dueDate,
          title: control.title,
          description: `Control generado por protocolo mock. Recordatorio: ${control.reminderDate || "sin fecha"}.`,
          status: control.status,
        })
      })

      return events
    })

  const surgeryEvents = cirugias
    .filter((cirugia) => cirugia.mascotaId === petId)
    .flatMap((cirugia) => {
      const protocol = inferSurgeryProtocol(cirugia.tipo)
      const baseDate = cirugia.registroCirugia?.fechaRealizacion || cirugia.fecha
      const events: ClinicalHistoryMockEvent[] = [
        {
          id: `history-surgery-${cirugia.id}`,
          clientId: 0,
          petId: cirugia.mascotaId,
          type: "surgery",
          date: baseDate,
          title: cirugia.tipo,
          description: cirugia.registroCirugia?.procedimiento || `Cirugía ${cirugia.estado.toLowerCase()} en agenda mock.`,
          status: cirugia.estado,
        },
      ]

      if (cirugia.registroCirugia) {
        buildSurgeryFollowUps(protocol.id, baseDate)
          .slice(0, 4)
          .forEach((control) => {
            events.push({
              id: `history-surgery-control-${cirugia.id}-${control.id}`,
              clientId: 0,
              petId: cirugia.mascotaId,
              type: "control",
              date: control.dueDate,
              title: control.title,
              description: `Control postoperatorio mock. Recordatorio: ${control.reminderDate || "sin fecha"}.`,
              status: control.status,
            })
          })
      }

      return events
    })

  return [...vaccineEvents, ...scheduleEvents, ...treatmentEvents, ...surgeryEvents].sort((a, b) => b.date.localeCompare(a.date))
}
