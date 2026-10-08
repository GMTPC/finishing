<script setup lang="ts">
import type { Component } from 'vue'
import { LABEL_CLASS } from '~/constants/ui'

/** label + control ที่จัดระยะเหมือนกันทุกฟอร์ม */
defineProps<{
  label: string
  required?: boolean
  hint?: string
  icon?: Component
  /** สีของ label เช่น text-rose-700 สำหรับช่อง "แผ่นเสีย" */
  tone?: string
}>()
</script>

<template>
  <div>
    <label class="flex items-center gap-1.5 mb-1.5" :class="[LABEL_CLASS, tone]">
      <component :is="icon" v-if="icon" class="w-4 h-4" />
      <span>{{ label }}</span>
      <span v-if="required" class="text-rose-500">*</span>
    </label>
    <slot />
    <p v-if="hint" class="text-[11px] text-slate-500 font-medium mt-1">{{ hint }}</p>
  </div>
</template>
