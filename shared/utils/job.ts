import type { JobDto, StationId } from '../types/finishing'
import { toDateCode } from './tag'

/** รหัส job: `JOB-[สถานี]-[วันที่ YYMMDD]-[ลำดับ 3 หลัก]` เช่น `JOB-S1-260925-001` */
export function buildJobCode(stationId: StationId, date: Date, sequence: number): string {
  return `JOB-${stationId}-${toDateCode(date)}-${String(sequence).padStart(3, '0')}`
}

export const isJobActive = (job: Pick<JobDto, 'status'>) => job.status === 'active'

/** สรุปสั้น ๆ ของ job ไว้โชว์บนการ์ด/หัวสถานี */
export function jobSummary(job: JobDto): string {
  const who = job.operators.length > 1 ? `${job.operators[0]} +${job.operators.length - 1}` : job.operators[0] ?? '-'
  return `${job.machine} • ${who}`
}
