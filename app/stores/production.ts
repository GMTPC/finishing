import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  Destination,
  InputSource,
  IssuedTagDto,
  PackagingMaterials,
  RollerSet,
  StepNumber,
  WorkRecordInput,
} from '~~/shared/types/finishing'
import { getStep } from '~~/shared/constants/steps'
import { parseTagBarcode } from '~~/shared/utils/tag'
import { newIdempotencyKey, yieldRate } from '~~/shared/utils/format'
import { api, apiErrorMessage } from '~/utils/api'
import { useJobsStore } from '~/stores/jobs'
import { useSessionStore } from '~/stores/session'
import { useSystemStore } from '~/stores/system'

const ROLLER_SET_COUNT = 3

function createRollerSet(): RollerSet {
  return {
    thick: 0.5,
    beltHz: 50,
    smallRollerHz: 40,
    bigRollerHz: 60,
    doctorBladeHz: 30,
    chainHz: 45,
    ovenTemp: 180,
    waterKg: 5,
    inkKg: 12,
  }
}

function createPackaging(): PackagingMaterials {
  return { paperRoll: 0, corrugatedPaper: 0, adhesiveTape: 0, edgeTape: 0, plasticBagKg: 0 }
}

/** ฟอร์มการผลิตของล็อตที่กำลังทำอยู่ + การบันทึกลง ledger (ผูกกับ job เสมอ) */
export const useProductionStore = defineStore('production', () => {
  const session = useSessionStore()
  const system = useSystemStore()
  const jobs = useJobsStore()

  // ── ขั้นตอนที่ 1: สแกน TAG จากคัดบอร์ดเข้าสถานี
  const inputSource = ref<InputSource>('RAW')
  /** ข้อมูลของ TAG ต้นทาง — เติมอัตโนมัติจากบาร์โค้ด แต่พนักงานแก้ไขได้ */
  const scannedTagCode = ref('')
  const itemCode = ref('')
  const itemName = ref('')
  const sizeText = ref('')
  const sourceLot = ref('')
  const receivedQty = ref(0)

  // ── ขั้นตอนที่ 2: ตั้งค่าก่อนผลิต (กะ/เครื่อง/พนักงาน มาจาก job แล้ว)
  const rollerSets = ref<RollerSet[]>(Array.from({ length: ROLLER_SET_COUNT }, createRollerSet))

  // ── ขั้นตอนที่ 3: ผลิต & แผ่นเสีย + TAG ใหม่ที่ออกจากฟินิชชิ่ง
  const issuedTag = ref<IssuedTagDto | null>(null)
  const isIssuingTag = ref(false)
  const producedQty = ref(0)
  const defectQty = ref(0)
  const packaging = ref<PackagingMaterials>(createPackaging())

  // ── ขั้นตอนที่ 4: ส่งต่อ / เซ็นรับ FG
  const destination = ref<Destination>('WAREHOUSE')
  const fgSignatureData = ref<string | null>(null)
  const fgSignedBy = ref('')

  // ── สถานะการบันทึก
  const isSaving = ref(false)
  const successMessage = ref<string | null>(null)
  const errorMessage = ref<string | null>(null)

  const currentYield = computed(() => yieldRate(producedQty.value, defectQty.value))
  const isBalanced = computed(() => receivedQty.value === 0 || producedQty.value + defectQty.value <= receivedQty.value)

  /** ต้องมีข้อมูล TAG ต้นทางครบก่อน จึงออก TAG ใหม่ได้ */
  const canIssueTag = computed(() => !!scannedTagCode.value.trim() && !!itemCode.value.trim())

  /** ตั้งค่าเริ่มต้นของฟอร์มให้ตรงกับสถานีที่เลือก (แหล่งวัสดุเข้า / ปลายทางส่งต่อ) */
  function syncWithStation() {
    const meta = session.station
    inputSource.value = meta.inputSources[0] ?? 'RAW'
    destination.value = meta.allowedNext[0] ?? 'WAREHOUSE'
  }

  /**
   * รับผลการสแกน TAG คัดบอร์ด แล้วเติมข้อมูลลงฟอร์มให้พนักงานตรวจ
   * (อ่านแบบ best-effort — ทุกช่องยังแก้ไขได้)
   */
  function applyScannedTag(raw: string) {
    const parsed = parseTagBarcode(raw)
    scannedTagCode.value = parsed.raw
    itemCode.value = parsed.itemCode
    if (parsed.sizeText) sizeText.value = parsed.sizeText
    if (parsed.lot) sourceLot.value = parsed.lot
    if (parsed.quantity !== null) receivedQty.value = parsed.quantity
    // TAG ต้นทางเปลี่ยน = ต้องออก TAG ใหม่อีกใบ
    issuedTag.value = null
  }

  /** ออก TAG ใหม่ของฟินิชชิ่ง (server เป็นคนออก Lot + running) */
  async function issueTag() {
    const job = jobs.activeJob
    if (!job || job.status !== 'active') {
      errorMessage.value = 'ยังไม่ได้เลือกงาน — กรุณาสร้างงานแปรรูป หรือเลือกงานที่กำลังแปรรูปก่อน'
      return null
    }
    if (!canIssueTag.value) {
      errorMessage.value = 'ต้องสแกน TAG จากคัดบอร์ดและระบุรหัสสินค้าก่อนออก TAG ใหม่'
      return null
    }

    isIssuingTag.value = true
    errorMessage.value = null
    try {
      const res = await api.issueTag({
        stationId: session.activeStation,
        jobId: job.id,
        shift: session.shift,
        code: scannedTagCode.value.trim(),
        itemCode: itemCode.value.trim(),
        itemName: itemName.value || null,
        sizeText: sizeText.value || null,
        lot: sourceLot.value || null,
        quantity: receivedQty.value,
        issuedBy: session.operatorName,
        idempotencyKey: newIdempotencyKey(),
      })
      issuedTag.value = res.data
      successMessage.value = res.data.duplicated
        ? `TAG ของใบนี้เคยออกแล้ว: ${res.data.code}`
        : `ออก TAG ใหม่สำเร็จ: ${res.data.code}`
      return res.data
    } catch (err) {
      errorMessage.value = apiErrorMessage(err, 'ออก TAG ใหม่ไม่สำเร็จ')
      return null
    } finally {
      isIssuingTag.value = false
    }
  }

  /** เคลียร์ฟอร์มเพื่อเริ่มล็อตใหม่ (ไม่แตะ job หรือข้อมูลผู้ปฏิบัติงาน) */
  function resetLot() {
    scannedTagCode.value = ''
    itemCode.value = ''
    itemName.value = ''
    sizeText.value = ''
    sourceLot.value = ''
    receivedQty.value = 0
    issuedTag.value = null
    producedQty.value = 0
    defectQty.value = 0
    packaging.value = createPackaging()
    fgSignatureData.value = null
    fgSignedBy.value = ''
    syncWithStation()
  }

  function buildPayload(step: StepNumber, jobId: number): WorkRecordInput {
    const meta = getStep(step)
    const job = jobs.activeJob
    return {
      stationId: session.activeStation,
      jobId,
      step,
      status: `Step ${step}: ${meta.label}`,
      shift: session.shift,
      operator: job?.operators.join(', ') || session.operatorName,
      // ขั้นตอน 1–2 อ้างอิง TAG ต้นทาง, ขั้นตอน 3–4 อ้างอิง TAG ใหม่ที่ออกให้ล็อต
      tagCode: step >= 3 ? (issuedTag.value?.code ?? scannedTagCode.value) || null : scannedTagCode.value || null,
      producedQty: producedQty.value,
      defectQty: defectQty.value,
      inputSource: inputSource.value,
      destination: destination.value,
      signatureData: step === 4 ? fgSignatureData.value : null,
      details: {
        jobCode: job?.code ?? null,
        machine: job?.machine ?? null,
        pvcType: job?.pvcType ?? null,
        operators: job?.operators ?? [],
        sourceTagCode: scannedTagCode.value || null,
        sourceLot: sourceLot.value || null,
        itemCode: itemCode.value || null,
        itemName: itemName.value || null,
        sizeText: sizeText.value || null,
        receivedQty: receivedQty.value,
        issuedTagCode: issuedTag.value?.code ?? null,
        issuedLot: issuedTag.value?.lot ?? null,
        issuedRunning: issuedTag.value?.running ?? null,
        fgSignedBy: fgSignedBy.value || null,
        ...(session.station.hasColorSetup ? { rollerSets: rollerSets.value } : {}),
        ...(session.station.hasPackaging ? { packaging: packaging.value } : {}),
      },
      idempotencyKey: newIdempotencyKey(),
    }
  }

  /** บันทึกขั้นตอนปัจจุบันลง ledger (append-only, กันส่งซ้ำด้วย idempotency key) */
  async function submitStep(step: StepNumber = session.currentStep) {
    const jobId = jobs.activeJobId
    if (!jobId || !jobs.hasActiveJob) {
      errorMessage.value = 'ยังไม่ได้เลือกงาน — กรุณาสร้างงานแปรรูป หรือเลือกงานที่กำลังแปรรูปก่อน'
      return false
    }

    isSaving.value = true
    successMessage.value = null
    errorMessage.value = null
    try {
      const res = await api.createRecord(buildPayload(step, jobId))
      successMessage.value = `บันทึกขั้นตอนที่ ${step} สำเร็จ (เลขที่รายการ ${res.data.id})`
      await Promise.all([system.refreshRecords(), jobs.fetchJobs()])
      return true
    } catch (err) {
      errorMessage.value = apiErrorMessage(err, 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง')
      return false
    } finally {
      isSaving.value = false
    }
  }

  function clearFeedback() {
    successMessage.value = null
    errorMessage.value = null
  }

  return {
    inputSource,
    scannedTagCode,
    itemCode,
    itemName,
    sizeText,
    sourceLot,
    receivedQty,
    rollerSets,
    issuedTag,
    isIssuingTag,
    producedQty,
    defectQty,
    packaging,
    destination,
    fgSignatureData,
    fgSignedBy,
    isSaving,
    successMessage,
    errorMessage,
    currentYield,
    isBalanced,
    canIssueTag,
    syncWithStation,
    applyScannedTag,
    issueTag,
    resetLot,
    submitStep,
    clearFeedback,
  }
})
