<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Search } from 'lucide-vue-next'
import { fieldClass } from '~/constants/ui'

/** เลือกได้ 1 รายการจากรายการยาว ๆ พร้อมช่องค้นหา (คู่กับ `CheckboxList`) */
const props = withDefaults(
  defineProps<{
    options: Array<{ label: string; value: string }>
    /** แสดงช่องค้นหาเมื่อมีตัวเลือกมากกว่าจำนวนนี้ */
    searchThreshold?: number
    maxHeight?: string
    placeholder?: string
  }>(),
  { searchThreshold: 8, maxHeight: 'max-h-64', placeholder: 'ค้นหา...' }
)

const model = defineModel<string>({ default: '' })

const keyword = ref('')
const showSearch = computed(() => props.options.length > props.searchThreshold)

const shown = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return q ? props.options.filter(o => o.label.toLowerCase().includes(q)) : props.options
})
</script>

<template>
  <div class="space-y-2">
    <div v-if="showSearch" class="relative">
      <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input v-model="keyword" type="search" :placeholder="props.placeholder" :class="[fieldClass('md'), 'pl-10']" />
    </div>

    <div
      class="border border-stone-300 rounded-xl overflow-hidden divide-y divide-stone-200 bg-white overflow-y-auto"
      :class="props.maxHeight"
    >
      <button
        v-for="opt in shown"
        :key="opt.value"
        type="button"
        class="w-full p-3 flex items-center gap-3 text-xs sm:text-sm font-bold transition text-left select-none"
        :class="model === opt.value
          ? 'bg-stone-100 text-stone-900 border-l-4 border-l-slate-800 font-extrabold'
          : 'hover:bg-stone-50 text-stone-700 bg-white'"
        @click="model = opt.value"
      >
        <span
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-[11px] font-bold transition"
          :class="model === opt.value
            ? 'bg-slate-800 border-slate-800 text-white shadow-2xs'
            : 'border-stone-400 bg-white text-transparent'"
        >
          ✓
        </span>
        <span class="truncate">{{ opt.label }}</span>
      </button>

      <p v-if="!shown.length" class="p-4 text-xs text-stone-500 font-medium text-center">
        ไม่พบรายการที่ค้นหา
      </p>
    </div>
  </div>
</template>
