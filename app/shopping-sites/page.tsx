import Header from '@/app/components/Header'
import { FaAmazon } from 'react-icons/fa'
import { SiAliexpress, SiEbay } from 'react-icons/si'
import { RiStoreLine } from 'react-icons/ri'

export default function ShoppingSitesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">مواقع التسوق العالمية</h1>
          <p className="text-xl text-gray-600">اكتشف أفضل مواقع التسوق العالمية للتسوق والشحن عبر خدماتنا</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {/* Amazon */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center mb-6">
              <FaAmazon className="text-6xl text-[#FF9900]" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Amazon</h2>
            <p className="text-gray-600 text-center">
              أكبر متجر إلكتروني في العالم مع ملايين المنتجات وأفضل الأسعار. يوفر تجربة تسوق موثوقة مع خيارات شحن سريعة.
            </p>
            <div className="mt-6 text-center">
              <a
                href="https://www.amazon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#FF9900] text-white px-6 py-2 rounded-lg hover:bg-[#FF9900]/90 transition-colors"
              >
                تسوق الآن
              </a>
            </div>
          </div>

          {/* eBay */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center mb-6">
              <SiEbay className="text-6xl text-[#e53238]" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">eBay</h2>
            <p className="text-gray-600 text-center">
              منصة عالمية للمزادات والتسوق المباشر، تقدم منتجات فريدة وجديدة ومستعملة بأسعار تنافسية.
            </p>
            <div className="mt-6 text-center">
              <a
                href="https://www.ebay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#E53238] text-white px-6 py-2 rounded-lg hover:bg-[#E53238]/90 transition-colors"
              >
                تسوق الآن
              </a>
            </div>
          </div>

          {/* AliExpress */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <SiAliexpress className="text-6xl text-[#e43226]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff4747] to-[#e43226] opacity-20"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">AliExpress</h2>
            <p className="text-gray-600 text-center">
              متجر صيني عالمي يقدم منتجات متنوعة بأسعار تنافسية، مع شحن مباشر من المصنعين والموردين.
            </p>
            <div className="mt-6 text-center">
              <a
                href="https://www.aliexpress.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#e43226] text-white px-6 py-2 rounded-lg hover:bg-[#e43226]/90 transition-colors"
              >
                تسوق الآن
              </a>
            </div>
          </div>

          {/* Sephora */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center mb-6">
              <RiStoreLine className="text-6xl text-black" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Sephora</h2>
            <p className="text-gray-600 text-center">
              متجر عالمي رائد في مستحضرات التجميل والعناية بالبشرة، يقدم أفضل العلامات التجارية العالمية ومنتجات الجمال الفاخرة.
            </p>
            <div className="mt-6 text-center">
              <a
                href="https://www.sephora.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                تسوق الآن
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
            مميزات التسوق عبر خدماتنا
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <h4 className="font-semibold text-lg mb-2">شحن موحد</h4>
              <p className="text-gray-600">سعر ثابت 35 شيكل لكل طرد من أي موقع</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <h4 className="font-semibold text-lg mb-2">تتبع سهل</h4>
              <p className="text-gray-600">تابع طرودك من جميع المواقع في مكان واحد</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <h4 className="font-semibold text-lg mb-2">دعم فني</h4>
              <p className="text-gray-600">مساعدة في الطلب والشحن على مدار الساعة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 