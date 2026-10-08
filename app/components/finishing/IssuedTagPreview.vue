<script setup lang="ts">
import type { IssuedTagDto } from '~~/shared/types/finishing'
import { formatQty } from '~~/shared/utils/format'

/**
 * ข้อมูลของ TAG ใหม่ที่ระบบออกให้ล็อต (ยังไม่ทำหน้าพิมพ์ในรอบนี้)
 * เรียงข้อมูลตามใบ TAG จริงเพื่อให้พนักงานเทียบกับของเดิมได้
 */
const props = defineProps<{ tag: IssuedTagDto }>()

const ROWS: Array<{ label: string; key: keyof IssuedTagDto; mono?: boolean }> = [
  { label: 'รหัสสินค้า', key: 'itemCode', mono: true },
  { label: 'ชื่อสินค้า', key: 'itemName' },
  { label: 'ขนาด', key: 'sizeText' },
  { label: 'Lot ใหม่', key: 'lot', mono: true },
  { label: 'TAG ต้นทาง (คัดบอร์ด)', key: 'sourceTagCode', mono: true },
]
</script>

<template>
  <div class="bg-white border border-sky-300 rounded-xl overflow-hidden shadow-sm">
    <div class="bg-sky-600 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
      <span class="text-xs font-black uppercase tracking-wider">TAG WIP (ฟินิชชิ่ง)</span>
      <span class="font-mono font-black text-xs">RUNNING {{ String(props.tag.running).padStart(3, '0') }}</span>
    </div>

    <p class="px-4 py-3 text-center font-mono font-black text-base sm:text-xl tracking-wider text-slate-900 break-all border-b border-slate-100">
      {{ props.tag.code }}
    </p>

    <dl class="divide-y divide-slate-100 text-xs sm:text-sm">
      <div v-for="row in ROWS" :key="row.key" class="flex items-start gap-3 px-4 py-2">
        <dt class="w-32 sm:w-44 shrink-0 text-slate-500 font-bold">{{ row.label }}</dt>
        <dd class="flex-1 min-w-0 font-bold text-slate-900 break-words" :class="row.mono ? 'font-mono' : ''">
          {{ props.tag[row.key] || '-' }}
        </dd>
      </div>

      <div class="flex items-start gap-3 px-4 py-2">
        <dt class="w-32 sm:w-44 shrink-0 text-slate-500 font-bold">จำนวน</dt>
        <dd class="flex-1 font-mono font-black text-slate-900">{{ formatQty(props.tag.quantity) }}</dd>
      </div>
    </dl>
  </div>
</template>
