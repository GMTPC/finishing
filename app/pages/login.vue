<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff, Factory, LogIn, ShieldCheck, Sparkles, User } from 'lucide-vue-next'
import AlertBanner from '~/components/ui/AlertBanner.vue'
import BigButton from '~/components/ui/BigButton.vue'
import FormField from '~/components/ui/FormField.vue'
import TextInput from '~/components/ui/TextInput.vue'
import { EMPLOYEES } from '~/constants/employees'
import { useSessionStore } from '~/stores/session'

definePageMeta({ layout: 'auth' })
useHead({ title: 'เข้าสู่ระบบ' })

const session = useSessionStore()
const { login, loading, error, user, assignedStationId } = useAuth()

const username = ref('')
const password = ref('')
const showPassword = ref(false)

async function handleLogin() {
  if (!username.value.trim()) return

  const ok = await login(username.value.trim(), password.value)
  if (ok) {
    const emp = EMPLOYEES.find(
      e => e.username.toLowerCase() === username.value.trim().toLowerCase()
    )
    session.operatorName = user.value?.name || (emp ? emp.name : username.value.trim())

    if (assignedStationId.value) {
      session.setStation(assignedStationId.value)
      const targetPath = session.station.workMode === 'board' 
        ? `/s/${assignedStationId.value}/board` 
        : `/s/${assignedStationId.value}`
      return navigateTo(targetPath)
    }

    return navigateTo('/')
  }
}
</script>

<template>
  <div class="w-full min-h-screen flex flex-col justify-center bg-[#F4F8F5]">
    <!-- Full-screen Dual-Column Layout -->
    <div class="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white shadow-none sm:shadow-sneat-lg overflow-hidden">
      
      <!-- Left Column: Soothing Matcha Tea Soft Green Hero Branding (Shown on Desktop screens lg:flex) -->
      <div class="lg:col-span-5 bg-gradient-to-br from-[#D8F3DC] via-[#B7E4C7] to-[#95D5B2] p-8 lg:p-14 text-[#1B4332] flex flex-col justify-between relative overflow-hidden hidden lg:flex select-none min-h-screen">
        <div class="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/40 blur-xl pointer-events-none" />
        <div class="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-emerald-600/10 blur-2xl pointer-events-none" />

        <div class="relative z-10 space-y-6">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md text-[#1B4332] font-black font-mono flex items-center justify-center text-xl shadow-2xs border border-white/70">
              FN
            </div>
            <div>
              <h2 class="font-black text-xl tracking-tight text-[#1B4332] leading-none">ฟินิชชิ่ง</h2>
              <span class="text-xs font-bold text-[#2D6A4F] uppercase tracking-widest">Sneat Production System</span>
            </div>
          </div>

          <div class="pt-10 space-y-3">
            <h3 class="text-2xl lg:text-4xl font-black leading-snug tracking-tight text-[#1B4332]">
              ระบบบันทึกการผลิต <br />
              แผนกฟินิชชิ่ง
            </h3>
            <p class="text-sm text-[#2D6A4F] font-semibold leading-relaxed max-w-md">
              รองรับการทำงาน 5 สถานีหลัก (S1–S5) พร้อมระบบบันทึกข้อมูลหน้างาน real-time และยืนยันตัวตนความปลอดภัยสูง
            </p>
          </div>
        </div>

        <div class="relative z-10 space-y-3.5 my-10 max-w-md">
          <div class="flex items-center gap-3 text-sm font-bold bg-white/50 backdrop-blur-md px-4 py-3.5 rounded-2xl border border-white/60 text-[#1B4332]">
            <ShieldCheck class="w-5 h-5 text-[#2D6A4F] shrink-0" />
            <span>ยืนยันตัวตนก่อนเข้าใช้งาน</span>
          </div>
          <div class="flex items-center gap-3 text-sm font-bold bg-white/50 backdrop-blur-md px-4 py-3.5 rounded-2xl border border-white/60 text-[#1B4332]">
            <Factory class="w-5 h-5 text-[#2D6A4F] shrink-0" />
            <span>5 สถานีหลัก S1 → S2 → S5</span>
          </div>
          <div class="flex items-center gap-3 text-sm font-bold bg-white/50 backdrop-blur-md px-4 py-3.5 rounded-2xl border border-white/60 text-[#1B4332]">
            <Sparkles class="w-5 h-5 text-[#B45309] shrink-0" />
            <span>Sneat UI Modern Theme</span>
          </div>
        </div>

        <div class="relative z-10 text-xs text-[#2D6A4F] font-semibold border-t border-[#2D6A4F]/20 pt-5 flex items-center justify-between">
          <span>ระบบบันทึกกระบวนการผลิต</span>
          <span class="font-mono font-black text-[#1B4332] text-sm">v1.0.0</span>
        </div>
      </div>

      <!-- Right Column: Standard Full-Height Login Form -->
      <div class="lg:col-span-7 p-6 sm:p-12 lg:p-20 bg-white flex flex-col justify-center min-h-screen">
        <div class="w-full max-w-xl mx-auto space-y-8">
          
          <!-- Mobile/Tablet Brand Header (Shown when hero banner is hidden on < lg) -->
          <div class="flex items-center gap-3.5 pb-5 mb-2 border-b border-slate-200 lg:hidden">
            <div class="w-14 h-14 rounded-2xl bg-[#52B788] text-white font-black font-mono flex items-center justify-center text-xl shadow-md shadow-[#52B788]/25 shrink-0">
              FN
            </div>
            <div>
              <h2 class="font-black text-xl sm:text-2xl tracking-tight text-slate-800 leading-tight">แผนกฟินิชชิ่ง</h2>
              <p class="text-sm text-slate-500 font-semibold mt-0.5">ระบบบันทึกการผลิต 5 สถานีหลัก</p>
            </div>
          </div>

          <div class="mb-6">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight">เข้าสู่ระบบ</h1>
          </div>

          <AlertBanner v-if="error" type="danger" dismissible class="mb-5" @dismiss="error = null">
            {{ error }}
          </AlertBanner>

          <form class="space-y-6 sm:space-y-7" @submit.prevent="handleLogin">
            <div class="space-y-2">
              <label class="block text-sm sm:text-base font-extrabold text-slate-700 uppercase tracking-wider">
                ชื่อผู้ใช้งาน / USERNAME <span class="text-rose-500">*</span>
              </label>
              <TextInput
                v-model="username"
                type="text"
                placeholder="ป้อน Username (เช่น S01 หรือ admin01)"
                class="px-5 py-4 text-lg sm:text-xl font-bold rounded-2xl placeholder:text-slate-400 placeholder:font-normal focus:ring-[#52B788]/20 focus:border-[#52B788]"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm sm:text-base font-extrabold text-slate-700 uppercase tracking-wider">
                รหัสผ่าน (PASSWORD) <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <TextInput
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="ป้อน Password (เช่น gmt@s01)"
                  class="pl-5 pr-14 py-4 text-lg sm:text-xl font-bold rounded-2xl placeholder:text-slate-400 placeholder:font-normal focus:ring-[#52B788]/20 focus:border-[#52B788]"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2"
                  :title="showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="w-6 h-6 text-[#52B788]" />
                  <Eye v-else class="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>

            <div class="pt-4">
              <button
                type="submit"
                :disabled="loading"
                class="w-full rounded-2xl font-black text-lg sm:text-xl text-white py-4 sm:py-5 bg-[#52B788] hover:bg-[#40916C] active:bg-[#2D6A4F] shadow-md shadow-[#52B788]/25 transition duration-150 active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-3 select-none"
              >
                <LogIn class="w-6 h-6 sm:w-7 sm:h-7" />
                <span>เข้าสู่ระบบ</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </div>
</template>
