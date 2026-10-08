# ระบบบันทึกการผลิต แผนกฟินิชชิ่ง

ระบบบันทึกกระบวนการผลิตของแผนก "ฟินิชชิ่ง" สร้างขึ้นทดแทนแอป AppSheet เดิม
ใช้งานจริงหน้าเครื่องผ่านมือถือ/แท็บเล็ต — ออกแบบแบบ mobile-first ปุ่มใหญ่กดด้วยนิ้วโป้งได้ ตัวอักษรใหญ่อ่านง่ายในที่แสงจ้า

**การใช้งานหลัก:** เลือกสถานี → **สร้างงานแปรรูป** ด้วยวันที่/กะ/พนักงาน/เครื่อง → บันทึก 4 ขั้นตอน (รับเข้า → ตั้งค่า → ผลิต & แผ่นเสีย → ส่งต่อ/เซ็นรับ FG) → **จบงาน**

| หัวข้อ | รายละเอียด |
| --- | --- |
| Frontend / Backend | Nuxt 4 (Nitro server API ใน `server/api`) |
| ORM / Database | Prisma → SQL Server |
| State | Pinia (`app/stores`) |
| Styling | Tailwind CSS |
| Interactive component | Reka UI (headless) |
| Auth | Laravel Sanctum (ระบบเดิม) ผ่าน `server/api/auth/login` |
| Deploy | IIS (Windows Server) |

## เริ่มต้นใช้งาน

```bash
npm install                 # ติดตั้ง dependency (จะรัน nuxt prepare ให้อัตโนมัติ)
cp .env.example .env        # แล้วแก้ค่า DATABASE_URL ให้ตรงกับ SQL Server ของคุณ
npm run db:generate         # สร้าง Prisma client
npm run db:push             # สร้าง/อัปเดตตารางในฐานข้อมูลตาม prisma/schema.prisma
npm run dev                 # เปิด http://localhost:3000
```

> **ถ้า `db:generate` ขึ้น `EPERM ... query_engine-windows.dll.node`** ให้ปิด dev server ก่อน แล้วสั่งใหม่ — Windows ล็อกไฟล์ engine ไว้ขณะมีโปรเซสใช้งานอยู่
>
> **ถ้า `db:push` ขึ้น `The object 'DF__work_reco__creat__...' is dependent on column 'created_at'`** แปลว่าฐานข้อมูลยังมีตารางรุ่นเก่าที่สร้างด้วย raw SQL อยู่ ให้เคลียร์ก่อนแล้ว push ใหม่:
>
> ```bash
> npx prisma db execute --schema prisma/schema.prisma --file prisma/sql/drop-legacy-tables.sql
> ```
>
> สคริปต์นี้ดรอปเฉพาะตารางที่ไม่มีข้อมูลเลย (รายละเอียดใน [docs/REFACTOR.md](docs/REFACTOR.md))

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ทำอะไร |
| --- | --- |
| `npm run dev` | dev server พร้อม hot reload |
| `npm run build` / `npm run preview` | build production แล้วลองรันจากไฟล์ที่ build |
| `npm run db:generate` | สร้าง Prisma client ใหม่หลังแก้ `schema.prisma` |
| `npm run db:push` | ดันโครงสร้างตารางลง DB (ใช้ตอน dev) |
| `npm run db:migrate` | สร้าง migration แบบมีประวัติ (ใช้ตอนขึ้น production) |
| `npm run db:studio` | เปิด Prisma Studio ดูข้อมูลในตาราง |

## ตัวแปรสภาพแวดล้อม (`.env`)

| ตัวแปร | จำเป็น | คำอธิบาย |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | connection string ของ SQL Server (รูปแบบดูใน `.env.example`) |
| `SANCTUM_API_URL` | – | endpoint login ของ Laravel เดิม ถ้าเว้นว่างจะเข้าโหมดทดสอบเฉพาะตอน `npm run dev` |

## โครงสร้างโปรเจกต์

```text
shared/          domain ที่ใช้ร่วมกันทั้ง client และ server (types, ข้อมูล 5 สถานี, 4 ขั้นตอน, TAG, format)
app/
├── components/ui/          primitive ใช้ซ้ำได้ทุกหน้า (ปุ่ม, ฟอร์ม, การ์ด, ป้ายสถานี)
├── components/finishing/   feature เฉพาะ flow นี้ (4 ขั้นตอน, สแกน TAG, ลายเซ็น)
├── components/layout/      โครงหน้าจอ (sidebar, แถบบน, แถบล่างมือถือ, footer)
├── composables/            useAuth, useStationNav
├── constants/              class/ไอคอนของ UI ที่ผูกกับ Vue/Tailwind
├── stores/                 session, jobs, production, system (Pinia)
├── utils/                  api client, route builder
└── pages/                  login, index, s/[station] (หน้างาน job), s/[station]/[step] (4 ขั้นตอน)
server/
├── api/                    endpoint ทั้งหมด (health, records, tags, shifts, auth)
└── utils/                  prisma client, api handler, idempotent ledger
prisma/schema.prisma        นิยามตารางที่เดียวของระบบ
```

## เอกสารเพิ่มเติม

| เอกสาร | เนื้อหา |
| --- | --- |
| [docs/DOMAIN.md](docs/DOMAIN.md) | 5 สถานี, 4 ขั้นตอน, กะ, TAG, กฎธุรกิจ และข้อที่ยังไม่ยืนยัน |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | โครงสร้างโค้ด, การไหลของข้อมูล, หน้าที่ของแต่ละชั้น |
| [docs/API.md](docs/API.md) | รายละเอียด endpoint, payload, idempotency, รูปแบบ error |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | กฎการเขียนโค้ด + วิธีเพิ่มสถานี/ขั้นตอน/ฟอร์มใหม่ |
| [docs/REFACTOR.md](docs/REFACTOR.md) | สรุปการจัดโครงสร้างใหม่ และตารางเทียบไฟล์เก่า → ใหม่ |
| [GEMINI.md](GEMINI.md) | กติกาสำหรับ AI agent ที่มาช่วยเขียนโค้ดต่อ |

## Deploy บน IIS

1. `npm run build` บนเครื่อง build
2. คัดลอกโฟลเดอร์ `.output/` ไปเครื่องเซิร์ฟเวอร์
3. ตั้งค่า `DATABASE_URL` / `SANCTUM_API_URL` เป็น environment variable ของ site
4. รัน `node .output/server/index.mjs` ผ่าน iisnode หรือ Windows Service แล้ว reverse proxy จาก IIS

> ระบบมี server API (บันทึกข้อมูล/ยืนยันตัวตน) จึงต้องรันแบบ Node ไม่สามารถ `nuxt generate` เป็น static ล้วนได้
