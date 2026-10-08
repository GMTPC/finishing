import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { DbHealth, WorkRecordDto } from '~~/shared/types/finishing'
import { yieldRate } from '~~/shared/utils/format'
import { api, apiErrorMessage } from '~/utils/api'

/** สถานะระบบ: การเชื่อมต่อฐานข้อมูล และประวัติรายการล่าสุด */
export const useSystemStore = defineStore('system', () => {
  const health = ref<DbHealth | null>(null)
  const healthError = ref<string | null>(null)
  const isCheckingHealth = ref(false)

  const records = ref<WorkRecordDto[]>([])
  const isLoadingRecords = ref(false)

  const isDbConnected = computed(() => health.value?.connected === true)

  const totals = computed(() => {
    const produced = records.value.reduce((sum, r) => sum + (r.producedQty || 0), 0)
    const defects = records.value.reduce((sum, r) => sum + (r.defectQty || 0), 0)
    return { produced, defects, yield: yieldRate(produced, defects) }
  })

  /** จำนวนสถานีที่มีการบันทึกข้อมูลในรายการล่าสุด */
  const activeStationCount = computed(() => new Set(records.value.map(r => r.stationId)).size)

  async function checkHealth() {
    isCheckingHealth.value = true
    healthError.value = null
    try {
      const res = await api.health()
      health.value = res.data
      if (res.data.connected) await refreshRecords()
    } catch (err) {
      health.value = null
      healthError.value = apiErrorMessage(err, 'เชื่อมต่อฐานข้อมูลไม่สำเร็จ')
    } finally {
      isCheckingHealth.value = false
    }
  }

  async function refreshRecords(limit = 50) {
    isLoadingRecords.value = true
    try {
      const res = await api.listRecords({ limit })
      records.value = res.data
    } catch {
      // ประวัติโหลดไม่ได้ไม่ควรขัดจังหวะการทำงานหน้างาน
      records.value = []
    } finally {
      isLoadingRecords.value = false
    }
  }

  return {
    health,
    healthError,
    isCheckingHealth,
    isDbConnected,
    records,
    isLoadingRecords,
    totals,
    activeStationCount,
    checkHealth,
    refreshRecords,
  }
})
