<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-vue-next'

/** แถบแจ้งเตือน/ยืนยันผล — ใช้แทนการเขียน div สีเองในแต่ละหน้า */
const props = withDefaults(
  defineProps<{ tone?: 'success' | 'warning' | 'danger' | 'info' }>(),
  { tone: 'info' }
)

const TONE = {
  success: 'bg-emerald-50/90 border-emerald-400/80 text-emerald-900',
  warning: 'bg-amber-50/90 border-amber-300 text-amber-900',
  danger: 'bg-rose-50/90 border-rose-300 text-rose-900',
  info: 'bg-emerald-50/80 border-emerald-300 text-emerald-800',
} as const

const ICON = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
} as const
</script>

<template>
  <div
    class="p-3.5 sm:p-4 border rounded-2xl shadow-sm font-bold text-xs sm:text-sm flex items-center gap-3"
    :class="TONE[props.tone]"
  >
    <component :is="ICON[props.tone]" class="w-5 h-5 shrink-0" />
    <span><slot /></span>
  </div>
</template>
