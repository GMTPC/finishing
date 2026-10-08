import type { CreateJobInput, JobDto } from '~~/shared/types/finishing'
import { getStation } from '~~/shared/constants/stations'
import { isShiftCode } from '~~/shared/constants/shifts'
import { prisma } from '../../utils/prisma'
import { assertStationId, badRequest, defineApiHandler, readRequiredBody } from '../../utils/api'
import { createIdempotent } from '../../utils/ledger'
import { nextJobCode, toJobDto } from '../../utils/jobs'

/** สร้าง job ใหม่ (ปุ่ม "เริ่มงาน") — ต้องมีก่อนจึงจะบันทึกขั้นตอน 1–4 ได้ */
export default defineApiHandler(async (event): Promise<JobDto> => {
  const body = await readRequiredBody<CreateJobInput>(event, [
    'stationId',
    'shift',
    'machine',
    'operators',
    'startedAt',
    'idempotencyKey',
  ])

  const stationId = assertStationId(body.stationId)
  const station = getStation(stationId)

  if (!isShiftCode(body.shift)) throw badRequest(`กะไม่ถูกต้อง: ${String(body.shift)}`)

  if (!Array.isArray(body.operators) || body.operators.length === 0) {
    throw badRequest('ต้องเลือกพนักงานที่ทำงานอย่างน้อย 1 คน')
  }

  if (station.machines.length && !station.machines.includes(body.machine)) {
    throw badRequest(`เครื่องจักรไม่ตรงกับสถานี ${stationId}: ${body.machine}`)
  }

  // สถานีที่มีชนิด PVC ให้เลือก ต้องระบุและต้องอยู่ในรายการของสถานีนั้น
  if (station.pvcTypes.length) {
    if (!body.pvcType) throw badRequest('กรุณาเลือกชนิด PVC')
    if (!station.pvcTypes.includes(body.pvcType)) {
      throw badRequest(`ชนิด PVC ไม่ถูกต้อง: ${body.pvcType}`)
    }
  }

  const startedAt = new Date(body.startedAt)
  if (Number.isNaN(startedAt.getTime())) throw badRequest('วันที่เริ่มทำงานไม่ถูกต้อง')

  const { record } = await createIdempotent({
    findByKey: () => prisma.job.findUnique({ where: { idempotencyKey: body.idempotencyKey } }),
    create: async () =>
      prisma.job.create({
        data: {
          code: await nextJobCode(stationId, startedAt),
          stationId,
          shift: body.shift,
          machine: body.machine,
          pvcType: station.pvcTypes.length ? body.pvcType! : null,
          operators: JSON.stringify(body.operators.map(String)),
          status: 'active',
          startedAt,
          note: body.note ?? null,
          idempotencyKey: body.idempotencyKey,
        },
      }),
  })

  return toJobDto(record, { recordCount: 0, producedQty: 0, defectQty: 0 })
}, 'สร้างงานใหม่ไม่สำเร็จ')
