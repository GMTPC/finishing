import type { DbHealth } from '~~/shared/types/finishing'
import { prisma } from '../utils/prisma'
import { defineApiHandler } from '../utils/api'

/**
 * เช็คว่า Nuxt คุย SQL Server ได้จริง
 * ใช้ $queryRaw เพราะเป็นการตรวจการเชื่อมต่อ ไม่ใช่การอ่าน/เขียนข้อมูลโดเมน
 */
export default defineApiHandler(async (): Promise<DbHealth> => {
  const checkedAt = new Date().toISOString()

  try {
    const rows = await prisma.$queryRaw<Array<{ version: string }>>`SELECT @@VERSION AS version`
    return {
      connected: true,
      provider: 'sqlserver',
      version: rows[0]?.version,
      checkedAt,
      message: 'เชื่อมต่อฐานข้อมูลสำเร็จ',
    }
  } catch (err) {
    console.error('[health] database unreachable:', err)
    return {
      connected: false,
      provider: 'sqlserver',
      checkedAt,
      message: 'เชื่อมต่อฐานข้อมูลไม่สำเร็จ ตรวจสอบ DATABASE_URL และสถานะ SQL Server',
    }
  }
}, 'ตรวจสอบสถานะฐานข้อมูลไม่สำเร็จ')
