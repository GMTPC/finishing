<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import JobHeader from '~/components/board/JobHeader.vue'
import ProgressCard from '~/components/board/ProgressCard.vue'
import MaterialsSheet from '~/components/board/MaterialsSheet.vue'
import LotFilter, { type FilterValue } from '~/components/board/LotFilter.vue'
import LotCard, { type LotItem } from '~/components/board/LotCard.vue'
import ScanDock from '~/components/board/ScanDock.vue'
import AlertBanner from '~/components/ui/AlertBanner.vue'
import { useStationNav } from '~/composables/useStationNav'
import { useBoardStore } from '~/stores/board'
import { useJobsStore } from '~/stores/jobs'
import { useSessionStore } from '~/stores/session'
import { stationBoardPath } from '~/utils/routes'

/**
 * Redesigned Mobile-First Station Board (`/s/:station/board?job=<id>`)
 * Unified Lot Cards (1 received WIP -> 1 TAG issued)
 */
definePageMeta({
  layout: 'auth',
})

const session = useSessionStore()
const jobsStore = useJobsStore()
const board = useBoardStore()

const { station } = storeToRefs(session)
const { activeJob, isSubmitting } = storeToRefs(jobsStore)
const { entries, totals, materials, isScanning, isLoading, successMessage, errorMessage } =
  storeToRefs(board)

const { stationId, routeJobId, syncFromRoute, goToJobs } = useStationNav()

syncFromRoute()

const isClosed = computed(() => activeJob.value?.status === 'done')
const filterMode = ref<FilterValue>('all')
const newestEntryId = ref<number | null>(null)
const issuingLotId = ref<number | null>(null)

onMounted(async () => {
  useHead({ title: `กระดานงาน • สถานี ${stationId.value}` })

  if (!jobsStore.jobs.some(j => j.stationId === stationId.value)) {
    await jobsStore.fetchJobs(stationId.value)
  }
  if (routeJobId.value) jobsStore.selectJob(routeJobId.value)

  if (!jobsStore.activeJobId) {
    await goToJobs()
    return
  }

  await board.load(jobsStore.activeJobId)

  if (!routeJobId.value) {
    await navigateTo(stationBoardPath(stationId.value, jobsStore.activeJobId), { replace: true })
  }
})

watch(routeJobId, async (jobId) => {
  if (!jobId) return
  jobsStore.selectJob(jobId)
  await board.load(jobId)
})

/** แปลง entries เป็น 1 Lot List (เอาล่าสุดขึ้นบนก่อน) */
const lots = computed<LotItem[]>(() => {
  return [...entries.value].reverse().map(entry => ({
    id: entry.id,
    wipCode: entry.barcode,
    qty: entry.quantity,
    tagCode: entry.issued?.code || null,
    tagLot: entry.issued?.lot || null,
    issuedTagId: entry.issued?.id || null,
    createdAt: typeof entry.scannedAt === 'string' ? entry.scannedAt : entry.scannedAt ? new Date(entry.scannedAt).toISOString() : '',
    isNew: newestEntryId.value === entry.id,
  }))
})

const pendingLots = computed(() => lots.value.filter(l => !l.tagCode))
const doneLots = computed(() => lots.value.filter(l => !!l.tagCode))

const filteredLots = computed(() => {
  if (filterMode.value === 'pending') return pendingLots.value
  if (filterMode.value === 'done') return doneLots.value
  return lots.value
})

const pendingCountCalculated = computed(() => {
  const pendingQty = totals.value.inQty - totals.value.outQty - totals.value.trimQty
  return Math.max(0, pendingQty)
})

async function handleScanWip(barcodeText: string) {
  const previousIds = new Set(entries.value.map(e => e.id))
  const success = await board.addEntry(barcodeText)
  if (success) {
    const newlyAdded = entries.value.find(e => !previousIds.has(e.id))
    if (newlyAdded) {
      newestEntryId.value = newlyAdded.id
      setTimeout(() => {
        if (newestEntryId.value === newlyAdded.id) {
          newestEntryId.value = null
        }
      }, 1500)
    }
  }
}

async function handleIssueLot(lotId: number) {
  const entry = entries.value.find(e => e.id === lotId)
  if (!entry) return

  issuingLotId.value = lotId
  try {
    await board.issueFor(entry)
  } finally {
    issuingLotId.value = null
  }
}

async function handleCancelIssuedTag(issuedTagId: number) {
  await board.removeIssuedTag(issuedTagId)
}

function handleReprintTag(tagCode: string) {
  if (typeof window !== 'undefined') {
    // พิมพ์ TAG ซ้ำ (สามารถเปิดหน้าต่างพิมพ์หรือ window.print())
    window.print()
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F3F4F1] pb-24 flex flex-col antialiased">
    <!-- Header (sticky top, white, bottom border) -->
    <JobHeader
      v-if="activeJob"
      :job="activeJob"
      :station-title="station.title"
      @back="goToJobs()"
    />

    <!-- Main scrollable content container -->
    <main class="flex-1 max-w-md w-full mx-auto px-1 sm:px-2 py-1 space-y-1">
      <AlertBanner v-if="isClosed" tone="warning">
        งานนี้ปิดแล้ว — ดูข้อมูลได้อย่างเดียว แก้ไขหรือออกรหัสเพิ่มไม่ได้
      </AlertBanner>

      <!-- Progress card -->
      <ProgressCard
        :in-qty="totals.inQty"
        :out-qty="totals.outQty"
        :pending-qty="pendingCountCalculated"
        :scrap-qty="totals.trimQty"
      />

      <!-- Materials row button -->
      <MaterialsSheet
        :materials="materials"
        :readonly="isClosed"
        :busy="isSubmitting"
        @add="board.addMaterial"
        @remove="board.removeMaterial"
      />

      <!-- List header + filter -->
      <LotFilter
        v-model="filterMode"
        :total-count="lots.length"
        :pending-count="pendingLots.length"
        :done-count="doneLots.length"
      />

      <!-- Loading State -->
      <div v-if="isLoading" class="py-4 text-center text-xs font-bold text-[#555B64] font-mono">
        กำลังโหลดข้อมูลล็อต...
      </div>

      <!-- Lot list (gap 4px / space-y-1) -->
      <div v-else-if="filteredLots.length" class="space-y-1">
        <LotCard
          v-for="(lot, idx) in filteredLots"
          :key="lot.id"
          :lot="lot"
          :index="filteredLots.length - idx"
          :busy="issuingLotId === lot.id"
          :readonly="isClosed"
          @issue="handleIssueLot"
          @reprint="handleReprintTag"
          @cancel="handleCancelIssuedTag"
        />
      </div>

      <!-- Empty state per filter -->
      <div v-else class="bg-white rounded-xl border border-dashed border-[#E3E5E0] p-5 text-center text-xs font-bold text-[#555B64] space-y-1">
        <p v-if="filterMode === 'all'">ยังไม่มีล็อต — สแกน WIP เพื่อเริ่ม</p>
        <p v-else-if="filterMode === 'pending'">ไม่มีล็อตที่รอออก TAG</p>
        <p v-else-if="filterMode === 'done'">ยังไม่มีล็อตที่ออก TAG แล้ว</p>
      </div>
    </main>

    <!-- Bottom Dock (sticky bottom, white, top border) -->
    <ScanDock
      :station-id="stationId"
      :readonly="isClosed"
      :busy="isScanning"
      :scan-error="errorMessage"
      :scan-success="successMessage"
      @scan="handleScanWip"
      @clear-feedback="board.clearFeedback"
    />
  </div>
</template>


