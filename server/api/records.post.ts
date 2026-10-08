import type { WorkRecordDto, WorkRecordInput } from '~~/shared/types/finishing'
import { prisma } from '../utils/prisma'
import { assertStationId, badRequest, defineApiHandler, readRequiredBody, toPositiveInt } from '../utils/api'
import { createIdempotent } from '../utils/ledger'

/**
 * บันทึก 1 แถวลง ledger (append-only)
 * - ต้องผูกกับ job ที่ยัง "กำลังแปรรูป" เท่านั้น
 * - ต้องมี idempotencyKey ทุกครั้ง ส่งซ้ำด้วย key เดิมจะได้แถวเดิมกลับไป
 * - ยอดสมดุลถูกตรวจฝั่ง server ด้วย ไม่พึ่ง validation ฝั่ง client อย่างเดียว
 */
export default defineApiHandler(async (event): Promise<WorkRecordDto> => {
  const body = await readRequiredBody<WorkRecordInput>(event, [
    'stationId',
    'jobId',
    'step',
    'status',
    'shift',
    'idempotencyKey',
  ])

  const stationId = assertStationId(body.stationId)
  const step = Number(body.step)
  if (![1, 2, 3, 4].includes(step)) throw badRequest(`เลขขั้นตอนไม่ถูกต้อง: ${body.step}`)

  const jobId = toPositiveInt(body.jobId)
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) throw badRequest('ไม่พบงาน (job) ที่จะบันทึก — กรุณาสร้างงานก่อน')
  if (job.status === 'done') throw badRequest(`งาน ${job.code} ถูกปิดไปแล้ว ไม่สามารถบันทึกเพิ่มได้`)
  if (job.stationId !== stationId) throw badRequest(`งาน ${job.code} ไม่ได้อยู่ที่สถานี ${stationId}`)

  const producedQty = toPositiveInt(body.producedQty)
  const defectQty = toPositiveInt(body.defectQty)
  const receivedQty = toPositiveInt((body.details as { receivedQty?: number } | undefined)?.receivedQty)

  // ยอดสมดุล: รับเข้า = ผลิตออก + แผ่นเสีย + คงค้าง (ผลิตออก+เสีย ห้ามเกินที่รับเข้า)
  if (step >= 3 && receivedQty > 0 && producedQty + defectQty > receivedQty) {
    throw badRequest(
      `ยอดไม่สมดุล: ผลิต ${producedQty} + แผ่นเสีย ${defectQty} เกินจำนวนที่รับเข้า ${receivedQty}`
    )
  }

  const { record } = await createIdempotent({
    findByKey: () => prisma.workRecord.findUnique({ where: { idempotencyKey: body.idempotencyKey } }),
    create: () =>
      prisma.workRecord.create({
        data: {
          stationId,
          jobId: job.id,
          step,
          status: body.status,
          shift: body.shift,
          operator: body.operator ?? null,
          tagCode: body.tagCode ?? null,
          producedQty,
          defectQty,
          inputSource: body.inputSource ?? null,
          destination: body.destination ?? null,
          signatureData: body.signatureData ?? null,
          details: body.details ? JSON.stringify(body.details) : null,
          idempotencyKey: body.idempotencyKey,
        },
      }),
  })

  return {
    id: record.id,
    stationId: record.stationId,
    jobId: record.jobId,
    step: record.step,
    status: record.status,
    shift: record.shift,
    operator: record.operator,
    tagCode: record.tagCode,
    producedQty: record.producedQty,
    defectQty: record.defectQty,
    createdAt: record.createdAt,
  }
}, 'บันทึกข้อมูลการผลิตไม่สำเร็จ')
