import { prisma } from '../../../../utils/prisma'
import { badRequest, defineApiHandler, toPositiveInt } from '../../../../utils/api'

/**
 * ลบแถวข้อมูลเข้าที่สแกนผิด (ยังไม่ได้ออก TAG เท่านั้น)
 * ถ้าออก TAG ไปแล้วห้ามลบ — ต้องแก้ที่ TAG ก่อน เพื่อให้ยอดเข้า/ออกยังตรงกัน
 */
export default defineApiHandler(async (event) => {
  const jobId = toPositiveInt(getRouterParam(event, 'id'))
  const entryId = toPositiveInt(getRouterParam(event, 'entryId'))
  if (!jobId || !entryId) throw badRequest('ไม่พบรายการที่จะลบ')

  const entry = await prisma.wipEntry.findUnique({ where: { id: entryId }, include: { issuedTag: true } })
  if (!entry || entry.jobId !== jobId) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการนี้', message: 'ไม่พบรายการนี้' })
  }
  if (entry.issuedTag) throw badRequest('รายการนี้ออก TAG ไปแล้ว ลบไม่ได้')

  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (job?.status === 'done') throw badRequest(`งาน ${job.code} ถูกปิดไปแล้ว แก้ไขไม่ได้`)

  await prisma.wipEntry.delete({ where: { id: entryId } })
  return { id: entryId, removed: true }
}, 'ลบรายการเข้าไม่สำเร็จ')
