import type { IssuedTagDto, JobTotals, WipEntryDto } from '~~/shared/types/finishing'
import { prisma } from './prisma'

/** แถว issued_tags ที่อ่านจาก Prisma */
export type IssuedTagRow = {
  id: number
  code: string
  jobId: number
  wipEntryId: number | null
  stationId: string
  itemCode: string
  outItemCode: string | null
  itemName: string | null
  sizeText: string | null
  lot: string
  running: number
  quantity: number
  sourceTagCode: string | null
  sourceLot: string | null
  issuedBy: string | null
  issuedAt: Date
}

export function toIssuedTagDto(row: IssuedTagRow): IssuedTagDto {
  return {
    id: row.id,
    code: row.code,
    jobId: row.jobId,
    wipEntryId: row.wipEntryId,
    stationId: row.stationId,
    itemCode: row.itemCode,
    outItemCode: row.outItemCode,
    itemName: row.itemName,
    sizeText: row.sizeText,
    lot: row.lot,
    running: row.running,
    quantity: row.quantity,
    sourceTagCode: row.sourceTagCode,
    sourceLot: row.sourceLot,
    issuedBy: row.issuedBy,
    issuedAt: row.issuedAt,
  }
}

type WipEntryRow = {
  id: number
  jobId: number
  barcode: string
  itemCode: string
  itemName: string | null
  sizeText: string | null
  sourceLot: string | null
  quantity: number
  scannedBy: string | null
  scannedAt: Date
  issuedTag?: IssuedTagRow | null
}

export function toWipEntryDto(row: WipEntryRow): WipEntryDto {
  return {
    id: row.id,
    jobId: row.jobId,
    barcode: row.barcode,
    itemCode: row.itemCode,
    itemName: row.itemName,
    sizeText: row.sizeText,
    sourceLot: row.sourceLot,
    quantity: row.quantity,
    scannedBy: row.scannedBy,
    scannedAt: row.scannedAt,
    issued: row.issuedTag ? toIssuedTagDto(row.issuedTag) : null,
  }
}

/** อ่านรายการเข้า/ออกของงาน พร้อมยอดสรุปหัวกระดาน */
export async function loadJobBoard(jobId: number, trimQty: number) {
  const entries = await prisma.wipEntry.findMany({
    where: { jobId },
    orderBy: { id: 'asc' },
    include: { issuedTag: true },
  })

  const inQty = entries.reduce((sum, e) => sum + e.quantity, 0)
  const issued = entries.map(e => e.issuedTag).filter(Boolean) as IssuedTagRow[]
  const outQty = issued.reduce((sum, t) => sum + t.quantity, 0)

  const totals: JobTotals = {
    inQty,
    outQty,
    trimQty,
    // คงค้าง (HD) = เข้า − ออก − ตัดทิ้ง
    holdQty: inQty - outQty - trimQty,
    entryCount: entries.length,
    issuedCount: issued.length,
  }

  return { entries: entries.map(toWipEntryDto), totals }
}

/** ลำดับ LOT ถัดไปของซีรีส์นั้นในวันเดียวกัน */
export async function nextLotRunning(lotPrefix: string): Promise<number> {
  const last = await prisma.issuedTag.findFirst({
    where: { lot: { startsWith: lotPrefix } },
    orderBy: { running: 'desc' },
    select: { running: true },
  })
  return (last?.running ?? 0) + 1
}
