/**
 * ชนิด PVC ที่เลือกได้ตอนสร้างงานแปรรูป (ตามรายการในระบบ AppSheet เดิม)
 * TODO: ยืนยันกับหน้างานว่ารายการครบหรือไม่ (ในหน้าจอเดิมรายการยังเลื่อนต่อได้ใต้ WAX)
 */
export const PVC_TYPES: string[] = [
  'ขาวผ่อง',
  'PVC Lemon',
  'PVC Orange',
  'PVC 567',
  'PVC 996',
  'PVC Black',
  'PVC ลายไม้ WE002-5',
  'PVC ลายไม้ P56 TA11-2',
  'PVC ลายไม้ P50 TA07-1',
  'PVC 238 ฟอล์ย',
  'PVC 996 ฟอล์ย',
  'เคลือบสีขาว',
  'ฟอล์ย',
  'WAX',
]

export function isPvcType(value: unknown): value is string {
  return typeof value === 'string' && PVC_TYPES.includes(value)
}
