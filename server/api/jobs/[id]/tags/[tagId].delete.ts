import { prisma } from '../../../../utils/prisma'
import { badRequest, defineApiHandler, toPositiveInt } from '../../../../utils/api'

/**
 * ลบ TAG ที่ออกผิด เพื่อให้กลับไปเป็นรายการค้างออกรหัส
 */
export default defineApiHandler(async (event) => {
  const jobId = toPositiveInt(getRouterParam(event, 'id'))
  const tagId = toPositiveInt(getRouterParam(event, 'tagId'))
  if (!jobId || !tagId) throw badRequest('ไม่พบรายการที่จะลบ')

  const tag = await prisma.issuedTag.findUnique({ where: { id: tagId } })
  if (!tag || tag.jobId !== jobId) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการนี้', message: 'ไม่พบรายการนี้' })
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (job?.status === 'done') throw badRequest(`งาน ${job.code} ถูกปิดไปแล้ว แก้ไขไม่ได้`)

  await prisma.issuedTag.delete({ where: { id: tagId } })
  return { id: tagId, removed: true }
}, 'ลบรายการออก TAG ไม่สำเร็จ')
