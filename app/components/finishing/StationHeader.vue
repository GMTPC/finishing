<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import StationChip from '~/components/ui/StationChip.vue'
import type { StationMeta } from '~~/shared/types/finishing'
import { stationDotClass } from '~/constants/station-theme'
import { useSessionStore } from '~/stores/session'

/** หัวหน้าสถานี: ปุ่มย้อนกลับ, ป้ายสถานี, ชื่อสถานี และกะ · ชื่อพนักงาน */
const props = defineProps<{ station: StationMeta }>()
const session = useSessionStore()
</script>

<template>
  <div class="sneat-card overflow-hidden border-slate-200/80 shadow-sneat">
    <!-- แถบเส้นสีประจำสถานีด้านบนสุด -->
    <div class="h-1.5 w-full" :class="stationDotClass(props.station.id)" />

    <header class="p-3.5 sm:p-4 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <NuxtLink
          to="/"
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200/80 flex items-center justify-center transition active:scale-95 shrink-0 shadow-2xs"
          title="กลับหน้าแรก"
        >
          <ArrowLeft class="w-4 h-4 sm:w-5 sm:h-5" />
        </NuxtLink>

        <StationChip :station="props.station.id" size="md" />

        <div class="min-w-0">
          <h1 class="text-lg sm:text-xl lg:text-2xl font-black text-slate-800 tracking-tight truncate leading-tight">
            {{ props.station.title }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 font-bold mt-0.5 truncate">
            กะ {{ session.shiftText }} · [{{ session.operatorName || 'พนักงาน' }}]
          </p>
        </div>
      </div>
    </header>
  </div>
</template>
