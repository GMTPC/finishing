<script setup lang="ts">
import { Check } from 'lucide-vue-next'

/** เลือกได้หลายรายการ (เช่น รายชื่อพนักงานที่ทำงานใน job) */
const props = withDefaults(
  defineProps<{
    options: Array<{ label: string; value: string; hint?: string }>
    maxHeight?: string
  }>(),
  { maxHeight: 'max-h-56' }
)

const model = defineModel<string[]>({ default: () => [] })

function toggle(value: string) {
  model.value = model.value.includes(value)
    ? model.value.filter(v => v !== value)
    : [...model.value, value]
}
</script>

<template>
  <div class="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50/50 overflow-y-auto" :class="props.maxHeight">
    <button
      v-for="opt in props.options"
      :key="opt.value"
      type="button"
      class="w-full p-3 flex items-center justify-between gap-3 text-sm font-semibold transition text-left"
      :class="model.includes(opt.value) ? 'bg-sky-600 text-white' : 'hover:bg-slate-100 text-slate-700'"
      @click="toggle(opt.value)"
    >
      <span class="flex items-center gap-2.5 min-w-0">
        <span
          class="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
          :class="model.includes(opt.value) ? 'bg-white border-white text-sky-700' : 'border-slate-300 bg-white'"
        >
          <Check v-if="model.includes(opt.value)" class="w-3.5 h-3.5" />
        </span>
        <span class="truncate">{{ opt.label }}</span>
      </span>
      <span
        v-if="opt.hint"
        class="text-xs font-normal shrink-0"
        :class="model.includes(opt.value) ? 'text-sky-100' : 'text-slate-500'"
      >
        {{ opt.hint }}
      </span>
    </button>
  </div>
</template>
