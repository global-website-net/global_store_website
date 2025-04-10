import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth.config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get published posts, ordered by order field and limited to 10
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      take: 10
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنشورات' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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
        { error: 'غير مصرح لك بإنشاء منشورات' },
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

    // Create the blog post
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || null,
        itemUrl: data.itemUrl || null,
        price: data.price || null,
        isPublished: data.isPublished ?? true,
        order: data.order || 0,
        createdBy: session.user.email,
        updatedBy: session.user.email
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المنشور' },
      { status: 500 }
    )
  }
} 