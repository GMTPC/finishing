import type { JobDto, JobStatus } from '~~/shared/types/finishing'
import { buildJobCode } from '~~/shared/utils/job'
import type { StationId } from '~~/shared/types/finishing'
import { prisma } from './prisma'

/** แถว job ที่อ่านมาจาก Prisma (operators ยังเป็น JSON string) */
type JobRow = {
  id: number
  code: string
  stationId: string
  shift: string
  machine: string
  pvcType: string | null
  operators: string
  status: string
  startedAt: Date
  finishedAt: Date | null
  finishedBy: string | null
  note: string | null
  trimQty?: number
}

/** แปลงแถวจาก DB เป็น DTO ที่ client ใช้ (operators กลับเป็น array) */
export function toJobDto(row: JobRow, totals?: { recordCount: number; producedQty: number; defectQty: number }): JobDto {
  let operators: string[] = []
  try {
    const parsed = JSON.parse(row.operators)
    if (Array.isArray(parsed)) operators = parsed.map(String)
  } catch {
    // ข้อมูลเก่าที่เก็บเป็นข้อความธรรมดา
    operators = row.operators ? [row.operators] : []
  }

  return {
    id: row.id,
    code: row.code,
    stationId: row.stationId,
    shift: row.shift,
    machine: row.machine,
    pvcType: row.pvcType,
    operators,
    status: (row.status === 'done' ? 'done' : 'active') as JobStatus,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    finishedBy: row.finishedBy,
    note: row.note,
    trimQty: row.trimQty ?? 0,
    ...totals,
  }
}

/**
 * ออกรหัส job ถัดไปของสถานีตามวันที่ (`JOB-S1-260925-001`)
 * นับจากจำนวน job ของสถานีนั้นในวันเดียวกัน
 */
export async function nextJobCode(stationId: StationId, startedAt: Date): Promise<string> {
  const dayStart = new Date(startedAt)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  const count = await prisma.job.count({
    where: { stationId, startedAt: { gte: dayStart, lt: dayEnd } },
  })

  return buildJobCode(stationId, startedAt, count + 1)
}

/** ยอดรวมของ job (ใช้โชว์บนการ์ด job) */
export async function jobTotals(jobIds: number[]) {
  if (!jobIds.length) return new Map<number, { recordCount: number; producedQty: number; defectQty: number }>()

  const grouped = await prisma.workRecord.groupBy({
    by: ['jobId'],
    where: { jobId: { in: jobIds } },
    _count: { _all: true },
    _sum: { producedQty: true, defectQty: true },
  })

  return new Map(
    grouped.map(g => [
      g.jobId,
      {
        recordCount: g._count._all,
        producedQty: g._sum.producedQty ?? 0,
        defectQty: g._sum.defectQty ?? 0,
      },
    ])
  )
}
