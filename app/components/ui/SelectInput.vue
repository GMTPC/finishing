<script setup lang="ts">
import { fieldClass, type FieldSize } from '~/constants/ui'

const props = withDefaults(
  defineProps<{
    options: Array<{ label: string; value: string }>
    size?: FieldSize
  }>(),
  { size: 'md' }
)

const model = defineModel<string>({ default: '' })
</script>

<template>
  <select v-model="model" :class="[fieldClass(props.size), 'font-sans cursor-pointer bg-white']">
    <option v-for="opt in props.options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>
