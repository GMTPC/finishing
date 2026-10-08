<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Activity, History, PackageCheck, Plus, X } from 'lucide-vue-next'
import JobCard from '~/components/finishing/JobCard.vue'
import JobForm from '~/components/finishing/JobForm.vue'
import JobTable from '~/components/finishing/JobTable.vue'
import StationHeader from '~/components/finishing/StationHeader.vue'
import AlertBanner from '~/components/ui/AlertBanner.vue'
import SectionCard from '~/components/ui/SectionCard.vue'
import { useStationNav } from '~/composables/useStationNav'
import { stationPrimaryBtnClass } from '~/constants/station-theme'
import { useJobsStore } from '~/stores/jobs'
import { useSessionStore } from '~/stores/session'
import { jobWorkPath } from '~/utils/routes'

/** หน้างานแปรรูปของสถานี — งานกำลังแปรรูปเป็น การ์ด บน, ประวัติงานแปรรูปเสร็จแล้วเป็น ตาราง ล่าง */
const session = useSessionStore()
const jobsStore = useJobsStore()
const { station } = storeToRefs(session)
const {
  runningJobs,
  finishedJobs,
  activeJobId,
  isLoading,
  isSubmitting,
  errorMessage,
  successMessage,
} = storeToRefs(jobsStore)

const { stationId, syncFromRoute } = useStationNav()

syncFromRoute()

const showForm = ref(false)

onMounted(() => {
  useHead({ title: `งานสถานี ${stationId.value}` })
  jobsStore.fetchJobs(stationId.value)
})

watch(stationId, (id) => {
  syncFromRoute()
  jobsStore.clearFeedback()
  showForm.value = false
  jobsStore.fetchJobs(id)
})

function openJob(jobId: number) {
  jobsStore.selectJob(jobId)
  return navigateTo(jobWorkPath(station.value, jobId))
}

async function finishJob(jobId: number) {
  await jobsStore.finishJob(jobId)
}

async function onJobCreated(jobId: number) {
  showForm.value = false
  await openJob(jobId)
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <StationHeader :station="station" />

    <AlertBanner v-if="successMessage" tone="success">{{ successMessage }}</AlertBanner>
    <AlertBanner v-if="errorMessage" tone="danger">{{ errorMessage }}</AlertBanner>

    <!-- ฟอร์มสร้างงานแปรรูป -->
    <SectionCard
      v-if="showForm"
      title="สร้างงานแปรรูป"
      :description="`สถานี ${station.id}: ${station.title}`"
      :icon="Plus"
    >
      <template #actions>
        <button
          type="button"
          class="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition active:scale-95 cursor-pointer"
          title="ยกเลิก"
          @click="showForm = false"
        >
          <X class="w-5 h-5" />
        </button>
      </template>

      <JobForm :station="station" @created="onJobCreated" />
    </SectionCard>

    <template v-else>
      <!-- ส่วนบน: งานกำลังแปรรูป (การ์ด) -->
      <SectionCard
        title="งานกำลังแปรรูป"
        description="รายการงานที่เปิดอยูในขณะนี้สำหรับลงบันทึกการแปรรูป"
        :icon="Activity"
      >
        <template #actions>
          <button
            type="button"
            class="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-white font-extrabold text-xs sm:text-base shadow-xs flex items-center gap-1.5 sm:gap-2 transition active:scale-95 shrink-0 cursor-pointer"
            :class="stationPrimaryBtnClass(stationId)"
            @click="showForm = true"
          >
            <Plus class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="sm:hidden">สร้างงาน</span>
            <span class="hidden sm:inline">สร้างงานแปรรูปใหม่</span>
          </button>
        </template>

        <p v-if="isLoading" class="text-sm text-stone-500 font-medium text-center py-6">กำลังโหลดรายการงาน...</p>

        <!-- แสดงผลเป็นการ์ดเต็มความกว้าง (Full Width Banner Cards) -->
        <div v-else-if="runningJobs.length" class="space-y-3 sm:space-y-4">
          <JobCard
            v-for="job in runningJobs"
            :key="job.id"
            :job="job"
            :selected="job.id === activeJobId"
            :busy="isSubmitting"
            @open="openJob"
            @finish="finishJob"
          />
        </div>

        <div v-else class="text-center py-6 sm:py-8 space-y-3 bg-stone-50/60 rounded-2xl border border-dashed border-stone-300">
          <div class="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <PackageCheck class="w-6 h-6" />
          </div>
          <p class="text-sm font-bold text-stone-600">ยังไม่มีงานที่กำลังแปรรูปอยู่ในขณะนี้</p>
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
            :class="stationPrimaryBtnClass(stationId)"
            @click="showForm = true"
          >
            <Plus class="w-4 h-4" />
            <span>สร้างงานแปรรูปใหม่</span>
          </button>
        </div>
      </SectionCard>

      <!-- ส่วนล่าง: ประวัติงานแปรรูปเสร็จแล้ว (ตาราง) -->
      <SectionCard
        title="ประวัติงานแปรรูปเสร็จแล้ว"
        description="รายการงานทั้งหมดที่ปิดการทำงานเรียบร้อยแล้ว"
        :icon="History"
      >
        <template #actions>
          <span class="px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-mono font-bold text-xs border border-stone-200">
            {{ finishedJobs.length }} งาน
          </span>
        </template>

        <p v-if="isLoading" class="text-sm text-stone-500 font-medium text-center py-6">กำลังโหลดประวัติงาน...</p>

        <JobTable
          v-else-if="finishedJobs.length"
          :jobs="finishedJobs"
          :active-job-id="activeJobId"
          :busy="isSubmitting"
          @open="openJob"
          @finish="finishJob"
        />

        <div v-else class="text-center py-8 text-stone-400 font-bold text-sm">
          ยังไม่มีประวัติงานที่แปรรูปเสร็จแล้ว
        </div>
      </SectionCard>
    </template>
  </div>
</template>


