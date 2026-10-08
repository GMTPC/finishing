<script setup lang="ts">
import { computed } from 'vue'
import { Check, Plus, Trash2 } from 'lucide-vue-next'
import type { IssuedTagDto, StationId } from '~~/shared/types/finishing'
import { formatQty } from '~~/shared/utils/format'
import { stationDotClass, stationPrimaryBtnClass } from '~/constants/station-theme'

/** คอลัมน์ขวา: ข้อมูลออก — ดีไซน์ Item-Level Card + ปุ่มออกรหัสแบบ Full Width */
const props = withDefaults(
  defineProps<{
    issued: IssuedTagDto[]
    pendingCount: number
    stationId?: StationId | string
    busy?: boolean
    readonly?: boolean
  }>(),
  {
    stationId: 'S1',
  }
)

const emit = defineEmits<{ issue: []; remove: [tagId: number] }>()

const canIssue = computed(() => props.pendingCount > 0 && !props.readonly)
</script>

<template>
  <div class="space-y-2.5">
    <!-- ปุ่มออกรหัสใหม่แบบเต็มความกว้าง (Col-12 Full Width Button) -->
    <div v-if="!props.readonly">
      <button
        type="button"
        :disabled="!canIssue || props.busy"
        class="w-full h-11 sm:h-12 rounded-xl text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        :class="stationPrimaryBtnClass(props.stationId)"
        @click="emit('issue')"
      >
        <Plus class="w-4 h-4 sm:w-5 sm:h-5" />
        <span>
          {{ props.busy ? 'กำลังออกรหัส...' : `ออกรหัสใหม่${props.pendingCount ? ` (${props.pendingCount} ค้าง)` : ''}` }}
        </span>
      </button>
    </div>

    <!-- หัวข้อข้อมูลออก -->
    <div class="flex items-center justify-between px-1 text-xs font-bold text-slate-800">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span class="font-extrabold text-slate-900">ข้อมูลออก (TAG ใหม่)</span>
      </div>
      <span class="font-mono text-[11px] bg-slate-100 text-slate-700 border border-slate-200/70 px-2 py-0.5 rounded-lg font-bold shrink-0">
        {{ props.issued.length }} รายการ
      </span>
    </div>

    <!-- รายการ Item-Level Cards -->
    <div class="space-y-1.5">
      <div
        v-for="tag in props.issued"
        :key="tag.id"
        class="bg-white border border-slate-200/90 rounded-xl p-2.5 sm:p-3 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-5 text-center shrink-0 flex items-center justify-center">
            <Check class="w-4 h-4 text-emerald-600" />
          </span>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono font-black text-slate-900 text-xs sm:text-sm whitespace-nowrap">{{ tag.lot }}</span>
              <span class="font-mono font-bold text-slate-600 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded truncate border border-slate-200/60">{{ tag.code }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <span class="font-mono font-black text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
            {{ formatQty(tag.quantity) }}
          </span>
          <button
            v-if="!props.readonly"
            type="button"
            :disabled="props.busy"
            class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition cursor-pointer"
            title="ลบรายการออก TAG นี้"
            @click="emit('remove', tag.id)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-if="!props.issued.length" class="bg-white border border-dashed border-slate-300 rounded-xl p-4 text-center text-slate-400 font-medium text-xs">
        ยังไม่ได้ออกรหัสใหม่ในงานนี้
      </div>
    </div>
  </div>
</template>

