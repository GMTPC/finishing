/**
 * ตัวช่วยเขียน ledger แบบ idempotent
 * มือถือหน้างานส่งซ้ำได้เสมอเวลาเน็ตหลุด — ต้องได้ผลลัพธ์เดิม ไม่ใช่แถวใหม่
 */

/** รหัส error ของ Prisma เมื่อชน unique constraint */
const UNIQUE_VIOLATION = 'P2002'

export interface IdempotentResult<T> {
  record: T
  /** true = เคยบันทึกด้วย key นี้แล้ว ไม่ได้เขียนแถวใหม่ */
  duplicated: boolean
}

export async function createIdempotent<T>(ops: {
  findByKey: () => Promise<T | null>
  create: () => Promise<T>
}): Promise<IdempotentResult<T>> {
  const existing = await ops.findByKey()
  if (existing) return { record: existing, duplicated: true }

  try {
    return { record: await ops.create(), duplicated: false }
  } catch (err) {
    // มีอีก request บันทึกสำเร็จไปก่อนระหว่างที่เรากำลังเขียน
    if ((err as { code?: string })?.code === UNIQUE_VIOLATION) {
      const record = await ops.findByKey()
      if (record) return { record, duplicated: true }
    }
    throw err
  }
}
