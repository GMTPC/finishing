<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, CheckCircle2, Clock, Cog, Layers, Users } from 'lucide-vue-next'
import StatusPill from '~/components/ui/StatusPill.vue'
import type { JobDto } from '~~/shared/types/finishing'
import { shiftLabel } from '~~/shared/constants/shifts'
import { formatQty, formatShortThaiDate, formatTime } from '~~/shared/utils/format'

/** ตารางงานแปรรูป (Job Table View) */
const props = defineProps<{
  jobs: JobDto[]
  activeJobId?: number | null
  busy?: boolean
}>()

const emit = defineEmits<{ open: [jobId: number]; finish: [jobId: number] }>()

function isSelected(jobId: number) {
  return props.activeJobId === jobId
}

function isActive(job: JobDto) {
  return job.status === 'active'
}

function operatorsText(job: JobDto) {
  return job.operators.join(', ') || '-'
}
</script>

<template>
  <div class="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-stone-100/90 text-stone-700 text-xs sm:text-sm font-black border-b border-stone-200">
          <th class="py-3 px-3 sm:px-4 uppercase tracking-wider font-mono">รหัสงาน</th>
          <th class="py-3 px-3 sm:px-4 uppercase tracking-wider">วันที่ / กะ</th>
          <th class="py-3 px-3 sm:px-4 uppercase tracking-wider">เครื่องจักร / ชนิด PVC</th>
          <th class="py-3 px-3 sm:px-4 uppercase tracking-wider">พนักงาน</th>
          <th class="py-3 px-3 text-center uppercase tracking-wider font-mono">บันทึก</th>
          <th class="py-3 px-3 text-right uppercase tracking-wider font-mono">ผลิตได้</th>
          <th class="py-3 px-3 text-right uppercase tracking-wider font-mono">แผ่นเสีย</th>
          <th class="py-3 px-3 text-center uppercase tracking-wider">สถานะ</th>
          <th class="py-3 px-4 text-center uppercase tracking-wider min-w-[160px]">จัดการ</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-stone-200 text-xs sm:text-sm font-semibold text-stone-800">
        <tr
          v-for="job in props.jobs"
          :key="job.id"
          class="hover:bg-stone-50/80 transition"
          :class="[isSelected(job.id) ? 'bg-emerald-50/60' : '']"
        >
          <!-- รหัสงาน -->
          <td class="py-3 px-3 sm:px-4 font-mono font-black text-sm sm:text-base text-stone-900 whitespace-nowrap">
            <div class="flex items-center gap-2">
              <span v-if="isSelected(job.id)" class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{{ job.code }}</span>
            </div>
          </td>

          <!-- วันที่ & กะ -->
          <td class="py-3 px-3 sm:px-4 whitespace-nowrap">
            <div class="font-bold text-stone-900">{{ formatShortThaiDate(job.startedAt) }}</div>
            <div class="text-xs text-stone-500 font-semibold mt-0.5">{{ shiftLabel(job.shift) }}</div>
          </td>

          <!-- เครื่องจักร / ชนิด PVC -->
          <td class="py-3 px-3 sm:px-4 max-w-[200px]">
            <div class="flex items-center gap-1.5 font-bold text-stone-900 truncate">
              <Cog class="w-4 h-4 text-stone-400 shrink-0" />
              <span class="truncate">{{ job.machine }}</span>
            </div>
            <div v-if="job.pvcType" class="flex items-center gap-1.5 text-xs text-stone-600 font-semibold mt-0.5 truncate">
              <Layers class="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span class="truncate">PVC: {{ job.pvcType }}</span>
            </div>
          </td>

          <!-- พนักงาน -->
          <td class="py-3 px-3 sm:px-4 max-w-[180px]">
            <div class="flex items-center gap-1.5 text-stone-700 truncate">
              <Users class="w-4 h-4 text-stone-400 shrink-0" />
              <span class="truncate">{{ operatorsText(job) }}</span>
            </div>
          </td>

          <!-- จำนวนบันทึก -->
          <td class="py-3 px-3 text-center font-mono font-black text-base text-stone-800 whitespace-nowrap">
            {{ job.recordCount ?? 0 }}
          </td>

          <!-- ผลิตได้ -->
          <td class="py-3 px-3 text-right font-mono font-black text-base text-emerald-700 whitespace-nowrap">
            {{ formatQty(job.producedQty) }}
          </td>

          <!-- แผ่นเสีย -->
          <td class="py-3 px-3 text-right font-mono font-black text-base text-rose-600 whitespace-nowrap">
            {{ formatQty(job.defectQty) }}
          </td>

          <!-- สถานะ -->
          <td class="py-3 px-3 text-center whitespace-nowrap">
            <StatusPill :tone="isActive(job) ? 'success' : 'neutral'" :pulse="isActive(job)">
              {{ isActive(job) ? 'กำลังแปรรูป' : 'แปรรูปแล้ว' }}
            </StatusPill>
          </td>

          <!-- จัดการ -->
          <td class="py-3 px-4 text-center whitespace-nowrap">
            <div v-if="isActive(job)" class="flex items-center justify-center gap-2">
              <button
                type="button"
                class="h-9 sm:h-10 px-3.5 rounded-xl bg-[#52B788] hover:bg-[#40916C] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
                @click="emit('open', job.id)"
              >
                <span>{{ isSelected(job.id) ? 'ทำงานต่อ' : 'เปิดงาน' }}</span>
                <ArrowRight class="w-4 h-4" />
              </button>

              <button
                type="button"
                :disabled="props.busy"
                class="h-9 sm:h-10 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1 transition active:scale-95 shadow-2xs disabled:opacity-50 cursor-pointer"
                title="จบงานนี้"
                @click="emit('finish', job.id)"
              >
                <CheckCircle2 class="w-4 h-4" />
                <span class="hidden lg:inline">จบงาน</span>
              </button>
            </div>
            <div v-else class="text-xs text-stone-500 font-bold">
              <div v-if="job.finishedAt" class="flex items-center justify-center gap-1">
                <Clock class="w-3.5 h-3.5 text-stone-400" />
                <span>{{ formatShortThaiDate(job.finishedAt) }}</span>
              </div>
              <span v-else>-</span>
            </div>
          </td>
        </tr>

        <tr v-if="!props.jobs.length">
          <td colspan="9" class="py-8 text-center text-stone-400 font-bold">
            ยังไม่มีงานในรายการนี้
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
