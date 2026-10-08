import { computed } from 'vue'
import type { StepNumber } from '~~/shared/types/finishing'
import { toStationId } from '~~/shared/constants/stations'
import { toStepNumber } from '~~/shared/constants/steps'
import { useJobsStore } from '~/stores/jobs'
import { useSessionStore } from '~/stores/session'
import { JOB_QUERY_KEY, stationPath, stationStepPath } from '~/utils/routes'

/**
 * อ่านสถานี / ขั้นตอน / งานที่เปิดอยู่ จาก URL
 * (`/s/S3` = หน้างาน, `/s/S3/2?job=12` = ขั้นตอนที่ 2 ของงานเลขที่ 12)
 *
 * URL เป็นแหล่งความจริง เพื่อให้รีเฟรชหรือแชร์ลิงก์แล้วกลับมาที่เดิมได้
 */
export function useStationNav() {
  const route = useRoute()
  const session = useSessionStore()
  const jobs = useJobsStore()

  /** อยู่ในหน้าสถานี (ทั้งหน้างานและหน้าขั้นตอน) */
  const isStationPage = computed(() => route.path.startsWith('/s/'))

  /** อยู่ในหน้าขั้นตอน 1–4 (ไม่ใช่หน้ารายการงาน) */
  const isStepPage = computed(() => isStationPage.value && route.params.step !== undefined)

  const stationId = computed(() =>
    isStationPage.value ? toStationId(route.params.station, session.activeStation) : session.activeStation
  )

  const stepNumber = computed<StepNumber>(() =>
    isStepPage.value ? toStepNumber(route.params.step, session.currentStep) : session.currentStep
  )

  /** เลขงานที่อยู่ใน URL (`?job=12`) */
  const routeJobId = computed(() => {
    const raw = Number(route.query[JOB_QUERY_KEY])
    return Number.isInteger(raw) && raw > 0 ? raw : null
  })

  /** ดึงค่าจาก URL ลง store (เรียกตอน mount และตอน params เปลี่ยน) */
  function syncFromRoute() {
    session.setStation(stationId.value)
    if (isStepPage.value) session.setStep(stepNumber.value)
    if (routeJobId.value) jobs.selectJob(routeJobId.value)
  }

  /** ย้ายขั้นตอนโดยพางานที่เปิดอยู่ไปด้วยเสมอ */
  function goToStep(step: StepNumber | number) {
    return navigateTo(stationStepPath(stationId.value, step, routeJobId.value ?? jobs.activeJobId))
  }

  /** กลับไปหน้ารายการงานของสถานี */
  function goToJobs(station: string = stationId.value) {
    return navigateTo(stationPath(toStationId(station)))
  }

  return { isStationPage, isStepPage, stationId, stepNumber, routeJobId, syncFromRoute, goToStep, goToJobs }
}
