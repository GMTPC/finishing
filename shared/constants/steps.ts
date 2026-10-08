import type { StepNumber } from '../types/finishing'

export interface StepMeta {
  step: StepNumber
  /** ป้ายสั้นสำหรับแถบล่างจอมือถือ */
  short: string
  /** ป้ายเต็มสำหรับ sidebar / tab */
  label: string
  /** คำอธิบายใต้หัวข้อการ์ด */
  description: string
  /** ข้อความบนปุ่มยืนยันของขั้นตอนนั้น */
  submitLabel: string
}

/** 4 ขั้นตอนที่ทุกสถานีใช้ pattern เดียวกัน */
export const STEPS: StepMeta[] = [
  {
    step: 1,
    short: '1. รับเข้า',
    label: '1. รับวัตถุดิบ/WIP',
    description: 'สแกนป้าย TAG บาร์โค้ด และตรวจนับจำนวนเทียบเอกสารกำกับ',
    submitLabel: 'ยืนยันการรับวัตถุดิบเข้าสถานี',
  },
  {
    step: 2,
    short: '2. ตั้งค่า',
    label: '2. ตั้งค่าก่อนผลิต',
    description: 'เลือกกะการทำงาน (กะ A / กะ B) และกำหนดพารามิเตอร์เครื่องจักร',
    submitLabel: 'บันทึกการตั้งค่าเครื่องจักร',
  },
  {
    step: 3,
    short: '3. ผลิต/เสีย',
    label: '3. ผลิต & แผ่นเสีย',
    description: 'ต้องกรอกจำนวน "แผ่นเสีย" ทุกครั้งก่อนปิดล็อต (แม้เป็น 0 ก็ต้องกดยืนยัน)',
    submitLabel: 'บันทึกผลผลิต & ยืนยันยอด "แผ่นเสีย" ล็อตนี้',
  },
  {
    step: 4,
    short: '4. ส่ง/เซ็น',
    label: '4. ส่งต่อ / เซ็นรับ FG',
    description: 'ปิดล็อตด้วยการส่งต่อสถานีถัดไป หรือเซ็นรับเข้าคลังเป็น FG',
    submitLabel: 'ยืนยันปิดล็อต',
  },
]

export const FIRST_STEP: StepNumber = 1
export const LAST_STEP: StepNumber = 4

export function getStep(step: number): StepMeta {
  return STEPS.find(s => s.step === step) ?? STEPS[0]!
}

export function isStepNumber(value: unknown): value is StepNumber {
  return value === 1 || value === 2 || value === 3 || value === 4
}

/** normalize ค่าจาก route param (`/s/S1/3`) ให้เป็นเลขขั้นตอน */
export function toStepNumber(value: unknown, fallback: StepNumber = FIRST_STEP): StepNumber {
  const n = Number(value)
  return isStepNumber(n) ? n : fallback
}
