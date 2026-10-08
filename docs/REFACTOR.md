# สรุปการเปลี่ยนแปลง

## รอบที่ 4 (2026-09-25): กระดานข้อมูลเข้า/ออกของ S1

ทำตามหน้าจอ "ระบบคัดบอร์ด : ไลน์ 3" ของระบบเดิม — S1 เปลี่ยนจากฟอร์มทีละล็อต เป็น **กระดานสะสมรายการ**

| เรื่อง | เดิม | ตอนนี้ |
| --- | --- | --- |
| หน้าทำงาน S1 | ฟอร์ม 4 ขั้นตอน ทีละล็อต | กระดาน `/s/S1/board?job=<id>` — สแกนเข้าหลายใบ / ออกรหัสหลายใบในงานเดียว |
| ยอดสรุป | ไม่มี | แผ่นเข้า • แผ่นออก • คงค้าง (HD) • ตัดทิ้ง (แก้ไขได้ พร้อมตรวจยอดติดลบ) |
| LOT ที่ออกใหม่ | `FNS1260925M` (ชั่วคราว) | `260925A501` = วันที่ + ซีรีส์ + ลำดับ (ถอดจากระบบเดิม) |
| OUT CODE | `B494-AV0212-FNS1260925M001` | `BX58-AV0212L4+++++++0076` = รหัสขาออก + Lot ต้นทาง + จำนวน |
| บาร์โค้ดที่อ่านได้ | แบบมีตัวคั่น `:` เท่านั้น | รองรับแบบติดกันด้วย (`W499-AV0212260924B633076`) |
| S2–S5 | 4 ขั้นตอน | เหมือนเดิม (คุมด้วย `workMode` ใน `STATIONS`) |

ของใหม่: ตาราง `wip_entries` + `jobs.trim_qty` + `issued_tags.wip_entry_id/out_item_code` •
`GET /api/jobs/:id/board`, `POST /api/jobs/:id/entries`, `DELETE .../entries/:entryId`, `POST /api/jobs/:id/trim` •
`app/stores/board.ts` • `BoardSummary`, `WipInPanel`, `WipOutPanel` • `buildFgLot()`, `buildOutCode()`, `suggestOutItemCode()`

หลังดึงโค้ดรอบนี้: `npm run db:generate && npm run db:push --accept-data-loss`

## รอบที่ 3 (2026-09-25): flow TAG ของ S1 + จัดพื้นที่จอมือถือ

**งานจริงของ S1** = สแกน TAG WIP จากแผนกคัดบอร์ด → ออกเป็น WIP ของฟินิชชิ่ง (TAG ใหม่ / Lot ใหม่ / running ใหม่)

| เรื่อง | เดิม | ตอนนี้ |
| --- | --- | --- |
| ขั้นตอนที่ 1 | สแกนได้แค่เลข TAG เฉย ๆ | ถอดบาร์โค้ดเป็น รหัสสินค้า / ขนาด / Lot / จำนวน ให้อัตโนมัติ (แก้ไขได้ทุกช่อง) |
| เลข TAG ใหม่ | สุ่มฝั่ง client (`draftTagCode`) | **server ออกให้** — Lot + running ต่อ Lot, unique ที่ระดับ DB |
| ความสัมพันธ์ TAG | ไม่มีการผูก | 1 TAG เข้า → 1 TAG ออก (คอลัมน์ `source_tag_code` เป็น unique) |
| ขั้นตอนที่ 3 | โชว์เลข TAG ที่สุ่มมา | ปุ่ม "ออก TAG ใหม่" + การ์ดสรุปข้อมูล TAG และปิดปุ่มบันทึกจนกว่าจะออก TAG |

ของใหม่: ตาราง `issued_tags` • `POST /api/tags/issue` • `parseTagBarcode()`, `buildWipLot()`, `buildWipTagCode()` • `IssuedTagPreview.vue`

### บั๊กที่แก้: กด "เปิดงานนี้" แล้วเด้งกลับ

งานที่เลือกอยู่ถูกเก็บไว้ใน Pinia อย่างเดียว พอรีเฟรชหน้าจอ (Responsively รีโหลดทุกจอเวลาเปลี่ยน URL)
หรือเปิดลิงก์ `/s/S1/3` ตรง ๆ store จะว่าง ระบบจึงคิดว่า "ยังไม่ได้เลือกงาน" แล้วเด้งกลับหน้ารายการงาน

แก้โดยย้ายเลขงานไปไว้ใน URL ตามกติกาเดิมของโปรเจกต์ (URL = แหล่งความจริง):
`/s/S1/3?job=12` — รีเฟรชหรือแชร์ลิงก์แล้วยังอยู่ที่งานและขั้นตอนเดิม
ทุกปุ่มที่ย้ายขั้นตอน (แถบล่าง, sidebar, ปุ่มถัดไป/ก่อนหน้า) พาเลขงานไปด้วยผ่าน `stationStepPath()`

### จอมือถือ: เพิ่มพื้นที่เนื้อหา

- ขอบจอ `px-4 py-6` → `px-3 py-3` (จอเล็ก) และช่องไฟระหว่างการ์ดแคบลง
- หัวสถานีย่อเหลือบรรทัดเดียว (ป้ายเล็กลง, ซ่อนบรรทัด INPUT→OUTPUT และปุ่มสถานะ DB ที่มีในเมนูอยู่แล้ว)
- **ซ่อนแท็บ 4 ขั้นตอนบนมือถือ** เพราะซ้ำกับแถบปุ่มล่างจอ (thumb dock) อยู่แล้ว
- ซ่อน footer บนมือถือ, แถบบน/แถบล่างเตี้ยลง, การ์ดงานและ padding ของการ์ดแน่นขึ้น
- ตารางการ์ดงาน: มือถือ 1 คอลัมน์ → แท็บเล็ต 2 → จอใหญ่ 3


## รอบที่ 2 (2026-09-25): เพิ่มระบบงาน (job) + เปลี่ยนชื่อกะ

ตามหน้าจอ AppSheet เดิม ("ขั้นตอนการเริ่ม job") ทุกสถานีต้อง **สร้างงานก่อน** จึงจะบันทึกขั้นตอนได้

| เรื่อง | เดิม | ตอนนี้ |
| --- | --- | --- |
| การเริ่มงาน | ไม่มี — เข้าหน้าสถานีแล้วบันทึกได้เลย | ต้อง "สร้างงานแปรรูป" (วันที่ + กะ + พนักงานหลายคน + เครื่อง) ก่อน |
| หน้าสถานี | เข้า `/s/S1/1` ทันที | `/s/S1` = รายการงาน (กำลังแปรรูป / แปรรูปแล้ว) → เลือกงาน → `/s/S1/1` |
| กะ | กะ A / กะ B | **กะเช้า / กะดึก** (เก็บเป็น `MORNING` / `NIGHT`) |
| เครื่องจักร | dropdown `M-01`…`M-03` เหมือนกันทุกสถานี | `machines` รายสถานี (S1 = เครื่องเคลือบขาวผ่อง / เครื่องลามิเนต / ฟอล์ยบนกันร้อน) |
| พนักงาน | 1 คนต่อ session | เลือกได้หลายคนต่อ 1 job |
| ขั้นตอนที่ 2 | เลือกกะ + เครื่องซ้ำอีกรอบ | แสดงข้อมูลจากใบงาน (อ่านอย่างเดียว) + ตั้งค่าสีเฉพาะ S3 |
| การจบงาน | ไม่มีแนวคิดนี้ | ปุ่ม "จบงาน" ย้าย job ไปกลุ่ม "แปรรูปแล้ว" (บันทึกเพิ่มไม่ได้) |

เพิ่มเติม: **ชนิด PVC** ในฟอร์มสร้างงานของ S1 (คอลัมน์ `jobs.pvc_type`, รายการที่ [`shared/constants/pvc-types.ts`](../shared/constants/pvc-types.ts), component `<RadioList>` แบบมีช่องค้นหา) — สถานีที่ `pvcTypes` ว่างจะไม่เห็นช่องนี้

ของใหม่: ตาราง `jobs` + คอลัมน์ `work_records.job_id` • `GET/POST /api/jobs`, `POST /api/jobs/:id/finish` •
`app/stores/jobs.ts` • `JobForm`, `JobCard`, `ActiveJobBar`, `CheckboxList` • `shared/constants/shifts.ts`, `shared/utils/job.ts`, `app/constants/employees.ts`

หลังดึงโค้ดรอบนี้: `npm run db:generate && npm run db:push` (มีตารางใหม่และคอลัมน์ใหม่)
⚠️ `work_records.job_id` เป็นคอลัมน์บังคับ — ถ้ามีข้อมูลเดิมอยู่ต้องสร้าง job ย้อนหลังให้ก่อน (ฐานข้อมูล dev ตอนนี้ว่าง จึง push ทับได้เลย)

---

## รอบที่ 1 (2026-09-25): จัดโครงสร้าง + ลดโค้ดซ้ำ

เอกสารนี้บันทึกว่าโค้ดถูกจัดใหม่อย่างไร เพื่อให้คนที่เคยอ่านโค้ดเวอร์ชันก่อนหน้าตามต่อได้

## โค้ดซ้ำที่ถูกกำจัด

| โค้ดซ้ำเดิม | ซ้ำกี่ที่ | แก้เป็น |
| --- | --- | --- |
| `switch (id)` แจกสีสถานี | 5 (`layouts/default.vue`, `pages/index.vue`, `pages/login.vue`, `StationHeader.vue`, store) | `app/constants/station-theme.ts` + `<StationChip>` |
| ข้อมูลสถานี (`stationList` + `stationDetails` มีชื่อสถานีคนละชุด) | 2 ใน store เดียว | `shared/constants/stations.ts` ชุดเดียว |
| นิยาม 4 ขั้นตอน | 2 (`layouts/default.vue`, หน้า `[step].vue`) | `shared/constants/steps.ts` + `app/constants/step-icons.ts` |
| การ์ดสถานีในหน้าแรก | 2 บล็อกเหมือนกันทั้งบล็อก | `<StationCard>` + วนลูปกลุ่ม |
| การ์ด KPI หน้าแรก | 4 บล็อก | `<StatCard>` |
| หัวการ์ด + ปุ่มยืนยันของแต่ละขั้นตอน | 4 | `<StepCard>` |
| `<input class="w-full bg-slate-50 border ...">` | ~20 | `<TextInput> <NumberInput> <SelectInput>` + `app/constants/ui.ts` |
| ปุ่มเลือก 2 ตัวเลือก (กะ A/B, WIP1/WIP2, ปลายทาง) | 4 ชุด | `<SegmentedControl>` (Reka UI) |
| ช่องกรอกลูกกลิ้ง 9 ช่อง × 3 ชุด | 27 บล็อก | `ColorSetupMatrix.vue` วนจาก array นิยามฟิลด์ |
| `try/catch` + รูปแบบ response ใน endpoint | 6 | `defineApiHandler` ใน `server/utils/api.ts` |
| `CREATE TABLE` ฝังใน endpoint (ซ้ำกับ `schema.prisma`) | 3 | นิยามที่ `prisma/schema.prisma` ที่เดียว |
| type `'S1'|'S2'|...` เขียนเอง | 8 ไฟล์ | `StationId` ใน `shared/types/finishing.ts` |

## ไฟล์เก่า → ใหม่

| เดิม | ตอนนี้ |
| --- | --- |
| `app/stores/finishing.ts` (244 บรรทัด ทำทุกอย่าง) | `stores/session.ts` + `stores/production.ts` + `stores/system.ts` |
| `app/layouts/default.vue` (436 บรรทัด) | 30 บรรทัด + `components/layout/{AppSidebar,AppTopBar,AppBottomDock,AppFooter,DbStatusButton}.vue` |
| `app/components/ui/StationBadge.vue` (ไม่ถูกใช้, ธีมมืด) | ลบ — ใช้ `StationChip.vue` |
| `app/components/ui/ToggleGroup.vue` (ไม่ถูกใช้, ธีมมืด) | ลบ — ใช้ `SegmentedControl.vue` |
| `server/utils/db.ts` (mssql pool + สร้าง DB/ตารางเอง) | ลบ — ใช้ Prisma อย่างเดียว |
| `server/api/health.ts` | `server/api/health.get.ts` (Prisma) |

## พฤติกรรมที่เปลี่ยนไป (ตั้งใจ)

1. **URL เก็บขั้นตอนจริง** — เดิมทุกลิงก์ชี้ `/s/S1/scan` แล้วขั้นตอนอยู่ใน store อย่างเดียว (รีเฟรชแล้วกลับไปขั้น 1)
   ตอนนี้เป็น `/s/S1/3` รีเฟรช/แชร์ลิงก์ได้ ลิงก์เก่ายังเปิดได้ (ตีเป็นขั้นตอนที่ 1)
2. **ตัวเลข KPI หน้าแรกเป็นของจริง** — เดิม hardcode `1,280 / 42 / 96.8%` ตอนนี้คำนวณจากรายการที่บันทึกจริง
3. **ขั้นตอนที่ 4 ของ S3/S4/S5 ล็อกปุ่มจนกว่าจะเซ็น** — บังคับกฎ "ไม่เซ็นรับ = ไม่ถือเป็น FG"
4. **server ตรวจยอดสมดุล** — ผลิต + แผ่นเสีย เกินจำนวนที่รับเข้า จะถูกปฏิเสธด้วย HTTP 400
5. **idempotency ทำงานจริง** — `idempotencyKey` มี unique index แล้ว ส่งซ้ำได้แถวเดิม (เดิมรับค่ามาแล้วส่งกลับเฉย ๆ)
6. **เช็ค DB ครั้งเดียวตอนเปิดแอป** — เดิมทุกหน้าสถานียิง `/api/health` ใหม่ทุกครั้งที่ mount
7. **สแกน TAG หลายตัวในหน้าเดียวได้** — `QrScanner` ใช้ element id เฉพาะตัวแทน id คงที่ `qr-reader`
8. **`login.vue` ไม่แตะ cookie เอง** — ผ่าน `useAuth().startLocalSession()`

## ต้องทำหลังดึงโค้ดนี้

```bash
npm install        # ตัด mssql, tedious, @types/mssql, @lucide/vue ที่ไม่ได้ใช้แล้วออก

# ปิด dev server ก่อน ไม่งั้น generate จะติด EPERM (Windows ล็อกไฟล์ engine ไว้)
npm run db:generate

# ตารางรุ่นเก่าที่สร้างด้วย raw SQL ต้องเคลียร์ก่อน (ดูหัวข้อถัดไป)
npx prisma db execute --schema prisma/schema.prisma --file prisma/sql/drop-legacy-tables.sql
npm run db:push
```

### ปัญหาที่จะเจอตอน `db:push` ครั้งแรก

```text
Error: The object 'DF__work_reco__creat__4AB81AF0' is dependent on column 'created_at'.
```

ตารางเดิมถูกสร้างโดย `server/utils/db.ts` ด้วย `created_at DATETIME DEFAULT GETDATE()`
โดยไม่ได้ตั้งชื่อ constraint SQL Server เลยตั้งชื่อสุ่มให้ พอ Prisma จะแก้คอลัมน์จึงติด constraint นี้

วิธีแก้: รัน [`prisma/sql/drop-legacy-tables.sql`](../prisma/sql/drop-legacy-tables.sql) ก่อน `db:push`
สคริปต์นี้ **ดรอปเฉพาะตารางที่ไม่มีข้อมูลเลย** ถ้าตารางไหนมีข้อมูลจริงจะข้ามไปพร้อมข้อความเตือน — กรณีนั้นต้องเขียน migration ย้ายข้อมูลเอง (คอลัมน์เดิม `barcode`, `defects` ไม่ตรงกับ schema ใหม่)

### รัน production build

`.output/server/index.mjs` **ไม่อ่านไฟล์ `.env`** (Nitro โหลด `.env` ให้เฉพาะตอน `npm run dev`)
ต้องตั้ง `DATABASE_URL` / `SANCTUM_API_URL` เป็น environment variable ของ process หรือของ site ใน IIS

## งานที่ยังเหลือ

- ออกเลข TAG จากฝั่ง server (ตอนนี้ `draftTagCode` ยังสุ่มลำดับฝั่ง client)
- ต่อรายชื่อพนักงานจริงในหน้า login และบังคับ PIN ผ่าน `useAuth().login()`
- endpoint ปิดกะยังไม่มีปุ่มเรียกใช้ใน UI
- ยังไม่มีชุดทดสอบอัตโนมัติ (ยังไม่ได้ติดตั้ง vitest/vue-tsc)
