<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import {
  Barcode,
  Camera,
  Home,
  Layers,
  LogOut,
  RefreshCw,
} from 'lucide-vue-next'
import QrScanner from '~/components/finishing/QrScanner.vue'

const props = defineProps<{
  stationId: string
  busy?: boolean
  readonly?: boolean
  scanError?: string | null
  scanSuccess?: string | null
}>()

const emit = defineEmits<{
  scan: [barcode: string]
  clearFeedback: []
}>()

const barcode = ref('')
const showCamera = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function focusInput() {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

onMounted(() => {
  focusInput()
})

function submitScan() {
  const value = barcode.value.trim()
  if (!value) return

  emit('scan', value)
  barcode.value = ''
  focusInput()
}

function onCameraScan(code: string) {
  emit('scan', code)
  showCamera.value = false
  focusInput()
}

watch(
  () => props.scanError,
  (err) => {
    if (err && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(100)
      } catch {
        // Ignore if unsupported or restricted
      }
    }
  }
)
</script>

<template>
  <div class="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E3E5E0] shadow-lg pb-safe">
    <!-- Camera Modal overlay if open -->
    <QrScanner v-if="showCamera" @scan="onCameraScan" @close="showCamera = false" />

    <div class="max-w-md mx-auto p-2 space-y-1.5">
      <!-- Toast feedback -->
      <div
        v-if="props.scanSuccess"
        class="bg-[#EEF7F1] text-[#1F7A4D] border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center justify-between shadow-2xs"
      >
        <span>{{ props.scanSuccess }}</span>
        <button type="button" class="text-xs text-[#1F7A4D] hover:underline" @click="emit('clearFeedback')">✕</button>
      </div>

      <!-- Scan row -->
      <div v-if="!props.readonly">
        <form class="flex items-center gap-1.5" @submit.prevent="submitScan">
          <label class="relative flex-1">
            <Barcode class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555B64]" />
            <input
              ref="inputRef"
              v-model="barcode"
              type="text"
              inputmode="text"
              autocomplete="off"
              placeholder="สแกนบาร์โค้ด WIP"
              class="w-full h-[44px] pl-9 pr-2.5 rounded-xl bg-[#F8F9F7] font-mono text-xs sm:text-sm font-bold text-[#16181D] placeholder:text-[#555B64] transition focus:outline-none shadow-2xs"
              :class="[
                props.scanError
                  ? 'border-2 border-[#A1261B] text-[#A1261B]'
                  : 'border-[1.5px] border-[#C9CDC5] focus:border-[#2457D6] focus:ring-2 focus:ring-[#2457D6]/20',
              ]"
            />
          </label>

          <button
            type="button"
            aria-label="เปิดกล้องสแกน"
            class="h-[44px] px-3 rounded-xl bg-[#16181D] hover:bg-slate-800 active:bg-black text-white font-bold text-xs flex items-center justify-center gap-1 shrink-0 transition active:scale-95 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#2457D6]"
            @click="showCamera = !showCamera"
          >
            <Camera class="w-4 h-4 text-white stroke-[2]" />
            <span>กล้อง</span>
          </button>
        </form>

        <p v-if="props.scanError" class="text-[10px] font-bold text-[#A1261B] mt-0.5 px-1">
          {{ props.scanError }}
        </p>
      </div>

      <!-- Bottom Nav (4-column grid, compact items) -->
      <nav class="grid grid-cols-4 gap-1 pt-1 border-t border-[#E3E5E0]">
        <NuxtLink
          to="/"
          class="h-[40px] rounded-lg flex flex-col items-center justify-center gap-0.5 text-[#2457D6] bg-[#E8EEFC] transition font-bold"
        >
          <Home class="w-3.5 h-3.5 stroke-[2.2]" />
          <span class="text-[10px] leading-none">หน้าแรก</span>
        </NuxtLink>

        <NuxtLink
          :to="`/s/${props.stationId}`"
          class="h-[40px] rounded-lg flex flex-col items-center justify-center gap-0.5 text-[#555B64] hover:bg-slate-50 hover:text-[#16181D] transition font-bold"
        >
          <Layers class="w-3.5 h-3.5 stroke-[2.2]" />
          <span class="text-[10px] leading-none">งานสถานี</span>
        </NuxtLink>

        <NuxtLink
          to="/"
          class="h-[40px] rounded-lg flex flex-col items-center justify-center gap-0.5 text-[#555B64] hover:bg-slate-50 hover:text-[#16181D] transition font-bold"
        >
          <RefreshCw class="w-3.5 h-3.5 stroke-[2.2]" />
          <span class="text-[10px] leading-none">เลือกสถานี</span>
        </NuxtLink>

        <NuxtLink
          to="/login"
          class="h-[40px] rounded-lg flex flex-col items-center justify-center gap-0.5 text-[#555B64] hover:bg-slate-50 hover:text-[#16181D] transition font-bold"
        >
          <LogOut class="w-3.5 h-3.5 stroke-[2.2]" />
          <span class="text-[10px] leading-none">เปลี่ยนกะ</span>
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

