<script setup lang="ts">
import { ref } from 'vue'
import { Camera, Trash2 } from 'lucide-vue-next'
import QrScanner from '~/components/finishing/QrScanner.vue'
import type { StationId, WipEntryDto } from '~~/shared/types/finishing'
import { formatQty } from '~~/shared/utils/format'
import { fieldClass } from '~/constants/ui'
import { stationDotClass } from '~/constants/station-theme'

/** คอลัมน์ซ้าย: ข้อมูลเข้า (WIP) — ดีไซน์ Item-Level Card สำหรับ Mobile */
const props = withDefaults(
  defineProps<{
    entries: WipEntryDto[]
    stationId?: StationId | string
    busy?: boolean
    readonly?: boolean
  }>(),
  {
    stationId: 'S1',
  }
)

const emit = defineEmits<{ add: [barcode: string]; remove: [entryId: number] }>()

const barcode = ref('')
const showCamera = ref(false)

function submit() {
  const value = barcode.value.trim()
  if (!value) return
  emit('add', value)
  barcode.value = ''
}

function onCameraScan(code: string) {
  emit('add', code)
  showCamera.value = false
}
</script>

<template>
  <div class="space-y-2.5">
    <!-- ช่องสแกนบาร์โค้ด + ปุ่มเปิดกล้อง -->
    <div v-if="!props.readonly" class="space-y-1">
      <form class="flex items-center gap-2" @submit.prevent="submit">
        <input
          v-model="barcode"
          type="text"
          inputmode="text"
          autocomplete="off"
          placeholder="สแกนบาร์โค้ดรับเข้า WIP (กด Enter บันทึก)..."
          :class="[fieldClass('md'), 'font-mono flex-1 bg-white h-11 sm:h-12 text-sm sm:text-base border-slate-300 focus:border-slate-500 shadow-2xs']"
        />
        <button
          type="button"
          class="h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 shadow-2xs transition active:scale-95 cursor-pointer"
          title="เปิดกล้องสแกนบาร์โค้ด"
          @click="showCamera = !showCamera"
        >
          <Camera class="w-5 h-5 sm:w-5 sm:h-5 text-slate-300" />
          <span class="hidden sm:inline">เปิดกล้องสแกน</span>
          <span class="sm:hidden">กล้อง</span>
        </button>
      </form>
      <QrScanner v-if="showCamera" @scan="onCameraScan" @close="showCamera = false" />
    </div>

    <!-- หัวข้อข้อมูลเข้า -->
    <div class="flex items-center justify-between px-1 text-xs font-bold text-slate-800">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="stationDotClass(props.stationId)" />
        <span class="font-extrabold text-slate-900">ข้อมูลเข้า (WIP)</span>
      </div>
      <span class="font-mono text-[11px] bg-slate-100 text-slate-700 border border-slate-200/70 px-2 py-0.5 rounded-lg font-bold">
        {{ props.entries.length }} รายการ
      </span>
    </div>

    <!-- รายการ Item-Level Cards -->
    <div class="space-y-1.5">
      <div
        v-for="(entry, idx) in props.entries"
        :key="entry.id"
        class="bg-white border border-slate-200/90 rounded-xl p-2.5 sm:p-3 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-5 text-center font-mono text-xs font-bold text-slate-400 shrink-0">{{ idx + 1 }}</span>
          <div class="min-w-0">
            <p class="font-mono font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate">{{ entry.barcode }}</p>
            <p v-if="entry.issued" class="text-[11px] text-emerald-600 font-extrabold mt-0.5 truncate flex items-center gap-1">
              <span>✓ ออกรหัสแล้ว:</span>
              <span class="font-mono">{{ entry.issued.lot }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <span class="font-mono font-black text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
            {{ formatQty(entry.quantity) }}
          </span>
          <button
            v-if="!props.readonly"
            type="button"
            :disabled="!!entry.issued || props.busy"
            class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-20 transition cursor-pointer"
            :title="entry.issued ? 'ออกรหัสแล้ว ลบไม่ได้' : 'ลบรายการนี้'"
            @click="emit('remove', entry.id)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-if="!props.entries.length" class="bg-white border border-dashed border-slate-300 rounded-xl p-4 text-center text-slate-400 font-medium text-xs">
        ยังไม่มีรายการรับเข้า — สแกนบาร์โค้ดจากใบ TAG คัดบอร์ด
      </div>
    </div>
  </div>
</template>

