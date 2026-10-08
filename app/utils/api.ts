import type {
  AddWipEntryInput,
  ApiOk,
  CreateJobInput,
  DbHealth,
  FinishJobInput,
  IssueTagInput,
  JobBoardDto,
  IssuedTagDto,
  JobDto,
  JobStatus,
  JobTotals,
  ShiftCode,
  StationId,
  WipEntryDto,
  WorkRecordDto,
  WorkRecordInput,
} from '~~/shared/types/finishing'

/**
 * จุดเดียวที่รู้ path ของ `server/api/*` — component/store ห้ามเรียก $fetch ตรง
 * ทุกฟังก์ชัน throw FetchError ตามปกติ ให้ผู้เรียกจัดการ error เอง
 */
export const api = {
  health: () => $fetch<ApiOk<DbHealth>>('/api/health'),

  // ── งาน (job) ──────────────────────────────────────────────
  listJobs: (params?: { stationId?: StationId; status?: JobStatus; limit?: number }) =>
    $fetch<ApiOk<JobDto[]>>('/api/jobs', { query: params }),

  createJob: (body: CreateJobInput) => $fetch<ApiOk<JobDto>>('/api/jobs', { method: 'POST', body }),

  finishJob: (jobId: number, body: FinishJobInput) =>
    $fetch<ApiOk<JobDto>>(`/api/jobs/${jobId}/finish`, { method: 'POST', body }),

  // ── กระดานข้อมูลเข้า/ออก ──────────────────────────────────
  jobBoard: (jobId: number) => $fetch<ApiOk<JobBoardDto>>(`/api/jobs/${jobId}/board`),

  addWipEntry: (jobId: number, body: AddWipEntryInput) =>
    $fetch<ApiOk<WipEntryDto & { duplicated: boolean }>>(`/api/jobs/${jobId}/entries`, { method: 'POST', body }),

  removeWipEntry: (jobId: number, entryId: number) =>
    $fetch<ApiOk<{ id: number; removed: boolean }>>(`/api/jobs/${jobId}/entries/${entryId}`, { method: 'DELETE' }),

  removeIssuedTag: (jobId: number, tagId: number) =>
    $fetch<ApiOk<{ id: number; removed: boolean }>>(`/api/jobs/${jobId}/tags/${tagId}`, { method: 'DELETE' }),

  updateTrimQty: (jobId: number, trimQty: number) =>
    $fetch<ApiOk<{ job: JobDto; totals: JobTotals }>>(`/api/jobs/${jobId}/trim`, { method: 'POST', body: { trimQty } }),

  // ── บันทึกการผลิต ─────────────────────────────────────────
  listRecords: (params?: { stationId?: StationId; jobId?: number; limit?: number }) =>
    $fetch<ApiOk<WorkRecordDto[]>>('/api/records', { query: params }),

  createRecord: (body: WorkRecordInput) =>
    $fetch<ApiOk<WorkRecordDto>>('/api/records', { method: 'POST', body }),

  /** ออก TAG ใหม่จาก TAG ที่สแกนเข้ามา (1 เข้า → 1 ออก) */
  issueTag: (body: IssueTagInput) =>
    $fetch<ApiOk<IssuedTagDto>>('/api/tags/issue', { method: 'POST', body }),

  receiveTag: (body: {
    tagCode: string
    stationId: StationId
    operator?: string
    quantity?: number
    idempotencyKey: string
  }) => $fetch<ApiOk<{ id: number; tagCode: string }>>('/api/tags/receive', { method: 'POST', body }),

  closeShift: (
    shiftId: string,
    body: {
      stationId: StationId
      shift: ShiftCode
      closedBy: string
      totalPassed: number
      totalScrap: number
      idempotencyKey: string
    }
  ) => $fetch<ApiOk<{ id: number; closedAt: string }>>(`/api/shifts/${shiftId}/close`, { method: 'POST', body }),

  login: (body: { employeeId: string; pin: string }) =>
    $fetch<ApiOk<{ token: string; user: { id: number; name: string; employeeId: string; role: string } }>>(
      '/api/auth/login',
      { method: 'POST', body }
    ),
}

/** ดึงข้อความ error ที่อ่านรู้เรื่องจาก FetchError ของ Nitro */
export function apiErrorMessage(err: unknown, fallback = 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ'): string {
  const e = err as { data?: { message?: string; statusMessage?: string }; statusMessage?: string; message?: string }
  return e?.data?.message || e?.data?.statusMessage || e?.statusMessage || e?.message || fallback
}
