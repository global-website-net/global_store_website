import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import prisma from '@/lib/prisma';

interface Package {
  status: string;
  deliveryCost: number | null;
  createdAt: Date;
}

interface Shop {
  id: string;
  name: string | null;
  email: string | null;
  shopPackages: Package[];
  _count: {
    shopPackages: number;
  };
}

interface FavoriteShop {
  name: string;
  url: string;
  logo: string;
  popularity: number;
  metrics?: {
    totalOrders: number;
    deliveryRate: number;
    totalValue: number;
  };
}

interface StatusDistribution {
  status: string;
  _count: number;
}

const FAVORITE_SHOPS = [
  {
    name: 'أمازون',
    url: 'https://www.amazon.com',
    logo: '/images/amazon-logo.png',
    popularity: 85
  },
  {
    name: 'إيباي',
    url: 'https://www.ebay.com',
    logo: '/images/ebay-logo.png',
    popularity: 75
  },
  {
    name: 'علي إكسبريس',
    url: 'https://www.aliexpress.com',
    logo: '/images/aliexpress-logo.png',
    popularity: 90
  }
];

function getDefaultDate() {
  const date = new Date();
  return {
    month: date.getMonth() + 1, // Current month (1-12)
    year: date.getFullYear()    // Current year
  };
}

async function calculateShopPopularity(startDate: Date, endDate: Date) {
  try {
    // Get total packages in the system for this date range
    const totalPackages = await prisma.package.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get all shops with their packages within the date range
    const shops = await prisma.user.findMany({
      where: {
        isShop: true,
        shopPackages: {
          some: {} // Ensure shop has at least one package
        }
      },
      include: {
        shopPackages: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        _count: {
          select: {
            shopPackages: true
          }
        }
      }
    });

    if (!shops || shops.length === 0) {
      return [];
    }

    return shops.map((shop: Shop) => {
      const packages = shop.shopPackages || [];
      const totalOrders = packages.length;
      const deliveredOrders = packages.filter((pkg: Package) => pkg.status === 'delivered').length;
      const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

      // Calculate shop activity as percentage of total packages
      const popularity = totalPackages > 0 
        ? Math.round((totalOrders / totalPackages) * 100)
        : 0;

      return {
        id: shop.id,
        name: shop.name || shop.email?.split('@')[0] || 'متجر',
        popularity,
        metrics: {
          totalOrders,
          deliveryRate: Math.round(deliveryRate)
        }
      };
    });
  } catch (error) {
    console.error('Error calculating shop popularity:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '0');
    const year = parseInt(searchParams.get('year') || '0');
    const viewMode = searchParams.get('viewMode') || 'month';

    console.log('DEBUG - Initial Parameters:', { month, year, viewMode });

    // Validate month and year
    const currentDate = new Date();
    const defaultDate = getDefaultDate();

    const selectedYear = year || defaultDate.year;
    const selectedMonth = month || defaultDate.month;

    if (selectedMonth < 1 || selectedMonth > 12) {
      return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
    }

    if (selectedYear < 2020 || selectedYear > 2100) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    // Calculate date range
    let startDate: Date;
    let endDate: Date;

    if (viewMode === 'month') {
      // For monthly view
      startDate = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(selectedYear, selectedMonth, 0, 23, 59, 59));
    } else {
      // For yearly view - ensure we get the full year
      startDate = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(selectedYear + 1, 0, 0, 23, 59, 59));
    }

    console.log('DEBUG - Query Date Range:', {
      viewMode,
      selectedYear,
      selectedMonth,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Get status distribution within the date range
    const statusDistribution = await prisma.package.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    });

    // Get shop popularity data
    const shopPopularityData = await calculateShopPopularity(startDate, endDate);

    // Convert shop data to favorite shops format
    const favoriteShops = shopPopularityData.map((shop: { 
      id: string;
      name: string;
      popularity: number;
      metrics: {
        totalOrders: number;
        deliveryRate: number;
      };
    }) => ({
      name: shop.name,
      url: `/admin/shops/${shop.id}`,
      logo: '/images/google-logo.png', // Default logo
      popularity: shop.popularity,
      metrics: shop.metrics
    }));

    // Get total packages within the date range
    const totalPackages = await prisma.package.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get packages within the date range with proper sorting
    const packages = await prisma.package.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        shopId: true,
        shop: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('DEBUG - Found Packages:', {
      totalCount: packages.length,
      packages: packages.map((p: { 
        id: string; 
        createdAt: Date; 
        status: string;
        shop?: { name: string | null }
      }) => ({
        id: p.id,
        createdAt: p.createdAt.toISOString(),
        status: p.status,
        shopName: p.shop?.name
      }))
    });

    // Initialize all months for yearly view
    const statsMap = new Map();
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                   'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    if (viewMode === 'year') {
      months.forEach(month => {
        statsMap.set(month, { month, packages: 0 });
      });
    }

    // Count packages for each period
    packages.forEach((pkg: { createdAt: Date; status: string; shop?: { name: string | null } }) => {
      const date = new Date(pkg.createdAt);
      let key;
      
      if (viewMode === 'month') {
        // For monthly view, use only the day number
        const dayOfMonth = date.getDate();
        key = dayOfMonth.toString();
        if (!statsMap.has(key)) {
          statsMap.set(key, { month: key, packages: 0 });
        }
      } else {
        // For yearly view, use only month name
        key = date.toLocaleDateString('ar-EG', { month: 'long' });
        console.log('DEBUG - Package Mapping:', {
          date: date.toISOString(),
          shopName: pkg.shop?.name,
          mappedMonth: key
        });
      }
      
      const stats = statsMap.get(key);
      if (stats) {
        stats.packages++;
      }
    });

    console.log('DEBUG - Final Stats:', {
      statsMap: Object.fromEntries(statsMap),
      sortedStats: Array.from(statsMap.entries())
        .sort(([keyA], [keyB]) => months.indexOf(keyA) - months.indexOf(keyB))
        .map(([_, value]) => value)
    });

    // Sort the stats
    const sortedStats = Array.from(statsMap.entries())
      .sort(([keyA], [keyB]) => {
        if (viewMode === 'month') {
          // Sort by day for monthly view
          const dayA = parseInt(keyA.split(' ')[0]);
          const dayB = parseInt(keyB.split(' ')[0]);
          return dayA - dayB;
        } else {
          // Sort by month for yearly view
          return months.indexOf(keyA) - months.indexOf(keyB);
        }
      })
      .map(([_, value]) => value);

    const response = {
      favoriteShops,
      totalPackages,
      stats: sortedStats,
      statusDistribution: statusDistribution.map((item: StatusDistribution) => ({
        status: item.status,
        count: item._count
      }))
    };

    console.log('DEBUG - Response Data:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 