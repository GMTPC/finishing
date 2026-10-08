<script setup lang="ts">
import { computed } from 'vue'
import type { StepNumber } from '~~/shared/types/finishing'
import { STEP_VIEWS } from '~/constants/step-icons'

/** แท็บขั้นตอน 0-4 ตรงตาม Wireframe (0 Job, 1 รับเข้า, 2 ก่อนผลิต, 3 ผลิต, 4 ส่งต่อ/FG) */
const props = defineProps<{
  current: StepNumber | 0
  hasActiveJob?: boolean
}>()

const emit = defineEmits<{ select: [step: StepNumber | 0] }>()

const navItems = computed(() => [
  { step: 0 as const, label: '0 Job' },
  ...STEP_VIEWS.map(s => ({
    step: s.step,
    label: s.step === 4 ? '4 ส่งต่อ/FG' : `${s.step} ${s.label.replace(/^\d+\.\s*/, '')}`,
  })),
])
</script>

<template>
  <nav class="bg-white border border-stone-300/90 rounded-xl overflow-hidden shadow-2xs">
    <div class="grid grid-cols-5 divide-x divide-stone-200 text-center">
      <button
        v-for="item in navItems"
        :key="item.step"
        type="button"
        class="py-2.5 sm:py-3 px-1 transition relative select-none flex flex-col items-center justify-center gap-0.5"
        :class="props.current === item.step
          ? 'bg-stone-100 text-stone-900 font-extrabold'
          : 'bg-white text-stone-500 font-medium hover:bg-stone-50 hover:text-stone-800'"
        @click="emit('select', item.step)"
      >
        <span class="text-[11px] sm:text-xs tracking-tight truncate max-w-full">
          {{ item.label }}
        </span>
        <!-- แถบเส้นสีเขียวด้านล่างเมื่อเลือกขั้นตอนนั้นอยู่ -->
        <span
          v-if="props.current === item.step"
          class="absolute bottom-0 inset-x-1 h-0.5 bg-emerald-600 rounded-full"
        />
      </button>
    </div>
  </nav>
</template>
