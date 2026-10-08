import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CreateJobInput, JobDto, ShiftCode, StationId } from '~~/shared/types/finishing'
import { newIdempotencyKey } from '~~/shared/utils/format'
import { api, apiErrorMessage } from '~/utils/api'
import { useSessionStore } from '~/stores/session'

/**
 * งานแปรรูป (job) ของสถานี — ต้องสร้างก่อนจึงจะบันทึกขั้นตอน 1–4 ได้
 * "กำลังแปรรูป" = status active, "แปรรูปแล้ว" = status done (ปิดด้วยปุ่มจบงาน)
 */
export const useJobsStore = defineStore('jobs', () => {
  const session = useSessionStore()

  const jobs = ref<JobDto[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  /** job ที่ผู้ใช้เลือกทำอยู่ (ต่อ 1 เครื่อง/1 เบราว์เซอร์) */
  const activeJobId = ref<number | null>(null)

  const stationJobs = computed(() => jobs.value.filter(j => j.stationId === session.activeStation))
  const runningJobs = computed(() => stationJobs.value.filter(j => j.status === 'active'))
  const finishedJobs = computed(() => stationJobs.value.filter(j => j.status === 'done'))

  const activeJob = computed(() => jobs.value.find(j => j.id === activeJobId.value) ?? null)
  const hasActiveJob = computed(() => activeJob.value?.status === 'active')

  function clearFeedback() {
    errorMessage.value = null
    successMessage.value = null
  }

  async function fetchJobs(stationId: StationId = session.activeStation) {
    isLoading.value = true
    errorMessage.value = null
    try {
      const res = await api.listJobs({ stationId, limit: 100 })
      // เก็บเฉพาะสถานีอื่นไว้ แล้วแทนที่ของสถานีนี้ด้วยข้อมูลล่าสุด
      jobs.value = [...jobs.value.filter(j => j.stationId !== stationId), ...res.data]

      // ถ้า job ที่เลือกไว้ถูกปิด/หายไป ให้เลิกเลือก
      if (activeJobId.value && !res.data.some(j => j.id === activeJobId.value && j.status === 'active')) {
        activeJobId.value = null
      }
    } catch (err) {
      errorMessage.value = apiErrorMessage(err, 'ดึงรายการงานไม่สำเร็จ')
    } finally {
      isLoading.value = false
    }
  }

  /** ปุ่ม "สร้างงานแปรรูป" — สร้าง job ใหม่แล้วเลือกเป็น job ที่กำลังทำ */
  async function createJob(input: {
    stationId: StationId
    shift: ShiftCode
    machine: string
    pvcType?: string | null
    operators: string[]
    startedAt: string
    note?: string
  }) {
    isSubmitting.value = true
    clearFeedback()
    try {
      const payload: CreateJobInput = { ...input, idempotencyKey: newIdempotencyKey() }
      const res = await api.createJob(payload)
      jobs.value = [res.data, ...jobs.value]
      activeJobId.value = res.data.id
      successMessage.value = `สร้างงานแปรรูป ${res.data.code} แล้ว`
      return res.data
    } catch (err) {
      errorMessage.value = apiErrorMessage(err, 'สร้างงานใหม่ไม่สำเร็จ')
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  /** ปุ่ม "จบงาน" — ย้าย job ไปกลุ่ม "แปรรูปแล้ว" */
  async function finishJob(jobId: number, finishedBy = session.operatorName) {
    isSubmitting.value = true
    clearFeedback()
    try {
      const res = await api.finishJob(jobId, { finishedBy, idempotencyKey: newIdempotencyKey() })
      jobs.value = jobs.value.map(j => (j.id === res.data.id ? res.data : j))
      if (activeJobId.value === jobId) activeJobId.value = null
      successMessage.value = `จบงาน ${res.data.code} เรียบร้อย`
      return true
    } catch (err) {
      errorMessage.value = apiErrorMessage(err, 'ปิดงานไม่สำเร็จ')
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  function selectJob(jobId: number) {
    activeJobId.value = jobId
  }

  return {
    jobs,
    isLoading,
    isSubmitting,
    errorMessage,
    successMessage,
    activeJobId,
    activeJob,
    hasActiveJob,
    stationJobs,
    runningJobs,
    finishedJobs,
    clearFeedback,
    fetchJobs,
    createJob,
    finishJob,
    selectJob,
  }
})
