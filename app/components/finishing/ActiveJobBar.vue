<script setup lang="ts">
import { ArrowLeft, SquareStop } from 'lucide-vue-next'
import type { JobDto } from '~~/shared/types/finishing'
import { shiftLabel } from '~~/shared/constants/shifts'
import { formatShortThaiDate } from '~~/shared/utils/format'

/** แถบหัวงานแบบ App Header กะทัดรัด ไม่ใช้ Card เปลืองพื้นที่ */
const props = withDefaults(
  defineProps<{
    job: JobDto
    busy?: boolean
    showFinishButton?: boolean
  }>(),
  {
    showFinishButton: true,
  }
)
const emit = defineEmits<{ back: []; finish: [jobId: number] }>()
</script>

<template>
  <div class="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
    <div class="flex items-center gap-2.5 min-w-0">
      <button
        type="button"
        class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition active:scale-95 shrink-0 cursor-pointer"
        title="กลับไปรายการงาน"
        @click="emit('back')"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>

      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-mono font-black text-base sm:text-lg text-slate-900 truncate tracking-tight">{{ props.job.code }}</span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            กำลังแปรรูป
          </span>
        </div>
        <p class="text-xs text-slate-500 font-semibold truncate mt-0.5">
          {{ formatShortThaiDate(props.job.startedAt) }} • {{ shiftLabel(props.job.shift) }} • {{ props.job.machine }}
          <span v-if="props.job.pvcType" class="text-slate-700 font-bold">({{ props.job.pvcType }})</span>
          • พนักงาน: {{ props.job.operators.join(', ') || '-' }}
        </p>
      </div>
    </div>

    <div v-if="props.showFinishButton" class="shrink-0">
      <button
        type="button"
        :disabled="props.busy"
        class="w-full sm:w-auto px-4 h-10 rounded-xl bg-rose-700 hover:bg-rose-600 active:bg-rose-800 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-2xs cursor-pointer"
        @click="emit('finish', props.job.id)"
      >
        <SquareStop class="w-4 h-4" />
        <span>จบงาน</span>
      </button>
    </div>
  </div>
</template>

