<script setup lang="ts">
import { ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'

export type FilterValue = 'all' | 'pending' | 'done'

const props = defineProps<{
  totalCount: number
  pendingCount: number
  doneCount: number
}>()

const model = defineModel<FilterValue>({ default: 'all' })

function onUpdate(val: unknown) {
  if (typeof val === 'string' && val) {
    model.value = val as FilterValue
  }
}
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-center justify-between px-0.5">
      <h3 class="font-black text-xs text-[#16181D] tracking-tight">ล็อตในงานนี้</h3>
    </div>

    <ToggleGroupRoot
      :model-value="model"
      type="single"
      class="grid grid-cols-3 gap-1.5"
      @update:model-value="onUpdate"
    >
      <ToggleGroupItem
        value="all"
        class="h-9 px-1.5 rounded-lg border text-xs font-bold font-mono transition select-none flex items-center justify-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2457D6]"
        :class="model === 'all' ? 'bg-[#2457D6] text-white border-[#2457D6] shadow-2xs' : 'bg-white text-[#555B64] border-[#E3E5E0] hover:bg-slate-50'"
      >
        <span>ทั้งหมด</span>
        <span class="opacity-80 font-mono">({{ props.totalCount }})</span>
      </ToggleGroupItem>

      <ToggleGroupItem
        value="pending"
        class="h-9 px-1.5 rounded-lg border text-xs font-bold font-mono transition select-none flex items-center justify-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2457D6]"
        :class="model === 'pending' ? 'bg-[#2457D6] text-white border-[#2457D6] shadow-2xs' : 'bg-white text-[#555B64] border-[#E3E5E0] hover:bg-slate-50'"
      >
        <span>รอออก TAG</span>
        <span class="opacity-80 font-mono">({{ props.pendingCount }})</span>
      </ToggleGroupItem>

      <ToggleGroupItem
        value="done"
        class="h-9 px-1.5 rounded-lg border text-xs font-bold font-mono transition select-none flex items-center justify-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2457D6]"
        :class="model === 'done' ? 'bg-[#2457D6] text-white border-[#2457D6] shadow-2xs' : 'bg-white text-[#555B64] border-[#E3E5E0] hover:bg-slate-50'"
      >
        <span>ออกแล้ว</span>
        <span class="opacity-80 font-mono">({{ props.doneCount }})</span>
      </ToggleGroupItem>
    </ToggleGroupRoot>
  </div>
</template>

