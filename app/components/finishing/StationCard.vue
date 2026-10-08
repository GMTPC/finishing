<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import StationChip from '~/components/ui/StationChip.vue'
import StatusPill from '~/components/ui/StatusPill.vue'
import type { StationMeta } from '~~/shared/types/finishing'
import { CARD_CLASS } from '~/constants/ui'
import { stationPath } from '~/utils/routes'

/** การ์ดเลือกสถานีในหน้าแรก (เดิมเขียนซ้ำ 2 บล็อกสำหรับสายต่อเนื่อง/ไลน์อิสระ) */
const props = defineProps<{
  station: StationMeta
  /** ถ้ากำลังทำงานอยู่ ให้ระบุเลขขั้นตอนปัจจุบัน */
  activeStep?: number | null
}>()
</script>

<template>
  <NuxtLink
    :to="stationPath(props.station.id)"
    class="sneat-card sneat-card-hover p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between gap-4 active:scale-[0.99] select-none group border-slate-200/80"
  >
    <div class="flex items-center gap-3">
      <StationChip :station="props.station.id" size="md" />
      <div class="flex-1 min-w-0">
        <h3 class="text-sm sm:text-base font-extrabold text-slate-800 group-hover:text-[#696CFF] transition leading-snug truncate">
          {{ props.station.title }}
        </h3>
        <p class="text-xs text-slate-400 font-medium truncate mt-0.5">{{ props.station.subtitle }}</p>
      </div>
    </div>

    <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <span
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
        :class="props.activeStep
          ? 'bg-[#71DD37]/10 text-[#54A925] border-[#71DD37]/30'
          : 'bg-slate-100 text-slate-500 border-slate-200'"
      >
        <span
          class="w-2 h-2 rounded-full"
          :class="props.activeStep ? 'bg-[#71DD37] animate-pulse' : 'bg-slate-300'"
        />
        <span>{{ props.activeStep ? `กำลังทำงาน · ขั้น ${props.activeStep}` : 'ว่าง' }}</span>
      </span>

      <span class="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#696CFF] group-hover:text-white text-slate-500 flex items-center justify-center transition shrink-0 shadow-2xs group-hover:shadow-sneat-primary">
        <ArrowRight class="w-4 h-4" />
      </span>
    </div>
  </NuxtLink>
</template>
