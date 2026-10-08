import type { StationId } from '~~/shared/types/finishing'
import { prisma } from '../../utils/prisma'
import { assertStationId, defineApiHandler, readRequiredBody, toPositiveInt } from '../../utils/api'
import { createIdempotent } from '../../utils/ledger'

interface ReceiveTagBody {
  tagCode: string
  stationId: StationId
  operator?: string
  quantity?: number
  idempotencyKey: string
}

/** รับ TAG เข้าสถานี (ขั้นตอนที่ 1) */
export default defineApiHandler(async (event) => {
  const body = await readRequiredBody<ReceiveTagBody>(event, ['tagCode', 'stationId', 'idempotencyKey'])
  const stationId = assertStationId(body.stationId)

  const { record, duplicated } = await createIdempotent({
    findByKey: () => prisma.tagReceive.findUnique({ where: { idempotencyKey: body.idempotencyKey } }),
    create: () =>
      prisma.tagReceive.create({
        data: {
          tagCode: body.tagCode,
          stationId,
          operator: body.operator || 'system',
          quantity: toPositiveInt(body.quantity),
          idempotencyKey: body.idempotencyKey,
        },
      }),
  })

  return {
    id: record.id,
    tagCode: record.tagCode,
    duplicated,
    message: `รับ TAG ${record.tagCode} เข้าสถานี ${stationId} แล้ว`,
  }
}, 'บันทึกการรับ TAG ไม่สำเร็จ')
