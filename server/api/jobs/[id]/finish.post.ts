import type { FinishJobInput, JobDto } from '~~/shared/types/finishing'
import { prisma } from '../../../utils/prisma'
import { badRequest, defineApiHandler, readRequiredBody, toPositiveInt } from '../../../utils/api'
import { jobTotals, toJobDto } from '../../../utils/jobs'

/**
 * ปิด job (ปุ่ม "จบงาน") — ย้ายจาก "กำลังแปรรูป" ไป "แปรรูปแล้ว"
 * job ที่ปิดแล้วจะกดซ้ำไม่ได้ และบันทึกขั้นตอนเพิ่มไม่ได้
 */
export default defineApiHandler(async (event): Promise<JobDto> => {
  const jobId = toPositiveInt(getRouterParam(event, 'id'))
  if (!jobId) throw badRequest('ไม่พบรหัสงานที่จะปิด')

  const body = await readRequiredBody<FinishJobInput>(event, ['finishedBy', 'idempotencyKey'])

  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) throw createError({ statusCode: 404, statusMessage: 'ไม่พบงานนี้', message: 'ไม่พบงานนี้' })

  // ปิดซ้ำถือว่าสำเร็จ (มือถืออาจส่งซ้ำตอนเน็ตหลุด) แต่ไม่เขียนทับเวลาเดิม
  if (job.status === 'done') {
    const totals = await jobTotals([job.id])
    return toJobDto(job, totals.get(job.id))
  }

  const finished = await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'done',
      finishedAt: new Date(),
      finishedBy: body.finishedBy,
      note: body.note ?? job.note,
    },
  })

  const totals = await jobTotals([finished.id])
  return toJobDto(finished, totals.get(finished.id))
}, 'ปิดงานไม่สำเร็จ')
