import type { EventHandler, EventHandlerRequest, H3Event } from 'h3'
import type { ApiOk } from '~~/shared/types/finishing'
import { isStationId } from '~~/shared/constants/stations'

/** ห่อ response ให้ทุก endpoint คืนรูปแบบเดียวกัน */
export function apiOk<T>(data: T): ApiOk<T> {
  return { success: true, data }
}

/** ข้อผิดพลาดที่อ่านรู้เรื่องสำหรับผู้ใช้หน้างาน (ภาษาไทย) */
export function badRequest(message: string) {
  return createError({ statusCode: 400, statusMessage: message, message })
}

export function serverError(message: string, cause?: unknown) {
  if (cause) console.error(`[api] ${message}`, cause)
  return createError({ statusCode: 500, statusMessage: message, message })
}

/**
 * แทน try/catch ที่เดิมเขียนซ้ำทุกไฟล์
 * error ที่ throw เองด้วย createError จะถูกส่งต่อตามเดิม อย่างอื่นแปลงเป็น 500
 */
export function defineApiHandler<Req extends EventHandlerRequest, Res>(
  handler: (event: H3Event<Req>) => Promise<Res>,
  fallbackMessage = 'ระบบขัดข้อง กรุณาลองอีกครั้ง'
): EventHandler<Req, Promise<ApiOk<Res>>> {
  return defineEventHandler(async (event) => {
    try {
      return apiOk(await handler(event))
    } catch (err) {
      if (err && typeof err === 'object' && 'statusCode' in err) throw err
      throw serverError(fallbackMessage, err)
    }
  })
}

/** ตรวจ field ที่ต้องมี แล้วคืน body ที่พิมพ์ชนิดไว้แล้ว */
export async function readRequiredBody<T extends Record<string, unknown>>(
  event: H3Event,
  fields: Array<keyof T & string>
): Promise<T> {
  const body = (await readBody(event)) as T | undefined
  if (!body) throw badRequest('ไม่พบข้อมูลที่ส่งมา')

  const missing = fields.filter(f => body[f] === undefined || body[f] === null || body[f] === '')
  if (missing.length) throw badRequest(`ข้อมูลไม่ครบ: ${missing.join(', ')}`)

  return body
}

export function assertStationId(value: unknown) {
  if (!isStationId(value)) throw badRequest(`รหัสสถานีไม่ถูกต้อง: ${String(value)}`)
  return String(value).toUpperCase() as import('~~/shared/types/finishing').StationId
}

export function toPositiveInt(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : fallback
}
