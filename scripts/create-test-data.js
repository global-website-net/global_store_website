const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Create shop users
    const shops = await Promise.all([
      prisma.user.create({
        data: {
          email: 'amazon@shop.com',
          name: 'أمازون',
          password: '$2b$10$rFqIj5g6h7t5wHQXdDoVkemPg0h5WirKSai6vE95JZiSuwFYwE6v.',
          isShop: true,
        },
      }),
      prisma.user.create({
        data: {
          email: 'aliexpress@shop.com',
          name: 'علي إكسبريس',
          password: '$2b$10$rFqIj5g6h7t5wHQXdDoVkemPg0h5WirKSai6vE95JZiSuwFYwE6v.',
          isShop: true,
        },
      }),
      prisma.user.create({
        data: {
          email: 'ebay@shop.com',
          name: 'إيباي',
          password: '$2b$10$rFqIj5g6h7t5wHQXdDoVkemPg0h5WirKSai6vE95JZiSuwFYwE6v.',
          isShop: true,
        },
      }),
      prisma.user.create({
        data: {
          email: 'sephora@shop.com',
          name: 'سيفورا',
          password: '$2b$10$rFqIj5g6h7t5wHQXdDoVkemPg0h5WirKSai6vE95JZiSuwFYwE6v.',
          isShop: true,
        },
      }),
    ]);

    // Create a regular user if not exists
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
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

    // Create packages for each shop with different distributions
    for (const shop of shops) {
      // Number of packages varies by shop to show different popularity levels
      const numPackages = {
        'أمازون': 25,
        'علي إكسبريس': 30,
        'إيباي': 15,
        'سيفورا': 10
      }[shop.name] || 10;

      for (let i = 0; i < numPackages; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const date = dates[Math.floor(Math.random() * dates.length)];
        const deliveryCost = Math.floor(Math.random() * 200) + 50; // Random cost between 50 and 250
        
        await prisma.package.create({
          data: {
            trackingNumber: `${shop.name.substring(0, 2)}${String(i + 1).padStart(5, '0')}`,
            description: `طرد ${i + 1} من ${shop.name}`,
            status,
            deliveryCost,
            createdAt: date,
            updatedAt: date,
            userId: user.id,
            shopId: shop.id,
          },
        });
      }
    }

    // Create some transactions
    const transactionTypes = ['deposit', 'withdrawal', 'payment'];
    for (let i = 0; i < 10; i++) {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const amount = Math.floor(Math.random() * 200) + 50;
      
      await prisma.transaction.create({
        data: {
          amount,
          type,
          description: `Test Transaction ${i + 1}`,
          userId: user.id,
        },
      });
    }

    console.log('Test data created successfully');
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 