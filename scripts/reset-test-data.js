const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data
    await prisma.transaction.deleteMany({});
    await prisma.balanceHistory.deleteMany({});
    await prisma.package.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          notIn: ['admin@example.com'] // Keep the admin user
        }
      }
    });

    // Create a shop user
    const shop = await prisma.user.create({
      data: {
        email: 'shop@example.com',
        name: 'Test Shop',
        password: '$2b$10$rFqIj5g6h7t5wHQXdDoVkemPg0h5WirKSai6vE95JZiSuwFYwE6v.',
        isShop: true,
      },
    });

    // Create a regular user
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        name: 'Test User',
        password: '$2b$10$rFqIj5g6h7t5wHQXdDoVkemPg0h5WirKSai6vE95JZiSuwFYwE6v.',
        balance: 1000,
      },
    });

    // Create test packages with different statuses and dates
    const statuses = ['pending', 'received', 'in_transit', 'delivered'];
    
    // Create dates for the last 30 days
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    });

    // Create 50 packages with better distribution
    for (let i = 0; i < 50; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const date = dates[Math.floor(Math.random() * dates.length)];
      
      await prisma.package.create({
        data: {
          trackingNumber: `TRK${String(i + 1).padStart(5, '0')}`,
          description: `Test Package ${i + 1}`,
          status,
          deliveryCost: Math.floor(Math.random() * 100) + 50,
          createdAt: date,
          updatedAt: date,
          userId: user.id,
          shopId: shop.id,
        },
      });
    }

    // Create transactions and balance history
    const transactionTypes = ['deposit', 'withdrawal', 'payment'];
    for (let i = 0; i < 20; i++) {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const amount = Math.floor(Math.random() * 200) + 50;
      const date = dates[Math.floor(Math.random() * dates.length)];
      
      // Create transaction
      await prisma.transaction.create({
        data: {
          amount,
          type,
          description: `Test Transaction ${i + 1}`,
          userId: user.id,
          createdAt: date,
        },
      });

      // Create balance history
      await prisma.balanceHistory.create({
        data: {
          userId: user.id,
          amount,
          type: type === 'deposit' ? 'add' : 'reduce',
          updatedBy: 'admin@example.com',
          isAdmin: true,
          createdAt: date,
        },
      });
    }

    console.log('Test data reset and created successfully');
  } catch (error) {
    console.error('Error resetting test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 