// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  // Pinia store ต้องอยู่ที่ app/stores เท่านั้น (ห้ามชี้หลาย path)
  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  css: ['~/assets/css/tailwind.css'],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: true,
  },

  typescript: {
    strict: true,
    // เปิด typeCheck เมื่อได้ติดตั้ง vue-tsc แล้ว (`npm i -D vue-tsc typescript`)
    typeCheck: false,
  },

  /** ค่าที่อ่านจาก .env ตอนรันจริง — ห้ามอ่าน process.env ตรง ๆ ใน endpoint */
  runtimeConfig: {
    // NUXT_SANCTUM_API_URL หรือ SANCTUM_API_URL
    sanctumApiUrl: process.env.SANCTUM_API_URL || '',
    public: {
      appName: 'ระบบบันทึกการผลิต แผนกฟินิชชิ่ง',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'th' },
      titleTemplate: '%s • ฟินิชชิ่ง',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0284c7' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },
})
