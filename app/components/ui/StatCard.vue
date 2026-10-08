<script setup lang="ts">
import type { Component } from 'vue'
import { CARD_CLASS } from '~/constants/ui'

/** การ์ด KPI ในหน้าแรก (เดิมเขียนซ้ำ 4 บล็อกเหมือนกัน) */
const props = withDefaults(
  defineProps<{
    label: string
    value: string
    unit?: string
    icon?: Component
    /** ตัวย่อกรณีไม่มี icon เช่น YLD */
    abbr?: string
    tone?: 'neutral' | 'success' | 'danger' | 'info'
  }>(),
  { tone: 'neutral' }
)

const ICON_TONE = {
  neutral: 'bg-[#696CFF]/10 text-[#696CFF] border-[#696CFF]/20',
  success: 'bg-[#71DD37]/10 text-[#71DD37] border-[#71DD37]/20',
  danger: 'bg-[#FF3E1D]/10 text-[#FF3E1D] border-[#FF3E1D]/20',
  info: 'bg-[#03C3EC]/10 text-[#03C3EC] border-[#03C3EC]/20',
} as const

const VALUE_TONE = {
  neutral: 'text-slate-800',
  success: 'text-slate-800',
  danger: 'text-[#FF3E1D]',
  info: 'text-slate-800',
} as const
</script>

<template>
  <div :class="[CARD_CLASS, 'p-4 flex items-center justify-between', props.tone === 'danger' ? 'border-l-4 border-l-rose-500' : '']">
    <div class="min-w-0">
      <span
        class="text-xs font-bold uppercase tracking-wider block"
        :class="props.tone === 'danger' ? 'text-rose-700' : 'text-slate-500'"
      >
        {{ props.label }}
      </span>
      <p class="text-3xl font-extrabold font-mono mt-1" :class="VALUE_TONE[props.tone]">
        {{ props.value }}
        <span v-if="props.unit" class="text-xs font-semibold text-slate-500 font-sans">{{ props.unit }}</span>
      </p>
    </div>

    <div
      class="w-11 h-11 rounded-xl border flex items-center justify-center font-extrabold text-xs font-mono shrink-0"
      :class="ICON_TONE[props.tone]"
    >
      <component :is="props.icon" v-if="props.icon" class="w-6 h-6" />
      <template v-else>{{ props.abbr }}</template>
    </div>
  </div>
</template>
