<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2 } from 'lucide-vue-next'
import BigButton from '~/components/ui/BigButton.vue'
import SectionCard from '~/components/ui/SectionCard.vue'
import type { StepNumber } from '~~/shared/types/finishing'
import { getStep } from '~~/shared/constants/steps'

/**
 * โครงการ์ดของทุกขั้นตอน: หัวข้อ (เลขขั้น + ชื่อ + คำอธิบาย) → เนื้อหา → ปุ่มยืนยัน
 * เดิมทั้ง 4 ขั้นตอนเขียน header/ปุ่มซ้ำกันเองคนละชุด
 */
const props = withDefaults(
  defineProps<{
    step: StepNumber
    /** เขียนหัวข้อทับค่า default จาก `shared/constants/steps.ts` */
    title?: string
    description?: string
    submitLabel?: string
    submitVariant?: 'primary' | 'success'
    loading?: boolean
    disabled?: boolean
  }>(),
  { submitVariant: 'primary' }
)

const emit = defineEmits<{ submit: [] }>()

const meta = computed(() => getStep(props.step))
const heading = computed(() => `ขั้นตอนที่ ${props.step}: ${props.title ?? meta.value.label.replace(/^\d+\.\s*/, '')}`)
</script>

<template>
  <SectionCard :badge="props.step" :title="heading" :description="props.description ?? meta.description">
    <slot />

    <div class="pt-2">
      <BigButton
        :variant="props.submitVariant"
        :loading="props.loading"
        :disabled="props.disabled"
        @click="emit('submit')"
      >
        <template #icon><CheckCircle2 class="w-6 h-6" /></template>
        <span>{{ props.submitLabel ?? meta.submitLabel }}</span>
      </BigButton>
    </div>
  </SectionCard>
</template>
