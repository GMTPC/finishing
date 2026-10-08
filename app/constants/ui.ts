/** class ที่ใช้ซ้ำทั่ว UI — ปรับแต่งตาม Sneat Admin Theme */

export const CARD_CLASS = 'bg-white border border-slate-200/60 rounded-xl shadow-sneat'

export const LABEL_CLASS = 'text-xs font-bold text-slate-600 uppercase tracking-wider'

export const FIELD_BASE =
  'w-full bg-slate-50 border rounded-xl text-slate-900 font-bold shadow-2xs transition focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#696CFF]/20 focus:border-[#696CFF]'

export const FIELD_SIZE = {
  md: 'p-3 text-sm',
  lg: 'p-3.5 text-xl font-mono font-black',
  sm: 'p-1.5 text-xs font-mono',
} as const

export const FIELD_TONE = {
  default: 'border-slate-200 focus:ring-[#696CFF]/20 focus:border-[#696CFF]',
  success: 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500',
  danger: 'bg-rose-50/70 border-rose-300 text-rose-800 focus:ring-rose-500/20 focus:border-rose-500',
} as const

export type FieldSize = keyof typeof FIELD_SIZE
export type FieldTone = keyof typeof FIELD_TONE

export function fieldClass(size: FieldSize = 'md', tone: FieldTone = 'default') {
  return [FIELD_BASE, FIELD_SIZE[size], FIELD_TONE[tone]].join(' ')
}

