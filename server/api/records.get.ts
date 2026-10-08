import type { WorkRecordDto } from '~~/shared/types/finishing'
import { isStationId } from '~~/shared/constants/stations'
import { prisma } from '../utils/prisma'
import { defineApiHandler, toPositiveInt } from '../utils/api'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

/** ประวัติรายการล่าสุดของ ledger (กรองตามสถานี หรือตาม job ได้) */
export default defineApiHandler(async (event): Promise<WorkRecordDto[]> => {
  const query = getQuery(event)
  const limit = Math.min(toPositiveInt(query.limit, DEFAULT_LIMIT) || DEFAULT_LIMIT, MAX_LIMIT)
  const stationId = isStationId(query.stationId) ? String(query.stationId).toUpperCase() : undefined
  const jobId = toPositiveInt(query.jobId) || undefined

  const records = await prisma.workRecord.findMany({
    where: {
      ...(stationId ? { stationId } : {}),
      ...(jobId ? { jobId } : {}),
    },
    orderBy: { id: 'desc' },
    take: limit,
    select: {
      id: true,
      stationId: true,
      jobId: true,
      step: true,
      status: true,
      shift: true,
      operator: true,
      tagCode: true,
      producedQty: true,
      defectQty: true,
      createdAt: true,
    },
  })

  return records
}, 'ดึงประวัติการบันทึกไม่สำเร็จ')
