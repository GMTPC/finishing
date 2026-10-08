<script setup lang="ts">
import type { Component } from 'vue'
import { CARD_CLASS } from '~/constants/ui'

/** การ์ดขาวมาตรฐาน + หัวข้อ (ป้ายเลข/ไอคอน, ชื่อ, คำอธิบาย) */
defineProps<{
  title?: string
  description?: string
  /** ป้ายตัวเลขหน้าหัวข้อ เช่น เลขขั้นตอน */
  badge?: string | number
  icon?: Component
  /** padding ภายใน */
  padding?: string
}>()
</script>

<template>
  <section :class="[CARD_CLASS, padding || 'p-4 sm:p-5 lg:p-6']">
    <header
      v-if="title || $slots.header || $slots.actions"
      class="flex flex-wrap items-center justify-between gap-4"
      :class="$slots.default ? 'border-b border-slate-100 pb-3 mb-4 sm:pb-4 sm:mb-6' : ''"
    >
      <slot name="header">
        <div class="flex items-center gap-3 min-w-0">
          <div
            v-if="badge !== undefined || icon"
            class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-100 border border-sky-300 text-sky-800 flex items-center justify-center font-black font-mono shrink-0 text-sm sm:text-base"
          >
            <component :is="icon" v-if="icon" class="w-4 h-4 sm:w-5 sm:h-5" />
            <template v-else>{{ badge }}</template>
          </div>
          <div class="min-w-0">
            <h2 class="text-base sm:text-xl font-black text-slate-900 tracking-tight">{{ title }}</h2>
            <!-- คำอธิบายเป็นข้อมูลรอง แสดงทั้งบนมือถือและจอใหญ่ -->
            <p v-if="description" class="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">{{ description }}</p>
          </div>
        </div>
      </slot>

      <div v-if="$slots.actions" class="flex items-center gap-3">
        <slot name="actions" />
      </div>
    </header>

    <div v-if="$slots.default" class="space-y-4 sm:space-y-6">
      <slot />
    </div>
  </section>
</template>
