<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { ScanLine } from 'lucide-vue-next'
import QrScanner from '~/components/finishing/QrScanner.vue'
import StepCard from '~/components/finishing/StepCard.vue'
import AlertBanner from '~/components/ui/AlertBanner.vue'
import FormField from '~/components/ui/FormField.vue'
import NumberInput from '~/components/ui/NumberInput.vue'
import SegmentedControl from '~/components/ui/SegmentedControl.vue'
import TextInput from '~/components/ui/TextInput.vue'
import { INPUT_SOURCE_LABEL } from '~~/shared/constants/stations'
import { useProductionStore } from '~/stores/production'
import { useSessionStore } from '~/stores/session'

/**
 * ขั้นตอนที่ 1 — สแกน TAG WIP จากแผนกคัดบอร์ดเข้าสถานี
 * ข้อมูลที่ถอดจากบาร์โค้ดจะถูกเติมให้อัตโนมัติ แต่พนักงานตรวจและแก้ไขได้ทุกช่อง
 */
const emit = defineEmits<{ submit: [] }>()

const session = useSessionStore()
const production = useProductionStore()
const { activeStation, station } = storeToRefs(session)
const { inputSource, scannedTagCode, itemCode, itemName, sizeText, sourceLot, receivedQty, isSaving } =
  storeToRefs(production)

/** สถานีที่รับวัสดุได้หลายชนิด (S4) ต้องให้เลือกก่อน */
const sourceOptions = computed(() =>
  station.value.inputSources.map(src => ({ label: INPUT_SOURCE_LABEL[src] ?? src, value: src }))
)
const needsSourceChoice = computed(() => sourceOptions.value.length > 1)

const hasScanned = computed(() => !!scannedTagCode.value.trim())
</script>

<template>
  <div class="space-y-4">
    <header class="bg-white border border-stone-300 rounded-2xl p-4 shadow-sm">
      <h2 class="text-base sm:text-lg font-black text-stone-900 tracking-tight">
        1 · รับ {{ station.inputLabel }}
      </h2>
    </header>

    <StepCard
      :step="1"
      :submit-label="`ยืนยันรับมอบ`"
      :loading="isSaving"
      :disabled="!hasScanned || !itemCode"
      @submit="emit('submit')"
    >
      <div v-if="needsSourceChoice" class="p-3.5 bg-stone-100/80 border border-stone-300 rounded-xl">
        <FormField :label="`เลือกแหล่งวัตถุดิบนำเข้า (${activeStation} INPUT SOURCE)`">
          <SegmentedControl v-model="inputSource" :options="sourceOptions" />
        </FormField>
      </div>

      <!-- สแกนบาร์โค้ด / กล้อง -->
      <div class="border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50/70 p-4 sm:p-6 text-center space-y-3">
        <p class="text-xs sm:text-sm font-semibold text-stone-600">
          [ พื้นที่สแกน Tag / กล้อง ] แตะเพื่อสแกน
        </p>
        <QrScanner :model-value="scannedTagCode" @scan="production.applyScannedTag" />
      </div>

      <!-- รายละเอียดข้อมูล TAG ที่สแกนได้ -->
      <div class="space-y-4">
        <AlertBanner v-if="hasScanned" tone="info">
          ตรวจข้อมูลจากใบ TAG ให้ตรงก่อนกดยืนยัน — แก้ไขได้ทุกช่อง
        </AlertBanner>

        <FormField label="เลขบาร์โค้ด TAG ที่สแกนได้" required>
          <TextInput v-model="scannedTagCode" mono placeholder="สแกนหรือพิมพ์เลขบาร์โค้ด TAG..." />
        </FormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="รหัสสินค้า" required>
            <TextInput v-model="itemCode" mono placeholder="เช่น B494-AV0212" />
          </FormField>

          <FormField label="ขนาด">
            <TextInput v-model="sizeText" placeholder="เช่น 1.22 x 2.44 m." />
          </FormField>
        </div>

        <FormField label="ชื่อสินค้า" hint="ยังไม่มีข้อมูลสินค้าในระบบ — กรอกตามใบ TAG ไปก่อน">
          <TextInput v-model="itemName" placeholder="เช่น รอติดFOIL ขอบลาด FIBER CORE 1.22x2.44m.x12mm." />
        </FormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Lot ของคัดบอร์ด">
            <TextInput v-model="sourceLot" mono placeholder="เช่น L4xxxxxxx" />
          </FormField>

          <FormField label="จำนวนที่รับเข้า (แผ่น)" required>
            <NumberInput v-model="receivedQty" />
          </FormField>
        </div>
      </div>
    </StepCard>
  </div>
</template>
