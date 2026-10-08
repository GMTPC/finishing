<script setup lang="ts">
import { Palette } from 'lucide-vue-next'
import type { RollerSet } from '~~/shared/types/finishing'
import { fieldClass } from '~/constants/ui'

/** ฟอร์มตั้งค่าสีของ S3 — ลูกกลิ้ง 3 ชุด ชุดละ 9 ค่า (เดิมเขียน input ซ้ำ 9 บล็อกต่อชุด) */
const rollers = defineModel<RollerSet[]>({ required: true })

interface RollerField {
  key: keyof RollerSet
  label: string
  step?: number
  /** กินความกว้าง 2 คอลัมน์ */
  wide?: boolean
}

const FIELDS: RollerField[] = [
  { key: 'thick', label: 'ความหนาสี', step: 0.1 },
  { key: 'beltHz', label: 'ความเร็วสายพาน (Hz)' },
  { key: 'smallRollerHz', label: 'ลูกยางเล็ก (Hz)' },
  { key: 'bigRollerHz', label: 'ลูกยางใหญ่ (Hz)' },
  { key: 'doctorBladeHz', label: 'Doctor Blade (Hz)' },
  { key: 'chainHz', label: 'ความเร็วโซ่ (Hz)' },
  { key: 'ovenTemp', label: 'เตาอบ (°C)' },
  { key: 'waterKg', label: 'ปริมาณน้ำ (Kg)' },
  { key: 'inkKg', label: 'ปริมาณสี (Kg)', wide: true },
]
</script>

<template>
  <div class="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-4">
    <div class="flex items-center gap-2 text-amber-900 font-extrabold text-sm uppercase tracking-wider">
      <Palette class="w-5 h-5 text-amber-600" />
      <span>ฟอร์มตั้งค่าสี (COLOR SETUP — ลูกกลิ้ง {{ rollers.length }} ชุด)</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div
        v-for="(roller, idx) in rollers"
        :key="idx"
        class="bg-white border border-amber-200/80 rounded-xl p-4 space-y-3 shadow-sm"
      >
        <h4 class="text-xs font-black text-amber-900 font-mono uppercase bg-amber-100/60 p-1.5 rounded text-center">
          ลูกกลิ้งชุดที่ {{ idx + 1 }}
        </h4>

        <div class="grid grid-cols-2 gap-2 text-xs font-mono">
          <div v-for="f in FIELDS" :key="f.key" :class="f.wide ? 'col-span-2' : ''">
            <span class="text-slate-600 font-medium block mb-0.5">{{ f.label }}:</span>
            <input
              v-model.number="roller[f.key]"
              type="number"
              inputmode="decimal"
              :step="f.step"
              :class="fieldClass('sm')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
