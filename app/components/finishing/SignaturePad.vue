<script setup lang="ts">
import { ref } from 'vue'
import Vue3Signature from 'vue3-signature'
import { Check, Eraser } from 'lucide-vue-next'

/** แผ่นลงลายเซ็นดิจิทัล — ค่าที่ได้เป็น data URL (PNG) ผูกกับ v-model */
const model = defineModel<string | null>({ default: null })

const pad = ref<{ clear: () => void; save: (type?: string) => string } | null>(null)

const OPTIONS = { penColor: '#0f172a', backgroundColor: '#ffffff' }

function clear() {
  pad.value?.clear()
  model.value = null
}

function save() {
  model.value = pad.value?.save('image/png') ?? null
}
</script>

<template>
  <ClientOnly>
    <div class="space-y-3 font-sans">
      <div class="border border-slate-300 rounded-2xl overflow-hidden bg-white p-2 shadow-sm">
        <Vue3Signature ref="pad" :sig-option="OPTIONS" w="100%" h="180px" class="w-full rounded-xl cursor-crosshair" />
      </div>

      <div class="flex items-center justify-between gap-3">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm flex items-center gap-2 transition"
          @click="clear"
        >
          <Eraser class="w-4 h-4 text-slate-600" />
          <span>ล้างลายเซ็น</span>
        </button>

        <button
          type="button"
          class="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-sky-600/20 transition"
          @click="save"
        >
          <Check class="w-4 h-4" />
          <span>บันทึกลายเซ็น</span>
        </button>
      </div>

      <div v-if="model" class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <p class="text-xs font-bold text-slate-700 mb-2">ลายเซ็นที่บันทึกแล้ว:</p>
        <img :src="model" alt="ลายเซ็นผู้รับ" class="h-16 object-contain bg-white rounded-lg p-1 border border-slate-300" />
      </div>
    </div>

    <template #fallback>
      <div class="h-44 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 text-sm font-medium">
        กำลังโหลดระบบเซ็นชื่อ...
      </div>
    </template>
  </ClientOnly>
</template>
