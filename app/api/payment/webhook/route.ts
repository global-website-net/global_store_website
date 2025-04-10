import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const { userId } = paymentIntent.metadata

      if (!userId) {
        throw new Error('No user ID in payment metadata')
      }

      // Get the amount from the payment intent (it's in cents)
      const amount = paymentIntent.amount / 100

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: amount,
          },
          balanceHistory: {
            create: {
              amount,
              type: 'add',
              isAdmin: false,
              updatedBy: userId,
            },
          },
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
} 