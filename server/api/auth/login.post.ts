import { prisma } from '../../utils/prisma'
import { badRequest, defineApiHandler, readRequiredBody } from '../../utils/api'

interface LoginBody {
  employeeId: string
  pin: string
}

interface SanctumResponse {
  token?: string
  user?: { id: number; name: string; employeeId?: string; employee_id?: string; role?: string }
}

/**
 * เข้าระบบผ่าน DB Prisma (หรือ Laravel Sanctum)
 */
export default defineApiHandler(async (event) => {
  const { employeeId, pin } = await readRequiredBody<LoginBody>(event, ['employeeId', 'pin'])

  // 1. ค้นหาผู้ใช้จาก DB Prisma ก่อน (รองรับ S01-S05, admin01-admin02)
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: employeeId },
        { name: employeeId },
      ],
    },
  })

  if (dbUser) {
    if (pin && dbUser.password !== pin) {
      throw createError({
        statusCode: 401,
        statusMessage: 'รหัสผ่านไม่ถูกต้อง',
        message: 'รหัสผ่านไม่ถูกต้อง',
      })
    }

    const match = dbUser.username.match(/^S0?([1-5])$/i)
    const stationId = match ? `S${match[1]}` : null

    return {
      token: `token_user_${dbUser.id}_${Date.now()}`,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        employeeId: dbUser.username,
        role: dbUser.role,
        stationId,
      },
    }
  }

  // 2. ถ้ามี SANCTUM_API_URL ให้ยิงไป Sanctum
  const { sanctumApiUrl } = useRuntimeConfig(event)
  if (sanctumApiUrl) {
    try {
      const res = await $fetch<SanctumResponse>(sanctumApiUrl, {
        method: 'POST',
        body: { employee_id: employeeId, password: pin },
      })

      if (!res?.token) throw badRequest('รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง')

      return {
        token: res.token,
        user: {
          id: res.user?.id ?? 0,
          name: res.user?.name ?? `พนักงาน ${employeeId}`,
          employeeId: res.user?.employeeId ?? res.user?.employee_id ?? employeeId,
          role: res.user?.role ?? 'operator',
        },
      }
    } catch (err) {
      throw createError({
        statusCode: 401,
        statusMessage: 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง',
        message: 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง',
      })
    }
  }

  if (import.meta.dev) {
    const match = employeeId.match(/^S0?([1-5])$/i)
    const stationId = match ? `S${match[1]}` : null
    return {
      token: `dev_token_${Date.now()}`,
      user: { id: 0, name: `พนักงาน ${employeeId}`, employeeId, role: 'operator', stationId },
    }
  }

  throw createError({
    statusCode: 401,
    statusMessage: 'ไม่พบรหัสผู้ใช้นี้ในระบบ',
    message: 'ไม่พบรหัสผู้ใช้นี้ในระบบ',
  })
}, 'เข้าสู่ระบบไม่สำเร็จ')

