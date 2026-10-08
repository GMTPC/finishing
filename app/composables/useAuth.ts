import { computed, ref } from 'vue'
import { api, apiErrorMessage } from '~/utils/api'

export interface AuthUser {
  id: number
  name: string
  employeeId: string
  role: string
  stationId?: string | null
}

const TOKEN_COOKIE = 'auth_token'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7

/**
 * จุดเดียวที่จัดการ session ของผู้ใช้ — หน้า/เลย์เอาต์ห้ามแตะ cookie `auth_token` เอง
 */
export const useAuth = () => {
  const user = useState<AuthUser | null>('auth_user', () => null)
  const token = useCookie<string | null>(TOKEN_COOKIE, { maxAge: TOKEN_MAX_AGE, sameSite: 'lax' })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  /** รหัสสถานีที่ user นี้ได้รับสิทธิ์ (ถ้าเป็น admin จะคืนค่า null เพื่อให้เห็นทุกสถานี) */
  const assignedStationId = computed<string | null>(() => {
    if (!user.value) return null
    if (user.value.role?.toLowerCase() === 'admin') return null
    if (user.value.stationId) return user.value.stationId

    const match = user.value.employeeId?.match(/^S0?([1-5])$/i)
    if (match) return `S${match[1]}`
    return null
  })

  const isStationUser = computed(() => !!assignedStationId.value)

  /** เข้าระบบผ่าน Laravel Sanctum (ผ่าน `server/api/auth/login`) */
  async function login(employeeId: string, pin: string) {
    loading.value = true
    error.value = null
    try {
      const res = await api.login({ employeeId, pin })
      token.value = res.data.token
      user.value = res.data.user
      return true
    } catch (err) {
      error.value = apiErrorMessage(err, 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * เริ่มกะจากหน้าเลือกพนักงานหน้างาน (ยังไม่มีการกรอก PIN)
   * TODO: เปลี่ยนไปใช้ `login()` เมื่อหน้างานยืนยันว่าต้องกรอก PIN ทุกครั้ง
   */
  function startLocalSession(profile: { name: string; employeeId?: string }) {
    token.value = `local_${Date.now()}`
    const empId = profile.employeeId ?? ''
    const match = empId.match(/^S0?([1-5])$/i)
    user.value = {
      id: 0,
      name: profile.name,
      employeeId: empId,
      role: 'operator',
      stationId: match ? `S${match[1]}` : null,
    }
  }

  function logout() {
    token.value = null
    user.value = null
    return navigateTo('/login')
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    assignedStationId,
    isStationUser,
    login,
    startLocalSession,
    logout,
  }
}
