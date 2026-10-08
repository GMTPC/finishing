/**
 * รายการวัตถุดิบในการแปรรูป (ตามระบบ AppSheet เดิม)
 */
export interface MaterialOption {
  code: string
  name: string
  unit?: string
}

export const RAW_MATERIALS: MaterialOption[] = [
  { code: 'IM01-000141', name: 'กาว PVCGLUE จีน', unit: 'กก.' },
  { code: 'DM02-000023', name: 'PW1121 30G AMN กระดาษปิดผิว', unit: 'ม้วน' },
  { code: 'DM02-000024', name: 'MET-MPT 1195 แผ่นอลูมิเนียมฟอยล์(จีน)', unit: 'แผ่น' },
  { code: 'DM02-000025', name: 'FIBER GLASS MAT', unit: 'ม้วน' },
  { code: 'DM02-000026', name: 'กระดาษปิดผิว PVC จีน (238)', unit: 'ม้วน' },
  { code: 'DM02-000027', name: 'กระดาษปิดผิว PVC จีน ( Lemon 154 )', unit: 'ม้วน' },
  { code: 'DM02-000028', name: 'กระดาษปิดผิว PVC จีน ( Orange 608 )', unit: 'ม้วน' },
  { code: 'DM02-000029', name: 'AIU 1/2*1/2 นิ้ว ชุบขาวบาง (12มิล)', unit: 'ชิ้น' },
  { code: 'DM02-000030', name: 'กระดาษปิดผิว PVC จีน (975)', unit: 'ม้วน' },
  { code: 'DM02-000031', name: 'กระดาษปิดผิว PVC จีน (996)', unit: 'ม้วน' },
  { code: 'DM02-000032', name: 'กระดาษปิดผิว PVC จีน (567)', unit: 'ม้วน' },
  { code: 'DM02-000033', name: 'กระดาษปิดผิว PVC จีน ลายไม้ (P56 TA11-2)', unit: 'ม้วน' },
  { code: 'DM02-000034', name: 'กระดาษปิดผิว PVC จีน ลายไม้ (WE002-5)', unit: 'ม้วน' },
  { code: 'DM02-000035', name: 'กระดาษปิดผิว PVC จีน ลายไม้ (P50 TA07-1)', unit: 'ม้วน' },
  { code: 'DM02-000036', name: 'กระดาษปิดผิว PVC จีน (567) B', unit: 'ม้วน' },
]

export function findMaterialByCode(code: string): MaterialOption | undefined {
  return RAW_MATERIALS.find(m => m.code === code)
}
