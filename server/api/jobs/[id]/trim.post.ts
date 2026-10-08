import { prisma } from '../../../utils/prisma'
import { badRequest, defineApiHandler, readRequiredBody, toPositiveInt } from '../../../utils/api'
import { loadJobBoard } from '../../../utils/board'
import { toJobDto } from '../../../utils/jobs'

/** อัพเดทจำนวนตัดทิ้งของงาน (ปุ่ม "อัพเดทข้อมูล" บนกระดาน) */
export default defineApiHandler(async (event) => {
  const jobId = toPositiveInt(getRouterParam(event, 'id'))
  if (!jobId) throw badRequest('ไม่พบรหัสงาน')

  const body = await readRequiredBody<{ trimQty: number }>(event, ['trimQty'])
  const trimQty = toPositiveInt(body.trimQty)

  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) throw createError({ statusCode: 404, statusMessage: 'ไม่พบงานนี้', message: 'ไม่พบงานนี้' })
  if (job.status === 'done') throw badRequest(`งาน ${job.code} ถูกปิดไปแล้ว แก้ไขไม่ได้`)

  const { totals } = await loadJobBoard(job.id, trimQty)
  if (totals.holdQty < 0) {
    throw badRequest(`ยอดไม่สมดุล: เข้า ${totals.inQty} − ออก ${totals.outQty} − ตัดทิ้ง ${trimQty} ติดลบ`)
  }

  const updated = await prisma.job.update({ where: { id: jobId }, data: { trimQty } })
  return { job: toJobDto(updated), totals }
}, 'อัพเดทจำนวนตัดทิ้งไม่สำเร็จ')
