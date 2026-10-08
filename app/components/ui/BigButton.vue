<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

/** ปุ่มหลักสำหรับหน้างาน — สูงพอกดด้วยนิ้วโป้ง ตัวอักษรใหญ่ สไตล์เดียวกับปุ่มจบการทำงานเครื่องจักร */
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'danger' | 'success'
    size?: 'md' | 'lg' | 'xl'
    disabled?: boolean
    loading?: boolean
  }>(),
  { type: 'button', variant: 'primary', size: 'lg' }
)

const VARIANT = {
  primary: 'bg-[#52B788] hover:bg-[#40916C] active:bg-[#2D6A4F] text-white shadow-lg shadow-[#52B788]/25',
  success: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25',
  danger: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-lg shadow-rose-600/30',
  secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200/90',
} as const

const SIZE = {
  md: 'h-11 sm:h-12 text-sm px-5 rounded-xl',
  lg: 'h-13 sm:h-14 text-base sm:text-lg px-6 rounded-2xl',
  xl: 'py-4 sm:py-5 px-6 sm:px-8 text-lg sm:text-xl font-black rounded-2xl',
} as const
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="w-full font-black tracking-wide flex items-center justify-center gap-3 transition duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
    :class="[VARIANT[variant], SIZE[size]]"
  >
    <Loader2 v-if="loading" class="w-6 h-6 animate-spin" />
    <slot v-else name="icon" />
    <slot />
  </button>
</template>
