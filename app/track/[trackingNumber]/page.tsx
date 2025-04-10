"use client";

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import { Package } from '@prisma/client';
import { FaBox, FaCheckCircle, FaTruck, FaWarehouse } from 'react-icons/fa';

interface TrackingPageProps {
  params: {
    trackingNumber: string;
  };
}

export default function TrackingPage({ params }: TrackingPageProps) {
  const [package_, setPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(`/api/packages/${params.trackingNumber}`);
        if (!response.ok) {
          throw new Error('رقم التتبع غير صحيح');
        }
        const data = await response.json();
        setPackage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل معلومات الطرد');
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [params.trackingNumber]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaBox className="text-yellow-500" />;
      case 'received':
        return <FaWarehouse className="text-blue-500" />;
      case 'in_transit':
        return <FaTruck className="text-purple-500" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'received':
        return 'تم الاستلام';
      case 'in_transit':
        return 'قيد التوصيل';
      case 'delivered':
        return 'تم التوصيل';
      default:
        return 'غير معروف';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8" dir="rtl">
            تتبع الطرد
          </h1>

          {loading ? (
            <div className="text-center">جاري التحميل...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : package_ ? (
            <div className="space-y-6" dir="rtl">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h2 className="text-lg font-semibold">رقم التتبع</h2>
                  <p className="text-gray-600">{package_.trackingNumber}</p>
                </div>
                <div className="text-4xl">
                  {getStatusIcon(package_.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">حالة الطرد</h2>
                  <p className="text-gray-600">{getStatusText(package_.status)}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">تاريخ الإنشاء</h2>
                  <p className="text-gray-600">
                    {new Date(package_.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>

              {package_.description && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">وصف الطرد</h2>
                  <p className="text-gray-600">{package_.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              لم يتم العثور على معلومات الطرد
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 