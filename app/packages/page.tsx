'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/app/components/Header'
import toast from 'react-hot-toast'
import { Package } from '@prisma/client'
import PackageQRCode from '@/app/components/PackageQRCode'

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
  isAdmin?: boolean;
  isShop?: boolean;
}

interface User {
  name: string | null;
  email: string;
  phone: string | null;
}

export default function PackagesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const user = session?.user as SessionUser | undefined

  useEffect(() => {
    if (!session) {
      router.push('/signin')
      return
    }

    fetchPackages()
  }, [session, router])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      if (!response.ok) throw new Error('Failed to fetch packages')
      const data = await response.json()
      setPackages(data)
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('حدث خطأ أثناء جلب الطرود')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update package')

      toast.success('تم تحديث حالة الطرد بنجاح')
      fetchPackages()
    } catch (error) {
      console.error('Error updating package:', error)
      toast.error('حدث خطأ أثناء تحديث حالة الطرد')
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار'
      case 'received':
        return 'تم الاستلام'
      case 'in_transit':
        return 'قيد التوصيل'
      case 'delivered':
        return 'تم التوصيل'
      default:
        return 'غير معروف'
    }
  }

  if (isLoading) {
    return (
      <div>
        <Header initialSession={session} />
        <main>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-xl">جاري التحميل...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Header initialSession={session} />
      <main>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {user?.isShop ? 'إدارة الطرود' : 'طرودي'}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white shadow rounded-lg p-6 flex flex-col"
                    dir="rtl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">
                          رقم التتبع: {pkg.trackingNumber}
                        </h2>
                        <p className="text-gray-600 mb-2">
                          الحالة: {getStatusText(pkg.status)}
                        </p>
                        {pkg.description && (
                          <p className="text-gray-600">
                            الوصف: {pkg.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <PackageQRCode trackingNumber={pkg.trackingNumber} size={120} />
                    </div>

                    <div className="mt-4 text-sm text-gray-500 text-center">
                      تاريخ الإنشاء: {new Date(pkg.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 