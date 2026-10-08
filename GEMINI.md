# GEMINI.md — โปรเจกต์ "ฟินิชชิ่ง"

คำแนะนำนี้สำหรับ Gemini (หรือ AI agent ใดๆ) ที่ช่วยเขียนโค้ดในโปรเจกต์นี้ อ่านไฟล์นี้ก่อนเริ่มทำงานทุกครั้ง และยึดตามกฎด้านล่างอย่างเคร่งครัด

เอกสารประกอบ (อ่านเฉพาะที่เกี่ยวกับงานที่ทำ):
[docs/DOMAIN.md](docs/DOMAIN.md) โดเมน • [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) โครงสร้างโค้ด • [docs/API.md](docs/API.md) endpoint • [docs/CONVENTIONS.md](docs/CONVENTIONS.md) กฎการเขียนโค้ด • [docs/REFACTOR.md](docs/REFACTOR.md) สิ่งที่เพิ่งเปลี่ยน

## โปรเจกต์คืออะไร

ระบบบันทึกกระบวนการผลิตแผนก "ฟินิชชิ่ง" สร้างขึ้นมาแทนแอป AppSheet เดิม ใช้งานหน้างานจริงโดยพนักงานหน้าเครื่อง ผ่านมือถือ/แท็บเล็ตเป็นหลัก (mobile-first, ปุ่มใหญ่กดง่ายด้วยนิ้วโป้ง, ตัวอักษรใหญ่อ่านง่ายในที่แสงจ้า)

## Tech Stack (ห้ามเปลี่ยนโดยไม่ถามก่อน)
| ส่วน | ใช้ | หมายเหตุ |
| --- | --- | --- |
| Frontend/Backend | Nuxt 4 | server API อยู่ใน `server/api/*` (Nitro), ไม่ใช้ NestJS แยก |
| ORM | Prisma | คุย DB ผ่าน Prisma เท่านั้น ห้าม raw query ยกเว้นจำเป็นจริงๆ |
| Database | SQL Server | รันบน Windows Server/IIS |
| Auth | Laravel Sanctum (ระบบเดิม) | Nuxt server เรียก Laravel `/api/login` แล้วเก็บ token ไว้ฝั่ง server เอง (httpOnly cookie) ห้ามส่ง token ลง browser ตรงๆ |
| State | Pinia | store อยู่ที่ `app/stores/` ที่เดียวเท่านั้น |
| Styling | Tailwind CSS | ห้ามใช้ Vuetify/Nuxt UI/Ionic — ตกลงกันแล้วว่าใช้ Tailwind ล้วนเพื่อความลื่นและคุมดีไซน์ได้ตรง wireframe |
| Interactive component | Reka UI (headless) | ใช้กับ ToggleGroup, Tabs, Select, Checkbox, AlertDialog เท่านั้น — ไม่มีสไตล์ติดมา ต้องใส่ Tailwind class เอง |
| ลายเซ็นดิจิทัล | `vue3-signature` หรือ `<canvas>` เอง | Reka UI ไม่มีให้ |
| สแกน TAG/บาร์โค้ด | `html5-qrcode` หรือ `vue-qrcode-reader` | รองรับทั้งกล้องมือถือและเครื่องสแกนภายนอกที่พิมพ์เป็นคีย์บอร์ด |
| Deploy | IIS (Windows) | ต้องรัน Node (`node .output/server/index.mjs`) เพราะมี server API — `nuxi generate` แบบ static ล้วนใช้ไม่ได้ |

## โครงสร้างโฟลเดอร์ (Nuxt 4 ใช้ `app/` เป็นราก)

```text
shared/                  ← domain ที่ใช้ร่วมทั้ง client/server (ห้ามผูกกับ Vue หรือ Prisma)
├── types/finishing.ts   ← StationId, ShiftCode, WorkRecordInput ฯลฯ — type โดเมนอยู่ที่นี่ที่เดียว
├── constants/stations.ts ← ข้อมูล 5 สถานี + รายชื่อเครื่อง (แหล่งความจริงเดียว)
├── constants/shifts.ts  ← กะเช้า/กะดึก
├── utils/tag.ts         ← ถอดบาร์โค้ด + สูตร LOT/OUT CODE (แก้ที่นี่ที่เดียว)
├── constants/steps.ts   ← ข้อมูล 4 ขั้นตอน
└── utils/{tag,format}.ts
app/
├── app.vue
├── assets/css/tailwind.css
├── components/
│   ├── ui/              ← primitive ที่ไม่รู้จักโดเมน (BigButton, FormField, TextInput,
│   │                       NumberInput, SelectInput, SegmentedControl, SectionCard,
│   │                       StatCard, StatusPill, StationChip, AlertBanner)
│   ├── finishing/       ← เฉพาะ flow นี้ (JobForm, JobCard, ActiveJobBar, StepCard, Step1–4, StationHeader,
│   │                       StepNavigator, ColorSetupMatrix, PackagingMaterialsForm,
│   │                       QrScanner, SignaturePad)
│   └── layout/          ← AppSidebar, AppTopBar, AppBottomDock, AppFooter, DbStatusButton
├── composables/         ← useAuth.ts (ที่เดียวที่แตะ cookie), useStationNav.ts
├── constants/           ← class/icon ที่ผูกกับ Tailwind/Vue (station-theme, step-icons, ui)
├── utils/               ← api.ts (ที่เดียวที่รู้ path ของ server/api), routes.ts
├── middleware/auth.global.ts
├── pages/
│   ├── login.vue
│   ├── index.vue        ← Home เลือก station
│   ├── s/[station]/index.vue    ← หน้างาน (job) ของสถานี
│   ├── s/[station]/board.vue    ← กระดานข้อมูลเข้า/ออก (S1)
│   └── s/[station]/[step].vue   ← dynamic route, step เป็นเลข 1–4 จริง
└── stores/              ← session.ts, jobs.ts, board.ts, production.ts, system.ts (Pinia ที่เดียว ห้ามสร้างที่อื่น)
prisma/
└── schema.prisma        ← นิยามตารางที่เดียว ห้าม CREATE TABLE ใน endpoint
server/
├── api/                 ← health.get, jobs/*, records.get/post, tags/receive.post, shifts/[id]/close.post, auth/login.post
└── utils/
    ├── prisma.ts        ← PrismaClient instance เดียว, import จากที่นี่เท่านั้น
    ├── api.ts           ← defineApiHandler, readRequiredBody, assertStationId
    └── ledger.ts        ← createIdempotent (กันบันทึกซ้ำ)
docs/                    ← DOMAIN, ARCHITECTURE, API, CONVENTIONS, REFACTOR
```

### กฎเรื่องโครงสร้าง:
1. ห้ามสร้าง `store/`, `stores/` (นอก `app/`), หรือ `server/store/` ซ้ำ — Pinia store อยู่ที่ `app/stores/` เท่านั้น
2. `app.vue` ต้องอยู่ที่ `app/app.vue` เท่านั้น
3. แยก `components/ui/` (primitive ทั่วไป) ออกจาก `components/finishing/` (เฉพาะ flow นี้) เสมอ — `ui/` ห้าม import store
4. ห้ามแก้ `nuxt.config.ts` ให้ `storesDirs` ชี้หลาย path พร้อมกัน — ต้องมี path เดียว (`./app/stores/**`)
5. ข้อมูลที่ทั้ง client และ server ต้องรู้ (รหัสสถานี, เลขขั้นตอน, รูปแบบ TAG) ให้อยู่ใน `shared/` เท่านั้น ห้ามประกาศซ้ำ
6. **ก่อนเขียนของใหม่ ให้อ่าน [docs/CONVENTIONS.md](docs/CONVENTIONS.md) ก่อนเสมอ** — มีตารางบอกว่าอะไรมี component/helper อยู่แล้ว ห้ามเขียนซ้ำ

## โดเมนของระบบ (ต้องเข้าใจก่อนเขียนโค้ด logic)

### 5 สถานี ไม่ใช่สายการผลิตเส้นตรงเดียว:
- **S1 เครื่องเคลือบ ขาวผ่อง/PVC** — Input: วัตถุดิบตั้งต้น → Output: WIP1
- **S2 เครื่องเคลือบ PVC** — Input: WIP1 (จาก S1) → Output: WIP2
- **S3 เครื่องเคลือบสี ปรุลาย** — Input: คัดบอร์ด (วัสดุอิสระ ไม่เกี่ยว S1/S2) → Output: FG
- **S4 เครื่องตัด&แพ็ค ออโต้ T-Bar 1** — Input: เลือกได้ WIP1 (จาก S1) หรือ WIP2 (จาก S2) → Output: FG
- **S5 เครื่องตัด&แพ็ค ออโต้ T-Bar 2** — Input: คัดบอร์ด (เหมือน S3) → Output: FG

*S1→S2 เป็นสายต่อเนื่อง ส่วน S3, S4, S5 เป็น 3 ไลน์อิสระที่ผลิต FG แยกกัน S1 ส่งต่อได้ 2 ปลายทาง (S2 หรือ S4) — อย่า hardcode ว่า S1 ส่งไป S2 เสมอ*

### S1 ใช้ "กระดานข้อมูลเข้า/ออก" ไม่ใช่ฟอร์ม 4 ขั้นตอน:
`/s/S1/board?job=<id>` — สแกน TAG WIP จากคัดบอร์ดสะสมหลายใบใน 1 งาน แล้วออกรหัสใหม่ (LOT + OUT CODE) ทีละใบ
คุมด้วย `workMode` ใน `STATIONS` (`board` = S1, `steps` = S2–S5) ห้ามเช็ค `if (station === 'S1')` เอง
ยอดสรุป: แผ่นเข้า • แผ่นออก • คงค้าง (HD) = เข้า−ออก−ตัดทิ้ง • ตัดทิ้ง — server ปฏิเสธถ้าคงค้างติดลบ

### ทุกสถานีต้องสร้าง "งาน (job)" ก่อนเสมอ:
เข้าสถานี → หน้างาน `/s/S1` (กำลังแปรรูป / แปรรูปแล้ว) → "สร้างงานแปรรูป" (วันที่, กะ, พนักงานหลายคน, เครื่อง) → บันทึกขั้นตอน 1–4 → กดปุ่ม "จบงาน"
- ทุกแถวใน ledger ต้องมี `jobId` — ไม่มี job = server ปฏิเสธ (400)
- job ปิดด้วยการกดปุ่มเท่านั้น (1 job บันทึกได้หลายล็อต) job ที่ปิดแล้วบันทึกเพิ่มไม่ได้
- กะ/เครื่อง/พนักงาน อยู่ที่ job — ขั้นตอนที่ 2 แค่แสดงยืนยัน ห้ามทำให้แก้ได้

### ทุกสถานีมี 4 ขั้นตอนเหมือนกัน (ใช้ pattern เดียวกันในโค้ด):
1. **รับวัตถุดิบ/WIP เข้าสถานี** — ตรวจนับ เทียบเอกสาร/TAG
2. **บันทึกข้อมูลก่อนผลิต (เครื่อง/กะ/สถานะ)** — S3 มีฟอร์ม "ตั้งค่าสี" เพิ่ม (ลูกกลิ้ง 3 ชุด ชุดละ 9 ค่า)
3. **ผลิต/แปรรูปตามมาตรฐานโซนเครื่อง** — ออก TAG ใหม่ + แผ่นเสีย ต้องกรอกทุกครั้งก่อนปิดล็อต แม้เป็น 0 ก็ต้องกดยืนยัน
4. **ส่งต่อสถานีถัดไป (S1, S2) หรือ เซ็นรับ FG เข้าคลัง (S3, S4, S5)** — กฎตายตัว: "ไม่เซ็นรับ = ไม่ถือเป็น FG"

**กะมี 2 กะ**: กะเช้า, กะดึก (เก็บใน DB เป็น `MORNING` / `NIGHT` แสดงผลด้วย `shiftLabel()`)

### คำศัพท์ที่ต้องใช้ให้ตรง (มาจาก AppSheet เดิม เพื่อให้พนักงานคุ้นคำเดิม):
- **"แผ่นเสีย"** ไม่ใช่ "Scrap" ในทุก UI ที่ผู้ใช้เห็น (โค้ด/ตัวแปรภายในใช้ scrap หรือ defect เป็นภาษาอังกฤษได้ปกติ)
- **TAG** = ป้ายกำกับล็อตสินค้า มีเลขรูปแบบ `[รหัสสินค้า]-[วันที่][กะ][ลำดับ]` เช่น `B39P-B10218260718A050100`

## กฎการเขียน API (`server/api`)
1. ทุก endpoint ที่บันทึกข้อมูล (TAG movement, ปิดกะ, เซ็นรับ FG) ต้องรับ **idempotency key** (client-generated UUID) เพื่อรองรับกรณีมือถือส่งซ้ำตอนเน็ตหลุด — ห้ามลืมจุดนี้
2. Ledger การเคลื่อนไหวของ TAG เป็น append-only ห้าม UPDATE/DELETE ย้อนหลัง ถ้าต้องแก้ ให้บันทึกรายการกลับทางแทน
3. ยอดสมดุล (รับเข้า = ผลิตออก + แผ่นเสีย + คงค้าง) ต้อง validate ฝั่ง server เสมอ ไม่พึ่ง validation ฝั่ง client อย่างเดียว
4. การเช็คสิทธิ์ผู้ใช้ (พนักงาน / หัวหน้า / คลัง / admin) เช็คจาก session ที่ Nuxt เก็บเอง ไม่ต้องยิงกลับไปถาม Laravel ทุก request
5. ทุก endpoint ใช้ `defineApiHandler` จาก `server/utils/api.ts` — ห้ามเขียน try/catch เองและห้ามคืน shape อื่นนอกจาก `{ success, data }`
6. การบันทึกแบบ idempotent ให้ใช้ `createIdempotent` จาก `server/utils/ledger.ts` คู่กับคอลัมน์ `idempotency_key` ที่ unique

## สิ่งที่ยังไม่ยืนยัน (ถามผู้ใช้ก่อนสมมติเอง)
- S5 ใช้ฟอร์มแบบเดียวกับ S4 ทุกจุดหรือไม่ (ตอนนี้สมมติว่าเหมือน)
- S3 มีสองโหมดจริงหรือไม่ (ส่ง FG ตรง vs ส่งเป็นแผ่นรอแพ็คไปสถานีอื่น)
- เกณฑ์ตัวเลข (Yield เป้า, ของเสียเกินกี่ % ถือว่าผิดปกติ) — เป็นค่าที่ต้องให้หัวหน้ากำหนด ห้ามเขียน hardcode เป็นค่าสุดท้าย
