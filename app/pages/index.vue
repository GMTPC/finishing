<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { AlertTriangle, CheckCircle2, ClipboardList, Cpu, Factory } from 'lucide-vue-next'
import StationCard from '~/components/finishing/StationCard.vue'
import SectionCard from '~/components/ui/SectionCard.vue'
import StatCard from '~/components/ui/StatCard.vue'
import { GROUP_THEME } from '~/constants/station-theme'
import { formatPercent, formatQty } from '~~/shared/utils/format'
import { useSessionStore } from '~/stores/session'
import { useSystemStore } from '~/stores/system'
import { stationPath } from '~/utils/routes'

/** หน้าแรก: สรุปยอดของรายการล่าสุด + เลือกสถานีปฏิบัติงาน */
useHead({ title: 'เลือกสถานีปฏิบัติงาน' })

const session = useSessionStore()
const system = useSystemStore()
const { activeStation, currentStep, continuousStations, independentStations, stationList } = storeToRefs(session)
const { totals, activeStationCount } = storeToRefs(system)

const { assignedStationId } = useAuth()

const groups = computed(() => [
  { key: 'continuous' as const, stations: continuousStations.value },
  { key: 'independent' as const, stations: independentStations.value },
].filter(g => g.stations.length > 0))

/** สถานีที่ผู้ใช้กำลังทำงานอยู่ (จาก session ปัจจุบัน) */
const activeStepOf = (id: string) => (id === activeStation.value ? currentStep.value : null)
</script>

<template>
  <div class="space-y-6">
    <!-- Sneat Welcome & KPI Summary Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="สถานีทั้งหมด"
        value="5"
        unit="Lines"
        :icon="Factory"
        tone="neutral"
      />
      <StatCard
        label="สถานีปัจจุบัน"
        :value="activeStation"
        unit="Active"
        :icon="Cpu"
        tone="info"
      />
      <StatCard
        label="กะปฏิบัติงาน"
        :value="session.shiftText"
        :unit="session.workDate"
        :icon="ClipboardList"
        tone="success"
      />
      <StatCard
        label="สถานะระบบ"
        :value="system.health ? 'ปกติ' : 'เช็คระบบ'"
        unit="MSSQL"
        :icon="system.health ? CheckCircle2 : AlertTriangle"
        :tone="system.health ? 'success' : 'danger'"
      />
    </div>

    <!-- Section Title -->
    <div class="flex items-center justify-between pt-2">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">เลือกสถานีปฏิบัติงาน</h1>
        <p class="text-xs text-slate-400 font-medium mt-0.5">ระบบบันทึกกระบวนการผลิตแผนกฟินิชชิ่ง</p>
      </div>
    </div>

    <!-- Station Groups -->
    <div class="space-y-6">
      <section v-for="group in groups" :key="group.key" class="space-y-3.5">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full" :class="GROUP_THEME[group.key].dot" />
          <h2 class="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-500 font-mono">
            {{ group.key === 'continuous' ? 'สายต่อเนื่อง S1 → S2 → S4 (WIP Process)' : 'ไลน์อิสระ ผลิต FG' }}
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StationCard
            v-for="st in group.stations"
            :key="st.id"
            :station="st"
            :active-step="activeStepOf(st.id)"
          />
        </div>
      </section>
    </div>
  </div>
</template>
