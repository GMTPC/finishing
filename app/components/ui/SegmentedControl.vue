<script setup lang="ts">
import { ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'

export interface SegmentOption {
  label: string
  value: string
  /** class ตอนถูกเลือก (ถ้าไม่ระบุใช้สีฟ้าเริ่มต้น) */
  activeClass?: string
}

const props = withDefaults(
  defineProps<{
    options: SegmentOption[]
    /** จำนวนคอลัมน์ (ค่าเริ่มต้น = จำนวนตัวเลือก) */
    columns?: number
    size?: 'md' | 'lg'
  }>(),
  { size: 'md' }
)

const model = defineModel<string>({ required: true })

const DEFAULT_ACTIVE = 'bg-slate-800 text-white border-slate-800 shadow-2xs font-bold'
const IDLE = 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50 font-semibold'

const SIZE = {
  md: 'py-2.5 text-xs sm:text-sm',
  lg: 'py-3 text-sm sm:text-base',
} as const

/** Reka ยอมให้กดซ้ำเพื่อยกเลิกการเลือก — หน้างานต้องมีค่าตลอด จึงกันค่าว่างไว้ */
function onUpdate(value: unknown) {
  if (typeof value === 'string' && value) model.value = value
}
</script>

<template>
  <ToggleGroupRoot
    :model-value="model"
    type="single"
    class="grid gap-2.5"
    :style="{ gridTemplateColumns: `repeat(${props.columns ?? props.options.length}, minmax(0, 1fr))` }"
    @update:model-value="onUpdate"
  >
    <ToggleGroupItem
      v-for="opt in props.options"
      :key="opt.value"
      :value="opt.value"
      class="rounded-xl border font-mono text-center shadow-2xs transition select-none active:scale-[0.99] flex items-center justify-center gap-1.5"
      :class="[SIZE[props.size], model === opt.value ? (opt.activeClass || DEFAULT_ACTIVE) : IDLE]"
    >
      <span v-if="model === opt.value" class="text-xs">✓</span>
      <span>{{ opt.label }}</span>
    </ToggleGroupItem>
  </ToggleGroupRoot>
</template>
