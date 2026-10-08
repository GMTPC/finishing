<script setup lang="ts">
import { fieldClass, type FieldSize, type FieldTone } from '~/constants/ui'

const props = withDefaults(
  defineProps<{
    size?: FieldSize
    tone?: FieldTone
    min?: number
    step?: number | string
  }>(),
  { size: 'lg', tone: 'default', min: 0 }
)

const model = defineModel<number>({ default: 0 })
</script>

<template>
  <input
    v-model.number="model"
    type="number"
    inputmode="numeric"
    :min="props.min"
    :step="props.step"
    placeholder="0"
    :class="fieldClass(props.size, props.tone)"
  />
</template>
