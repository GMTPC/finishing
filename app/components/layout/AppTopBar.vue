<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Bell, ChevronRight, Home, LogOut, Menu, Search, User, X } from 'lucide-vue-next'
import StationChip from '~/components/ui/StationChip.vue'
import { useSessionStore } from '~/stores/session'
import { stationPath } from '~/utils/routes'

/** แถบบนสำหรับมือถือ/แท็บเล็ต และ Floating Header บน Desktop สไตล์ Sneat */
const menuOpen = defineModel<boolean>('menuOpen', { default: false })

const session = useSessionStore()
const { operatorName, shiftText, workDate, stationList } = storeToRefs(session)
const { logout } = useAuth()
</script>

<template>
  <div>
    <!-- Desktop Floating Header Bar (Sneat Signature Topbar) -->
    <header class="hidden lg:flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur-md sticky top-3 z-30 mx-6 mt-3 rounded-xl border border-slate-200/70 shadow-sneat">
      <div class="flex items-center gap-3 text-slate-400">
        <Search class="w-4 h-4 text-[#8592A3]" />
        <span class="text-xs font-semibold text-[#8592A3]">ค้นหาเมนู / สถานี (Ctrl+K)...</span>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs">
          <span class="w-2 h-2 rounded-full bg-[#71DD37] animate-pulse" />
          <span class="font-extrabold text-slate-700">{{ operatorName }}</span>
          <span class="px-2 py-0.5 rounded-md bg-[#FFAB00]/15 text-[#B87A00] font-black text-[10px] border border-[#FFAB00]/30">
            {{ shiftText }}
          </span>
          <span class="text-slate-400 text-[11px] font-mono ml-1">{{ workDate }}</span>
        </div>

        <button
          type="button"
          class="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/80 transition active:scale-95"
          title="แจ้งเตือนระบบ"
        >
          <Bell class="w-4 h-4 text-[#8592A3]" />
        </button>

        <button
          type="button"
          class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#FF3E1D] border border-rose-200/80 transition active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          title="ออกจากระบบ"
          @click="logout()"
        >
          <LogOut class="w-4 h-4" />
          <span>ออก</span>
        </button>
      </div>
    </header>

    <!-- Mobile Header Bar -->
    <header class="lg:hidden bg-white/95 backdrop-blur-md text-slate-800 sticky top-0 z-40 border-b border-slate-200/80 shadow-sneat">
      <div class="px-3 py-2 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-200 active:scale-95 flex items-center gap-1.5"
            @click="menuOpen = !menuOpen"
          >
            <Menu v-if="!menuOpen" class="w-4 h-4 text-[#696CFF]" />
            <X v-else class="w-4 h-4 text-[#FF3E1D]" />
            <span>เมนู</span>
          </button>

          <NuxtLink to="/" class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-[#696CFF] text-white font-extrabold font-mono flex items-center justify-center text-xs shadow-sneat-primary">
              FN
            </div>
            <span class="font-black text-sm tracking-tight text-slate-800 truncate max-w-[150px] sm:max-w-none">ฟินิชชิ่ง</span>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
            <User class="w-3.5 h-3.5 text-[#FFAB00]" />
            <span class="font-bold text-slate-800 text-xs truncate max-w-[90px]">{{ operatorName }}</span>
            <span class="px-1.5 py-0.5 rounded-md bg-[#FFAB00]/20 text-[#B87A00] font-black text-[10px]">{{ shiftText }}</span>
          </div>

          <button
            type="button"
            class="p-2 rounded-xl bg-rose-50 text-[#FF3E1D] hover:bg-rose-100 transition border border-rose-200 active:scale-95"
            title="ออกจากระบบ"
            @click="logout()"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>

      <transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="menuOpen" class="bg-slate-50 border-t border-slate-200/80 px-4 py-4 shadow-sneat-md space-y-3">
          <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">
            <span>เลือกสถานีบันทึกข้อมูล</span>
            <span>{{ workDate }}</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <NuxtLink
              to="/"
              class="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-between border border-slate-200/80 transition shadow-2xs"
              @click="menuOpen = false"
            >
              <span class="flex items-center gap-2">
                <Home class="w-4 h-4 text-[#696CFF]" />
                <span>หน้าแรก</span>
              </span>
              <ChevronRight class="w-3.5 h-3.5 text-slate-400" />
            </NuxtLink>

            <NuxtLink
              v-for="st in stationList"
              :key="st.id"
              :to="stationPath(st.id)"
              class="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-between border border-slate-200/80 transition shadow-2xs"
              @click="menuOpen = false"
            >
              <span class="flex items-center gap-2 min-w-0">
                <StationChip :station="st.id" size="xs" />
                <span class="truncate max-w-[80px]">{{ st.title }}</span>
              </span>
              <ChevronRight class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </NuxtLink>
          </div>
        </div>
      </transition>
    </header>
  </div>
</template>
