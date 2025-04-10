import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: params.id }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المنشور' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنشور' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول للقيام بهذه العملية' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتعديل المنشورات' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'العنوان والمحتوى مطلوبان' },
        { status: 400 }
      )
    }

    // Update the blog post
    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || null,
        itemUrl: data.itemUrl || null,
        price: data.price || null,
        isPublished: data.isPublished ?? true,
        order: data.order || 0,
        updatedBy: session.user.email
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المنشور' },
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

    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول للقيام بهذه العملية' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'غير مصرح لك بحذف المنشورات' },
        { status: 403 }
      )
    }

    // Delete the blog post
    await prisma.blogPost.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'تم حذف المنشور بنجاح' })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المنشور' },
      { status: 500 }
    )
  }
} 