import type { StationId, StationTone } from '~~/shared/types/finishing'
import { STATIONS } from '~~/shared/constants/stations'

/**
 * Tailwind class ประจำโทนสีสถานี — เขียนเป็นสตริงเต็มเพื่อให้ Tailwind scan เจอ
 * ที่เดียวเท่านั้นในระบบ ห้ามเขียน switch (id) แจกสีที่ component อื่น
 */
interface ToneClasses {
  /** ป้ายรหัสสถานี (S1..S5) */
  badge: string
  /** จุดสีหัวข้อกลุ่ม/ตัวชี้วัด */
  dot: string
  /** ปุ่ม/สถานะที่ถูกเลือกด้วยโทนสถานี */
  solid: string
  /** ปุ่ม Action หลักประจำสถานี (เช่น ออกรหัสใหม่) */
  primaryBtn: string
  /** ปุ่ม Action รองประจำสถานี */
  secondaryBtn: string
  /** แถบ/กรอบไฮไลต์สถานีอ่อนๆ */
  softBg: string
  /** สีข้อความเน้นสถานี */
  text: string
  /** สีขอบสถานี */
  border: string
  /** สีแหวน/โฟกัสสถานี */
  ring: string
}

const TONE_CLASSES: Record<StationTone, ToneClasses> = {
  blue: {
    badge: 'bg-blue-600 text-white border-blue-700',
    dot: 'bg-blue-600',
    solid: 'bg-blue-600 text-white border-blue-600',
    primaryBtn: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-2xs',
    secondaryBtn: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white shadow-2xs',
    softBg: 'bg-blue-50/70 border-blue-200/80 text-blue-900',
    text: 'text-blue-700',
    border: 'border-blue-200',
    ring: 'ring-blue-500',
  },
  emerald: {
    badge: 'bg-emerald-600 text-white border-emerald-700',
    dot: 'bg-emerald-600',
    solid: 'bg-emerald-600 text-white border-emerald-600',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-2xs',
    secondaryBtn: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white shadow-2xs',
    softBg: 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    ring: 'ring-emerald-500',
  },
  amber: {
    badge: 'bg-amber-500 text-slate-950 border-amber-600',
    dot: 'bg-amber-500',
    solid: 'bg-amber-500 text-slate-950 border-amber-500',
    primaryBtn: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold shadow-2xs',
    secondaryBtn: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white shadow-2xs',
    softBg: 'bg-amber-50/70 border-amber-200/80 text-amber-950',
    text: 'text-amber-800',
    border: 'border-amber-200',
    ring: 'ring-amber-500',
  },
  orange: {
    badge: 'bg-orange-600 text-white border-orange-700',
    dot: 'bg-orange-600',
    solid: 'bg-orange-600 text-white border-orange-600',
    primaryBtn: 'bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white shadow-2xs',
    secondaryBtn: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white shadow-2xs',
    softBg: 'bg-orange-50/70 border-orange-200/80 text-orange-950',
    text: 'text-orange-700',
    border: 'border-orange-200',
    ring: 'ring-orange-500',
  },
  pink: {
    badge: 'bg-pink-600 text-white border-pink-700',
    dot: 'bg-pink-600',
    solid: 'bg-pink-600 text-white border-pink-600',
    primaryBtn: 'bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white shadow-2xs',
    secondaryBtn: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white shadow-2xs',
    softBg: 'bg-pink-50/70 border-pink-200/80 text-pink-950',
    text: 'text-pink-700',
    border: 'border-pink-200',
    ring: 'ring-pink-500',
  },
}

const FALLBACK: ToneClasses = {
  badge: 'bg-slate-700 text-white border-slate-800',
  dot: 'bg-slate-500',
  solid: 'bg-slate-700 text-white border-slate-700',
  primaryBtn: 'bg-slate-800 hover:bg-slate-700 text-white shadow-2xs',
  secondaryBtn: 'bg-slate-700 hover:bg-slate-600 text-white shadow-2xs',
  softBg: 'bg-slate-100 border-slate-200 text-slate-900',
  text: 'text-slate-700',
  border: 'border-slate-200',
  ring: 'ring-slate-500',
}

function toneOf(station: StationId | string): ToneClasses {
  const meta = STATIONS[station as StationId]
  return meta ? TONE_CLASSES[meta.tone] : FALLBACK
}

export const stationBadgeClass = (station: StationId | string) => toneOf(station).badge
export const stationDotClass = (station: StationId | string) => toneOf(station).dot
export const stationSolidClass = (station: StationId | string) => toneOf(station).solid
export const stationPrimaryBtnClass = (station: StationId | string) => toneOf(station).primaryBtn
export const stationSecondaryBtnClass = (station: StationId | string) => toneOf(station).secondaryBtn
export const stationSoftBgClass = (station: StationId | string) => toneOf(station).softBg
export const stationTextClass = (station: StationId | string) => toneOf(station).text
export const stationBorderClass = (station: StationId | string) => toneOf(station).border
export const stationRingClass = (station: StationId | string) => toneOf(station).ring

/** โทนสีหัวข้อกลุ่มสถานีในหน้าแรก */
export const GROUP_THEME = {
  continuous: { dot: 'bg-blue-600', title: 'สายการผลิตต่อเนื่อง: S1 → S2 → S4' },
  independent: { dot: 'bg-amber-500', title: 'ไลน์การผลิตอิสระ ผลิต FG' },
} as const

