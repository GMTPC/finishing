<script setup lang="ts">
import { computed, ref } from 'vue'
import { Layers, Plus, Search, Trash2, X } from 'lucide-vue-next'
import { RAW_MATERIALS, type MaterialOption } from '~~/shared/constants/materials'
import type { JobMaterialDto } from '~~/shared/types/finishing'
import FormField from '~/components/ui/FormField.vue'
import NumberInput from '~/components/ui/NumberInput.vue'
import TextInput from '~/components/ui/TextInput.vue'
import { fieldClass } from '~/constants/ui'

const props = defineProps<{
  materials: JobMaterialDto[]
  busy?: boolean
  readonly?: boolean
}>()

const emit = defineEmits<{
  add: [item: { materialCode: string; materialName: string; quantity: number; unit?: string }]
  remove: [id: string | number]
}>()

/** State ควบคุม Modal */
const isModalOpen = ref(false)
const isPickerOpen = ref(false)
const searchQuery = ref('')

const selectedMaterial = ref<MaterialOption | null>(null)
const quantityInput = ref<number | null>(null)

/** รายการวัตถุดิบที่ผ่านการกรอง Search */
const filteredMaterials = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return RAW_MATERIALS
  return RAW_MATERIALS.filter(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q))
})

function openAddModal() {
  selectedMaterial.value = null
  quantityInput.value = null
  searchQuery.value = ''
  isModalOpen.value = true
  isPickerOpen.value = true
}

function selectMaterial(mat: MaterialOption) {
  selectedMaterial.value = mat
  isPickerOpen.value = false
}

function handleSave() {
  if (!selectedMaterial.value || !quantityInput.value || quantityInput.value <= 0) return
  emit('add', {
    materialCode: selectedMaterial.value.code,
    materialName: selectedMaterial.value.name,
    quantity: Number(quantityInput.value),
    unit: selectedMaterial.value.unit,
  })
  isModalOpen.value = false
}
</script>

<template>
  <div>
    <!-- กรณีมีวัตถุดิบแล้ว -->
    <div v-if="props.materials.length" class="space-y-2">
      <div class="flex items-center justify-between px-1 text-xs font-bold text-stone-900">
        <div class="flex items-center gap-2">
          <Layers class="w-4 h-4 text-amber-600 shrink-0" />
          <span>ปริมาณการใช้วัตถุดิบในการแปรรูป</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded shrink-0">
            {{ props.materials.length }} รายการ
          </span>
          <button
            v-if="!props.readonly"
            type="button"
            :disabled="props.busy"
            class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
            @click="openAddModal"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>เพิ่ม</span>
          </button>
        </div>
      </div>

      <!-- รายการ Item-Level Cards -->
      <div class="space-y-1.5">
        <div
          v-for="(item, idx) in props.materials"
          :key="item.id"
          class="bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="font-mono text-xs font-bold text-slate-400 w-4 text-center shrink-0">{{ idx + 1 }}</span>
            <div class="min-w-0">
              <p class="font-bold text-slate-900 text-xs sm:text-sm truncate">{{ item.materialName }}</p>
              <p class="font-mono text-[11px] text-slate-500 font-semibold truncate">{{ item.materialCode }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 shrink-0">
            <span class="font-mono font-black text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
              {{ item.quantity.toLocaleString() }} {{ item.unit ?? '' }}
            </span>
            <button
              v-if="!props.readonly"
              type="button"
              :disabled="props.busy"
              class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition cursor-pointer"
              title="ลบรายการนี้"
              @click="emit('remove', item.id)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- กรณียังไม่มีวัตถุดิบ: แถบ Slim Bar -->
    <div v-else class="bg-white border border-slate-200/90 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-2xs">
      <div class="flex items-center gap-2 text-xs font-bold text-slate-700 min-w-0 truncate">
        <Layers class="w-4 h-4 text-amber-500 shrink-0" />
        <span class="truncate">ปริมาณการใช้วัตถุดิบ (0 รายการ)</span>
      </div>
      <button
        v-if="!props.readonly"
        type="button"
        :disabled="props.busy"
        class="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:opacity-40 text-white font-extrabold text-xs flex items-center gap-1 transition shrink-0 cursor-pointer shadow-2xs"
        @click="openAddModal"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>เพิ่มวัตถุดิบ</span>
      </button>
    </div>

    <!-- Modal เพิ่มปริมาณการใช้วัตถุดิบ -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      >
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <header class="bg-slate-900 text-white p-4 flex items-center justify-between">
            <h4 class="font-black text-sm uppercase tracking-wide">เพิ่มการใช้วัตถุดิบ</h4>
            <button type="button" class="p-1 rounded-lg hover:bg-slate-800 text-slate-300" @click="isModalOpen = false">
              <X class="w-5 h-5" />
            </button>
          </header>

          <div class="p-5 space-y-4">
            <!-- เลือกวัตถุดิบ -->
            <FormField label="วัตถุดิบ" required>
              <button
                type="button"
                class="w-full text-left p-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white font-bold flex justify-between items-center transition"
                :class="selectedMaterial ? 'text-slate-900' : 'text-slate-400 font-normal'"
                @click="isPickerOpen = true"
              >
                <span class="truncate">{{ selectedMaterial ? selectedMaterial.name : 'กรุณากดเลือกวัตถุดิบ...' }}</span>
                <span class="text-blue-600 font-black text-xs shrink-0 ml-2">{{ selectedMaterial ? 'เปลี่ยน' : 'กดเลือก' }}</span>
              </button>
            </FormField>

            <!-- รหัสวัตถุดิบ -->
            <FormField label="รหัสวัตถุดิบ">
              <TextInput :model-value="selectedMaterial?.code ?? ''" readonly mono disabled />
            </FormField>

            <!-- ปริมาณการใช้วัตถุดิบ -->
            <FormField label="ปริมาณการใช้วัตถุดิบ" required>
              <NumberInput v-model="quantityInput" placeholder="กรอกจำนวนปริมาณที่ใช้..." min="1" />
            </FormField>
          </div>

          <footer class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 text-xs sm:text-sm transition"
              @click="isModalOpen = false"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              :disabled="!selectedMaterial || !quantityInput || quantityInput <= 0"
              class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-black text-xs sm:text-sm transition active:scale-95 shadow-2xs"
              @click="handleSave"
            >
              บันทึก
            </button>
          </footer>
        </div>
      </div>

      <!-- Pop-up รายการเลือกวัตถุดิบ -->
      <div
        v-if="isPickerOpen"
        class="fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      >
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
          <header class="p-4 border-b border-slate-100 space-y-3 bg-slate-50">
            <div class="flex items-center justify-between">
              <h5 class="font-black text-slate-900 text-sm">เลือกรายการวัตถุดิบ</h5>
              <button type="button" class="p-1 rounded-lg hover:bg-slate-200 text-slate-600" @click="isPickerOpen = false">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- ช่อง Search -->
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาชื่อ หรือ รหัสวัตถุดิบ..."
                :class="[fieldClass('md'), 'pl-9']"
              />
            </div>
          </header>

          <div class="flex-1 overflow-y-auto p-2 divide-y divide-slate-100">
            <button
              v-for="mat in filteredMaterials"
              :key="mat.code"
              type="button"
              class="w-full text-left p-3 rounded-xl hover:bg-sky-50 transition flex items-center justify-between gap-3 group"
              @click="selectMaterial(mat)"
            >
              <div class="min-w-0">
                <p class="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-sky-900">{{ mat.name }}</p>
                <p class="font-mono text-xs text-slate-500 mt-0.5">{{ mat.code }}</p>
              </div>
              <span
                v-if="selectedMaterial?.code === mat.code"
                class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black shrink-0"
              >
                เลือกอยู่
              </span>
            </button>

            <div v-if="!filteredMaterials.length" class="p-8 text-center text-slate-400 text-sm font-medium">
              ไม่พบวัตถุดิบที่ค้นหา
            </div>
          </div>

          <footer class="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
              @click="isPickerOpen = false"
            >
              ปิดหน้าต่าง
            </button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>
