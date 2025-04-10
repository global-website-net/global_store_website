"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import ShopLogo from '@/app/components/ShopLogo';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardStats {
  totalPackages: number;
  stats: {
    month: string;
    packages: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
  favoriteShops: {
    name: string;
    url: string;
    logo: string;
    popularity: number;
    metrics?: {
      totalOrders: number;
      deliveryRate: number;
      totalValue: number;
    };
  }[];
}

const STATUS_COLORS = {
  pending: '#FFBB28',
  received: '#00C49F',
  in_transit: '#0088FE',
  delivered: '#FF8042'
};

const STATUS_LABELS = {
  pending: 'قيد الانتظار',
  received: 'تم الاستلام',
  in_transit: 'قيد التوصيل',
  delivered: 'تم التوصيل'
};

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: CustomLabelProps) => {
  // Calculate base radius for all labels
  const radius = outerRadius * 1.4;
  
  // Calculate end points
  const ex = cx + radius * Math.cos(-midAngle * RADIAN);
  const ey = cy + radius * Math.sin(-midAngle * RADIAN);

  // Determine if label is on right side
  const isRightSide = ex > cx;

  // Calculate text position with more space from line
  const textOffset = 90; // Increased from 70 to 90 to move labels much further from lines
  const textX = ex + (isRightSide ? textOffset : -textOffset);

  return (
    <g>
      <path
        d={`M${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${cy + outerRadius * Math.sin(-midAngle * RADIAN)}
           L${ex},${ey}`}
        stroke="#888"
        fill="none"
      />
      <text
        x={textX}
        y={ey}
        fill="#333"
        textAnchor={isRightSide ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${STATUS_LABELS[name as keyof typeof STATUS_LABELS]} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

function getDefaultDate() {
  const date = new Date();
  return {
    month: date.getMonth() + 1, // Current month (1-12)
    year: date.getFullYear()    // Current year
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const defaultDate = getDefaultDate();
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultDate.month);
  const [selectedYear, setSelectedYear] = useState<number>(defaultDate.year);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (status === 'authenticated') {
      if (!session?.user?.isAdmin) {
        router.push('/');
        return;
      }

      fetchDashboardStats();
    }
  }, [status, session, router, selectedMonth, selectedYear, viewMode]);

  const fetchDashboardStats = async () => {
    try {
      const url = `/api/admin/dashboard?${viewMode === 'month' ? `month=${selectedMonth}&` : ''}year=${selectedYear}&viewMode=${viewMode}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2020; year--) {
      years.push(year);
    }
    return years;
  };

  // Show loading state while session is being determined
  if (status === 'loading' || loading) {
    return (
      <div>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
              <div className="flex gap-4 items-center">
                <div className="flex gap-4">
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as 'month' | 'year')}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="month">شهري</option>
                    <option value="year">سنوي</option>
                  </select>
                  {viewMode === 'month' && (
                    <select
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="1">يناير</option>
                      <option value="2">فبراير</option>
                      <option value="3">مارس</option>
                      <option value="4">أبريل</option>
                      <option value="5">مايو</option>
                      <option value="6">يونيو</option>
                      <option value="7">يوليو</option>
                      <option value="8">أغسطس</option>
                      <option value="9">سبتمبر</option>
                      <option value="10">أكتوبر</option>
                      <option value="11">نوفمبر</option>
                      <option value="12">ديسمبر</option>
                    </select>
                  )}
                  <select
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {getYearOptions().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">إجمالي الطرود</h2>
                <p className="text-3xl font-bold text-indigo-600">
                  {stats?.totalPackages || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">معدل الطرود</h2>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.stats?.length
                    ? Math.round(
                        stats.stats.reduce((acc, curr) => acc + curr.packages, 0) /
                          stats.stats.length
                      )
                    : 0}{' '}
                  / {viewMode === 'month' ? 'شهر' : 'سنة'}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">نسبة التوصيل</h2>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.statusDistribution
                    ? Math.round(
                        (stats.statusDistribution.find(s => s.status === 'delivered')?.count || 0) /
                          stats.totalPackages *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              {/* Monthly/Yearly Trends - Full Width */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  إحصائيات {viewMode === 'month' ? 'شهرية' : 'سنوية'} {viewMode === 'month' ? `- ${selectedMonth}/${selectedYear}` : `- ${selectedYear}`}
                </h2>
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats?.stats || []}
                      margin={{ top: 20, right: 50, left: 70, bottom: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        angle={-45}
                        textAnchor="end"
                        height={120}
                        interval={0}
                        tick={{ fontSize: 14 }}
                        dy={50}
                      />
                      <YAxis 
                        dx={-10}
                        tickFormatter={(value) => Math.round(value).toString()}
                        allowDecimals={false}
                        allowDuplicatedCategory={false}
                        type="number"
                        tick={{ fontSize: 14 }}
                        label={{ 
                          value: 'عدد الطرود',
                          angle: 0,
                          position: 'outside',
                          style: { 
                            textAnchor: 'middle', 
                            fontSize: 16,
                            fill: '#2563eb',
                            fontWeight: 'bold'
                          },
                          dx: -55,
                          dy: -20
                        }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${value}`, 'عدد الطرود']}
                        labelFormatter={(label: any) => `الشهر: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="packages"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Two Column Layout for Pie Chart and Favorite Shops */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Package Status Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">توزيع حالات الطرود</h2>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.statusDistribution || []}
                          cx={200}
                          cy={200}
                          labelLine
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="status"
                          label={renderCustomizedLabel as any}
                        >
                          {stats?.statusDistribution?.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any, name: string) => [
                            value.toString(),
                            STATUS_LABELS[name as keyof typeof STATUS_LABELS]
                          ]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          layout="horizontal"
                          iconSize={12}
                          iconType="square"
                          wrapperStyle={{
                            paddingTop: '20px',
                            paddingBottom: '20px',
                            width: '100%'
                          }}
                          formatter={(value: string): string => 
                            `     ${STATUS_LABELS[value as keyof typeof STATUS_LABELS]}     `
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Favorite Shops */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">المتاجر المفضلة</h2>
                  {!stats?.favoriteShops || stats.favoriteShops.length === 0 ? (
                    <p className="text-gray-500 text-center">لا يوجد متاجر نشطة في الفترة المحددة</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {stats.favoriteShops.map((shop, index) => (
                        <div key={shop.name} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {index + 1}
                            </div>
                            <div className="flex items-center mr-3">
                              <ShopLogo shopName={shop.name} className="w-10 h-10 object-contain" />
                              <h3 className="text-lg font-semibold text-gray-800 mr-3">{shop.name}</h3>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>نشاط المتجر</span>
                                <span>{shop.popularity}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full" 
                                  style={{ width: `${shop.popularity}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 space-y-2">
                              <div className="flex justify-between">
                                <span>عدد الطرود:</span>
                                <span className="font-medium">{shop.metrics?.totalOrders || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>الطرود المسلمة:</span>
                                <span className="font-medium">{Math.round((shop.metrics?.totalOrders || 0) * (shop.metrics?.deliveryRate || 0) / 100)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>نسبة التوصيل:</span>
                                <span className="font-medium">{shop.metrics?.deliveryRate || 0}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 