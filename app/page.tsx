'use client'

import { useSession } from 'next-auth/react'
import Header from './components/Header'
import { motion } from 'framer-motion'
import ShopLogo from './components/ShopLogo'
import Image from 'next/image'
import { MotionDiv, MotionH1, MotionP } from './components/AnimatedContent'
import { useEffect, useState } from 'react'

interface UserData {
  fullName: string
  email: string
}

export default function Home() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    // Get user data from localStorage
    const storedData = localStorage.getItem('userData')
    if (storedData) {
      setUserData(JSON.parse(storedData))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header initialSession={session} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <MotionDiv 
              className="text-right"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MotionH1 
                className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                تسوق من جميع أنحاء العالم
              </MotionH1>
              <MotionP 
                className="text-xl text-gray-600 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                نسهل عليك عملية التسوق من المواقع العالمية مثل أمازون وإيباي وعلي إكسبريس
              </MotionP>
            </MotionDiv>
            <MotionDiv
              className="relative h-[400px] lg:h-[500px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Image
                src="/images/hero-image.jpg"
                alt="Online Shopping"
                fill
                className="object-cover rounded-2xl shadow-xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <MotionDiv 
              className="bg-gray-50 rounded-lg p-8 text-gray-800 shadow-xl border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4 text-gray-800">تسوق بسهولة</h3>
              <p className="text-lg mb-6 text-gray-600">نوفر لك تجربة تسوق فريدة مع دعم كامل للغة العربية وخدمة عملاء على مدار الساعة</p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  دعم كامل للغة العربية
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  خدمة عملاء على مدار الساعة
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  شحن سريع وآمن
                </li>
              </ul>
            </MotionDiv>
            <MotionDiv 
              className="bg-gray-50 rounded-lg p-8 shadow-xl border border-gray-200"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">كيف يعمل؟</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <div className="mr-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">اختر منتجاتك</h4>
                    <p className="text-gray-600">تصفح المنتجات من المتاجر العالمية واختر ما يناسبك</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <div className="mr-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">أضف للسلة</h4>
                    <p className="text-gray-600">أضف المنتجات إلى سلة التسوق واكمل عملية الشراء</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <div className="mr-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">استلم منتجاتك</h4>
                    <p className="text-gray-600">نقوم بتوصيل منتجاتك إلى باب منزلك بأمان وسرعة</p>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">مميزاتنا</h2>
            <p className="text-xl text-gray-600">نقدم لك أفضل تجربة تسوق عالمية</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MotionDiv 
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="text-yellow-500 mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">أسعار تنافسية</h3>
              <p className="text-gray-600">نقدم لك أفضل الأسعار من جميع المواقع العالمية</p>
            </MotionDiv>

            <MotionDiv 
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-yellow-500 mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">توصيل سريع</h3>
              <p className="text-gray-600">نضمن لك وصول منتجاتك في أسرع وقت ممكن</p>
            </MotionDiv>

            <MotionDiv 
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="text-yellow-500 mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">ضمان الجودة</h3>
              <p className="text-gray-600">نضمن لك جودة المنتجات</p>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">كيف يعمل</h2>
            <p className="text-xl text-gray-600">خطوات بسيطة للحصول على منتجاتك</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MotionDiv 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-2xl font-bold text-white">١</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">اختر منتجاتك</h3>
              <p className="text-gray-600">تصفح المواقع العالمية واختر المنتجات التي تريدها</p>
            </MotionDiv>

            <MotionDiv 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-2xl font-bold text-white">٢</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">أرسل الطلب</h3>
              <p className="text-gray-600">أرسل رابط المنتج وسنقوم بشرائه نيابة عنك</p>
            </MotionDiv>

            <MotionDiv 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-2xl font-bold text-white">٣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">استلم منتجاتك</h3>
              <p className="text-gray-600">نقوم بتوصيل المنتجات إلى عنوانك</p>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Popular Shopping Sites */}
      <section id="shopping-sites" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">مواقع التسوق الشهيرة</h2>
            <p className="text-xl text-gray-600">تسوق من أشهر المواقع العالمية</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <MotionDiv 
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <a href="https://www.amazon.com" target="_blank" rel="noopener noreferrer" className="block">
                <ShopLogo shopName="Amazon" logoPath="/images/amazon-logo.png" width={150} height={50} />
              </a>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">أمازون</h3>
              <p className="text-gray-600 mt-2">الوصول إلى ملايين المنتجات من أمازون الولايات المتحدة والمملكة المتحدة والمزيد</p>
            </MotionDiv>

            <MotionDiv 
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <a href="https://www.ebay.com" target="_blank" rel="noopener noreferrer" className="block">
                <ShopLogo shopName="eBay" logoPath="/images/ebay-logo.png" width={150} height={50} />
              </a>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">إيباي</h3>
              <p className="text-gray-600 mt-2">تسوق من بائعي إيباي حول العالم مع شحن آمن وموثوق</p>
            </MotionDiv>

            <MotionDiv 
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <a href="https://www.aliexpress.com" target="_blank" rel="noopener noreferrer" className="block">
                <ShopLogo shopName="AliExpress" logoPath="/images/aliexpress-logo.png" width={100} height={33} />
              </a>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">علي إكسبرس</h3>
              <p className="text-gray-600 mt-2">احصل على أفضل العروض من علي إكسبرس مع توصيل موثوق</p>
            </MotionDiv>

            <MotionDiv 
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <a href="https://www.sephora.com" target="_blank" rel="noopener noreferrer" className="block">
                <div className="text-3xl font-bold text-gray-800 mb-4">SEPHORA</div>
              </a>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">سيفورا</h3>
              <p className="text-gray-600 mt-2">تسوق أحدث منتجات التجميل والعطور من سيفورا</p>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">متجر عالمي</h3>
              <p className="text-gray-300">نسهل عليك عملية التسوق من المواقع العالمية</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">روابط سريعة</h3>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-gray-300 hover:text-white">كيف يعمل</a></li>
                <li><a href="#features" className="text-gray-300 hover:text-white">المميزات</a></li>
                <li><a href="#shopping-sites" className="text-gray-300 hover:text-white">مواقع التسوق</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">تواصل معنا</h3>
              <ul className="space-y-2">
                <li className="text-gray-300">البريد الإلكتروني: info@globalshop.com</li>
                <li className="text-gray-300">الهاتف: +1234567890</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
            <p>جميع الحقوق محفوظة © 2024 متجر عالمي</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 