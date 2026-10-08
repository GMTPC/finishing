<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useId } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, ScanLine, SquareX } from 'lucide-vue-next'

/**
 * สแกน TAG ด้วยกล้องมือถือ — ค่าที่สแกนได้ผูกกับ v-model
 * รองรับเครื่องสแกนภายนอกที่พิมพ์เป็นคีย์บอร์ดผ่านช่องกรอกรหัส TAG ในฟอร์ม
 */
const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ scan: [code: string]; close: [] }>()

const props = withDefaults(
  defineProps<{
    autoStart?: boolean
  }>(),
  {
    autoStart: true,
  }
)

/** id ต้องไม่ซ้ำ ถ้ามี scanner มากกว่า 1 ตัวในหน้าเดียว */
const readerId = `qr-reader-${useId()}`

const isScanning = ref(false)
const lastResult = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
let scanner: Html5Qrcode | null = null

async function startScan() {
  if (isScanning.value && scanner) return
  lastResult.value = null
  errorMessage.value = null
  isScanning.value = true

  // รอให้ element ของ scanner ถูก render ก่อนสั่ง start
  await nextTick()
  try {
    scanner = new Html5Qrcode(readerId)
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 260, height: 120 } },
      (decodedText) => {
        lastResult.value = decodedText
        model.value = decodedText
        emit('scan', decodedText)
        stopScan()
      },
      () => {}
    )
  } catch (err) {
    isScanning.value = false
    errorMessage.value = 'เปิดกล้องไม่สำเร็จ — ตรวจสอบสิทธิ์การใช้กล้อง หรือใช้เครื่องสแกนบาร์โค้ดแทน'
    console.error('[QrScanner] start failed:', err)
  }
}

async function stopScan() {
  if (scanner) {
    try {
      await scanner.stop()
      scanner.clear()
    } catch (err) {
      console.error('[QrScanner] stop failed:', err)
    } finally {
      scanner = null
      isScanning.value = false
    }
  }
  emit('close')
}

onMounted(() => {
  if (props.autoStart) {
    startScan()
  }
})

onUnmounted(() => {
  scanner?.stop().catch(() => {})
})
</script>

<template>
  <ClientOnly>
    <div class="space-y-3 font-sans">
      <div v-show="isScanning" class="relative bg-slate-100 border border-slate-300 rounded-2xl overflow-hidden shadow-lg">
        <div :id="readerId" class="w-full min-h-[260px]" />
        <button
          type="button"
          class="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-slate-800 rounded-xl border border-slate-300 shadow z-10 transition"
          title="ปิดกล้อง"
          @click="stopScan"
        >
          <SquareX class="w-5 h-5" />
        </button>
      </div>

      <div v-if="lastResult" class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
        <span class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
          OK
        </span>
        <div class="min-w-0">
          <p class="text-xs text-emerald-800 font-bold">ผลการสแกนบาร์โค้ด TAG:</p>
          <p class="text-sm font-mono font-extrabold text-emerald-950 tracking-wider break-all">{{ lastResult }}</p>
        </div>
      </div>

      <p v-if="errorMessage" class="text-xs font-bold text-rose-700 text-center">{{ errorMessage }}</p>
    </div>

    <template #fallback>
      <div class="h-44 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 text-sm font-medium">
        กำลังโหลดระบบสแกนบาร์โค้ด...
      </div>
    </template>
  </ClientOnly>
</template>
