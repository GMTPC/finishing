<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { ClipboardList, Home, Layers, LogOut } from 'lucide-vue-next'
import { STEP_VIEWS } from '~/constants/step-icons'
import { useJobsStore } from '~/stores/jobs'
import { useSessionStore } from '~/stores/session'
import { useStationNav } from '~/composables/useStationNav'
import { stationPath } from '~/utils/routes'

/** แถบปุ่มล่างจอมือถือ (thumb dock) — ในหน้าขั้นตอนจะโชว์ 4 ขั้นตอน, หน้าอื่นโชว์เมนูด่วน */
const emit = defineEmits<{ openMenu: [] }>()

const session = useSessionStore()
const { currentStep, activeStation } = storeToRefs(session)
const jobs = useJobsStore()
const { hasActiveJob } = storeToRefs(jobs)
const { isStepPage, goToStep } = useStationNav()
const usesBoard = computed(() => session.station.workMode === 'board')
const { logout } = useAuth()

const DOCK_ITEM = 'flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border transition active:scale-95 select-none'
const DOCK_ACTIVE = 'bg-[#696CFF] text-white font-black border-[#696CFF] shadow-sneat-primary'
const DOCK_IDLE = 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
</script>

<template>
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-slate-200 px-2 py-1.5 text-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md">
    <!-- อยู่ในหน้าขั้นตอนของงาน: ปุ่มข้ามขั้นตอน -->
    <div v-if="isStepPage && !usesBoard" class="grid grid-cols-5 gap-1 max-w-md mx-auto">
      <NuxtLink to="/" :class="[DOCK_ITEM, DOCK_IDLE]">
        <Home class="w-4 h-4 mb-0.5" />
        <span class="text-[9px] font-extrabold leading-none">หน้าแรก</span>
      </NuxtLink>

      <button
        v-for="s in STEP_VIEWS"
        :key="s.step"
        type="button"
        :disabled="!hasActiveJob"
        :class="[DOCK_ITEM, currentStep === s.step ? `${DOCK_ACTIVE} ring-2 ring-[#696CFF]/40` : DOCK_IDLE, hasActiveJob ? '' : 'opacity-40']"
        @click="goToStep(s.step)"
      >
        <component :is="s.icon" class="w-4 h-4 mb-0.5" />
        <span class="text-[9px] font-extrabold leading-none truncate max-w-[55px]">{{ s.short }}</span>
      </button>
    </div>

    <!-- หน้าอื่น: เมนูด่วน -->
    <div v-else class="grid grid-cols-4 gap-1.5 max-w-md mx-auto">
      <NuxtLink to="/" :class="[DOCK_ITEM, DOCK_ACTIVE]">
        <Home class="w-4 h-4 mb-0.5" />
        <span class="text-[10px] font-black leading-none">หน้าแรก</span>
      </NuxtLink>

      <NuxtLink :to="stationPath(activeStation)" :class="[DOCK_ITEM, DOCK_IDLE]">
        <ClipboardList class="w-4 h-4 text-[#696CFF] mb-0.5" />
        <span class="text-[10px] font-extrabold leading-none">งานสถานี</span>
      </NuxtLink>

      <button type="button" :class="[DOCK_ITEM, DOCK_IDLE]" @click="emit('openMenu')">
        <Layers class="w-4 h-4 text-[#FFAB00] mb-0.5" />
        <span class="text-[10px] font-extrabold leading-none">เลือกสถานี</span>
      </button>

      <button type="button" :class="[DOCK_ITEM, DOCK_IDLE, 'text-[#FF3E1D]']" @click="logout()">
        <LogOut class="w-4 h-4 mb-0.5" />
        <span class="text-[10px] font-extrabold leading-none">เปลี่ยนกะ</span>
      </button>
    </div>
  </nav>
</template>
