'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { toast } from 'react-hot-toast'
import { FaUser } from 'react-icons/fa'

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface PaymentFormProps {
  amount: number
  onSuccess: () => void
  onCancel: () => void
}

function CheckoutForm({ amount, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardholderName, setCardholderName] = useState('')
  const [errors, setErrors] = useState({
    cardholderName: '',
    card: ''
  })

  const validateForm = () => {
    const newErrors = {
      cardholderName: '',
      card: ''
    }
    let isValid = true

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'يرجى إدخال اسم حامل البطاقة'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret } = await response.json()

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName,
            },
          },
        }
      )

      if (stripeError) {
        setErrors({
          ...errors,
          card: stripeError.message || 'حدث خطأ في معالجة البطاقة'
        })
        return
      }

      if (paymentIntent.status === 'succeeded') {
        toast.success('تم إضافة الرصيد بنجاح')
        onSuccess()
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('حدث خطأ أثناء معالجة الدفع')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">إضافة رصيد</h2>
          <p className="text-gray-600">يرجى إدخال تفاصيل بطاقتك لإتمام عملية الدفع</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800 text-center text-lg font-semibold">
            المبلغ المطلوب: {amount.toFixed(2)} شيكل
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center justify-end text-sm font-medium text-gray-700 mb-2">
              <FaUser className="ml-2" />
              اسم حامل البطاقة
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className={`w-full border ${errors.cardholderName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right`}
              placeholder="الاسم كما يظهر على البطاقة"
              dir="rtl"
            />
            {errors.cardholderName && (
              <p className="mt-1 text-red-500 text-right text-sm">{errors.cardholderName}</p>
            )}
          </div>

          <div>
            <label className="flex items-center justify-end text-sm font-medium text-gray-700 mb-2">
              تفاصيل البطاقة
            </label>
            <div className={`w-full border ${errors.card ? 'border-red-500' : 'border-gray-300'} rounded-lg p-4 bg-white`}>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
            {errors.card && (
              <p className="mt-1 text-red-500 text-right text-sm">{errors.card}</p>
            )}
          </div>

          <div className="flex justify-between items-center mt-8 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
              disabled={isProcessing}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 font-medium flex items-center"
              disabled={isProcessing || !stripe}
            >
              {isProcessing ? (
                <>
                  <span className="ml-2">جاري المعالجة...</span>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                </>
              ) : (
                'إتمام الدفع'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PaymentForm(props: PaymentFormProps) {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-red-600 text-right">خطأ في التكوين</h2>
          <p className="text-gray-700 text-right">
            لم يتم تكوين بوابة الدفع بشكل صحيح. يرجى الاتصال بمسؤول النظام.
          </p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={props.onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
} 