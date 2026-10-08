import type { AddWipEntryInput, WipEntryDto } from '~~/shared/types/finishing'
import { prisma } from '../../../../utils/prisma'
import { badRequest, defineApiHandler, readRequiredBody, toPositiveInt } from '../../../../utils/api'
import { createIdempotent } from '../../../../utils/ledger'
import { toWipEntryDto } from '../../../../utils/board'

/**
 * สแกน TAG เข้างาน 1 แถว (คอลัมน์ "ข้อมูลเข้า (WIP)")
 * สแกนบาร์โค้ดเดิมซ้ำในงานเดียวกันจะได้แถวเดิม ไม่เพิ่มซ้ำ
 */
export default defineApiHandler(async (event): Promise<WipEntryDto & { duplicated: boolean }> => {
  const jobId = toPositiveInt(getRouterParam(event, 'id'))
  if (!jobId) throw badRequest('ไม่พบรหัสงาน')

  const body = await readRequiredBody<AddWipEntryInput>(event, ['barcode', 'itemCode', 'idempotencyKey'])

  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) throw badRequest('ไม่พบงานแปรรูป')
  if (job.status === 'done') throw badRequest(`งาน ${job.code} ถูกปิดไปแล้ว สแกนเข้าเพิ่มไม่ได้`)

  const barcode = body.barcode.trim()
  const operators = safeOperators(job.operators)

  const existing = await prisma.wipEntry.findUnique({ where: { jobId_barcode: { jobId, barcode } } })
  if (existing) return { ...toWipEntryDto(existing), duplicated: true }

  const { record, duplicated } = await createIdempotent({
    findByKey: () => prisma.wipEntry.findUnique({ where: { idempotencyKey: body.idempotencyKey } }),
    create: () =>
      prisma.wipEntry.create({
        data: {
          jobId,
          stationId: job.stationId,
          barcode,
          itemCode: body.itemCode.trim(),
          itemName: body.itemName ?? null,
          sizeText: body.sizeText ?? null,
          sourceLot: body.sourceLot ?? null,
          quantity: toPositiveInt(body.quantity),
          scannedBy: operators.join(', ') || null,
          idempotencyKey: body.idempotencyKey,
        },
      }),
  })

  return { ...toWipEntryDto(record), duplicated }
}, 'บันทึกรายการเข้าไม่สำเร็จ')

function safeOperators(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return raw ? [raw] : []
  }
}
