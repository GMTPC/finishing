<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppBottomDock from '~/components/layout/AppBottomDock.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppTopBar from '~/components/layout/AppTopBar.vue'
import { useSystemStore } from '~/stores/system'

const sidebarCollapsed = ref(false)
const menuOpen = ref(false)

// เช็คการเชื่อมต่อ DB ครั้งเดียวต่อการโหลดแอป (เดิมทุกหน้ายิงซ้ำเอง)
const system = useSystemStore()
onMounted(() => {
  if (!system.health) system.checkHealth()
})
</script>

<template>
  <div class="min-h-screen bg-[#F4F8F5] text-[#566A7F] flex font-sans antialiased selection:bg-[#52B788] selection:text-white">
    <AppSidebar v-model:collapsed="sidebarCollapsed" />

    <div class="flex-1 flex flex-col min-w-0 pb-16 sm:pb-20 lg:pb-0">
      <AppTopBar v-model:menu-open="menuOpen" />

      <div class="w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-5 lg:py-6 flex-1 flex flex-col justify-between gap-4 lg:gap-8">
        <main>
          <slot />
        </main>
        <!-- footer กินพื้นที่บนมือถือ แสดงเฉพาะแท็บเล็ตขึ้นไป -->
        <AppFooter class="hidden sm:flex" />
      </div>
    </div>

    <AppBottomDock @open-menu="menuOpen = true" />
  </div>
</template>
