# สถาปัตยกรรมของโค้ด

## หลักคิด

โค้ดแบ่งเป็น 4 ชั้น และ **ข้อมูลโดเมนมีแหล่งความจริงเดียว**:

```text
shared/     ← ความจริงของโดเมน (5 สถานี, 4 ขั้นตอน, type, TAG, format) ไม่ผูกกับ Vue หรือ DB
   ↑                 ↑
app/ (UI)        server/ (API)
   ↑                 ↑
pages/stores     prisma/schema.prisma → SQL Server
```

กฎเหล็ก: ถ้าข้อมูลหนึ่งชิ้นต้องรู้กันทั้งสองฝั่ง (เช่น รหัสสถานี, เลขขั้นตอน) ให้อยู่ใน `shared/` เท่านั้น

## ชั้น `shared/`

| ไฟล์ | หน้าที่ |
| --- | --- |
| `types/finishing.ts` | type ของโดเมนทั้งหมด (`StationId`, `ShiftCode`, `WorkRecordInput`, …) |
| `constants/stations.ts` | ข้อมูล 5 สถานี + helper (`toStationId`, `destinationLabel`) |
| `constants/shifts.ts` | กะเช้า/กะดึก + `shiftLabel()` |
| `constants/pvc-types.ts` | รายการชนิด PVC ที่เลือกได้ตอนสร้างงาน |
| `utils/job.ts` | รหัสงาน `JOB-S1-260925-001` และ helper ของ job |
| `constants/steps.ts` | ข้อมูล 4 ขั้นตอน + helper (`getStep`, `toStepNumber`) |
| `utils/tag.ts` | ถอดบาร์โค้ด TAG คัดบอร์ด (`parseTagBarcode`) และประกอบ Lot/เลข TAG ใหม่ |
| `utils/format.ts` | ฟอร์แมตวันที่ไทย, จำนวน, %, yield, idempotency key |

## ชั้น `app/` (UI)

### components

| โฟลเดอร์ | ใช้ทำอะไร | ตัวอย่าง |
| --- | --- | --- |
| `ui/` | primitive ที่ไม่รู้จักโดเมน ใช้ซ้ำได้ทุกหน้า | `BigButton`, `FormField`, `TextInput`, `NumberInput`, `SelectInput`, `SegmentedControl`, `CheckboxList`, `RadioList`, `SectionCard`, `StatCard`, `StatusPill`, `StationChip`, `AlertBanner` |
| `finishing/` | เฉพาะ flow การผลิต | `JobForm`, `JobCard`, `ActiveJobBar`, `Step1Receive`…`Step4Transfer`, `StepCard`, `StepNavigator`, `StationHeader`, `StationCard`, `ColorSetupMatrix`, `PackagingMaterialsForm`, `QrScanner`, `SignaturePad` |
| `layout/` | โครงหน้าจอ | `AppSidebar`, `AppTopBar`, `AppBottomDock`, `AppFooter`, `DbStatusButton` |

`StepCard` คือโครงร่วมของทั้ง 4 ขั้นตอน (หัวข้อ → เนื้อหา → ปุ่มยืนยัน) ทำให้ `StepN*.vue` เหลือแค่ฟอร์มของตัวเอง
กระดานของ S1 ประกอบจาก `BoardSummary` + `WipInPanel` + `WipOutPanel`

### stores (Pinia)

| store | ถืออะไร |
| --- | --- |
| `session` | ใครทำงาน, กะไหน, สถานีไหน, ขั้นตอนไหน + getter รายการสถานี |
| `jobs` | รายการงานของสถานี (กำลังแปรรูป/แปรรูปแล้ว), งานที่เปิดอยู่, สร้างงาน, จบงาน |
| `board` | กระดานเข้า/ออกของงาน (S1): รายการสแกนเข้า, รหัสที่ออก, ยอดสรุป, ตัดทิ้ง |
| `production` | ฟอร์มของล็อตที่กำลังทำ (ขั้น 1–4), การบันทึกลง ledger, `resetLot()` |
| `system` | สถานะการเชื่อมต่อ DB และประวัติรายการล่าสุด + ยอดรวมสำหรับหน้าแรก |

Step component อ่าน/เขียน store ตรง ๆ จึงไม่ต้องส่ง props/emit ไล่ชั้น (เดิม page ส่ง `v-model` กว่า 15 ตัวลงไป)

### composables / utils / constants

| ไฟล์ | หน้าที่ |
| --- | --- |
| `composables/useAuth.ts` | ที่เดียวที่แตะ cookie `auth_token` |
| `composables/useStationNav.ts` | อ่านสถานี/ขั้นตอนจาก URL และย้ายขั้นตอนผ่าน URL |
| `utils/api.ts` | ที่เดียวที่รู้ path ของ `server/api/*` |
| `utils/routes.ts` | ที่เดียวที่ประกอบ path `/s/:station` และ `/s/:station/:step?job=` |
| `constants/ui.ts` | class ของ card/label/input ที่ใช้ซ้ำ |
| `constants/station-theme.ts` | Tailwind class ตามโทนสีสถานี (ที่เดียวในระบบ) |
| `constants/step-icons.ts` | ผูก icon ของ lucide เข้ากับขั้นตอน (แยกออกจาก shared เพราะ shared ห้ามผูกกับ Vue) |

## ชั้น `server/`

| ไฟล์ | หน้าที่ |
| --- | --- |
| `utils/prisma.ts` | PrismaClient instance เดียวของทั้งระบบ |
| `utils/jobs.ts` | แปลงแถว job เป็น DTO, ออกรหัสงาน, สรุปยอดของงาน |
| `utils/board.ts` | อ่านกระดานเข้า/ออก + คำนวณยอดสรุป (เข้า/ออก/คงค้าง/ตัดทิ้ง) |
| `utils/api.ts` | `defineApiHandler` (ครอบ try/catch + รูปแบบ response), `readRequiredBody`, `assertStationId` |
| `utils/ledger.ts` | `createIdempotent` — เขียน ledger ซ้ำด้วย key เดิมแล้วได้แถวเดิม |
| `api/*` | endpoint แต่ละตัว เหลือเฉพาะ logic จริง |

ทุก endpoint คืนรูปแบบเดียวกัน `{ success: true, data }` และโยน error เป็น `createError` ที่มีข้อความภาษาไทย

## การไหลของข้อมูลเมื่อกด "บันทึก" 1 ครั้ง

```text
StepN.vue  ──emit submit──►  pages/s/[station]/[step].vue
                                   │
                                   ▼
                     production.submitStep(step)
                        • ตรวจว่ามี job ที่เปิดอยู่ ถ้าไม่มีจะไม่ยิง API
                        • ประกอบ WorkRecordInput จาก session + production + job
                        • แนบ idempotencyKey (UUID)
                                   │
                          app/utils/api.ts  ──POST /api/records──►
                                                        server/api/records.post.ts
                                                          • ตรวจ field / รหัสสถานี / ยอดสมดุล
                                                          • createIdempotent → prisma.workRecord.create
                                                                    │
                                   ◄────── { success, data } ───────┘
                        • ตั้งข้อความสำเร็จ แล้ว system.refreshRecords()
```

## เส้นทาง (routing)

| path | หน้า |
| --- | --- |
| `/login` | เลือกพนักงาน กะ และสถานี แล้วเริ่มกะ |
| `/` | สรุปยอด + เลือกสถานี |
| `/s/:station` | **หน้างาน (job)** — กำลังแปรรูป / แปรรูปแล้ว / เริ่มงานใหม่ |
| `/s/:station/board?job=<id>` | **กระดานเข้า/ออก** ของงาน (สถานี `workMode: board` — ตอนนี้คือ S1) |
| `/s/:station/:step?job=<id>` | บันทึกขั้นตอนของงานที่เปิดอยู่ เช่น `/s/S3/2?job=12` |

เลขงานอยู่ใน query string เพื่อให้รีเฟรชหน้าจอหรือแชร์ลิงก์แล้วยังอยู่ที่งานเดิม
เข้าหน้าขั้นตอนโดยไม่มีเลขงาน (หรืองานถูกปิดไปแล้ว) → เด้งกลับไปหน้างานอัตโนมัติ

URL เป็นแหล่งความจริงของ "สถานี + ขั้นตอน" — รีเฟรชหรือแชร์ลิงก์แล้วกลับมาที่เดิมได้
ลิงก์เก่าแบบ `/s/S1/scan` ยังเปิดได้ (ค่าที่ไม่ใช่ตัวเลขจะถูกตีเป็นขั้นตอนที่ 1)
