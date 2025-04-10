import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get page from query params, default to 1
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const skip = (page - 1) * limit

    // Get filter params
    const trackingNumber = searchParams.get('trackingNumber')
    const description = searchParams.get('description')
    const userId = searchParams.get('userId')
    const shopId = searchParams.get('shopId')
    const status = searchParams.get('status')

    // Build where clause based on filters
    const where: any = {}
    
    if (trackingNumber) {
      where.trackingNumber = {
        contains: trackingNumber
      }
    }
    
    if (description) {
      where.description = {
        contains: description
      }
    }
    
    if (userId) {
      where.userId = userId
    }
    
    if (shopId) {
      where.shopId = shopId
    }
    
    if (status) {
      where.status = status
    }

    // Get total count for pagination with filters
    const totalCount = await prisma.package.count({ where })
    const totalPages = Math.ceil(totalCount / limit)

    // Get paginated packages with filters
    const packages = await prisma.package.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      packages,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit
      }
    })
  } catch (error) {
    console.error('Error in GET /api/admin/packages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received request body:', body) // Debug log

    const { trackingNumber, description, userId, shopId, status } = body

    // Validate required fields
    if (!trackingNumber || !description || !userId || !shopId || !status) {
      console.log('Missing required fields:', { trackingNumber, description, userId, shopId, status }) // Debug log
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Check if tracking number already exists
    const existingPackage = await prisma.package.findUnique({
      where: { trackingNumber },
    })

    if (existingPackage) {
      console.log('Duplicate tracking number:', trackingNumber) // Debug log
      return NextResponse.json(
        { error: 'رقم التتبع موجود بالفعل' },
        { status: 400 }
      )
    }

    // Check if user exists and is a regular user
    const packageUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!packageUser) {
      console.log('User not found:', userId) // Debug log
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 400 }
      )
    }

    if (packageUser.isAdmin || packageUser.isShop) {
      console.log('Invalid user type:', { isAdmin: packageUser.isAdmin, isShop: packageUser.isShop }) // Debug log
      return NextResponse.json(
        { error: 'يجب أن يكون المستخدم حساباً عادياً' },
        { status: 400 }
      )
    }

    // Check if shop exists and is a shop account
    const shopUser = await prisma.user.findUnique({
      where: { id: shopId },
    })

    if (!shopUser) {
      console.log('Shop not found:', shopId) // Debug log
      return NextResponse.json(
        { error: 'المتجر غير موجود' },
        { status: 400 }
      )
    }

    if (!shopUser.isShop) {
      console.log('Invalid shop account:', shopId) // Debug log
      return NextResponse.json(
        { error: 'يجب أن يكون الحساب المحدد متجراً' },
        { status: 400 }
      )
    }

    console.log('Creating new package with data:', { trackingNumber, description, userId, shopId, status }) // Debug log

    const newPackage = await prisma.package.create({
      data: {
        trackingNumber,
        description,
        status,
        userId,
        shopId
      },
    })

    console.log('Package created successfully:', newPackage) // Debug log
    return NextResponse.json(newPackage)
  } catch (error) {
    console.error('Error in POST /api/admin/packages:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 