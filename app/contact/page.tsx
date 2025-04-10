"use client";

import { useState } from 'react'
import Header from '@/app/components/Header'
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import Image from 'next/image'

// Contact information configuration
const CONTACT_INFO = {
  address: "فلسطين، رام الله، البيرة",
  whatsapp: "+970 123 456 789", // Replace with your actual WhatsApp number
  email: "info@example.com", // Replace with your actual email
  whatsappLink: "https://wa.me/970123456789" // Replace with your actual WhatsApp link
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('حدث خطأ أثناء إرسال الرسالة')
      }

      setSuccess(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      setError('حدث خطأ أثناء إرسال الرسالة. الرجاء المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">اتصل بنا</h1>
          <p className="text-xl text-gray-600">نحن هنا لمساعدتك ونرحب بتواصلك معنا</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="relative h-48 mb-8 rounded-lg overflow-hidden">
              <Image
                src="/contact-us.jpg"
                alt="Contact Us"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <FaMapMarkerAlt className="text-2xl text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">العنوان</h3>
                  <p className="text-gray-600">{CONTACT_INFO.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <FaWhatsapp className="text-2xl text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">واتساب</h3>
                  <a href={CONTACT_INFO.whatsappLink} className="text-gray-600 hover:text-indigo-600">
                    {CONTACT_INFO.whatsapp}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <FaEnvelope className="text-2xl text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">البريد الإلكتروني</h3>
                  <a href={`mailto:${CONTACT_INFO.email}`} className="text-gray-600 hover:text-indigo-600">
                    {CONTACT_INFO.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">أرسل لنا رسالة</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative">
                  تم إرسال رسالتك بنجاح. سنقوم بالرد عليك في أقرب وقت ممكن.
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  الاسم
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  الرسالة
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 