# API (`server/api`)

## ข้อตกลงร่วมของทุก endpoint

**สำเร็จ** — HTTP 200

```json
{ "success": true, "data": { } }
```

**ผิดพลาด** — HTTP 400 / 401 / 500 พร้อมข้อความภาษาไทยที่แสดงให้ผู้ใช้หน้างานได้เลย

```json
{ "statusCode": 400, "statusMessage": "ข้อมูลไม่ครบ: tagCode, idempotencyKey" }
```

ฝั่ง client อ่านข้อความด้วย `apiErrorMessage(err)` จาก `app/utils/api.ts`

### idempotency

ทุก endpoint ที่ **เขียน** ข้อมูลต้องรับ `idempotencyKey` (UUID จาก client)

- ส่งซ้ำด้วย key เดิม → ได้แถวเดิมกลับไป ไม่เกิดข้อมูลซ้ำ (`duplicated: true`)
- สร้าง key ด้วย `newIdempotencyKey()` จาก `shared/utils/format.ts`
- ห้ามใช้ key ซ้ำข้ามล็อต — 1 การกดยืนยัน = 1 key

---

## `GET /api/health`

ตรวจว่าคุย SQL Server ได้จริง (คืน 200 เสมอ ดูที่ `data.connected`)

```json
{ "success": true, "data": {
  "connected": true, "provider": "sqlserver",
  "version": "Microsoft SQL Server 2019 ...",
  "checkedAt": "2026-09-25T02:10:00.000Z",
  "message": "เชื่อมต่อฐานข้อมูลสำเร็จ"
} }
```

## `GET /api/jobs`

รายการงานของสถานี

| query | ค่า | หมายเหตุ |
| --- | --- | --- |
| `stationId` | `S1`–`S5` | ไม่ระบุ = ทุกสถานี |
| `status` | `active` / `done` | ไม่ระบุ = ทั้งหมด |
| `limit` | ค่าเริ่มต้น 50 | สูงสุด 200 |

แต่ละงานมียอดรวมของ ledger ติดมาด้วย (`recordCount`, `producedQty`, `defectQty`)

```json
{ "success": true, "data": [{
  "id": 1, "code": "JOB-S1-260925-001", "stationId": "S1",
  "shift": "MORNING", "machine": "เครื่องเคลือบขาวผ่อง", "pvcType": "PVC 567",
  "operators": ["นิชิตา แถวถึก (แพร)", "ชนายุทธ สุพะสอน (บอม)"],
  "status": "active", "startedAt": "2026-09-25T00:00:00.000Z",
  "finishedAt": null, "finishedBy": null,
  "recordCount": 1, "producedQty": 400, "defectQty": 10
}] }
```

## `POST /api/jobs`

สร้างงานแปรรูปใหม่ (ปุ่ม "สร้างงานแปรรูป")

```jsonc
{
  "stationId": "S1",                  // จำเป็น
  "shift": "MORNING",                 // จำเป็น — MORNING (กะเช้า) หรือ NIGHT (กะดึก)
  "machine": "เครื่องเคลือบขาวผ่อง",    // จำเป็น — ต้องอยู่ใน machines ของสถานีนั้น
  "pvcType": "PVC 567",               // จำเป็นเมื่อสถานีมี pvcTypes (S1) — ต้องอยู่ในรายการ
  "operators": ["ชื่อพนักงาน"],        // จำเป็น — อย่างน้อย 1 คน
  "startedAt": "2026-09-25T00:00:00Z",// จำเป็น
  "idempotencyKey": "uuid",           // จำเป็น
  "note": "หมายเหตุ"
}
```

รหัสงานออกโดย server เป็น `JOB-[สถานี]-[YYMMDD]-[ลำดับ]` — client ไม่ต้องส่งมา

การตรวจฝั่ง server: รหัสสถานีถูกต้อง • กะเป็น MORNING/NIGHT • เครื่องตรงกับสถานี • ชนิด PVC ตรงกับรายการของสถานี (ถ้าสถานีนั้นต้องระบุ) • มีพนักงานอย่างน้อย 1 คน • วันที่ใช้ได้

## `POST /api/jobs/:id/finish`

จบงาน (ปุ่ม "จบงาน") — ย้ายจาก "กำลังแปรรูป" ไป "แปรรูปแล้ว"

```jsonc
{ "finishedBy": "ชื่อผู้ปิดงาน", "idempotencyKey": "uuid", "note": "หมายเหตุ" }
```

- งานที่ปิดแล้วกดซ้ำได้ (คืนข้อมูลเดิม ไม่เขียนทับเวลาที่ปิดครั้งแรก)
- ไม่พบงาน → 404

## `GET /api/records`

ประวัติ ledger ล่าสุด

| query | ค่าเริ่มต้น | หมายเหตุ |
| --- | --- | --- |
| `limit` | 50 | สูงสุด 200 |
| `stationId` | – | กรองเฉพาะสถานี เช่น `S3` |
| `jobId` | – | กรองเฉพาะงานนั้น |

## `POST /api/records`

บันทึก 1 แถวลง ledger (append-only) — ใช้ในทุกขั้นตอน 1–4

```jsonc
{
  "stationId": "S3",            // จำเป็น
  "jobId": 12,                  // จำเป็น — งานที่ยัง "กำลังแปรรูป" เท่านั้น
  "step": 3,                    // จำเป็น (1–4)
  "status": "Step 3: 3. ผลิต & แผ่นเสีย", // จำเป็น
  "shift": "MORNING",           // จำเป็น — MORNING / NIGHT
  "idempotencyKey": "uuid",     // จำเป็น
  "operator": "พนักงาน A",
  "tagCode": "B39P-260925A0101",
  "producedQty": 480,
  "defectQty": 12,
  "inputSource": "BOARD",
  "destination": "WAREHOUSE",
  "signatureData": "data:image/png;base64,...",
  "details": { "machineNumber": "M-01", "receivedQty": 500, "rollerSets": [] }
}
```

การตรวจฝั่ง server:

- `stationId` ต้องเป็น S1–S5, `step` ต้องเป็น 1–4
- `jobId` ต้องมีอยู่จริง ยังไม่ถูกปิด และอยู่ที่สถานีเดียวกัน (ไม่ผ่าน → 400)
- ขั้นตอน ≥ 3: ถ้า `details.receivedQty > 0` แล้ว `producedQty + defectQty > receivedQty` → 400 (ยอดไม่สมดุล)

## `GET /api/jobs/:id/board`

กระดานของงาน: รายการเข้า + รายการออก + ยอดสรุป

```json
{ "success": true, "data": {
  "job": { },
  "entries": [{ "id": 1, "barcode": "W499-...076", "itemCode": "W499-AV0212", "quantity": 76,
                "issued": { "lot": "260925A501", "code": "BX58-AV0212...0076" } }],
  "totals": { "inQty": 207, "outQty": 207, "holdQty": 0, "trimQty": 0, "entryCount": 3, "issuedCount": 3 }
} }
```

`holdQty` (คงค้าง HD) = `inQty − outQty − trimQty`

## `POST /api/jobs/:id/entries`

สแกนรับเข้า 1 แถว

```jsonc
{ "barcode": "W499-AV0212260924B633076", "itemCode": "W499-AV0212", "quantity": 76,
  "sourceLot": "260924B633", "sizeText": null, "idempotencyKey": "uuid" }
```

บาร์โค้ดเดิมในงานเดียวกัน → คืนแถวเดิมพร้อม `duplicated: true` (ไม่เพิ่มซ้ำ)

## `DELETE /api/jobs/:id/entries/:entryId`

ลบแถวที่สแกนผิด — ทำได้เฉพาะแถวที่**ยังไม่ได้ออกรหัส** และงานยังไม่ปิด

## `POST /api/jobs/:id/trim`

อัพเดทจำนวนตัดทิ้ง (ปุ่ม "อัพเดทข้อมูล")

```jsonc
{ "trimQty": 12 }
```

ถ้าทำให้คงค้างติดลบ → 400 `"ยอดไม่สมดุล: เข้า 207 − ออก 207 − ตัดทิ้ง 7 ติดลบ"`

## `POST /api/tags/issue`

ออก TAG ใหม่ของฟินิชชิ่งจาก TAG ที่สแกนเข้ามาจากคัดบอร์ด (1 เข้า → 1 ออก)

```jsonc
{
  "stationId": "S1",                  // จำเป็น
  "jobId": 12,                        // จำเป็น — งานที่ยังเปิดอยู่
  "shift": "MORNING",                 // จำเป็น
  "code": "B494-AV0212 : 1.22 x 2.44 m. : L4123456076", // จำเป็น — TAG ต้นทางทั้งเส้น
  "itemCode": "B494-AV0212",          // จำเป็น — ใช้รหัสเดิมจาก TAG ที่สแกน
  "idempotencyKey": "uuid",           // จำเป็น
  "itemName": "รอติดFOIL ขอบลาด ...",
  "sizeText": "1.22 x 2.44 m.",
  "lot": "L4123456",                  // Lot ของคัดบอร์ด
  "quantity": 76,
  "issuedBy": "ชื่อพนักงาน"
}
```

ผลลัพธ์: เลข TAG ใหม่ + Lot + running ที่ server ออกให้

```json
{ "success": true, "data": {
  "code": "B494-AV0212-FNS1260925M001",
  "lot": "FNS1260925M", "running": 1, "quantity": 76,
  "sourceTagCode": "B494-AV0212 : 1.22 x 2.44 m. : L4123456076"
} }
```

- ส่ง TAG ต้นทางใบเดิมซ้ำ → ได้ใบเดิมกลับไปพร้อม `duplicated: true` (ไม่ออกเลขใหม่)
- งานที่ปิดแล้ว / ไม่พบงาน / คนละสถานี → 400

## `POST /api/tags/receive`

รับ TAG เข้าสถานี (ขั้นตอนที่ 1)

```jsonc
{ "tagCode": "B39P-...", "stationId": "S1", "operator": "พนักงาน A", "quantity": 500, "idempotencyKey": "uuid" }
```

## `POST /api/shifts/:id/close`

ปิดกะของสถานี

```jsonc
{ "stationId": "S4", "shift": "NIGHT", "closedBy": "หัวหน้ากะ", "totalPassed": 1280, "totalScrap": 42, "idempotencyKey": "uuid" }
```

## `POST /api/auth/login`

เข้าระบบผ่าน Laravel Sanctum

```jsonc
{ "employeeId": "12345", "pin": "1111" }
```

- ถ้าตั้ง `SANCTUM_API_URL` → Nuxt server ยิงต่อไปที่ Laravel แล้วส่ง token กลับให้ `useAuth` เก็บใน cookie
- ถ้าไม่ตั้ง → ตอน `npm run dev` จะคืน token ทดสอบ, ตอน production จะคืน 500 (กันเผลอขึ้นระบบโดยไม่มี auth จริง)
- token ถูกเก็บด้วย `useCookie('auth_token')` ที่ `app/composables/useAuth.ts` ที่เดียว

---

## เพิ่ม endpoint ใหม่

```ts
// server/api/example.post.ts
import { prisma } from '../utils/prisma'
import { assertStationId, defineApiHandler, readRequiredBody } from '../utils/api'
import { createIdempotent } from '../utils/ledger'

export default defineApiHandler(async (event) => {
  const body = await readRequiredBody<{ stationId: string; idempotencyKey: string }>(
    event, ['stationId', 'idempotencyKey']
  )
  const stationId = assertStationId(body.stationId)
  // ...
  return { ok: true }
}, 'ข้อความ error เริ่มต้นเมื่อระบบขัดข้อง')
```

อย่าเขียน `try/catch` เอง และอย่าใช้ raw SQL — `defineApiHandler` จัดการ error ให้แล้ว และทุกตารางนิยามไว้ที่ `prisma/schema.prisma`
