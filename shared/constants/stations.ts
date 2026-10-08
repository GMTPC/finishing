import type { Destination, StationId, StationMeta } from '../types/finishing'
import { PVC_TYPES } from './pvc-types'

/**
 * แหล่งข้อมูลเดียวของ 5 สถานี (single source of truth)
 * ห้าม hardcode ชื่อสถานี / เส้นทางส่งต่อ ที่ component หรือ store อื่น
 */
export const STATIONS: Record<StationId, StationMeta> = {
  S1: {
    id: 'S1',
    title: 'เครื่องเคลือบ ขาวผ่อง/PVC',
    subtitle: 'TAG WIP จากคัดบอร์ด → WIP1',
    group: 'continuous',
    tone: 'blue',
    inputLabel: 'TAG WIP จากแผนกคัดบอร์ด',
    outputLabel: 'WIP1 (TAG ใหม่ของฟินิชชิ่ง)',
    inputSources: ['BOARD'],
    allowedNext: ['S2', 'S4'],
    machines: ['เครื่องเคลือบขาวผ่อง', 'เครื่องลามิเนต', 'ฟอล์ยบนกันร้อน'],
    pvcTypes: PVC_TYPES,
    workMode: 'board',
    lotSeries: 'A5',
    outItemPrefix: 'B19P',
    requiresFgSignature: false,
    hasColorSetup: false,
    hasPackaging: false,
  },
  S2: {
    id: 'S2',
    title: 'เครื่องเคลือบ PVC',
    subtitle: 'WIP1 (จาก S1) → WIP2',
    group: 'continuous',
    tone: 'emerald',
    inputLabel: 'WIP1 (จาก S1)',
    outputLabel: 'WIP2',
    inputSources: ['WIP1'],
    allowedNext: ['S4'],
    machines: ['เครื่องเคลือบ PVC 1', 'เครื่องเคลือบ PVC 2'],
    pvcTypes: [],
    workMode: 'steps',
    lotSeries: 'A5',
    outItemPrefix: 'B29P',
    requiresFgSignature: false,
    hasColorSetup: false,
    hasPackaging: false,
  },
  S3: {
    id: 'S3',
    title: 'เครื่องเคลือบสี ปรุลาย',
    subtitle: 'คัดบอร์ด → FG',
    group: 'independent',
    tone: 'amber',
    inputLabel: 'คัดบอร์ด (วัสดุอิสระ)',
    outputLabel: 'FG (สินค้าสำเร็จรูป)',
    inputSources: ['BOARD'],
    allowedNext: ['WAREHOUSE'],
    machines: ['เครื่องเคลือบสี ปรุลาย 1', 'เครื่องเคลือบสี ปรุลาย 2'],
    pvcTypes: [],
    workMode: 'steps',
    lotSeries: 'A5',
    outItemPrefix: 'B39P',
    requiresFgSignature: true,
    hasColorSetup: true,
    hasPackaging: false,
  },
  S4: {
    id: 'S4',
    title: 'เครื่องตัด&แพ็ค ออโต้ T-Bar 1',
    subtitle: 'WIP1 หรือ WIP2 → FG',
    group: 'independent',
    tone: 'orange',
    inputLabel: 'WIP1 (จาก S1) หรือ WIP2 (จาก S2)',
    outputLabel: 'FG (สินค้าสำเร็จรูป)',
    inputSources: ['WIP1', 'WIP2'],
    allowedNext: ['WAREHOUSE'],
    machines: ['ออโต้ T-Bar 1'],
    pvcTypes: [],
    workMode: 'steps',
    lotSeries: 'A5',
    outItemPrefix: 'B49P',
    requiresFgSignature: true,
    hasColorSetup: false,
    hasPackaging: true,
  },
  S5: {
    id: 'S5',
    title: 'เครื่องตัด&แพ็ค ออโต้ T-Bar 2',
    subtitle: 'คัดบอร์ด → FG',
    group: 'independent',
    tone: 'pink',
    inputLabel: 'คัดบอร์ด (วัสดุอิสระ)',
    outputLabel: 'FG (สินค้าสำเร็จรูป)',
    inputSources: ['BOARD'],
    allowedNext: ['WAREHOUSE'],
    machines: ['ออโต้ T-Bar 2'],
    pvcTypes: [],
    workMode: 'steps',
    lotSeries: 'A5',
    outItemPrefix: 'B59P',
    requiresFgSignature: true,
    hasColorSetup: false,
    hasPackaging: true,
  },
}

export const STATION_IDS = Object.keys(STATIONS) as StationId[]

export const STATION_LIST: StationMeta[] = STATION_IDS.map(id => STATIONS[id])

export function isStationId(value: unknown): value is StationId {
  return typeof value === 'string' && value.toUpperCase() in STATIONS
}

/** normalize ค่าจาก route param / payload ให้เป็น StationId (fallback = S1) */
export function toStationId(value: unknown, fallback: StationId = 'S1'): StationId {
  return isStationId(value) ? (String(value).toUpperCase() as StationId) : fallback
}

export function getStation(id: StationId): StationMeta {
  return STATIONS[id]
}

/** ป้ายกำกับปลายทางที่ผู้ใช้เห็นในขั้นตอนที่ 4 */
export function destinationLabel(dest: Destination): string {
  return dest === 'WAREHOUSE'
    ? 'คลังสินค้า (FG WAREHOUSE)'
    : `ส่งต่อ ${dest} (${STATIONS[dest].title})`
}

/** ป้ายกำกับชนิดวัสดุเข้า */
export const INPUT_SOURCE_LABEL: Record<string, string> = {
  RAW: 'วัตถุดิบตั้งต้น',
  BOARD: 'คัดบอร์ด',
  WIP1: 'WIP1 (จาก S1)',
  WIP2: 'WIP2 (จาก S2)',
}
