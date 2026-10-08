/**
 * Domain types ของแผนกฟินิชชิ่ง — ใช้ร่วมกันทั้งฝั่ง Nuxt app และ Nitro server
 * ห้ามประกาศ union ของรหัสสถานี/กะ ซ้ำที่อื่น ให้ import จากไฟล์นี้เท่านั้น
 */

export type StationId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5'

/** กะเช้า / กะดึก — เก็บเป็นรหัสอังกฤษ แสดงผลด้วย `shiftLabel()` */
export type ShiftCode = 'MORNING' | 'NIGHT'

/** 1: รับเข้า, 2: ตั้งค่าก่อนผลิต, 3: ผลิต & แผ่นเสีย, 4: ส่งต่อ / เซ็นรับ FG */
export type StepNumber = 1 | 2 | 3 | 4

/** ชนิดวัสดุที่รับเข้าสถานี */
export type InputSource = 'RAW' | 'BOARD' | 'WIP1' | 'WIP2'

/** ปลายทางหลังจบขั้นตอนที่ 4 */
export type Destination = StationId | 'WAREHOUSE'

/** กลุ่มของสถานี: สายต่อเนื่อง (S1→S2) หรือไลน์อิสระที่ผลิต FG เอง */
export type StationGroup = 'continuous' | 'independent'

/** โทนสีประจำสถานี — map เป็น Tailwind class ที่ `app/constants/station-theme.ts` */
export type StationTone = 'blue' | 'emerald' | 'amber' | 'orange' | 'pink'

export interface StationMeta {
  id: StationId
  /** ชื่อสถานีที่ผู้ใช้เห็น */
  title: string
  /** คำอธิบายสั้น input → output */
  subtitle: string
  group: StationGroup
  tone: StationTone
  /** ข้อความอธิบายวัสดุเข้า */
  inputLabel: string
  /** ข้อความอธิบายผลผลิต */
  outputLabel: string
  /** ชนิดวัสดุเข้าที่เลือกได้ — ถ้ามีมากกว่า 1 ต้องให้ผู้ใช้เลือกในขั้นตอนที่ 1 */
  inputSources: InputSource[]
  /** ปลายทางที่ส่งต่อได้ในขั้นตอนที่ 4 */
  allowedNext: Destination[]
  /** เครื่องจักรที่เลือกได้ตอนสร้าง job */
  machines: string[]
  /** ชนิด PVC ที่เลือกได้ตอนสร้างงาน — ว่าง = สถานีนี้ไม่มีช่องนี้ */
  pvcTypes: string[]
  /**
   * รูปแบบหน้าทำงาน
   * `board` = กระดานข้อมูลเข้า/ออก (สแกนเข้าหลายใบ ออกรหัสหลายใบในงานเดียว)
   * `steps` = ฟอร์ม 4 ขั้นตอนทีละล็อต
   */
  workMode: 'board' | 'steps'
  /** ซีรีส์ 2 ตัวใน LOT ที่ออกใหม่ (เช่น `A5` → LOT `260925A501`) */
  lotSeries: string
  /** prefix รหัสสินค้าขาออก (เช่น `BX58` → `BX58-AV0212`) — ว่าง = ใช้รหัสขาเข้าเดิม */
  outItemPrefix: string
  /** ต้องมีลายเซ็นรับเข้าคลังหรือไม่ ("ไม่เซ็นรับ = ไม่ถือเป็น FG") */
  requiresFgSignature: boolean
  /** มีฟอร์มตั้งค่าสี (ลูกกลิ้ง 3 ชุด) หรือไม่ */
  hasColorSetup: boolean
  /** มีฟอร์มบันทึกวัสดุแพ็คเกจจิ้งหรือไม่ */
  hasPackaging: boolean
}

// ── Job ───────────────────────────────────────────────────────────────

/** active = กำลังแปรรูป, done = แปรรูปแล้ว (ปิดด้วยการกดปุ่ม "จบงาน") */
export type JobStatus = 'active' | 'done'

export interface JobDto {
  id: number
  code: string
  stationId: string
  shift: string
  machine: string
  /** ชนิด PVC ของงานนี้ (เฉพาะสถานีที่มีให้เลือก) */
  pvcType: string | null
  /** รายชื่อพนักงานที่ทำงานใน job นี้ (มีได้หลายคน) */
  operators: string[]
  status: JobStatus
  startedAt: string | Date
  finishedAt: string | Date | null
  finishedBy: string | null
  note: string | null
  /** จำนวนตัดทิ้งของงาน */
  trimQty?: number
  /** จำนวนรายการที่บันทึกไว้ใน job นี้ */
  recordCount?: number
  producedQty?: number
  defectQty?: number
}

export interface CreateJobInput {
  stationId: StationId
  shift: ShiftCode
  machine: string
  pvcType?: string | null
  operators: string[]
  /** วันที่เริ่มทำงาน (ISO date) */
  startedAt: string
  note?: string
  idempotencyKey: string
}

export interface FinishJobInput {
  finishedBy: string
  note?: string
  idempotencyKey: string
}

/** บันทึกการใช้วัตถุดิบในการแปรรูป (กาว, กระดาษปิดผิว PVC, ฯลฯ) */
export interface JobMaterialDto {
  id: number | string
  jobId: number
  materialCode: string
  materialName: string
  quantity: number
  unit?: string
  createdAt?: string | Date
}

export interface AddJobMaterialInput {
  jobId: number
  materialCode: string
  materialName: string
  quantity: number
  unit?: string
}

// ── กระดานข้อมูลเข้า/ออก (S1) ─────────────────────────────────────────

/** 1 แถวของ "ข้อมูลเข้า (WIP)" — TAG ที่สแกนรับเข้างาน */
export interface WipEntryDto {
  id: number
  jobId: number
  barcode: string
  itemCode: string
  itemName: string | null
  sizeText: string | null
  sourceLot: string | null
  quantity: number
  scannedBy: string | null
  scannedAt: string | Date
  /** TAG ที่ออกจากแถวนี้แล้ว (ถ้ามี) */
  issued?: IssuedTagDto | null
}

export interface AddWipEntryInput {
  barcode: string
  itemCode: string
  itemName?: string | null
  sizeText?: string | null
  sourceLot?: string | null
  quantity: number
  idempotencyKey: string
}

/** ยอดสรุปหัวกระดาน */
export interface JobTotals {
  /** จำนวนแผ่นเข้า */
  inQty: number
  /** จำนวนแผ่นออก */
  outQty: number
  /** คงค้าง (HD) = เข้า − ออก − ตัดทิ้ง */
  holdQty: number
  /** จำนวนตัดทิ้ง */
  trimQty: number
  entryCount: number
  issuedCount: number
}

export interface JobBoardDto {
  job: JobDto
  entries: WipEntryDto[]
  totals: JobTotals
}

// ── TAG ───────────────────────────────────────────────────────────────

/** ข้อมูลของ TAG ที่สแกนเข้ามาจากแผนกคัดบอร์ด (ถอดจากบาร์โค้ด แล้วให้พนักงานตรวจแก้ได้) */
export interface SourceTagInput {
  /** เลข TAG/บาร์โค้ดที่สแกนได้ทั้งเส้น */
  code: string
  itemCode: string
  itemName?: string | null
  sizeText?: string | null
  /** Lot ของคัดบอร์ด */
  lot?: string | null
  quantity: number
}

/** TAG ใหม่ที่ฟินิชชิ่งออกให้ล็อต (1 TAG ที่สแกนเข้า → 1 TAG ใหม่) */
export interface IssueTagInput extends SourceTagInput {
  stationId: StationId
  jobId: number
  shift: ShiftCode
  /** แถวข้อมูลเข้าที่ออก TAG ให้ (โหมดกระดาน) */
  wipEntryId?: number
  /** รหัสสินค้าขาออก เช่น `BX58-AV0212` */
  outItemCode?: string | null
  issuedBy?: string
  idempotencyKey: string
}

export interface IssuedTagDto {
  id: number
  /** OUT CODE เช่น `BX58-AV0212L4+++++++0076` */
  code: string
  jobId: number
  wipEntryId: number | null
  stationId: string
  itemCode: string
  outItemCode: string | null
  itemName: string | null
  sizeText: string | null
  lot: string
  running: number
  quantity: number
  sourceTagCode: string | null
  sourceLot: string | null
  issuedBy: string | null
  issuedAt: string | Date
  /** true = TAG ใบนี้เคยออกไปแล้ว (ส่งซ้ำด้วย key เดิมหรือ TAG ต้นทางเดิม) */
  duplicated?: boolean
}

// ── Production ────────────────────────────────────────────────────────

/** ค่าตั้งลูกกลิ้ง 1 ชุด (9 ค่า) ใช้ที่สถานี S3 */
export interface RollerSet {
  thick: number
  beltHz: number
  smallRollerHz: number
  bigRollerHz: number
  doctorBladeHz: number
  chainHz: number
  ovenTemp: number
  waterKg: number
  inkKg: number
}

/** วัสดุแพ็คเกจจิ้งที่ใช้ต่อล็อต (S4/S5) */
export interface PackagingMaterials {
  paperRoll: number
  corrugatedPaper: number
  adhesiveTape: number
  edgeTape: number
  plasticBagKg: number
}

/** payload ที่ client ส่งมาบันทึกลง ledger (append-only) */
export interface WorkRecordInput {
  stationId: StationId
  /** job ที่กำลังแปรรูปอยู่ — ทุกการบันทึกต้องผูกกับ job */
  jobId: number
  step: StepNumber
  status: string
  shift: ShiftCode
  operator?: string
  tagCode?: string | null
  producedQty?: number
  defectQty?: number
  inputSource?: InputSource | null
  destination?: Destination | null
  signatureData?: string | null
  /** metadata อิสระ เช่น ค่าตั้งลูกกลิ้ง / วัสดุแพ็คเกจจิ้ง */
  details?: Record<string, unknown>
  /** UUID จาก client กันบันทึกซ้ำตอนเน็ตหลุด */
  idempotencyKey: string
}

export interface WorkRecordDto {
  id: number
  stationId: string
  jobId: number | null
  step: number | null
  status: string
  shift: string | null
  operator: string | null
  tagCode: string | null
  producedQty: number
  defectQty: number
  createdAt: string | Date
}

/** รูปแบบ response มาตรฐานของ `server/api/*` */
export interface ApiOk<T> {
  success: true
  data: T
}

export interface DbHealth {
  connected: boolean
  provider: string
  version?: string
  checkedAt: string
  message: string
}
