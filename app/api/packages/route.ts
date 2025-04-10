import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth.config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details including isShop status
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isShop: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get packages based on user type
    const packages = await prisma.package.findMany({
      where: user.isShop 
        ? { shopId: user.id }  // For shop accounts, get packages assigned to this shop
        : { userId: user.id }, // For regular users, get their own packages
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    })

    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error in GET /api/packages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 