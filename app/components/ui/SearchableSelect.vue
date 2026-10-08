<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Check, ChevronDown, Search, X } from 'lucide-vue-next'
import { fieldClass, type FieldSize } from '~/constants/ui'

export interface SelectOption {
  label: string
  value: string
  badge?: string
  isRecent?: boolean
}

const props = withDefaults(
  defineProps<{
    options: SelectOption[]
    placeholder?: string
    searchPlaceholder?: string
    size?: FieldSize
  }>(),
  {
    placeholder: 'เลือกรายการ...',
    searchPlaceholder: 'พิมพ์ชื่อ / รหัส เพื่อค้นหา...',
    size: 'md',
  }
)

const model = defineModel<string>({ default: '' })

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const selectedOption = computed(() =>
  props.options.find(opt => opt.value === model.value)
)

const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(
    opt =>
      opt.label.toLowerCase().includes(q) ||
      opt.value.toLowerCase().includes(q)
  )
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    setTimeout(() => searchInputRef.value?.focus(), 50)
  }
}

function selectOption(val: string) {
  model.value = val
  isOpen.value = false
  searchQuery.value = ''
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="containerRef" class="relative w-full">
    <!-- Trigger Button -->
    <button
      type="button"
      class="w-full flex items-center justify-between text-left transition select-none"
      :class="[
        fieldClass(props.size),
        'bg-white cursor-pointer gap-2',
        isOpen ? 'ring-2 ring-[#696CFF]/20 border-[#696CFF]' : '',
      ]"
      @click="toggleDropdown"
    >
      <span class="truncate" :class="selectedOption ? 'text-slate-800 font-bold' : 'text-slate-400 font-normal'">
        {{ selectedOption ? selectedOption.label : props.placeholder }}
      </span>

      <div class="flex items-center gap-1 shrink-0 text-slate-400">
        <ChevronDown class="w-4 h-4 transition-transform duration-200" :class="isOpen ? 'rotate-180 text-[#696CFF]' : ''" />
      </div>
    </button>

    <!-- Dropdown Panel -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200/90 rounded-xl shadow-sneat-md p-2 space-y-2"
      >
        <!-- Search Input Field inside Dropdown -->
        <div class="relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            :placeholder="props.searchPlaceholder"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#696CFF]/20 focus:border-[#696CFF]"
            @keydown.esc="isOpen = false"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            @click="searchQuery = ''"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Options List -->
        <div class="max-h-52 overflow-y-auto space-y-0.5 divide-y divide-slate-50 pr-0.5">
          <button
            v-for="opt in filteredOptions"
            :key="opt.value"
            type="button"
            class="w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs sm:text-sm font-semibold transition text-left"
            :class="opt.value === model
              ? 'bg-[#696CFF]/10 text-[#696CFF] font-extrabold'
              : 'hover:bg-slate-50 text-slate-700'"
            @click="selectOption(opt.value)"
          >
            <span class="flex items-center gap-2 min-w-0">
              <Check v-if="opt.value === model" class="w-4 h-4 text-[#696CFF] shrink-0" />
              <span class="truncate">{{ opt.label }}</span>
            </span>

            <span
              v-if="opt.isRecent || opt.badge"
              class="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2"
              :class="opt.value === model
                ? 'bg-[#696CFF] text-white'
                : 'bg-slate-100 text-slate-500'"
            >
              {{ opt.badge || (opt.isRecent ? 'ล่าสุด' : '') }}
            </span>
          </button>

          <div v-if="filteredOptions.length === 0" class="py-4 text-center text-xs text-slate-400 font-medium">
            ไม่พบชื่อ "{{ searchQuery }}"
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
