'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Header from '@/app/components/Header'

interface BlogPost {
  id: string
  title: string
  content: string
  itemUrl: string | null
  price: number | null
  views: number
  createdAt: string
  updatedAt: string
  createdBy: string
  isPublished: boolean
}

export default function EditBlogPost({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.isAdmin) {
      router.push('/blog')
      return
    }

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch blog post')
        const data = await response.json()
        setPost(data)
      } catch (err) {
        console.error('Error fetching blog post:', err)
        toast.error('حدث خطأ أثناء تحميل المنشور')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.id, router, session])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch(`/api/blog/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.get('title'),
          content: formData.get('content'),
          itemUrl: formData.get('itemUrl'),
          price: parseFloat(formData.get('price') as string) || null,
          isPublished: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update blog post')
      }

      toast.success('تم تحديث المنشور بنجاح')
      router.push('/blog')
    } catch (err) {
      console.error('Error updating blog post:', err)
      toast.error('حدث خطأ أثناء تحديث المنشور')
    }
  }

  if (isLoading) {
    return (
      <div>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">جاري التحميل...</div>
          </div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">لم يتم العثور على المنشور</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">تعديل المنشور</h1>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                عنوان المنشور
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                defaultValue={post.title}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                محتوى المنشور
              </label>
              <textarea
                name="content"
                id="content"
                rows={4}
                required
                defaultValue={post.content}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="itemUrl" className="block text-sm font-medium text-gray-700">
                رابط المنتج
              </label>
              <input
                type="url"
                name="itemUrl"
                id="itemUrl"
                defaultValue={post.itemUrl || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                السعر
              </label>
              <input
                type="number"
                name="price"
                id="price"
                step="0.01"
                defaultValue={post.price || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                حفظ التغييرات
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 