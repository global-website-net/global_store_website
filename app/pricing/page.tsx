'use client';

import { FaBox, FaTruck, FaHandshake, FaCheckCircle } from 'react-icons/fa';
import Header from '@/app/components/Header';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">تكلفة نقل الطرود</h1>
          <p className="text-xl text-gray-600">خدمة موثوقة وبأسعار منافسة</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-100 rounded-full p-4 mb-4">
              <FaBox className="text-4xl text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              35 شيكل
            </h2>
            <p className="text-lg text-gray-600">
              سعر ثابت لكل طرد، يشمل جميع خدمات النقل والتوصيل
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-50 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center mb-4">
                <FaBox className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">استلام الطرد</h3>
              <p className="text-gray-600">نستلم طردك من المتجر أو المكان المحدد</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-blue-50 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center mb-4">
                <FaTruck className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">نقل آمن</h3>
              <p className="text-gray-600">نقل الطرد بعناية وأمان إلى وجهته</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-blue-50 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center mb-4">
                <FaHandshake className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">التسليم</h3>
              <p className="text-gray-600">تسليم الطرد مباشرة إلى العميل</p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="bg-blue-50 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center mb-4">
                <FaCheckCircle className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">تأكيد التسليم</h3>
              <p className="text-gray-600">تأكيد استلام الطرد وتحديث الحالة</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
            مميزات الخدمة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <h4 className="font-semibold text-lg mb-2">سعر ثابت</h4>
              <p className="text-gray-600">35 شيكل لكل طرد بغض النظر عن الحجم</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <h4 className="font-semibold text-lg mb-2">تتبع الطرود</h4>
              <p className="text-gray-600">تتبع حالة طردك في أي وقت</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <h4 className="font-semibold text-lg mb-2">خدمة سريعة</h4>
              <p className="text-gray-600">توصيل سريع وفعال</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 