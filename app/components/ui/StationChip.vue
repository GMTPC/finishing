<script setup lang="ts">
import type { StationId } from '~~/shared/types/finishing'
import { stationBadgeClass } from '~/constants/station-theme'

/** ป้ายรหัสสถานี S1–S5 ใช้ทุกที่ที่ต้องโชว์สีประจำสถานี */
const props = withDefaults(
  defineProps<{
    station: StationId | string
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' }
)

const SIZE = {
  xs: 'w-6 h-6 rounded-md text-[11px]',
  sm: 'w-8 h-8 rounded-lg text-xs',
  md: 'w-11 h-11 rounded-xl text-base',
  lg: 'w-14 h-14 rounded-2xl text-xl',
} as const
</script>

<template>
  <span
    class="inline-flex items-center justify-center font-black font-mono border shadow-sm shrink-0"
    :class="[SIZE[props.size], stationBadgeClass(props.station)]"
  >
    {{ props.station }}
  </span>
</template>
