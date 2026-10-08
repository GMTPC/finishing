import type { ShiftCode, StationId } from '../types/finishing'

/**
 * เลข TAG / LOT / CODE ของระบบ — ถอดรูปแบบจากระบบคัดบอร์ดเดิม
 *
 * ┌ TAG ที่สแกนเข้า (จากคัดบอร์ด) — บาร์โค้ดกลางของใบ TAG
 * │   `B494-AV0212 : 1.22 x 2.44 m. : L4+++++++076`
 * │    └ รหัสสินค้า   └ ขนาด           └ Lot ต้นทาง + จำนวน (3 หลักท้าย)
 * │   บาร์โค้ดอีกแบบที่เจอในระบบคัดบอร์ด (ไม่มีตัวคั่น):
 * │   `W499-AV0212260924B633076` = รหัสสินค้า + วันที่ + ลำดับ + จำนวน
 * │
 * └ ของที่ออกใหม่ที่ฟินิชชิ่ง
 *     LOT      `260925A501`               = [วันที่ YYMMDD][ซีรีส์ 2 ตัว][ลำดับ 2 หลัก]
 *     OUT CODE `BX58-AV0212L4+++++++0076` = [รหัสสินค้าขาออก][Lot ต้นทาง][จำนวน 4 หลัก]
 *
 * ⚠️ ทั้งหมดถอดจากหน้าจอระบบเดิม ยังไม่ได้ยืนยันความหมายทุกส่วนกับหน้างาน
 *    ถ้ารูปแบบจริงต่างจากนี้ ให้แก้เฉพาะฟังก์ชันในไฟล์นี้ที่เดียว
 */

export interface ParsedTag {
  /** ข้อความดิบที่สแกนได้ */
  raw: string
  itemCode: string
  /** ขนาด เช่น `1.22 x 2.44 m.` */
  sizeText: string | null
  /** Lot ของต้นทาง */
  lot: string | null
  /** จำนวนที่อ่านได้จากบาร์โค้ด */
  quantity: number | null
}

const PART_SEPARATOR = ':'
/** ส่วนท้ายของ Lot เป็นตัวเลขจำนวน 3 หลัก เช่น `L4+++++++076` → lot `L4+++++++` จำนวน 76 */
const LOT_QTY_PATTERN = /^(.*?)(\d{3})$/
/** บาร์โค้ดแบบไม่มีตัวคั่น เช่น `W499-AV0209261001B555100` = รหัสสินค้า + วันที่(6) + ลำดับ(กะ+รัน) + จำนวน(3) */
const PACKED_PATTERN = /^([A-Z0-9]+-[A-Z0-9]+)(\d{6})([A-Z0-9]+?)(\d{3})$/i

/**
 * ถอดข้อมูลจากบาร์โค้ดของ TAG ต้นทาง — เป็นการอ่านแบบ best-effort
 * ค่าที่ถอดได้จะถูกเอาไปเติมในฟอร์มให้พนักงาน "ตรวจและแก้ไขได้" เสมอ ไม่ใช้ตรง ๆ
 */
export function parseTagBarcode(raw: string): ParsedTag {
  const text = raw.trim()

  if (text.includes(PART_SEPARATOR)) {
    const parts = text.split(PART_SEPARATOR).map(p => p.trim()).filter(Boolean)
    const itemCode = parts[0] ?? text
    const sizeText = parts.length >= 3 ? parts[1]! : null
    const lotPart = parts.length >= 3 ? parts[2]! : parts.length === 2 ? parts[1]! : null

    let lot: string | null = lotPart
    let quantity: number | null = null
    if (lotPart) {
      const matched = LOT_QTY_PATTERN.exec(lotPart)
      if (matched) {
        lot = matched[1]! || lotPart
        quantity = Number(matched[2])
      }
    }
    return { raw: text, itemCode, sizeText, lot, quantity }
  }

  // บาร์โค้ดแบบติดกัน: รหัสสินค้า + วันที่(6) + ลำดับ + จำนวน(3)
  const packed = PACKED_PATTERN.exec(text)
  if (packed) {
    return {
      raw: text,
      itemCode: packed[1]!,
      sizeText: null,
      lot: `${packed[2]}${packed[3]}`,
      quantity: Number(packed[4]),
    }
  }

  return { raw: text, itemCode: text, sizeText: null, lot: null, quantity: null }
}

// ── เลขที่ออกใหม่ที่ฟินิชชิ่ง ────────────────────────────────────────────

export const LOT_RUNNING_LENGTH = 2
export const OUT_CODE_QTY_LENGTH = 4

export function toDateCode(date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}${mm}${dd}`
}

/** ตัวอักษรกะ: MORNING = A, NIGHT = B */
export const SHIFT_TAG_LETTER: Record<ShiftCode, string> = {
  MORNING: 'A',
  NIGHT: 'B',
}

/**
 * LOT ที่ออกใหม่ เช่น `260925A501`
 * `series` คือรหัส 2 ตัวประจำไลน์/กลุ่ม (ในภาพระบบเดิมคือ `A5`)
 */
export function buildFgLot(series: string, running: number, date: Date = new Date()): string {
  return `${toDateCode(date)}${series}${String(running).padStart(LOT_RUNNING_LENGTH, '0')}`
}

/**
 * TAG WIP ที่ออกใหม่ของสถานี S1 / ฟินิชชิ่ง
 * รูปแบบ: [รหัสสินค้าขาออก][YYMMDD][กะ A/B][ลำดับ 3 หลัก][จำนวน 3 หลัก]
 * ตัวอย่าง: `W494-AV0209` + `261006` + `B` + `001` + `100` = `W494-AV0209261006B001100`
 */
export function buildS1WipTag(
  outItemCode: string,
  shift: ShiftCode,
  running: number,
  quantity: number,
  date: Date = new Date()
): string {
  const dateCode = toDateCode(date)
  const shiftLetter = SHIFT_TAG_LETTER[shift] || 'A'
  const runStr = String(running).padStart(3, '0')
  const qtyStr = String(quantity).padStart(3, '0')
  return `${outItemCode}${dateCode}${shiftLetter}${runStr}${qtyStr}`
}

/**
 * OUT CODE เช่น `BX58-AV0212L4+++++++0076`
 * = รหัสสินค้าขาออก + Lot ของต้นทาง + จำนวน 4 หลัก
 */
export function buildOutCode(outItemCode: string, sourceLot: string, quantity: number): string {
  return `${outItemCode}${sourceLot}${String(quantity).padStart(OUT_CODE_QTY_LENGTH, '0')}`
}

/**
 * เดารหัสสินค้าขาออกจากรหัสขาเข้า — คงส่วนท้ายไว้ เปลี่ยนเฉพาะส่วนหน้า
 * 1. ถ้า itemCode ขึ้นต้นด้วย W499 (WIP คัดบอร์ด) → เปลี่ยนเป็น W494 (WIP ฟินิชชิ่ง S1)
 * 2. ถ้า itemCode ขึ้นต้นด้วย W ตามด้วยตัวเลข n (เช่น W499...) → prefix = B{n}9P (สำหรับ FG)
 * 3. ถ้ามี outPrefix กำหนดไว้ ให้ใช้ outPrefix แทน
 */
export function suggestOutItemCode(itemCode: string, outPrefix?: string | null): string {
  const code = itemCode.trim()

  // W499 -> W494 (WIP คัดบอร์ด -> WIP ฟินิชชิ่ง)
  if (/^W\d99/i.test(code)) {
    return code.replace(/^W(\d)99/i, 'W$194')
  }

  if (outPrefix) {
    const dash = code.indexOf('-')
    return dash === -1 ? outPrefix : `${outPrefix}${code.slice(dash)}`
  }

  const wMatch = code.match(/^W(\d)/i)
  const effectivePrefix = wMatch ? `B${wMatch[1]}9P` : ''

  if (!effectivePrefix) return code
  const dash = code.indexOf('-')
  return dash === -1 ? effectivePrefix : `${effectivePrefix}${code.slice(dash)}`
}

/** @deprecated ใช้ `buildFgLot` หรือ `buildS1WipTag` แทน — เหลือไว้ให้โค้ดเก่าไม่พัง */
export function buildWipLot(stationId: StationId, shift: ShiftCode, date: Date = new Date()): string {
  return `FN${stationId}${toDateCode(date)}${SHIFT_TAG_LETTER[shift]}`
}

