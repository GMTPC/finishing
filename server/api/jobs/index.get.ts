import type { JobDto } from '~~/shared/types/finishing'
import { isStationId } from '~~/shared/constants/stations'
import { prisma } from '../../utils/prisma'
import { defineApiHandler, toPositiveInt } from '../../utils/api'
import { jobTotals, toJobDto } from '../../utils/jobs'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

/**
 * รายการ job ของสถานี
 * `status=active` = กำลังแปรรูป, `status=done` = แปรรูปแล้ว, ไม่ระบุ = ทั้งหมด
 */
export default defineApiHandler(async (event): Promise<JobDto[]> => {
  const query = getQuery(event)
  const stationId = isStationId(query.stationId) ? String(query.stationId).toUpperCase() : undefined
  const status = query.status === 'active' || query.status === 'done' ? query.status : undefined
  const limit = Math.min(toPositiveInt(query.limit, DEFAULT_LIMIT) || DEFAULT_LIMIT, MAX_LIMIT)

  const jobs = await prisma.job.findMany({
    where: { ...(stationId ? { stationId } : {}), ...(status ? { status } : {}) },
    orderBy: [{ status: 'asc' }, { startedAt: 'desc' }, { id: 'desc' }],
    take: limit,
  })

  const totals = await jobTotals(jobs.map(j => j.id))
  return jobs.map(j => toJobDto(j, totals.get(j.id)))
}, 'ดึงรายการงานไม่สำเร็จ')
