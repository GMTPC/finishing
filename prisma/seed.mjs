import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const initialUsers = [
  { username: 'S01', password: 'gmt@s01', name: 'พนักงาน S01 (สถานี S1)', role: 'operator' },
  { username: 'S02', password: 'gmt@s02', name: 'พนักงาน S02 (สถานี S2)', role: 'operator' },
  { username: 'S03', password: 'gmt@s03', name: 'พนักงาน S03 (สถานี S3)', role: 'operator' },
  { username: 'S04', password: 'gmt@s04', name: 'พนักงาน S04 (สถานี S4)', role: 'operator' },
  { username: 'S05', password: 'gmt@s05', name: 'พนักงาน S05 (สถานี S5)', role: 'operator' },
  { username: 'admin01', password: 'gmt@admin01', name: 'Admin 01 (ผู้ดูแลระบบ)', role: 'admin' },
  { username: 'admin02', password: 'gmt@admin02', name: 'Admin 02 (ผู้ดูแลระบบ)', role: 'admin' },
]

async function main() {
  console.log('🌱 Starting Prisma database seeding for Users...')

  for (const user of initialUsers) {
    const upserted = await prisma.user.upsert({
      where: { username: user.username },
      update: {
        password: user.password,
        name: user.name,
        role: user.role,
      },
      create: user,
    })
    console.log(`✅ User seeded: [${upserted.username}] - ${upserted.name} (Role: ${upserted.role})`)
  }

  console.log('🎉 Seeding complete successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
