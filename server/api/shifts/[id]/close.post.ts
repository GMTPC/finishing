import type { ShiftCode, StationId } from '~~/shared/types/finishing'
import { prisma } from '../../../utils/prisma'
import { assertStationId, badRequest, defineApiHandler, readRequiredBody, toPositiveInt } from '../../../utils/api'
import { createIdempotent } from '../../../utils/ledger'

interface CloseShiftBody {
  stationId: StationId
  shift: ShiftCode
  closedBy: string
  totalPassed?: number
  totalScrap?: number
  idempotencyKey: string
}

/** ปิดกะของสถานี — สรุปยอดผลิตและแผ่นเสียของกะนั้น */
export default defineApiHandler(async (event) => {
  const shiftId = getRouterParam(event, 'id')
  if (!shiftId) throw badRequest('ไม่พบรหัสกะที่จะปิด')

  const body = await readRequiredBody<CloseShiftBody>(event, ['stationId', 'shift', 'closedBy', 'idempotencyKey'])
  const stationId = assertStationId(body.stationId)

  const { record, duplicated } = await createIdempotent({
    findByKey: () => prisma.shiftClose.findUnique({ where: { idempotencyKey: body.idempotencyKey } }),
    create: () =>
      prisma.shiftClose.create({
        data: {
          shiftId,
          stationId,
          shift: body.shift,
          closedBy: body.closedBy,
          totalPassed: toPositiveInt(body.totalPassed),
          totalScrap: toPositiveInt(body.totalScrap),
          idempotencyKey: body.idempotencyKey,
        },
      }),
  })

  return {
    id: record.id,
    closedAt: record.closedAt.toISOString(),
    duplicated,
    message: `ปิดกะ ${body.shift} ของสถานี ${stationId} เรียบร้อย`,
  }
}, 'ปิดกะไม่สำเร็จ')
