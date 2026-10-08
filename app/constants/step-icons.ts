import type { Component } from 'vue'
import { Factory, PackageCheck, Send, Settings2 } from 'lucide-vue-next'
import type { StepNumber } from '~~/shared/types/finishing'
import { STEPS, type StepMeta } from '~~/shared/constants/steps'

/** icon ของแต่ละขั้นตอน แยกจาก `shared/constants/steps.ts` เพราะ shared ต้องไม่ผูกกับ Vue */
export const STEP_ICONS: Record<StepNumber, Component> = {
  1: PackageCheck,
  2: Settings2,
  3: Factory,
  4: Send,
}

export interface StepView extends StepMeta {
  icon: Component
}

/** รายการขั้นตอนพร้อม icon — ใช้ทั้ง sidebar, แถบล่างมือถือ และ StepNavigator */
export const STEP_VIEWS: StepView[] = STEPS.map(s => ({ ...s, icon: STEP_ICONS[s.step] }))
