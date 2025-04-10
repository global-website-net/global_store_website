'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'
import { useSession } from 'next-auth/react'

export default function RegisterPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+970',
    governorate: '',
    address: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const countryCode = formData.get('countryCode') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const phone = `${countryCode}${phoneNumber}`
    const governorate = formData.get('governorate') as string
    const address = formData.get('address') as string

    // Validate all required fields
    if (!name || !email || !password || !confirmPassword || !phoneNumber || !governorate || !address) {
      setError('جميع الحقول مطلوبة')
      setLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('البريد الإلكتروني غير صالح')
      setLoading(false)
      return
    }

    // Validate phone number (at least 9 digits)
    const phoneRegex = /^\d{9,}$/
    if (!phoneRegex.test(phoneNumber)) {
      setError('رقم الهاتف يجب أن يحتوي على 9 أرقام على الأقل')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      setLoading(false)
      return
    }

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          governorate,
          address,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'حدث خطأ أثناء إنشاء الحساب')
      }

      // If admin is creating the user, redirect to users management page
      // Otherwise, redirect to signin page
      if (session?.user?.isAdmin) {
        router.push('/admin/users')
      } else {
        router.push('/signin?registered=true')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الحساب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={session?.user?.isAdmin ? "/admin/users" : "/"}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <span className="ml-2">←</span>
            {session?.user?.isAdmin ? 'العودة لإدارة المستخدمين' : 'العودة للصفحة الرئيسية'}
          </Link>
        </div>
        <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {session?.user?.isAdmin ? 'إضافة مستخدم جديد' : 'إنشاء حساب جديد'}
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  الاسم
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="الاسم الكامل"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  البريد الإلكتروني
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="example@domain.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  رقم الهاتف
                </label>
                <div className="mt-1 flex gap-2 flex-row-reverse">
                  <div className="relative w-24">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+</span>
                    <select
                      id="countryCode"
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      className="appearance-none w-full pl-6 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                      required
                      dir="ltr"
                    >
                      <option value="+970">970</option>
                      <option value="+972">972</option>
                    </select>
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    pattern="\d{9,}"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                    placeholder="رقم الهاتف (9 أرقام على الأقل)"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="governorate" className="block text-sm font-medium text-gray-700">
                  المحافظة
                </label>
                <div className="mt-1">
                  <select
                    id="governorate"
                    name="governorate"
                    required
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                  >
                    <option value="">اختر المحافظة</option>
                    <option value="محافظة القدس">محافظة القدس</option>
                    <option value="محافظة جنين">محافظة جنين</option>
                    <option value="محافظة طوباس">محافظة طوباس</option>
                    <option value="محافظة طولكرم">محافظة طولكرم</option>
                    <option value="محافظة نابلس">محافظة نابلس</option>
                    <option value="محافظة قلقيلية">محافظة قلقيلية</option>
                    <option value="محافظة رام الله والبيرة">محافظة رام الله والبيرة</option>
                    <option value="محافظة اريحا">محافظة اريحا</option>
                    <option value="محافظة الخليل">محافظة الخليل</option>
                    <option value="محافظة بيت لحم">محافظة بيت لحم</option>
                    <option value="محافظة سلفيت">محافظة سلفيت</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  العنوان
                </label>
                <div className="mt-1">
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    required
                    minLength={10}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="العنوان التفصيلي"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  كلمة المرور
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="كلمة المرور (8 أحرف على الأقل)"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  تأكيد كلمة المرور
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="تأكيد كلمة المرور"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'جاري إنشاء الحساب...' : (session?.user?.isAdmin ? 'إضافة المستخدم' : 'إنشاء حساب')}
                </button>
              </div>
            </form>

            {/* Only show the login section if not an admin */}
            {!session?.user?.isAdmin && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">لديك حساب ؟</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/signin"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 