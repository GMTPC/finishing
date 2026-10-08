import type { JobBoardDto } from '~~/shared/types/finishing'
import { prisma } from '../../../utils/prisma'
import { badRequest, defineApiHandler, toPositiveInt } from '../../../utils/api'
import { loadJobBoard } from '../../../utils/board'
import { toJobDto } from '../../../utils/jobs'

/** กระดานของงาน: ข้อมูลเข้า (WIP) + ข้อมูลออก + ยอดสรุป */
export default defineApiHandler(async (event): Promise<JobBoardDto> => {
  const jobId = toPositiveInt(getRouterParam(event, 'id'))
  if (!jobId) throw badRequest('ไม่พบรหัสงาน')

  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) throw createError({ statusCode: 404, statusMessage: 'ไม่พบงานนี้', message: 'ไม่พบงานนี้' })

  const { entries, totals } = await loadJobBoard(job.id, job.trimQty)
  return { job: toJobDto(job), entries, totals }
}, 'ดึงข้อมูลกระดานงานไม่สำเร็จ')
