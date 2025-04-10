'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Link from "next/link";
import { toast } from "react-hot-toast";
import PaymentForm from "@/app/components/PaymentForm";

interface BalanceHistory {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
  updatedBy: string;
  isAdmin: boolean;
  balanceAfter: number;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  balance: number;
  isAdmin: boolean;
}

export default function Account() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>([]);
  const [error, setError] = useState<string>("");
  const [showAmountDialog, setShowAmountDialog] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      router.push("/signin");
      return;
    }

    fetchUserData();
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/details");
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setBalanceHistory(data.balanceHistory);
      } else {
        setError(data.error || "حدث خطأ أثناء جلب بيانات المستخدم");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("حدث خطأ أثناء جلب بيانات المستخدم");
    }
  };

  const handleAddBalance = () => {
    setShowAmountDialog(true);
  };

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      setShowAmountDialog(false);
      setShowPaymentForm(true);
    } else {
      toast.error("الرجاء إدخال مبلغ صحيح");
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentForm(false);
    setAmount("");
    await fetchUserData();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 text-right">
              معلومات الحساب
            </h3>
          </div>
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-center">
              {error}
            </div>
          ) : user ? (
            <>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 text-right">
                      الاسم
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                      {user.name || "-"}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 text-right">
                      البريد الإلكتروني
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                      {user.email}
                    </dd>
                  </div>
                  {!user.isAdmin && (
                    <>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 text-right">
                          الرصيد
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">
                          <div className="flex justify-between items-center">
                            <button
                              onClick={handleAddBalance}
                              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                            >
                              إضافة رصيد
                            </button>
                            <span>{user.balance.toFixed(2)} شيكل</span>
                          </div>
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:px-6">
                        <div className="text-right mb-4">
                          <h4 className="text-lg font-medium text-gray-900">
                            سجل الرصيد
                          </h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  التاريخ
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  المبلغ
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  النوع
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  الرصيد بعد العملية
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  بواسطة
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {balanceHistory.map((record) => (
                                <tr key={record.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                    {new Date(record.createdAt).toLocaleDateString("ar-EG")}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                    {record.amount.toFixed(2)} شيكل
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                    {record.type === "add" ? "إضافة" : "خصم"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                    {record.balanceAfter.toFixed(2)} شيكل
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                    {record.isAdmin ? "مدير النظام" : "المستخدم"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Amount Dialog */}
      {showAmountDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">
              إضافة رصيد
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 text-right mb-2">
                  المبلغ المراد إضافته (شيكل)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowAmountDialog(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAmountSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  متابعة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {showPaymentForm && (
        <PaymentForm
          amount={parseFloat(amount)}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setShowPaymentForm(false);
            setAmount("");
          }}
        />
      )}
    </div>
  );
} 