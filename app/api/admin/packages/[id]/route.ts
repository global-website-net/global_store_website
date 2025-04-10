import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/auth.config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { trackingNumber, description, userId } = await request.json()

    // Validate required fields
    if (!trackingNumber || !description || !userId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Check if tracking number already exists (excluding current package)
    const existingPackage = await prisma.package.findFirst({
      where: {
        trackingNumber,
        NOT: { id: params.id }
      },
    })

    if (existingPackage) {
      return NextResponse.json(
        { error: 'رقم التتبع موجود بالفعل' },
        { status: 400 }
      )
    }

    // Check if user exists
    const packageUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!packageUser) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 400 }
      )
    }

    const updatedPackage = await prisma.package.update({
      where: { id: params.id },
      data: {
        trackingNumber,
        description,
        userId
      },
    })

    return NextResponse.json(updatedPackage)
  } catch (error) {
    console.error('Error in PUT /api/admin/packages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    await prisma.package.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'تم حذف الطرد بنجاح' })
  } catch (error) {
    console.error('Error in DELETE /api/admin/packages/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 