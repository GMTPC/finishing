<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { JobDto } from '~~/shared/types/finishing'
import { shiftLabel } from '~~/shared/constants/shifts'

const props = defineProps<{
  job: JobDto
  stationTitle?: string
}>()

const emit = defineEmits<{ back: [] }>()
</script>

<template>
  <header class="sticky top-0 z-20 bg-white border-b border-[#E3E5E0] px-3 py-1.5 flex items-center justify-between gap-2 shadow-2xs">
    <div class="flex items-center gap-2.5 min-w-0">
      <button
        type="button"
        aria-label="กลับ"
        class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#E3E5E0] hover:bg-slate-50 text-[#16181D] flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2457D6]"
        @click="emit('back')"
      >
        <ArrowLeft class="w-4 h-4 stroke-[2.2]" />
      </button>

      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-mono font-black text-sm sm:text-base text-[#16181D] tracking-tight truncate leading-tight">
            {{ props.job.code }}
          </span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E2F3E9] text-[#1F6B45] shrink-0 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-[#1F7A4D] animate-pulse" />
            กำลังแปรรูป
          </span>
        </div>
        <p class="text-[11px] text-[#555B64] font-medium truncate leading-tight">
          {{ props.job.stationId }} · {{ shiftLabel(props.job.shift) }} · {{ props.job.machine }}
        </p>
      </div>
    </div>
  </header>
</template>

