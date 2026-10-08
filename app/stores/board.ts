import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { IssuedTagDto, JobMaterialDto, JobTotals, WipEntryDto } from '~~/shared/types/finishing'
import { parseTagBarcode, suggestOutItemCode } from '~~/shared/utils/tag'
import { newIdempotencyKey } from '~~/shared/utils/format'
import { api, apiErrorMessage } from '~/utils/api'
import { useJobsStore } from '~/stores/jobs'
import { useSessionStore } from '~/stores/session'

const EMPTY_TOTALS: JobTotals = {
  inQty: 0,
  outQty: 0,
  holdQty: 0,
  trimQty: 0,
  entryCount: 0,
  issuedCount: 0,
}

/**
 * กระดานข้อมูลเข้า/ออกของงาน (สถานีที่ `workMode === 'board'`)
 * ซ้าย = TAG ที่สแกนรับเข้า • ขวา = รหัสที่ออกใหม่ • หัวกระดาน = ยอดสรุป
 */
export const useBoardStore = defineStore('board', () => {
  const session = useSessionStore()
  const jobs = useJobsStore()

  const entries = ref<WipEntryDto[]>([])
  const totals = ref<JobTotals>({ ...EMPTY_TOTALS })
  const materials = ref<JobMaterialDto[]>([])

  const isLoading = ref(false)
  const isScanning = ref(false)
  const isIssuing = ref(false)
  const successMessage = ref<string | null>(null)
  const errorMessage = ref<string | null>(null)

  /** แถวที่ออก TAG แล้ว (คอลัมน์ขวา) */
  const issuedList = computed(() =>
    entries.value.map(e => e.issued).filter((t): t is IssuedTagDto => !!t)
  )
  /** แถวที่ยังไม่ได้ออก TAG */
  const pendingEntries = computed(() => entries.value.filter(e => !e.issued))
  const canIssue = computed(() => pendingEntries.value.length > 0)

  function clearFeedback() {
    successMessage.value = null
    errorMessage.value = null
  }

  async function load(jobId: number) {
    isLoading.value = true
    errorMessage.value = null
    try {
      const res = await api.jobBoard(jobId)
      entries.value = res.data.entries
      totals.value = res.data.totals
      return res.data.job
    } catch (err) {
      errorMessage.value = apiErrorMessage(err, 'ดึงข้อมูลกระดานงานไม่สำเร็จ')
      entries.value = []
      totals.value = { ...EMPTY_TOTALS }
      return null
    } finally {
      isLoading.value = false
    }
  }

  function addMaterial(item: { materialCode: string; materialName: string; quantity: number; unit?: string }) {
    materials.value.push({
      id: Date.now(),
      jobId: jobs.activeJobId ?? 0,
      materialCode: item.materialCode,
      materialName: item.materialName,
      quantity: item.quantity,
      unit: item.unit,
      createdAt: new Date(),
    })
    successMessage.value = `เพิ่มวัตถุดิบ ${item.materialName} เรียบร้อยแล้ว`
  }

  function removeMaterial(id: string | number) {
    materials.value = materials.value.filter(m => m.id !== id)
  }

  /** สแกน/พิมพ์บาร์โค้ดรับเข้า 1 แถว */
  async function addEntry(rawBarcode: string) {
    const jobId = jobs.activeJobId
    if (!jobId) {
      errorMessage.value = 'ยังไม่ได้เลือกงาน'
      return false
    }

    const barcode = rawBarcode.trim()
    if (!barcode) return false

    if (entries.value.some(e => e.barcode === barcode)) {
      errorMessage.value = `บาร์โค้ดนี้สแกนเข้างานนี้แล้ว: ${barcode}`
      return false
    }

    const parsed = parseTagBarcode(barcode)
    isScanning.value = true
    clearFeedback()
    try {
      const res = await api.addWipEntry(jobId, {
        barcode,
        itemCode: parsed.itemCode,
        sizeText: parsed.sizeText,
        sourceLot: parsed.lot,
        quantity: parsed.quantity ?? 0,
        idempotencyKey: newIdempotencyKey(),
      })
      successMessage.value = res.data.duplicated
        ? `บาร์โค้ดนี้มีอยู่แล้วในงาน: ${barcode}`
        : `รับเข้า ${parsed.itemCode} จำนวน ${parsed.quantity ?? 0} แผ่น`
      await load(jobId)
      return true
    } catch (err) {
      errorMessage.value = apiErrorMessage(err, 'บันทึกรายการเข้าไม่สำเร็จ')
      return false
    } finally {
      isScanning.value = false
    }
  }

  async function removeEntry(entryId: number) {
    const jobId = jobs.activeJobId
    if (!jobId) return false
    clearFeedback()
    try {
      await api.removeWipEntry(jobId, entryId)
      await load(jobId)
      return true
    } catch (err) {
      errorMessage.value = apiErrorMessage(err, 'ลบรายการไม่สำเร็จ')
      return false
    }
  }

  async function removeIssuedTag(tagId: number) {
    const jobId = jobs.activeJobId
    if (!jobId) return false
    clearFeedback()
    try {
      await api.removeIssuedTag(jobId, tagId)
      await load(jobId)
      return true
    } catch (err) {
      errorMessage.value = apiErrorMessage(err, 'ลบรายการออก TAG ไม่สำเร็จ')
      return false
    }
  }

  /** ออกรหัสใหม่ให้แถวที่ยังไม่ได้ออก (ปุ่ม "ออกรหัส") */
  async function issueFor(entry: WipEntryDto, outItemCode?: string) {
    const job = jobs.activeJob
    if (!job) {
      errorMessage.value = 'ยังไม่ได้เลือกงาน'
      return null
    }

    isIssuing.value = true
    clearFeedback()
    try {
      const res = await api.issueTag({
        stationId: session.activeStation,
        jobId: job.id,
        wipEntryId: entry.id,
        shift: session.shift,
        code: entry.barcode,
        itemCode: entry.itemCode,
        outItemCode: outItemCode || suggestOutItemCode(entry.itemCode, session.station.outItemPrefix),
        itemName: entry.itemName,
        sizeText: entry.sizeText,
        lot: entry.sourceLot,
        quantity: entry.quantity,
        issuedBy: session.operatorName,
        idempotencyKey: newIdempotencyKey(),
      })
      successMessage.value = res.data.duplicated
        ? `รายการนี้ออกรหัสแล้ว: ${res.data.code}`
        : `ออกรหัสใหม่: ${res.data.lot} → ${res.data.code}`
      await load(job.id)
      return res.data
    } catch (err) {
      errorMessage.value = apiErrorMessage(err, 'ออกรหัสใหม่ไม่สำเร็จ')
      return null
    } finally {
      isIssuing.value = false
    }
  }

  /** ออกรหัสให้ทุกแถวที่ยังค้างอยู่ */
  async function issueAllPending(outItemCode?: string) {
    for (const entry of [...pendingEntries.value]) {
      const issued = await issueFor(entry, outItemCode)
      if (!issued) break
    }
  }

  async function saveTrimQty(trimQty: number) {
    const jobId = jobs.activeJobId
    if (!jobId) return false
    clearFeedback()
    try {
      const res = await api.updateTrimQty(jobId, trimQty)
      totals.value = res.data.totals
      successMessage.value = `อัพเดทจำนวนตัดทิ้งเป็น ${trimQty} แผ่นแล้ว`
      await jobs.fetchJobs()
      return true
    } catch (err) {
      errorMessage.value = apiErrorMessage(err, 'อัพเดทจำนวนตัดทิ้งไม่สำเร็จ')
      return false
    }
  }

  function reset() {
    entries.value = []
    totals.value = { ...EMPTY_TOTALS }
    clearFeedback()
  }

  return {
    entries,
    totals,
    materials,
    issuedList,
    pendingEntries,
    canIssue,
    isLoading,
    isScanning,
    isIssuing,
    successMessage,
    errorMessage,
    clearFeedback,
    load,
    addMaterial,
    removeMaterial,
    addEntry,
    removeEntry,
    removeIssuedTag,
    issueFor,
    issueAllPending,
    saveTrimQty,
    reset,
  }
})
