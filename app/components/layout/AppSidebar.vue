<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { ChevronRight, Home, Layers, LogOut, PanelLeftClose, PanelLeftOpen, User } from 'lucide-vue-next'
import DbStatusButton from '~/components/layout/DbStatusButton.vue'
import StationChip from '~/components/ui/StationChip.vue'
import { STEP_VIEWS } from '~/constants/step-icons'
import { useJobsStore } from '~/stores/jobs'
import { useSessionStore } from '~/stores/session'
import { useStationNav } from '~/composables/useStationNav'
import { stationPath } from '~/utils/routes'

/** เมนูซ้ายสำหรับจอ PC (ย่อ/ขยายได้) */
const collapsed = defineModel<boolean>('collapsed', { default: false })

const route = useRoute()
const session = useSessionStore()
const jobs = useJobsStore()
const { operatorName, shiftText, stationList, currentStep } = storeToRefs(session)
const { activeJob, hasActiveJob } = storeToRefs(jobs)
const usesBoard = computed(() => session.station.workMode === 'board')
const { isStationPage, stationId, goToStep, goToJobs } = useStationNav()
const { logout } = useAuth()
</script>

<template>
  <aside
    class="hidden lg:flex flex-col bg-white border-r border-slate-200/80 h-screen sticky top-0 shrink-0 z-30 justify-between p-3.5 shadow-sneat overflow-y-auto transition-all duration-300 ease-in-out select-none"
    :class="collapsed ? 'w-20' : 'w-72'"
  >
    <div class="space-y-5">
      <!-- โลโก้ + ปุ่มย่อ/ขยายเมนู (Sneat style) -->
      <div class="flex items-center justify-between gap-2 p-1.5 bg-slate-50/80 border border-slate-200/60 rounded-xl">
        <NuxtLink to="/" class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-[#696CFF] text-white font-black font-mono flex items-center justify-center text-base shadow-sneat-primary shrink-0">
            FN
          </div>
          <div v-if="!collapsed" class="min-w-0">
            <h1 class="font-black text-sm tracking-tight text-slate-800 truncate">แผนกฟินิชชิ่ง</h1>
            <p class="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Sneat Dashboard</p>
          </div>
        </NuxtLink>

        <button
          type="button"
          class="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 transition active:scale-95 shrink-0 shadow-2xs"
          :title="collapsed ? 'ขยายเมนู' : 'ย่อเมนู'"
          @click="collapsed = !collapsed"
        >
          <PanelLeftOpen v-if="collapsed" class="w-4 h-4 text-[#696CFF]" />
          <PanelLeftClose v-else class="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <!-- ผู้ปฏิบัติงาน & กะ -->
      <div
        class="bg-slate-50/80 border border-slate-200/80 rounded-xl transition-all duration-200"
        :class="collapsed ? 'p-2 text-center' : 'p-3 space-y-2'"
      >
        <div v-if="!collapsed" class="flex items-center justify-between text-xs font-bold text-slate-400">
          <span class="uppercase tracking-wider text-[10px]">ผู้ปฏิบัติงาน</span>
          <span class="text-[10px] bg-[#71DD37]/15 text-[#54A925] px-2 py-0.5 rounded-full font-mono font-bold border border-[#71DD37]/30">ONLINE</span>
        </div>

        <div class="flex items-center" :class="collapsed ? 'flex-col gap-1 justify-center' : 'justify-between'">
          <div class="flex items-center gap-2 min-w-0">
            <User class="w-4 h-4 text-[#FFAB00] shrink-0" />
            <span v-if="!collapsed" class="text-sm font-extrabold text-slate-800 truncate">{{ operatorName }}</span>
          </div>
          <span
            class="rounded-lg bg-[#FFAB00]/15 text-[#B87A00] font-black border border-[#FFAB00]/30"
            :class="collapsed ? 'px-1 py-0.5 text-[9px]' : 'px-2 py-0.5 text-xs'"
          >
            {{ collapsed ? shiftText.replace('กะ', '') : shiftText }}
          </span>
        </div>
      </div>

      <!-- เมนูหลัก -->
      <div class="space-y-1">
        <p v-if="!collapsed" class="text-[10px] font-black text-[#8592A3] uppercase tracking-wider px-2 mb-1.5">เมนูหลัก</p>
        <NuxtLink
          to="/"
          class="flex items-center rounded-xl font-bold transition-all duration-150"
          :class="[
            collapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5 text-sm',
            route.path === '/'
              ? 'bg-gradient-to-r from-[#696CFF] to-[#787BFF] text-white shadow-sneat-primary'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          ]"
          title="หน้าแรก Dashboard"
        >
          <span class="flex items-center gap-2.5">
            <Home class="w-4 h-4 shrink-0" />
            <span v-if="!collapsed">หน้าแรก Dashboard</span>
          </span>
          <ChevronRight v-if="!collapsed" class="w-4 h-4 opacity-70" />
        </NuxtLink>
      </div>

      <!-- สถานีปฏิบัติงาน -->
      <div class="space-y-1">
        <p v-if="!collapsed" class="text-[10px] font-black text-[#8592A3] uppercase tracking-wider px-2 mb-1.5">
          สถานีปฏิบัติงาน (5 Lines)
        </p>
        <NuxtLink
          v-for="st in stationList"
          :key="st.id"
          :to="stationPath(st.id)"
          class="flex items-center rounded-xl font-bold transition border"
          :class="[
            collapsed ? 'justify-center p-2' : 'justify-between px-3 py-2 text-xs',
            route.path.includes(`/s/${st.id}`)
              ? 'bg-slate-900 text-white border-slate-900 shadow-sneat'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200/80 hover:border-slate-300',
          ]"
          :title="st.title"
        >
          <span class="flex items-center gap-2.5 min-w-0">
            <StationChip :station="st.id" size="xs" />
            <span v-if="!collapsed" class="truncate text-xs">{{ st.title }}</span>
          </span>
          <ChevronRight v-if="!collapsed" class="w-3.5 h-3.5 opacity-50 shrink-0" />
        </NuxtLink>
      </div>

      <!-- ขั้นตอนการผลิต (เฉพาะเมื่ออยู่ในหน้าสถานี) -->
      <div
        v-if="isStationPage && !usesBoard"
        class="bg-[#696CFF]/5 border border-[#696CFF]/20 rounded-xl transition-all"
        :class="collapsed ? 'p-1.5 text-center' : 'p-3 space-y-2'"
      >
        <div v-if="!collapsed" class="flex items-center gap-1.5 text-xs font-black text-[#696CFF] uppercase tracking-wide">
          <Layers class="w-4 h-4 text-[#696CFF]" />
          <span>ขั้นตอนผลิต (สถานี {{ stationId }})</span>
        </div>

        <!-- งานที่กำลังทำอยู่ -->
        <button
          v-if="!collapsed"
          type="button"
          class="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-[#696CFF]/20 text-left transition hover:border-[#696CFF]/40 shadow-2xs"
          title="กลับไปรายการงาน"
          @click="goToJobs()"
        >
          <span class="min-w-0">
            <span class="block text-[10px] font-bold text-slate-400 uppercase">งานที่เปิดอยู่</span>
            <span class="block font-mono font-black text-xs text-slate-800 truncate">
              {{ activeJob ? activeJob.code : 'ยังไม่ได้เลือกงาน' }}
            </span>
          </span>
          <ChevronRight class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        <div class="space-y-1 font-mono text-xs" :class="hasActiveJob ? '' : 'opacity-40 pointer-events-none'">
          <button
            v-for="s in STEP_VIEWS"
            :key="s.step"
            type="button"
            class="w-full flex items-center rounded-xl font-bold transition"
            :class="[
              collapsed ? 'justify-center p-2' : 'gap-2 p-2 text-left',
              currentStep === s.step
                ? 'bg-[#696CFF] text-white shadow-sneat-primary'
                : 'text-slate-600 hover:bg-[#696CFF]/10 hover:text-[#696CFF]',
            ]"
            :title="s.label"
            @click="goToStep(s.step)"
          >
            <component :is="s.icon" class="w-4 h-4 shrink-0" />
            <span v-if="!collapsed" class="truncate">{{ s.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ท้ายเมนู -->
    <div class="pt-3 border-t border-slate-200/80 space-y-2">
      <DbStatusButton full :compact="collapsed" />

      <button
        type="button"
        class="w-full rounded-xl bg-rose-50 hover:bg-rose-100 text-[#FF3E1D] border border-rose-200 text-xs font-extrabold transition flex items-center justify-center"
        :class="collapsed ? 'p-2.5' : 'py-2.5 px-3 gap-2'"
        title="ออกจากระบบ"
        @click="logout()"
      >
        <LogOut class="w-4 h-4 shrink-0" />
        <span v-if="!collapsed">ออกจากระบบ</span>
      </button>
    </div>
  </aside>
</template>
