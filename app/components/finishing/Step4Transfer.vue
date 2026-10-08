<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import SignaturePad from '~/components/finishing/SignaturePad.vue'
import StepCard from '~/components/finishing/StepCard.vue'
import AlertBanner from '~/components/ui/AlertBanner.vue'
import FormField from '~/components/ui/FormField.vue'
import SegmentedControl from '~/components/ui/SegmentedControl.vue'
import TextInput from '~/components/ui/TextInput.vue'
import { destinationLabel } from '~~/shared/constants/stations'
import { useProductionStore } from '~/stores/production'
import { useSessionStore } from '~/stores/session'

/** ขั้นตอนที่ 4 — ส่งต่อสถานีถัดไป (S1/S2) หรือเซ็นรับ FG เข้าคลัง (S3/S4/S5) */
const emit = defineEmits<{ submit: [] }>()

const session = useSessionStore()
const production = useProductionStore()
const { station } = storeToRefs(session)
const { destination, fgSignedBy, fgSignatureData, isSaving } = storeToRefs(production)

const needsSignature = computed(() => station.value.requiresFgSignature)

const destinationOptions = computed(() =>
  station.value.allowedNext.map(dest => ({ label: destinationLabel(dest), value: dest }))
)

const title = computed(() => (needsSignature.value ? 'เซ็นรับ FG เข้าคลังสินค้า' : 'ส่งต่อสถานีถัดไป'))
const description = computed(() =>
  needsSignature.value
    ? 'กฎตายตัว: "ไม่เซ็นรับ = ไม่ถือเป็น FG"'
    : 'เลือกปลายทางที่จะส่งชิ้นงานต่อ แล้วยืนยันเพื่อปิดล็อต'
)
const submitLabel = computed(() =>
  needsSignature.value ? 'เซ็นรับ FG เข้าคลังสินค้าเรียบร้อย' : 'ยืนยันการส่งต่อสถานี'
)

/** ไม่เซ็นรับ = ไม่ถือเป็น FG จึงล็อกปุ่มไว้จนกว่าจะมีลายเซ็น + ชื่อผู้รับ */
const blocked = computed(() => needsSignature.value && (!fgSignatureData.value || !fgSignedBy.value.trim()))
</script>

<template>
  <StepCard
    :step="4"
    :title="title"
    :description="description"
    :submit-label="submitLabel"
    submit-variant="success"
    :loading="isSaving"
    :disabled="blocked"
    @submit="emit('submit')"
  >
    <!-- ส่งต่อสถานีถัดไป -->
    <FormField v-if="!needsSignature" label="เลือกสถานีปลายทางที่จะส่งต่อ" required>
      <SegmentedControl
        v-model="destination"
        :options="destinationOptions"
        :columns="Math.min(destinationOptions.length, 2)"
        size="lg"
      />
    </FormField>

    <!-- เซ็นรับ FG เข้าคลัง -->
    <template v-else>
      <AlertBanner tone="warning">
        เจ้าหน้าที่คลังสินค้าต้องลงลายเซ็นดิจิทัลเพื่อรับเข้าคลังเป็น FG ("ไม่เซ็นรับ = ไม่ถือเป็น FG")
      </AlertBanner>

      <FormField label="ลายเซ็นดิจิทัลเจ้าหน้าที่คลังสินค้า" required>
        <SignaturePad v-model="fgSignatureData" />
      </FormField>

      <FormField label="ชื่อผู้เซ็นรับเข้าคลัง" required>
        <TextInput v-model="fgSignedBy" placeholder="ระบุชื่อเจ้าหน้าที่คลังสินค้า..." />
      </FormField>
    </template>
  </StepCard>
</template>
