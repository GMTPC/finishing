# ข้อตกลงการเขียนโค้ด

## กฎที่ห้ามละเมิด

1. **Pinia store อยู่ที่ `app/stores/` เท่านั้น** — ห้ามสร้าง `store/` หรือ `server/store/` ซ้ำ และ `storesDirs` ใน `nuxt.config.ts` ต้องมี path เดียว
2. **`app.vue` อยู่ที่ `app/app.vue` เท่านั้น**
3. **แยก `components/ui/` (primitive) ออกจาก `components/finishing/` (เฉพาะ flow นี้) เสมอ** — `ui/` ห้าม import store หรือรู้จักโดเมน
4. **คุย DB ผ่าน Prisma เท่านั้น** — ห้าม raw query ยกเว้นตรวจการเชื่อมต่อใน `health.get.ts` และห้าม `CREATE TABLE` ใน endpoint
5. **UI ใช้ Tailwind ล้วน** — ห้ามเพิ่ม Vuetify / Nuxt UI / Ionic; component แบบ interactive ใช้ Reka UI (headless)

## หลีกเลี่ยงโค้ดซ้ำ: ของพวกนี้มี "ที่เดียว" แล้ว

| ต้องการ | ใช้ของที่มีอยู่ | ห้ามทำ |
| --- | --- | --- |
| สีประจำสถานี | `stationBadgeClass()` / `<StationChip>` | เขียน `switch (id)` แจกสีเอง |
| ข้อมูลสถานี | `STATIONS` / `getStation()` | พิมพ์ชื่อสถานีใน component |
| ชื่อกะ | `shiftLabel()` / `SHIFTS` | เขียน "กะเช้า"/"กะดึก" ตรง ๆ |
| งานที่เปิดอยู่ | `useJobsStore().activeJob` | ส่ง job เป็น prop ไล่ชั้น |
| รายชื่อพนักงาน | `EMPLOYEES` / `searchEmployees()` | ประกาศ array รายชื่อซ้ำในหน้า |
| เลือกได้หลายรายการ | `<CheckboxList>` | ทำ checkbox เองในหน้า |
| เลือก 1 จากรายการยาว | `<RadioList>` (มีช่องค้นหาในตัว) | ทำ dropdown/radio เองในหน้า |
| ชนิด PVC | `PVC_TYPES` / `station.pvcTypes` | พิมพ์รายการ PVC ในหน้า |
| รายการขั้นตอน | `STEPS` / `STEP_VIEWS` | ประกาศ array ขั้นตอนใหม่ |
| path หน้าสถานี | `stationPath(id)` / `stationStepPath(id, step)` | เขียน `` `/s/${id}/...` `` ตรง ๆ |
| เรียก API | `api.*` ใน `app/utils/api.ts` | `$fetch('/api/...')` ใน component |
| cookie / session | `useAuth()` | `useCookie('auth_token')` เอง |
| การ์ดขาว + หัวข้อ | `<SectionCard>` | ก็อป class `bg-white border ... rounded-2xl` |
| ช่องกรอก | `<TextInput> <NumberInput> <SelectInput>` + `<FormField>` | เขียน `<input class="...">` ยาว ๆ |
| ปุ่มเลือก 2–3 ตัวเลือก | `<SegmentedControl>` | ทำปุ่มคู่พร้อม `:class` เอง |
| แถบแจ้งเตือน | `<AlertBanner>` | div สีเอง |
| โครงการ์ดของขั้นตอน | `<StepCard>` | เขียน header + ปุ่มยืนยันเอง |

## Vue / Nuxt

- ใช้ `<script setup lang="ts">` เสมอ
- สองทางด้วย `defineModel()` (Vue 3.5) แทน `props` + `emit('update:x')`
- component ใน `finishing/` อ่าน store ได้ตรง ๆ ไม่ต้องส่ง props ไล่ชั้น
- component ใน `ui/` รับค่าทาง props/model เท่านั้น
- ตั้งชื่อ event เป็น kebab-case ใน template (`@save-step`) และ camelCase ใน `defineEmits`
- ข้อความที่ผู้ใช้เห็นเป็นภาษาไทย ส่วน identifier ในโค้ดเป็นภาษาอังกฤษ
- ทุก `console.error` ให้ขึ้นต้นด้วย tag เช่น `[QrScanner]`, `[api]`

## Mobile-first

- ปุ่มหลักใช้ `<BigButton>` (สูง 56–64px)
- ตัวเลขที่ต้องอ่านไกลใช้ `font-mono font-black` ขนาด `text-2xl` ขึ้นไป
- ทุกหน้าต้องใช้งานได้ที่ความกว้าง 360px และมีแถบปุ่มล่างสำหรับนิ้วโป้ง

---

## วิธีเพิ่ม/แก้ของ

### เพิ่มสถานีใหม่ (เช่น S6)

1. เพิ่ม `'S6'` ใน `StationId` ที่ `shared/types/finishing.ts`
2. เพิ่ม entry ใน `STATIONS` ที่ `shared/constants/stations.ts` (ตั้ง `tone`, `inputSources`, `allowedNext`, flag ต่าง ๆ)
3. ถ้าใช้โทนสีใหม่ ให้เพิ่มใน `TONE_CLASSES` ที่ `app/constants/station-theme.ts`

เท่านี้ — หน้าแรก, sidebar, drawer, หน้า login และหน้าทำงานจะมีสถานีใหม่ให้เองทั้งหมด

### เพิ่มฟอร์มเฉพาะบางสถานี

อย่าเขียน `v-if="stationParam === 'S3'"` แต่ให้เพิ่ม flag ใน `StationMeta` (เช่น `hasColorSetup`) แล้วใช้ `v-if="station.hasColorSetup"` — จะได้เปิดให้สถานีอื่นภายหลังได้โดยไม่ต้องแก้ component

### เพิ่มขั้นตอนใหม่

1. เพิ่มเลขใน `StepNumber` และ entry ใน `STEPS` (`shared/constants/steps.ts`)
2. เพิ่ม icon ใน `STEP_ICONS` (`app/constants/step-icons.ts`)
3. สร้าง `StepNXxx.vue` โดยครอบด้วย `<StepCard>` แล้วผูกใน map ที่ `app/pages/s/[station]/[step].vue`

### เพิ่ม/แก้ชนิด PVC

แก้ `PVC_TYPES` ที่ [`shared/constants/pvc-types.ts`](../shared/constants/pvc-types.ts)
ถ้าต้องการเปิดช่องนี้ให้สถานีอื่น ให้ใส่ `pvcTypes: PVC_TYPES` ใน `STATIONS` ของสถานีนั้น — ฟอร์มและการตรวจฝั่ง server จะตามเอง

### เพิ่ม/แก้รายชื่อเครื่องของสถานี

แก้ `machines` ใน `STATIONS` ที่ [`shared/constants/stations.ts`](../shared/constants/stations.ts)
ฟอร์มเริ่มงานจะเปลี่ยนตามเอง (1 เครื่อง = แสดงเป็น dropdown, 2–3 เครื่อง = ปุ่มเลือก)
server ตรวจด้วยว่าเครื่องที่ส่งมาอยู่ในรายการของสถานีนั้นจริง

### แก้โครงสร้างตาราง

แก้ `prisma/schema.prisma` → `npm run db:generate` → `npm run db:push` (dev) หรือ `npm run db:migrate` (production)
