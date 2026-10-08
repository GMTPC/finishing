<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, CheckCircle2, Clock, Cog, Layers, Users } from 'lucide-vue-next'
import StatusPill from '~/components/ui/StatusPill.vue'
import type { JobDto } from '~~/shared/types/finishing'
import { shiftLabel } from '~~/shared/constants/shifts'
import { formatQty, formatShortThaiDate, formatTime } from '~~/shared/utils/format'
import { stationPrimaryBtnClass } from '~/constants/station-theme'

/** การ์ด 1 งาน (job) — ดีไซน์แนวยาวเต็มความกว้าง (Full Width Row Card) */
const props = defineProps<{
  job: JobDto
  selected?: boolean
  busy?: boolean
}>()

const emit = defineEmits<{ open: [jobId: number]; finish: [jobId: number] }>()

const isActive = computed(() => props.job.status === 'active')
const operatorsText = computed(() => props.job.operators.join(', ') || '-')
</script>

<template>
  <div
    :class="[
      'w-full bg-white border rounded-2xl p-4 sm:p-5 transition shadow-2xs space-y-4',
      props.selected ? 'ring-2 ring-slate-900 border-slate-900 bg-slate-50/50' : 'border-slate-200/90 hover:border-slate-300',
      isActive ? '' : 'opacity-90',
    ]"
  >
    <!-- แถวบน: รหัสงาน, วันที่/กะ, รายละเอียดเครื่องและพนักงาน -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
      <div class="space-y-1">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="font-mono font-black text-lg sm:text-xl text-slate-900 tracking-tight">{{ props.job.code }}</span>
          <StatusPill :tone="isActive ? 'success' : 'neutral'" :pulse="isActive">
            {{ isActive ? 'กำลังแปรรูป' : 'แปรรูปแล้ว' }}
          </StatusPill>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 font-bold">
          {{ formatShortThaiDate(props.job.startedAt) }} • {{ shiftLabel(props.job.shift) }}
        </p>
      </div>

      <!-- รายละเอียดเครื่องจักร / PVC / พนักงาน -->
      <div class="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-slate-700 font-semibold">
        <div class="flex items-center gap-1.5">
          <Cog class="w-4 h-4 text-slate-400 shrink-0" />
          <span class="font-bold text-slate-900">{{ props.job.machine }}</span>
        </div>
        <div v-if="props.job.pvcType" class="flex items-center gap-1.5">
          <Layers class="w-4 h-4 text-slate-400 shrink-0" />
          <span>ชนิด PVC: <strong class="text-slate-900">{{ props.job.pvcType }}</strong></span>
        </div>
        <div class="flex items-center gap-1.5">
          <Users class="w-4 h-4 text-slate-400 shrink-0" />
          <span>{{ operatorsText }}</span>
        </div>
        <div v-if="!isActive && props.job.finishedAt" class="flex items-center gap-1.5">
          <Clock class="w-4 h-4 text-slate-400 shrink-0" />
          <span>จบงาน {{ formatShortThaiDate(props.job.finishedAt) }} {{ formatTime(props.job.finishedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- แถวล่าง: ยอดสถิติสะสม + ปุ่มดำเนินการ -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <!-- สถิติตัวเลข 3 ช่อง -->
      <div class="grid grid-cols-3 gap-3 sm:gap-6 text-center font-mono bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 flex-1 max-w-md">
        <div>
          <p class="text-[11px] sm:text-xs text-slate-500 font-extrabold uppercase">บันทึก</p>
          <p class="text-base sm:text-xl font-black text-slate-900">{{ props.job.recordCount ?? 0 }}</p>
        </div>
        <div>
          <p class="text-[11px] sm:text-xs text-slate-500 font-extrabold uppercase">ผลิตได้</p>
          <p class="text-base sm:text-xl font-black text-emerald-600">{{ formatQty(props.job.producedQty) }}</p>
        </div>
        <div>
          <p class="text-[11px] sm:text-xs text-slate-500 font-extrabold uppercase">แผ่นเสีย</p>
          <p class="text-base sm:text-xl font-black text-rose-600">{{ formatQty(props.job.defectQty) }}</p>
        </div>
      </div>

      <!-- ปุ่มเปิดงาน / จบงาน -->
      <div v-if="isActive" class="flex items-center gap-2.5 sm:w-auto w-full">
        <button
          type="button"
          class="flex-1 sm:flex-none sm:min-w-[180px] h-12 sm:h-13 px-6 rounded-xl text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-2xs cursor-pointer"
          :class="stationPrimaryBtnClass(props.job.stationId)"
          @click="emit('open', props.job.id)"
        >
          <span>{{ props.selected ? 'ทำงานต่อ' : 'เปิดงานนี้' }}</span>
          <ArrowRight class="w-5 h-5" />
        </button>

        <button
          type="button"
          :disabled="props.busy"
          class="h-12 sm:h-13 px-5 sm:px-6 rounded-xl bg-slate-900 hover:bg-rose-900 border border-slate-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-2xs disabled:opacity-50 cursor-pointer group"
          @click="emit('finish', props.job.id)"
        >
          <CheckCircle2 class="w-5 h-5 text-rose-500 group-hover:text-rose-400" />
          <span>จบงาน</span>
        </button>
      </div>
    </div>
  </div>
</template>

