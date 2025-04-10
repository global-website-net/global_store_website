'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Header from '@/app/components/Header'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

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
  order: number
}

export default function BlogPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog')
      if (!response.ok) throw new Error('Failed to fetch blog posts')
      const data = await response.json()
      setPosts(data)
    } catch (err) {
      console.error('Error fetching blog posts:', err)
      setError('حدث خطأ أثناء تحميل المنشورات')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
      return
    }

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete blog post')
      }

      toast.success('تم حذف المنشور بنجاح')
      // Refresh the posts list
      fetchPosts()
    } catch (err) {
      console.error('Error deleting blog post:', err)
      toast.error('حدث خطأ أثناء حذف المنشور')
    }
  }

  if (isLoading) {
    return (
      <div>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">جاري التحميل...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">أكثر المنتجات مبيعاً</h1>
            {session?.user?.isAdmin && (
              <Link
                href="/blog/new"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                إضافة منشور جديد
              </Link>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content}
                  </p>
                  {post.price && (
                    <p className="text-lg font-bold text-blue-600 mb-4">
                      {post.price.toFixed(2)} شيكل
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {post.itemUrl && (
                        <a
                          href={post.itemUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          عرض المنتج
                        </a>
                      )}
                    </div>
                    {session?.user?.isAdmin && (
                      <div className="flex gap-4 items-center">
                        <Link
                          href={`/blog/${post.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          تعديل
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
} 