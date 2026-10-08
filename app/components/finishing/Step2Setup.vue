<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { CalendarDays, Cog, Layers, Users } from 'lucide-vue-next'
import ColorSetupMatrix from '~/components/finishing/ColorSetupMatrix.vue'
import StepCard from '~/components/finishing/StepCard.vue'
import { shiftLabel } from '~~/shared/constants/shifts'
import { formatShortThaiDate } from '~~/shared/utils/format'
import { useJobsStore } from '~/stores/jobs'
import { useProductionStore } from '~/stores/production'
import { useSessionStore } from '~/stores/session'

/**
 * ขั้นตอนที่ 2 — บันทึกข้อมูลก่อนผลิต
 * กะ / เครื่อง / พนักงาน ถูกกำหนดตั้งแต่ตอนสร้างงานแปรรูป จึงแสดงเป็นข้อมูลยืนยันเท่านั้น
 * ถ้าต้องแก้ ให้จบงานแล้วสร้างงานใหม่ เพื่อไม่ให้ข้อมูลที่บันทึกไปแล้วขัดกัน
 */
const emit = defineEmits<{ submit: [] }>()

const session = useSessionStore()
const production = useProductionStore()
const jobs = useJobsStore()
const { activeStation, station } = storeToRefs(session)
const { rollerSets, isSaving } = storeToRefs(production)
const { activeJob } = storeToRefs(jobs)
</script>

<template>
  <StepCard
    :step="2"
    :submit-label="`บันทึกการตั้งค่าเครื่องจักรสถานี ${activeStation}`"
    :loading="isSaving"
    @submit="emit('submit')"
  >
    <!-- ข้อมูลจากงานแปรรูปที่เปิดอยู่ -->
    <div v-if="activeJob" class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <p class="text-xs font-bold text-slate-700 uppercase tracking-wider">ข้อมูลจากใบงาน</p>
        <span class="font-mono font-black text-sm text-slate-900">{{ activeJob.code }}</span>
      </div>

      <dl class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
        <div class="flex items-center gap-2">
          <CalendarDays class="w-4 h-4 text-slate-400 shrink-0" />
          <div class="min-w-0">
            <dt class="text-[11px] text-slate-500 font-bold uppercase">วันที่ / กะ</dt>
            <dd class="font-bold text-slate-900 truncate">
              {{ formatShortThaiDate(activeJob.startedAt) }} • {{ shiftLabel(activeJob.shift) }}
            </dd>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Cog class="w-4 h-4 text-slate-400 shrink-0" />
          <div class="min-w-0">
            <dt class="text-[11px] text-slate-500 font-bold uppercase">เครื่อง</dt>
            <dd class="font-bold text-slate-900 truncate">{{ activeJob.machine }}</dd>
          </div>
        </div>

        <div v-if="activeJob.pvcType" class="flex items-center gap-2">
          <Layers class="w-4 h-4 text-slate-400 shrink-0" />
          <div class="min-w-0">
            <dt class="text-[11px] text-slate-500 font-bold uppercase">ชนิด PVC</dt>
            <dd class="font-bold text-slate-900 truncate">{{ activeJob.pvcType }}</dd>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Users class="w-4 h-4 text-slate-400 shrink-0" />
          <div class="min-w-0">
            <dt class="text-[11px] text-slate-500 font-bold uppercase">พนักงานที่ทำงาน</dt>
            <dd class="font-bold text-slate-900 truncate">{{ activeJob.operators.join(', ') }}</dd>
          </div>
        </div>
      </dl>
    </div>

    <!-- ฟอร์มตั้งค่าสี (เฉพาะสถานีที่มีลูกกลิ้ง) -->
    <ColorSetupMatrix v-if="station.hasColorSetup" v-model="rollerSets" />

    <p v-else class="text-xs text-slate-500 font-medium">
      สถานีนี้ไม่มีค่าตั้งเครื่องเพิ่มเติม — กดยืนยันเพื่อบันทึกว่าตรวจเครื่องก่อนผลิตแล้ว
    </p>
  </StepCard>
</template>
