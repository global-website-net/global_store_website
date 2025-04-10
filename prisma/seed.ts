import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      isAdmin: true,
    },
  })

  console.log({ admin })

  // Create regular users
  const regularPassword = await bcrypt.hash('User123!', 10)
  const users = [
    {
      email: 'user1@example.com',
      name: 'User One',
      password: regularPassword,
      isAdmin: false,
      balance: 500,
      phone: '1234567891',
      address: 'User One Address'
    },
    {
      email: 'user2@example.com',
      name: 'User Two',
      password: regularPassword,
      isAdmin: false,
      balance: 750,
      phone: '1234567892',
      address: 'User Two Address'
    }
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 