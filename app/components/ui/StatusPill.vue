<script setup lang="ts">
/** ป้ายสถานะเล็ก ๆ (กำลังทำงาน / พร้อมทำงาน / ONLINE ฯลฯ) */
const props = withDefaults(
  defineProps<{
    tone?: 'neutral' | 'success' | 'warning' | 'danger'
    pulse?: boolean
  }>(),
  { tone: 'neutral', pulse: false }
)

const TONE = {
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
} as const

const DOT = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
} as const
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold"
    :class="TONE[props.tone]"
  >
    <span v-if="props.pulse" class="w-2 h-2 rounded-full animate-pulse" :class="DOT[props.tone]" />
    <slot />
  </span>
</template>
