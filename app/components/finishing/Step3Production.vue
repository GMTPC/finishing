<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { AlertTriangle, Tag } from 'lucide-vue-next'
import IssuedTagPreview from '~/components/finishing/IssuedTagPreview.vue'
import PackagingMaterialsForm from '~/components/finishing/PackagingMaterialsForm.vue'
import StepCard from '~/components/finishing/StepCard.vue'
import AlertBanner from '~/components/ui/AlertBanner.vue'
import BigButton from '~/components/ui/BigButton.vue'
import FormField from '~/components/ui/FormField.vue'
import NumberInput from '~/components/ui/NumberInput.vue'
import { formatPercent } from '~~/shared/utils/format'
import { useProductionStore } from '~/stores/production'
import { useSessionStore } from '~/stores/session'

/**
 * ขั้นตอนที่ 3 — ออก TAG ใหม่ของฟินิชชิ่ง (Lot + running ใหม่จาก server)
 * แล้วบันทึกผลผลิตและยอด "แผ่นเสีย" (บังคับกรอกแม้เป็น 0)
 */
const emit = defineEmits<{ submit: [] }>()

const session = useSessionStore()
const production = useProductionStore()
const { station } = storeToRefs(session)
const {
  producedQty,
  defectQty,
  packaging,
  isSaving,
  issuedTag,
  isIssuingTag,
  canIssueTag,
  currentYield,
  isBalanced,
  scannedTagCode,
} = storeToRefs(production)

const hasTag = computed(() => !!issuedTag.value)
</script>

<template>
  <StepCard
    :step="3"
    :loading="isSaving"
    :disabled="!hasTag"
    submit-variant="success"
    @submit="emit('submit')"
  >
    <!-- ออก TAG ใหม่จาก TAG ที่สแกนเข้ามา (1 เข้า → 1 ออก) -->
    <section class="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Tag class="w-4 h-4 text-sky-600" />
            <span>TAG ใหม่ของฟินิชชิ่ง</span>
          </p>
          <p class="text-[11px] text-slate-500 font-medium mt-0.5">
            TAG ต้นทาง 1 ใบ ออก TAG ใหม่ได้ 1 ใบ • Lot และ running ออกโดยระบบ
          </p>
        </div>

        <button
          type="button"
          :disabled="!canIssueTag || isIssuingTag || hasTag"
          class="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-black rounded-xl transition uppercase shadow-sm flex items-center gap-1.5"
          @click="production.issueTag()"
        >
          <Tag class="w-3.5 h-3.5" />
          <span>{{ isIssuingTag ? 'กำลังออกเลข...' : 'ออก TAG ใหม่' }}</span>
        </button>
      </div>

      <AlertBanner v-if="!scannedTagCode" tone="warning">
        ยังไม่ได้สแกน TAG จากคัดบอร์ด — กลับไปขั้นตอนที่ 1 ก่อน
      </AlertBanner>

      <IssuedTagPreview v-else-if="issuedTag" :tag="issuedTag" />

      <p v-else class="text-xs text-slate-500 font-medium text-center py-3">
        กด "ออก TAG ใหม่" เพื่อให้ระบบออกเลข Lot และ running ให้ล็อตนี้
      </p>
    </section>

    <!-- ผลผลิต & แผ่นเสีย -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <FormField label="จำนวนผลผลิตที่ได้ (PASS OUTPUT)" required>
        <NumberInput v-model="producedQty" tone="success" />
      </FormField>

      <FormField
        label='จำนวน "แผ่นเสีย" (ต้องกรอกทุกครั้ง แม้เป็น 0)'
        required
        tone="text-rose-700"
        :icon="AlertTriangle"
      >
        <NumberInput v-model="defectQty" tone="danger" />
      </FormField>
    </div>

    <AlertBanner v-if="!isBalanced" tone="warning">
      ยอดผลิต + แผ่นเสีย มากกว่าจำนวนที่รับเข้าสถานี กรุณาตรวจสอบตัวเลขก่อนบันทึก
    </AlertBanner>

    <p class="text-xs font-bold text-slate-600 font-mono">
      ผลผลิตดี (YIELD) ล็อตนี้: <span class="text-slate-900">{{ formatPercent(currentYield) }}</span>
    </p>

    <PackagingMaterialsForm v-if="station.hasPackaging" v-model="packaging" />
  </StepCard>
</template>
