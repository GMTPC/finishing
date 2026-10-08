<script setup lang="ts">
import { Factory, ShieldCheck } from 'lucide-vue-next'
</script>

<template>
  <footer class="pt-4 border-t border-slate-200 text-slate-500 text-xs font-medium flex flex-wrap items-center justify-between gap-2">
    <div class="flex items-center gap-2 text-slate-700 font-semibold">
      <Factory class="w-4 h-4 text-slate-600" />
      <span>ระบบบันทึกการผลิต แผนกฟินิชชิ่ง • พัฒนาทดแทนระบบ AppSheet เดิม</span>
    </div>
    <div class="flex items-center gap-1.5">
      <ShieldCheck class="w-4 h-4 text-emerald-600" />
      <span>ISO 9001 QUALITY SYSTEM</span>
    </div>
  </footer>
</template>
