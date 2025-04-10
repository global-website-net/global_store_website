'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserData {
  fullName: string
  email: string
  phoneNumber: string
  address: string
  accessKey: string
}

export default function Profile() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    // Get user data from localStorage
    const storedData = localStorage.getItem('userData')
    if (storedData) {
      setUserData(JSON.parse(storedData))
    } else {
      // If no user data, redirect to login
      router.push('/login')
    }
  }, [router])

  const handleDeleteAccount = () => {
    if (!userData) return

    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    // Remove the current user from the users array
    const updatedUsers = users.filter((user: UserData) => user.email !== userData.email)
    
    // Update localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers))
    localStorage.removeItem('userData')
    
    // Redirect to home page
    router.push('/')
  }

  if (!userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">الملف الشخصي</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">الاسم الكامل</label>
              <p className="mt-1 text-lg text-gray-900">{userData.fullName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
              <p className="mt-1 text-lg text-gray-900">{userData.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
              <p className="mt-1 text-lg text-gray-900">{userData.phoneNumber || 'غير محدد'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">العنوان</label>
              <p className="mt-1 text-lg text-gray-900">{userData.address || 'غير محدد'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">مفتاح الوصول</label>
              <p className="mt-1 text-lg text-gray-900 font-mono bg-gray-50 p-2 rounded">{userData.accessKey}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              رجوع
            </button>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-danger ml-4"
              >
                حذف الحساب
              </button>
            ) : (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-red-700 mb-4">هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.</p>
                <div className="flex space-x-4">
                  <button
                    onClick={handleDeleteAccount}
                    className="btn btn-danger"
                  >
                    نعم، احذف الحساب
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn btn-secondary"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 