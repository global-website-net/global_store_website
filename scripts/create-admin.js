const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin',
        password: '$2b$10$rFqIj5g6h7t5wHQXdDoVkemPg0h5WirKSai6vE95JZiSuwFYwE6v.',
        isAdmin: true,
      },
    });
    console.log('Admin user created:', admin);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 