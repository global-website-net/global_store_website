'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/app/components/Header'

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  address: string | null
  isAdmin: boolean
  balance: number
}

interface Toast {
  message: string
  type: 'success' | 'error'
}

export default function UsersManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [amount, setAmount] = useState('')
  const [operation, setOperation] = useState<'add' | 'reduce'>('add')
  const [reason, setReason] = useState('')
  const [toast, setToast] = useState<Toast | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    // Clear toast after 3 seconds
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  useEffect(() => {
    // Redirect non-admin users to home page
    if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users')
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const data = await response.json()
        setUsers(data)
      } catch (err) {
        setError('حدث خطأ أثناء تحميل بيانات المستخدمين')
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.isAdmin) {
      fetchUsers()
    }
  }, [session])

  const handleBalanceUpdate = async () => {
    if (!selectedUser || !amount) {
      setToast({
        message: 'الرجاء إدخال المبلغ',
        type: 'error'
      })
      return
    }

    if (!reason.trim()) {
      setToast({
        message: 'الرجاء إدخال سبب تعديل الرصيد',
        type: 'error'
      })
      return
    }

    try {
      const response = await fetch('/api/admin/users/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseFloat(amount),
          operation: operation,
          reason: reason.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update balance')
      }

      // Refresh users list
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            balance: operation === 'add' 
              ? user.balance + parseFloat(amount)
              : user.balance - parseFloat(amount)
          }
        }
        return user
      })
      setUsers(updatedUsers)
      setShowBalanceModal(false)
      setAmount('')
      setReason('')
      setSelectedUser(null)
      setToast({
        message: data.message || (operation === 'add' ? 'تم إضافة الرصيد بنجاح' : 'تم خصم الرصيد بنجاح'),
        type: 'success'
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الرصيد'
      setToast({
        message: errorMessage,
        type: 'error'
      })
      console.error('Error updating balance:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      // Remove user from the list
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      setToast({
        message: 'تم حذف المستخدم بنجاح',
        type: 'success'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء حذف المستخدم';
      setToast({
        message: errorMessage,
        type: 'error'
      });
      console.error('Error deleting user:', err);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header initialSession={session} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            جاري التحميل...
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return null;
  }

  return (
    <>
      <Header initialSession={session} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Toast Notification */}
          {toast && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className={`${
                toast.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              } border px-8 py-4 rounded-lg shadow-xl max-w-md w-full text-center`}>
                <p className={`text-xl font-semibold ${
                  toast.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {toast.message}
                </p>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    البريد الإلكتروني
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع الحساب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الرصيد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isAdmin ? 'مدير' : 'مستخدم'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {!user.isAdmin ? `${user.balance} ريال` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {!user.isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBalanceModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 ml-4"
                          >
                            تعديل الرصيد
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            حذف
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Balance Update Modal */}
          {showBalanceModal && selectedUser && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">تعديل رصيد المستخدم</h2>
                <div className="mb-4">
                  <p className="text-gray-600">
                    المستخدم: {selectedUser.name || selectedUser.email}
                  </p>
                  <p className="text-gray-600">
                    الرصيد الحالي: {selectedUser.balance} ريال
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    نوع العملية
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="operation"
                        value="add"
                        checked={operation === 'add'}
                        onChange={(e) => setOperation(e.target.value as 'add' | 'reduce')}
                      />
                      <span className="mr-2">إضافة رصيد</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="operation"
                        value="reduce"
                        checked={operation === 'reduce'}
                        onChange={(e) => setOperation(e.target.value as 'add' | 'reduce')}
                      />
                      <span className="mr-2">خصم رصيد</span>
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    المبلغ
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="أدخل المبلغ"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    سبب التعديل
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="أدخل سبب تعديل الرصيد"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowBalanceModal(false)
                      setSelectedUser(null)
                      setAmount('')
                      setReason('')
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 ml-2"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleBalanceUpdate}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    تأكيد
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedUser && !selectedUser.isAdmin && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  تأكيد حذف المستخدم
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  هل أنت متأكد من حذف المستخدم {selectedUser.name}؟
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedUser(null);
                    }}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 