import type { ShiftCode } from '../types/finishing'

/**
 * กะการทำงานมี 2 กะ: กะเช้า / กะดึก (ตามคำที่พนักงานใช้ในระบบ AppSheet เดิม)
 * เก็บลง DB เป็นรหัสอังกฤษ MORNING/NIGHT แต่แสดงผลเป็นภาษาไทยเสมอ
 */
export const SHIFTS: Array<{ value: ShiftCode; label: string }> = [
  { value: 'MORNING', label: 'กะเช้า' },
  { value: 'NIGHT', label: 'กะดึก' },
]

export const SHIFT_CODES = SHIFTS.map(s => s.value)

export function shiftLabel(code: ShiftCode | string | null | undefined): string {
  return SHIFTS.find(s => s.value === code)?.label ?? String(code ?? '-')
}

export function isShiftCode(value: unknown): value is ShiftCode {
  return value === 'MORNING' || value === 'NIGHT'
}

export function toShiftCode(value: unknown, fallback: ShiftCode = 'MORNING'): ShiftCode {
  return isShiftCode(value) ? value : fallback
}
