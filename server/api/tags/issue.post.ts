import type { IssueTagInput, IssuedTagDto } from '~~/shared/types/finishing'
import { getStation } from '~~/shared/constants/stations'
import { isShiftCode } from '~~/shared/constants/shifts'
import { SHIFT_TAG_LETTER, buildFgLot, buildOutCode, buildS1WipTag, suggestOutItemCode, toDateCode } from '~~/shared/utils/tag'
import { prisma } from '../../utils/prisma'
import { assertStationId, badRequest, defineApiHandler, readRequiredBody, toPositiveInt } from '../../utils/api'
import { toIssuedTagDto } from '../../utils/board'

const MAX_RUNNING_ATTEMPTS = 5

/**
 * ออก TAG/รหัสใหม่ของฟินิชชิ่งจากรายการที่สแกนเข้า (1 เข้า → 1 ออก)
 *
 * - S1 (board mode): Output เป็น WIP Finishing เช่น `W494-AV0209261006B001100`
 * - S2–S5 (steps mode): LOT `260925A501`, OUT CODE `BX58-AV0212L4+++++++0076`
 * - ลำดับออกจากฝั่ง server เพื่อกันเลขชนกันระหว่างเครื่อง
 */
export default defineApiHandler(async (event): Promise<IssuedTagDto & { duplicated?: boolean }> => {
  const body = await readRequiredBody<IssueTagInput>(event, [
    'stationId',
    'jobId',
    'shift',
    'code',
    'itemCode',
    'idempotencyKey',
  ])

  const stationId = assertStationId(body.stationId)
  const station = getStation(stationId)
  if (!isShiftCode(body.shift)) throw badRequest(`กะไม่ถูกต้อง: ${String(body.shift)}`)

  const job = await prisma.job.findUnique({ where: { id: toPositiveInt(body.jobId) } })
  if (!job) throw badRequest('ไม่พบงานแปรรูป — กรุณาสร้างงานก่อนออก TAG')
  if (job.status === 'done') throw badRequest(`งาน ${job.code} ถูกปิดไปแล้ว ออก TAG เพิ่มไม่ได้`)
  if (job.stationId !== stationId) throw badRequest(`งาน ${job.code} ไม่ได้อยู่ที่สถานี ${stationId}`)

  const sourceTagCode = body.code.trim()
  const wipEntryId = body.wipEntryId ? toPositiveInt(body.wipEntryId) : null

  // 1 เข้า → 1 ออก: ถ้าเคยออกให้รายการนี้แล้ว คืนใบเดิม
  const existing = await prisma.issuedTag.findFirst({
    where: {
      OR: [
        { idempotencyKey: body.idempotencyKey },
        { sourceTagCode },
        ...(wipEntryId ? [{ wipEntryId }] : []),
      ],
    },
  })
  if (existing) return { ...toIssuedTagDto(existing), duplicated: true }

  const quantity = toPositiveInt(body.quantity)
  const sourceLot = body.lot?.trim() || ''
  const outItemCode = body.outItemCode?.trim() || suggestOutItemCode(body.itemCode, station.outItemPrefix)

  const isS1Board = stationId === 'S1' || station.workMode === 'board'
  const shiftLetter = SHIFT_TAG_LETTER[body.shift] || 'A'
  const dateStr = toDateCode(new Date())
  const lotPrefix = isS1Board ? `${dateStr}${shiftLetter}` : `${dateStr}${station.lotSeries}`

  for (let attempt = 0; attempt < MAX_RUNNING_ATTEMPTS; attempt++) {
    const last = await prisma.issuedTag.findFirst({
      where: { stationId, lot: { startsWith: lotPrefix } },
      orderBy: { running: 'desc' },
      select: { running: true },
    })
    const running = (last?.running ?? 0) + 1

    const tagCode = isS1Board
      ? buildS1WipTag(outItemCode, body.shift, running, quantity)
      : buildOutCode(outItemCode, sourceLot, quantity)

    const tagLot = isS1Board
      ? `${dateStr}${shiftLetter}${String(running).padStart(3, '0')}`
      : buildFgLot(station.lotSeries, running)

    try {
      const created = await prisma.issuedTag.create({
        data: {
          code: tagCode,
          jobId: job.id,
          wipEntryId,
          stationId,
          itemCode: body.itemCode,
          outItemCode,
          itemName: body.itemName ?? null,
          sizeText: body.sizeText ?? null,
          lot: tagLot,
          running,
          quantity,
          sourceTagCode,
          sourceLot: sourceLot || null,
          issuedBy: body.issuedBy ?? null,
          idempotencyKey: body.idempotencyKey,
        },
      })
      return toIssuedTagDto(created)
    } catch (err) {
      // ชน unique (lot+running, source, wipEntry หรือ idempotency) → อ่านใหม่แล้วลองอีกรอบ
      if ((err as { code?: string })?.code !== 'P2002') throw err

      const duplicate = await prisma.issuedTag.findFirst({
        where: {
          OR: [
            { idempotencyKey: body.idempotencyKey },
            { sourceTagCode },
            ...(wipEntryId ? [{ wipEntryId }] : []),
          ],
        },
      })
      if (duplicate) return { ...toIssuedTagDto(duplicate), duplicated: true }
    }
  }

  throw badRequest('ออกเลขไม่สำเร็จ มีการออกเลขพร้อมกันหลายเครื่อง กรุณาลองอีกครั้ง')
}, 'ออก TAG ใหม่ไม่สำเร็จ')
