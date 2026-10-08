/** ฟอร์แมตที่ใช้ร่วมกันทุกหน้า — ห้ามเรียก toLocaleString ด้วย option ซ้ำที่ component */

export function formatThaiDate(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatShortThaiDate(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

export function formatTime(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

export function formatQty(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString('th-TH')
}

/** % ผลผลิตดี = ผลิตได้ / (ผลิตได้ + แผ่นเสีย) */
export function yieldRate(produced: number, defects: number): number {
  const total = produced + defects
  return total === 0 ? 0 : (produced / total) * 100
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

/** UUID สำหรับ idempotency key (รองรับเบราว์เซอร์เก่าที่ไม่มี crypto.randomUUID) */
export function newIdempotencyKey(): string {
  const c = globalThis.crypto
  if (c?.randomUUID) return c.randomUUID()
  return `idem-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}
