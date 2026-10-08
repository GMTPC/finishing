import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ShiftCode, StationId, StepNumber } from '~~/shared/types/finishing'
import { STATION_LIST, STATIONS, getStation, toStationId } from '~~/shared/constants/stations'
import { FIRST_STEP, LAST_STEP, getStep } from '~~/shared/constants/steps'
import { formatShortThaiDate } from '~~/shared/utils/format'
import { shiftLabel } from '~~/shared/constants/shifts'

/**
 * บริบทการทำงานของกะปัจจุบัน: ใครทำงาน กะไหน สถานีไหน ขั้นตอนไหน
 * ข้อมูลฟอร์มการผลิตอยู่ที่ `stores/production.ts`
 */
export const useSessionStore = defineStore('session', () => {
  const operatorName = ref('พนักงาน A')
  const employeeId = ref('')
  const shift = ref<ShiftCode>('MORNING')
  const workDate = ref(formatShortThaiDate())

  const activeStation = ref<StationId>('S1')
  const currentStep = ref<StepNumber>(FIRST_STEP)

  const shiftText = computed(() => shiftLabel(shift.value))
  const station = computed(() => getStation(activeStation.value))
  const step = computed(() => getStep(currentStep.value))

  const { assignedStationId } = useAuth()

  const stationList = computed(() => {
    if (!assignedStationId.value) return STATION_LIST
    return STATION_LIST.filter(s => s.id === assignedStationId.value)
  })
  const continuousStations = computed(() => stationList.value.filter(s => s.group === 'continuous'))
  const independentStations = computed(() => stationList.value.filter(s => s.group === 'independent'))

  const stationOptions = computed(() =>
    stationList.value.map(s => ({ label: `${s.id}: ${s.title}`, value: s.id }))
  )

  function setStation(value: unknown) {
    activeStation.value = toStationId(value, activeStation.value)
  }

  function setStep(value: number) {
    if (value >= FIRST_STEP && value <= LAST_STEP) currentStep.value = value as StepNumber
  }

  const canGoPrev = computed(() => currentStep.value > FIRST_STEP)
  const canGoNext = computed(() => currentStep.value < LAST_STEP)

  function nextStep() {
    if (canGoNext.value) currentStep.value = (currentStep.value + 1) as StepNumber
  }

  function prevStep() {
    if (canGoPrev.value) currentStep.value = (currentStep.value - 1) as StepNumber
  }

  return {
    // state
    operatorName,
    employeeId,
    shift,
    workDate,
    activeStation,
    currentStep,
    // getters
    shiftText,
    station,
    step,
    stationList,
    stationOptions,
    continuousStations,
    independentStations,
    canGoPrev,
    canGoNext,
    stations: STATIONS,
    // actions
    setStation,
    setStep,
    nextStep,
    prevStep,
  }
})
