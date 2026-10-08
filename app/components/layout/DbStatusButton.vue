<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Database, RefreshCw } from 'lucide-vue-next'
import { useSystemStore } from '~/stores/system'

/** ปุ่มเช็คการเชื่อมต่อฐานข้อมูล ใช้ทั้งใน sidebar และหัวหน้าสถานี */
const props = withDefaults(defineProps<{ compact?: boolean; full?: boolean }>(), {
  compact: false,
  full: false,
})

const system = useSystemStore()
const { isDbConnected, isCheckingHealth } = storeToRefs(system)
</script>

<template>
  <button
    type="button"
    class="rounded-xl border text-xs font-bold font-mono flex items-center transition"
    :class="[
      props.full ? 'w-full' : '',
      props.compact ? 'justify-center p-2' : 'justify-between gap-2 py-2 px-3',
      isDbConnected
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-amber-50 border-amber-200 text-amber-800',
    ]"
    :title="isDbConnected ? 'ฐานข้อมูลเชื่อมต่อแล้ว' : 'ยังเชื่อมต่อฐานข้อมูลไม่ได้ — กดเพื่อลองใหม่'"
    @click="system.checkHealth()"
  >
    <span class="flex items-center gap-2">
      <Database class="w-4 h-4 shrink-0" />
      <span v-if="!props.compact">{{ isDbConnected ? 'MSSQL CONNECTED' : 'MSSQL OFFLINE' }}</span>
    </span>
    <RefreshCw v-if="!props.compact" class="w-3.5 h-3.5" :class="{ 'animate-spin': isCheckingHealth }" />
  </button>
</template>
