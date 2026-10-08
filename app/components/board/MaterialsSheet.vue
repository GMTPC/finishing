<script setup lang="ts">
import { ref } from 'vue'
import { ChevronRight, Layers, Plus, Trash2, X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import type { JobMaterialDto } from '~~/shared/types/finishing'
import JobMaterialsPanel from '~/components/finishing/JobMaterialsPanel.vue'

const props = defineProps<{
  materials: JobMaterialDto[]
  readonly?: boolean
  busy?: boolean
}>()

const emit = defineEmits<{
  add: [item: { materialCode: string; materialName: string; quantity: number; unit?: string }]
  remove: [id: string | number]
}>()

const isOpen = ref(false)
</script>

<template>
  <div>
    <!-- Compact trigger button -->
    <button
      type="button"
      class="h-9 sm:h-10 w-full rounded-xl bg-white border border-[#E3E5E0] px-3 flex items-center justify-between font-bold text-xs sm:text-sm text-[#16181D] cursor-pointer hover:bg-slate-50 transition active:scale-[0.99] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#2457D6]"
      @click="isOpen = true"
    >
      <div class="flex items-center gap-2">
        <Layers class="w-4 h-4 text-[#9A5A00] shrink-0" />
        <span>วัตถุดิบที่ใช้</span>
      </div>
      <div class="flex items-center gap-1 text-xs font-mono font-bold text-[#555B64]">
        <span>{{ props.materials.length }} รายการ</span>
        <ChevronRight class="w-4 h-4 text-[#555B64]" />
      </div>
    </button>


    <!-- Reka UI Bottom Sheet Dialog -->
    <DialogRoot v-model:open="isOpen">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" />
        <DialogContent class="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl border-t border-[#E3E5E0] p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-250">
          <div class="w-12 h-1 bg-[#E3E5E0] rounded-full mx-auto -mt-1" />

          <div class="flex items-center justify-between">
            <DialogTitle class="font-black text-base text-[#16181D]">
              วัตถุดิบที่ใช้ในการแปรรูป
            </DialogTitle>
            <DialogClose class="p-2 rounded-xl hover:bg-slate-100 text-[#555B64] cursor-pointer">
              <X class="w-5 h-5" />
            </DialogClose>
          </div>

          <JobMaterialsPanel
            :materials="props.materials"
            :readonly="props.readonly"
            :busy="props.busy"
            @add="(item) => emit('add', item)"
            @remove="(id) => emit('remove', id)"
          />
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
