import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import prisma from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: 'غير مصرح لك بالوصول' }),
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'المستخدم غير موجود' }),
        { status: 404 }
      )
    }

    const { status } = await request.json()

    const package_ = await prisma.package.findUnique({
      where: { id: params.id }
    })

    if (!package_) {
      return new NextResponse(
        JSON.stringify({ error: 'الطرد غير موجود' }),
        { status: 404 }
      )
    }

    // Allow shop users to update any package status
    // Regular users can only update their own packages
    if (!user.isShop && package_.userId !== user.id) {
      return new NextResponse(
        JSON.stringify({ error: 'غير مصرح لك بتحديث هذا الطرد' }),
        { status: 403 }
      )
    }

    const updatedPackage = await prisma.package.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json(updatedPackage)
  } catch (error) {
    console.error('Error updating package:', error)
    return new NextResponse(
      JSON.stringify({ error: 'حدث خطأ أثناء تحديث الطرد' }),
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Try to find package by ID first
    let package_ = await prisma.package.findUnique({
      where: { id: params.id },
    });

    // If not found by ID, try to find by tracking number
    if (!package_) {
      package_ = await prisma.package.findFirst({
        where: { trackingNumber: params.id },
      });
    }

    if (!package_) {
      return NextResponse.json(
        { error: "لم يتم العثور على الطرد" },
        { status: 404 }
      );
    }

    return NextResponse.json(package_);
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب معلومات الطرد" },
      { status: 500 }
    );
  }
} 