import type { StationId, StationMeta, StepNumber } from '~~/shared/types/finishing'
import { FIRST_STEP } from '~~/shared/constants/steps'

/**
 * จุดเดียวที่ประกอบ path ของหน้าสถานี — ห้ามเขียน `/s/${id}/...` ตรง ๆ ใน component
 *
 * `/s/S1`           = หน้างานแปรรูป — กำลังแปรรูป / แปรรูปแล้ว / สร้างงานใหม่
 * `/s/S1/3?job=12`  = ขั้นตอนที่ 3 ของงานเลขที่ 12
 *
 * เลขงานอยู่ใน URL เพื่อให้รีเฟรชหน้าจอหรือเปิดลิงก์ตรง ๆ แล้วยังอยู่ที่งานเดิม
 */
export const JOB_QUERY_KEY = 'job'

export function stationPath(station: StationId): string {
  return `/s/${station}`
}

export function stationStepPath(
  station: StationId,
  step: StepNumber | number = FIRST_STEP,
  jobId?: number | null
): string {
  const base = `/s/${station}/${step}`
  return jobId ? `${base}?${JOB_QUERY_KEY}=${jobId}` : base
}

/** หน้ากระดานข้อมูลเข้า/ออก (สถานีที่ workMode === 'board') */
export function stationBoardPath(station: StationId, jobId?: number | null): string {
  const base = `/s/${station}/board`
  return jobId ? `${base}?${JOB_QUERY_KEY}=${jobId}` : base
}

/** ปลายทางเมื่อ "เปิดงาน" — ขึ้นกับว่าสถานีใช้กระดานหรือฟอร์ม 4 ขั้นตอน */
export function jobWorkPath(station: StationMeta, jobId: number): string {
  return station.workMode === 'board'
    ? stationBoardPath(station.id, jobId)
    : stationStepPath(station.id, FIRST_STEP, jobId)
}

export const ROUTES = {
  home: '/',
  login: '/login',
  station: stationPath,
  stationStep: stationStepPath,
  stationBoard: stationBoardPath,
} as const
