<script setup lang="ts">
import { ref } from 'vue'
import { Check, MoreVertical, Printer, Trash2 } from 'lucide-vue-next'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'
import { formatQty } from '~~/shared/utils/format'

export interface LotItem {
  id: number
  wipCode: string
  qty: number
  tagCode: string | null
  tagLot: string | null
  issuedTagId: number | null
  createdAt: string
  isNew?: boolean
}

const props = defineProps<{
  lot: LotItem
  index: number
  busy?: boolean
  readonly?: boolean
}>()

const emit = defineEmits<{
  issue: [lotId: number]
  reprint: [tagCode: string]
  cancel: [issuedTagId: number]
}>()

const showConfirmDialog = ref(false)

function triggerPrint() {
  if (props.lot.tagCode) {
    emit('reprint', props.lot.tagCode)
  }
}

function handleConfirmCancel() {
  if (props.lot.issuedTagId) {
    emit('cancel', props.lot.issuedTagId)
    showConfirmDialog.value = false
  }
}
</script>

<template>
  <div
    class="bg-white rounded-xl border border-[#E3E5E0] p-2.5 shadow-2xs space-y-1.5 transition-all duration-500"
    :class="[props.lot.isNew ? 'ring-2 ring-[#2457D6] bg-blue-50/20' : '']"
  >
    <!-- Top row: Index badge + WIP code + Qty chip -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5 min-w-0">
        <span class="w-4.5 h-4.5 rounded-full bg-[#E9EBE6] text-[#555B64] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
          {{ props.index }}
        </span>
        <span class="font-mono font-bold text-xs text-[#555B64] tracking-tight truncate min-w-0" :title="props.lot.wipCode">
          {{ props.lot.wipCode }}
        </span>
      </div>

      <span class="font-mono font-bold text-[11px] text-[#16181D] bg-[#F3F4F1] px-1.5 py-0.5 rounded-md shrink-0">
        {{ formatQty(props.lot.qty) }}
      </span>
    </div>

    <!-- If TAG issued -->
    <div
      v-if="props.lot.tagCode"
      class="bg-[#EEF7F1] rounded-lg px-2 py-1.5 flex items-center justify-between gap-2"
    >
      <div class="flex items-center gap-1.5 min-w-0">
        <Check class="w-3.5 h-3.5 text-[#1F7A4D] shrink-0 stroke-[2.5]" />
        <span class="font-bold text-[11px] text-[#1F7A4D] shrink-0">TAG</span>
        <span class="font-mono font-black text-sm text-[#16181D] tracking-tight truncate">
          {{ props.lot.tagLot || props.lot.tagCode }}
        </span>
      </div>

      <div class="flex items-center gap-0.5 shrink-0">
        <!-- Button: พิมพ์ TAG ซ้ำ -->
        <button
          type="button"
          aria-label="พิมพ์ TAG ซ้ำ"
          title="พิมพ์ TAG ซ้ำ"
          class="w-8 h-8 rounded-md hover:bg-emerald-100/70 text-[#16181D] flex items-center justify-center transition cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2457D6]"
          @click="triggerPrint"
        >
          <Printer class="w-3.5 h-3.5 text-[#16181D]" />
        </button>

        <!-- Button: ⋮ Dropdown menu for cancel -->
        <DropdownMenuRoot v-if="!props.readonly">
          <DropdownMenuTrigger
            aria-label="เมนูเพิ่มเติม"
            title="เมนูเพิ่มเติม"
            class="w-8 h-8 rounded-md hover:bg-emerald-100/70 text-[#16181D] flex items-center justify-center transition cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2457D6]"
          >
            <MoreVertical class="w-3.5 h-3.5 text-[#16181D]" />
          </DropdownMenuTrigger>

          <DropdownMenuPortal>
            <DropdownMenuContent
              side="bottom"
              align="end"
              class="z-50 min-w-[130px] bg-white rounded-xl border border-[#E3E5E0] p-1 shadow-lg animate-in fade-in-80 zoom-in-95"
            >
              <DropdownMenuItem
                class="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-[#A1261B] hover:bg-rose-50 rounded-lg cursor-pointer transition select-none outline-none"
                @select="showConfirmDialog = true"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>ยกเลิก TAG</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
      </div>
    </div>

    <!-- If TAG not issued -->
    <div v-else-if="!props.readonly">
      <button
        type="button"
        :disabled="props.busy"
        class="h-10 w-full rounded-lg bg-[#2457D6] hover:bg-[#1D46AF] active:bg-[#17388C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-[0.99] cursor-pointer disabled:opacity-50 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#2457D6]"
        @click="emit('issue', props.lot.id)"
      >
        <span v-if="props.busy" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span>{{ props.busy ? 'กำลังออก TAG...' : '+ ออกรหัส TAG' }}</span>
      </button>
    </div>


    <!-- Reka UI Confirm AlertDialog for Cancel -->
    <AlertDialogRoot v-model:open="showConfirmDialog">
      <AlertDialogPortal>
        <AlertDialogOverlay class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150" />
        <AlertDialogContent class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm bg-white rounded-2xl border border-[#E3E5E0] p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
          <AlertDialogTitle class="font-black text-base text-[#16181D]">
            ยืนยันยกเลิก TAG
          </AlertDialogTitle>

          <AlertDialogDescription class="text-xs text-[#555B64] font-medium leading-relaxed">
            คุณต้องการยกเลิก TAG รหัส <strong class="font-mono text-[#16181D]">{{ props.lot.tagLot || props.lot.tagCode }}</strong> ใช่หรือไม่? รายการจะถูกส่งกลับไปสถานะรอออก TAG
          </AlertDialogDescription>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <AlertDialogCancel
              class="px-4 py-2.5 rounded-xl border border-[#E3E5E0] hover:bg-slate-100 font-bold text-xs text-[#555B64] transition cursor-pointer"
            >
              ย้อนกลับ
            </AlertDialogCancel>
            <AlertDialogAction
              class="px-4 py-2.5 rounded-xl bg-[#A1261B] hover:bg-rose-700 font-bold text-xs text-white transition cursor-pointer shadow-2xs"
              @click="handleConfirmCancel"
            >
              ยกเลิก TAG
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </div>
</template>
