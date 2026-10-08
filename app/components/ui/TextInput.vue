<script setup lang="ts">
import { fieldClass, type FieldSize, type FieldTone } from '~/constants/ui'

const props = withDefaults(
  defineProps<{
    size?: FieldSize
    tone?: FieldTone
    mono?: boolean
    placeholder?: string
  }>(),
  { size: 'md', tone: 'default', mono: false }
)

const model = defineModel<string>({ default: '' })
</script>

<template>
  <input
    v-model="model"
    type="text"
    :placeholder="placeholder"
    :class="[fieldClass(props.size, props.tone), mono ? 'font-mono' : '']"
  />
</template>
