<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import ActiveJobBar from '~/components/finishing/ActiveJobBar.vue'
import StationHeader from '~/components/finishing/StationHeader.vue'
import Step1Receive from '~/components/finishing/Step1Receive.vue'
import Step2Setup from '~/components/finishing/Step2Setup.vue'
import Step3Production from '~/components/finishing/Step3Production.vue'
import Step4Transfer from '~/components/finishing/Step4Transfer.vue'
import StepNavigator from '~/components/finishing/StepNavigator.vue'
import AlertBanner from '~/components/ui/AlertBanner.vue'
import { useStationNav } from '~/composables/useStationNav'
import { useJobsStore } from '~/stores/jobs'
import { useProductionStore } from '~/stores/production'
import { useSessionStore } from '~/stores/session'
import { stationStepPath } from '~/utils/routes'

/** หน้าบันทึก 4 ขั้นตอนของงานที่เปิดอยู่ — `/s/:station/:step` */
const session = useSessionStore()
const production = useProductionStore()
const jobsStore = useJobsStore()
const { station, currentStep, canGoPrev, canGoNext } = storeToRefs(session)
const { successMessage, errorMessage } = storeToRefs(production)
const { activeJob, isSubmitting } = storeToRefs(jobsStore)

const { stationId, stepNumber, routeJobId, syncFromRoute, goToStep, goToJobs } = useStationNav()

syncFromRoute()
production.syncWithStation()

// URL เป็นแหล่งความจริงของสถานี/ขั้นตอน — เปลี่ยน params แล้ว store ตามทันที
watch([stationId, stepNumber], () => {
  syncFromRoute()
  production.clearFeedback()
})

// เปลี่ยนสถานี = เริ่มบริบทใหม่ (แหล่งวัสดุเข้า/ปลายทางส่งต่อไม่เหมือนกัน)
watch(stationId, () => production.syncWithStation())

// ต้องมี job ที่กำลังแปรรูปก่อนเสมอ ถ้าไม่มีให้กลับไปหน้ารายการงาน
watch(activeJob, (job, previous) => {
  // เด้งกลับเฉพาะตอนที่เคยมีงานเปิดอยู่แล้วงานถูกปิด/หายไป (กันเด้งระหว่างกำลังโหลด)
  if (previous && (!job || job.status !== 'active')) goToJobs()
})

onMounted(async () => {
  useHead({ title: `สถานี ${stationId.value} • ขั้นตอนที่ ${stepNumber.value}` })

  // รีเฟรชหน้าจอ/เปิดลิงก์ตรง ๆ store จะว่าง ต้องโหลดงานของสถานีก่อนเสมอ
  if (!jobsStore.jobs.some(j => j.stationId === stationId.value)) {
    await jobsStore.fetchJobs(stationId.value)
  }

  // งานมาจาก URL (`?job=12`) — ถ้าไม่มีหรือถูกปิดไปแล้วค่อยกลับไปหน้ารายการงาน
  if (routeJobId.value) jobsStore.selectJob(routeJobId.value)

  if (!jobsStore.hasActiveJob) {
    await goToJobs()
    return
  }

  // เข้ามาโดยไม่มีเลขงานใน URL (เช่นกดจากเมนู) — เติมให้เพื่อให้รีเฟรชแล้วยังอยู่ที่งานเดิม
  if (!routeJobId.value) {
    await navigateTo(stationStepPath(stationId.value, stepNumber.value, jobsStore.activeJobId), { replace: true })
  }
})

const stepComponent = computed(
  () => ({ 1: Step1Receive, 2: Step2Setup, 3: Step3Production, 4: Step4Transfer })[currentStep.value]
)

async function handleSubmit() {
  const saved = await production.submitStep(currentStep.value)
  // บันทึกขั้นตอนสุดท้ายสำเร็จ = จบล็อต เริ่มล็อตใหม่ใน job เดิม
  if (saved && currentStep.value === 4) production.resetLot()
}

async function handleFinishJob(jobId: number) {
  const done = await jobsStore.finishJob(jobId)
  if (done) await goToJobs()
}
</script>

<template>
  <div class="space-y-3 sm:space-y-5 lg:space-y-6">
    <StationHeader :station="station" />

    <ActiveJobBar
      v-if="activeJob"
      :job="activeJob"
      :busy="isSubmitting"
      @back="goToJobs()"
      @finish="handleFinishJob"
    />

    <StepNavigator :current="currentStep" @select="goToStep" />

    <AlertBanner v-if="successMessage" tone="success">{{ successMessage }}</AlertBanner>
    <AlertBanner v-if="errorMessage" tone="danger">{{ errorMessage }}</AlertBanner>

    <component :is="stepComponent" v-if="activeJob" @submit="handleSubmit" />

    <div class="flex items-center justify-between gap-3 pt-2">
      <button
        type="button"
        :disabled="!canGoPrev"
        class="px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 uppercase select-none"
        @click="goToStep(currentStep - 1)"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>ขั้นตอนก่อนหน้า</span>
      </button>

      <button
        type="button"
        :disabled="!canGoNext"
        class="px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 uppercase shadow-md select-none"
        @click="goToStep(currentStep + 1)"
      >
        <span>ขั้นตอนถัดไป</span>
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
