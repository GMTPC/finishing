<script setup lang="ts">
import { computed } from 'vue'
import { formatQty } from '~~/shared/utils/format'

const props = defineProps<{
  inQty: number
  outQty: number
  pendingQty: number
  scrapQty: number
}>()

const percent = computed(() => {
  if (props.inQty <= 0) return 0
  const ratio = (props.outQty / props.inQty) * 100
  return Math.min(100, Math.max(0, Math.round(ratio)))
})
</script>

<template>
  <div class="bg-white rounded-xl border border-[#E3E5E0] p-2.5 space-y-1.5 shadow-2xs">
    <div class="flex items-center justify-between text-xs sm:text-sm">
      <span class="font-bold text-[#16181D]">ออกแล้ว</span>
      <div class="font-mono">
        <b class="text-lg sm:text-xl font-black text-[#1F7A4D] leading-none">{{ formatQty(props.outQty) }}</b>
        <span class="text-[#555B64] font-bold text-xs"> / {{ formatQty(props.inQty) }} ชิ้น</span>
      </div>
    </div>

    <!-- Progress bar 6px -->
    <div class="h-1.5 w-full bg-[#E9EBE6] rounded-full overflow-hidden">
      <div
        class="h-full bg-[#1F7A4D] rounded-full transition-all duration-300"
        :style="{ width: `${percent}%` }"
      />
    </div>

    <div class="flex items-center justify-between text-[11px] font-bold font-mono text-[#555B64]">
      <span class="text-[#9A5A00]">คงค้าง {{ formatQty(props.pendingQty) }}</span>
      <span>ตัดทิ้ง {{ formatQty(props.scrapQty) }}</span>
    </div>
  </div>
</template>

