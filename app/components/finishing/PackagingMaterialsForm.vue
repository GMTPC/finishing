<script setup lang="ts">
import type { PackagingMaterials } from '~~/shared/types/finishing'
import { fieldClass } from '~/constants/ui'

/** วัสดุแพ็คเกจจิ้งที่ใช้ต่อล็อต (S4/S5) */
const materials = defineModel<PackagingMaterials>({ required: true })

const FIELDS: Array<{ key: keyof PackagingMaterials; label: string }> = [
  { key: 'paperRoll', label: 'ม้วนกระดาษ' },
  { key: 'corrugatedPaper', label: 'กระดาษลูกฟูก' },
  { key: 'adhesiveTape', label: 'เทปกาว' },
  { key: 'edgeTape', label: 'เทปห่อขอบ' },
  { key: 'plasticBagKg', label: 'ถุงพลาสติก (Kg)' },
]
</script>

<template>
  <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 font-mono">
    <p class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1">
      บันทึกวัสดุแพ็คเกจจิ้ง (PACKAGING MATERIALS)
    </p>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
      <div v-for="f in FIELDS" :key="f.key">
        <span class="text-slate-600 font-medium block mb-0.5">{{ f.label }}:</span>
        <input v-model.number="materials[f.key]" type="number" inputmode="numeric" min="0" :class="fieldClass('sm')" />
      </div>
    </div>
  </div>
</template>
