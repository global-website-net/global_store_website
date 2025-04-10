'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/app/components/Header'
import PackageQRCode from '@/app/components/PackageQRCode'
import { FaQrcode } from 'react-icons/fa'
import toast from 'react-hot-toast'

interface Package {
  id: string
  trackingNumber: string
  description: string
  status: string
  createdAt: string
  userId: string | null
  shopId: string | null
  user?: {
    id: string
    name: string
    email: string
  }
  shop?: {
    id: string
    name: string
    email: string
  }
}

interface User {
  id: string
  name: string
  email: string
}

export default function PackagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [shops, setShops] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    trackingNumber: '',
    description: '',
    userId: '',
    shopId: '',
    status: ''
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPackage, setNewPackage] = useState({
    trackingNumber: '',
    description: '',
    userId: '',
    shopId: '',
    status: 'pending'
  })
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null)

  useEffect(() => {
    // Don't redirect if session is still loading
    if (status === 'loading') return

    // Only redirect if session is fully loaded and we're not authenticated
    if (status === 'unauthenticated') {
      router.push('/signin')
      return
    }

    // Only redirect if we're authenticated but not an admin
    if (session && !session.user?.isAdmin) {
      router.push('/')
      return
    }

    // Only fetch data if we're authenticated and an admin
    if (session?.user?.isAdmin) {
      fetchPackages()
      fetchUsers()
      fetchShops()
    }
  }, [session, status, router])

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/admin/shops')
      if (!response.ok) throw new Error('Failed to fetch shops')
      const data = await response.json()
      setShops(data)
    } catch (error) {
      console.error('Error fetching shops:', error)
      toast.error('حدث خطأ أثناء جلب المتاجر')
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('حدث خطأ أثناء جلب المستخدمين')
    }
  }

  const fetchPackages = async (page = currentPage) => {
    try {
      setIsLoading(true)
      // Build query params including filters
      const params = new URLSearchParams({
        page: page.toString(),
        ...(filters.trackingNumber && { trackingNumber: filters.trackingNumber }),
        ...(filters.description && { description: filters.description }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.shopId && { shopId: filters.shopId }),
        ...(filters.status && { status: filters.status })
      })

      const response = await fetch(`/api/admin/packages?${params}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch packages')
      }
      const data = await response.json()
      setPackages(data.packages)
      setCurrentPage(data.pagination.currentPage)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('حدث خطأ أثناء جلب الطرود')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Build query params including filters
      const params = new URLSearchParams({
        page: '1',
        ...(filters.trackingNumber && { trackingNumber: filters.trackingNumber }),
        ...(filters.description && { description: filters.description }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.shopId && { shopId: filters.shopId }),
        ...(filters.status && { status: filters.status })
      })

      const response = await fetch(`/api/admin/packages?${params}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch packages')
      }
      const data = await response.json()
      setPackages(data.packages)
      setCurrentPage(1)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error applying filters:', error)
      toast.error('حدث خطأ أثناء تطبيق الفلاتر')
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = async () => {
    setIsLoading(true)
    try {
      // Reset filters state
      setFilters({
        trackingNumber: '',
        description: '',
        userId: '',
        shopId: '',
        status: ''
      })
      
      // Fetch packages without any filters
      const response = await fetch('/api/admin/packages?page=1')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch packages')
      }
      const data = await response.json()
      setPackages(data.packages)
      setCurrentPage(1)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error clearing filters:', error)
      toast.error('حدث خطأ أثناء مسح الفلاتر')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validate form data
      if (!newPackage.trackingNumber.trim()) {
        toast.error('الرجاء إدخال رقم التتبع')
        return
      }
      if (!newPackage.description.trim()) {
        toast.error('الرجاء إدخال الوصف')
        return
      }
      if (!newPackage.shopId) {
        toast.error('الرجاء اختيار المتجر')
        return
      }
      if (!newPackage.userId) {
        toast.error('الرجاء اختيار المالك')
        return
      }

      console.log('Submitting package:', newPackage) // Debug log

      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPackage)
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Server error:', data) // Debug log
        throw new Error(data.error || 'Failed to create package')
      }

      console.log('Package created:', data) // Debug log
      toast.success('تم إضافة الطرد بنجاح')
      setIsModalOpen(false)
      setNewPackage({ trackingNumber: '', description: '', userId: '', shopId: '', status: 'pending' })
      fetchPackages()
    } catch (error) {
      console.error('Error creating package:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الطرد')
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPackage) return

    try {
      const response = await fetch(`/api/admin/packages/${editingPackage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: editingPackage.trackingNumber,
          description: editingPackage.description,
          userId: editingPackage.userId
        })
      })

      if (!response.ok) throw new Error('Failed to update package')

      toast.success('تم تحديث الطرد بنجاح')
      setIsEditModalOpen(false)
      setEditingPackage(null)
      fetchPackages()
    } catch (error) {
      console.error('Error updating package:', error)
      toast.error('حدث خطأ أثناء تحديث الطرد')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete package')

      toast.success('تم حذف الطرد بنجاح')
      setIsDeleteModalOpen(false)
      setPackageToDelete(null)
      fetchPackages()
    } catch (error) {
      console.error('Error deleting package:', error)
      toast.error('حدث خطأ أثناء حذف الطرد')
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      fetchPackages(newPage)
    }
  }

  return (
    <div>
      <Header initialSession={session} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">إدارة الطرود</h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                إضافة طرد جديد
              </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <form onSubmit={handleFilterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رقم التتبع
                    </label>
                    <input
                      type="text"
                      value={filters.trackingNumber}
                      onChange={(e) => handleFilterChange('trackingNumber', e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="ابحث برقم التتبع"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الوصف
                    </label>
                    <input
                      type="text"
                      value={filters.description}
                      onChange={(e) => handleFilterChange('description', e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="ابحث في الوصف"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المالك
                    </label>
                    <select
                      value={filters.userId}
                      onChange={(e) => handleFilterChange('userId', e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">الكل</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المتجر
                    </label>
                    <select
                      value={filters.shopId}
                      onChange={(e) => handleFilterChange('shopId', e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">الكل</option>
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name || shop.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الحالة
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">الكل</option>
                      <option value="pending">قيد الانتظار</option>
                      <option value="received">تم الاستلام</option>
                      <option value="in_transit">قيد التوصيل</option>
                      <option value="delivered">تم التوصيل</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    مسح الفلاتر
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جاري البحث...
                      </>
                    ) : (
                      'تطبيق الفلاتر'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* Table */}
            {!isLoading && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم التتبع
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الوصف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المالك
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المتجر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 tracking-wider">
                        <FaQrcode className="inline-block text-lg" title="رمز QR" />
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {packages.map((pkg) => (
                      <tr key={pkg.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pkg.trackingNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pkg.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pkg.user?.name || pkg.user?.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pkg.shop?.name || pkg.shop?.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pkg.status === 'pending' ? 'قيد الانتظار' : 
                           pkg.status === 'received' ? 'تم الاستلام' :
                           pkg.status === 'in_transit' ? 'قيد التوصيل' :
                           pkg.status === 'delivered' ? 'تم التوصيل' : 'غير معروف'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex justify-center">
                            <PackageQRCode trackingNumber={pkg.trackingNumber} size={80} showDownload={true} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                          <button
                            onClick={() => {
                              setEditingPackage(pkg)
                              setIsEditModalOpen(true)
                            }}
                            className="text-indigo-600 hover:text-indigo-900 ml-2"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => {
                              setPackageToDelete(pkg.id)
                              setIsDeleteModalOpen(true)
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    عرض الصفحة{' '}
                    <span className="font-medium">{currentPage}</span> من{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">السابق</span>
                      ←
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">التالي</span>
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">إضافة طرد جديد</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  رقم التتبع
                </label>
                <input
                  type="text"
                  value={newPackage.trackingNumber}
                  onChange={(e) => setNewPackage({ ...newPackage, trackingNumber: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  الوصف
                </label>
                <textarea
                  value={newPackage.description}
                  onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  المتجر
                </label>
                <select
                  value={newPackage.shopId}
                  onChange={(e) => setNewPackage({ ...newPackage, shopId: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">اختر المتجر</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name} ({shop.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  المالك
                </label>
                <select
                  value={newPackage.userId}
                  onChange={(e) => setNewPackage({ ...newPackage, userId: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">اختر المالك</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  الحالة
                </label>
                <select
                  value={newPackage.status}
                  onChange={(e) => setNewPackage({ ...newPackage, status: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="received">تم الاستلام</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setNewPackage({ trackingNumber: '', description: '', userId: '', shopId: '', status: 'pending' })
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 ml-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {isEditModalOpen && editingPackage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">تعديل الطرد</h2>
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  رقم التتبع
                </label>
                <input
                  type="text"
                  value={editingPackage.trackingNumber}
                  onChange={(e) => setEditingPackage({ ...editingPackage, trackingNumber: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  الوصف
                </label>
                <input
                  type="text"
                  value={editingPackage.description}
                  onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  المالك
                </label>
                <select
                  value={editingPackage.userId || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, userId: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">اختر المالك</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingPackage(null)
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 ml-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && packageToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">تأكيد الحذف</h2>
            <p className="mb-4">هل أنت متأكد من حذف هذا الطرد؟</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setPackageToDelete(null)
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 ml-2"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(packageToDelete)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 