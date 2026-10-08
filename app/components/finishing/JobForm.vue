<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { CalendarDays, Layers, PlayCircle, Search, Users } from 'lucide-vue-next'
import BigButton from '~/components/ui/BigButton.vue'
import CheckboxList from '~/components/ui/CheckboxList.vue'
import FormField from '~/components/ui/FormField.vue'
import SegmentedControl from '~/components/ui/SegmentedControl.vue'
import RadioList from '~/components/ui/RadioList.vue'
import SelectInput from '~/components/ui/SelectInput.vue'
import TextInput from '~/components/ui/TextInput.vue'
import type { ShiftCode, StationMeta } from '~~/shared/types/finishing'
import { SHIFTS } from '~~/shared/constants/shifts'
import { fieldClass } from '~/constants/ui'
import { EMPLOYEES, searchEmployees } from '~/constants/employees'
import { useJobsStore } from '~/stores/jobs'
import { useSessionStore } from '~/stores/session'

/** ฟอร์มสร้างงานแปรรูป — วันที่, กะ, รายชื่อพนักงานที่ทำงาน, เครื่อง */
const props = defineProps<{ station: StationMeta }>()
const emit = defineEmits<{ created: [jobId: number] }>()

const session = useSessionStore()
const jobs = useJobsStore()
const { isSubmitting } = storeToRefs(jobs)

const today = new Date().toISOString().slice(0, 10)

const startedAt = ref(today)
const shift = ref<ShiftCode>(session.shift)
const machine = ref(props.station.machines[0] ?? '')
const pvcType = ref('')
const operators = ref<string[]>(session.operatorName ? [session.operatorName] : [])
const keyword = ref('')

const shiftOptions = SHIFTS.map(s => ({ label: s.label, value: s.value }))
const machineOptions = computed(() => props.station.machines.map(m => ({ label: m, value: m })))

/** สถานีที่ต้องระบุชนิด PVC (ปัจจุบันคือ S1) */
const pvcOptions = computed(() => props.station.pvcTypes.map(p => ({ label: p, value: p })))
const needsPvcType = computed(() => pvcOptions.value.length > 0)

const employeeOptions = computed(() =>
  searchEmployees(keyword.value).map(e => ({
    label: e.name,
    value: e.name,
    hint: e.isRecent ? 'ล่าสุด' : undefined,
  }))
)

const canSubmit = computed(
  () => operators.value.length > 0 && !!machine.value && !!startedAt.value && (!needsPvcType.value || !!pvcType.value)
)

async function startJob() {
  if (!canSubmit.value) return
  const job = await jobs.createJob({
    stationId: props.station.id,
    shift: shift.value,
    machine: machine.value,
    pvcType: needsPvcType.value ? pvcType.value : null,
    operators: operators.value,
    startedAt: new Date(startedAt.value).toISOString(),
  })
  if (job) {
    // เก็บกะไว้เป็นค่าเริ่มต้นของงานถัดไปในกะเดียวกัน
    session.shift = shift.value
    operators.value = []
    pvcType.value = ''
    emit('created', job.id)
  }
}
</script>

<template>
  <div class="bg-white border border-stone-300 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
    <header class="pb-3 border-b border-stone-200">
      <h2 class="text-lg font-black text-stone-900 tracking-tight">0 · สร้าง Job</h2>
    </header>

    <form class="space-y-5" @submit.prevent="startJob">
      <FormField label="วันที่">
        <div class="flex items-center justify-between bg-stone-100/90 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-800 font-bold">
          <span>{{ today }}</span>
          <span class="text-[11px] text-stone-500 font-medium bg-stone-200/80 px-2 py-0.5 rounded">อัตโนมัติ</span>
        </div>
      </FormField>

      <FormField label="กะ" required>
        <SegmentedControl v-model="shift" :options="shiftOptions" size="lg" />
      </FormField>

      <FormField
        v-if="needsPvcType"
        label="เลือกประเภทที่จะแปรรูป"
        required
        hint="รูปแบบเดียวกันทุกสถานี — เลือกรุ่นก่อนเริ่มรับเข้า/ผลิต"
      >
        <RadioList v-model="pvcType" :options="pvcOptions" placeholder="ค้นหาประเภท..." />
      </FormField>

      <FormField label="เครื่อง" required>
        <SegmentedControl
          v-if="machineOptions.length > 1 && machineOptions.length <= 3"
          v-model="machine"
          :options="machineOptions"
          :columns="machineOptions.length"
        />
        <SelectInput v-else v-model="machine" :options="machineOptions" />
      </FormField>

      <FormField
        label="รายชื่อพนักงานที่ทำงาน"
        required
        :hint="operators.length ? `เลือกแล้ว ${operators.length} คน: ${operators.join(', ')}` : 'เลือกได้มากกว่า 1 คน'"
      >
        <div v-if="EMPLOYEES.length > 5" class="relative mb-2">
          <Search class="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <TextInput v-model="keyword" placeholder="ค้นหาชื่อพนักงาน..." class="pl-10" />
        </div>
        <CheckboxList v-model="operators" :options="employeeOptions" />
      </FormField>

      <div class="pt-2">
        <BigButton type="submit" :loading="isSubmitting" :disabled="!canSubmit">
          <span>สร้าง Job</span>
        </BigButton>
      </div>
    </form>
  </div>
</template>
