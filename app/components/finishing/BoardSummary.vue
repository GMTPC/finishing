<script setup lang="ts">
import type { JobTotals, StationId } from '~~/shared/types/finishing'
import { formatQty } from '~~/shared/utils/format'
import { stationDotClass } from '~/constants/station-theme'

/** แถบสรุปยอดสะสม — Clean Industrial Metric Strip */
const props = withDefaults(
  defineProps<{
    totals: JobTotals
    stationId?: StationId | string
    readonly?: boolean
  }>(),
  {
    stationId: 'S1',
  }
)
</script>

<template>
  <div class="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3.5 shadow-2xs font-mono">
    <div class="grid grid-cols-4 divide-x divide-slate-100 text-center items-center">
      <div class="px-1">
        <div class="flex items-center justify-center gap-1.5 mb-1">
          <span class="w-1.5 h-1.5 rounded-full" :class="stationDotClass(props.stationId)" />
          <span class="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">เข้า</span>
        </div>
        <span class="text-base sm:text-lg lg:text-xl font-black text-slate-900 leading-none block">{{ formatQty(props.totals.inQty) }}</span>
      </div>

      <div class="px-1">
        <div class="flex items-center justify-center gap-1.5 mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span class="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">ออก</span>
        </div>
        <span class="text-base sm:text-lg lg:text-xl font-black text-emerald-600 leading-none block">{{ formatQty(props.totals.outQty) }}</span>
      </div>

      <div class="px-1">
        <div class="flex items-center justify-center gap-1.5 mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span class="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">คงค้าง (HD)</span>
        </div>
        <span class="text-base sm:text-lg lg:text-xl font-black text-amber-600 leading-none block">{{ formatQty(props.totals.holdQty) }}</span>
      </div>

      <div class="px-1">
        <div class="flex items-center justify-center gap-1.5 mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span class="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">ตัดทิ้ง</span>
        </div>
        <span class="text-base sm:text-lg lg:text-xl font-black text-rose-600 leading-none block">{{ formatQty(props.totals.trimQty) }}</span>
      </div>
    </div>
  </div>
</template>

