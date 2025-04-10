'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Session } from 'next-auth'

interface CustomUser {
  name?: string | null
  email?: string | null
  image?: string | null
  id?: string
  isAdmin?: boolean
  isShop?: boolean
}

interface CustomSession {
  user?: CustomUser
  expires: string
}

interface HeaderProps {
  initialSession?: CustomSession | null;
}

export default function Header({ initialSession }: HeaderProps) {
  const { data: session } = useSession() as { data: CustomSession | null }
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  
  // Helper function to determine if we're on the home page
  const isHomePage = () => pathname === '' || pathname === '/'

  // Debug logs for component mount and updates
  useEffect(() => {
    console.log('=== Header Component State ===')
    console.log('Current pathname:', pathname)
    console.log('Auth status:', session ? 'authenticated' : 'unauthenticated')
    console.log('Session:', session)
    console.log('Is admin:', session?.user?.isAdmin)
    console.log('Is home page:', isHomePage())
    console.log('============================')
  }, [pathname, session])

  // Debug logs for dropdown state
  useEffect(() => {
    if (isDropdownOpen) {
      console.log('=== Dropdown State ===')
      console.log('Is home page:', isHomePage())
      console.log('Is admin:', session?.user?.isAdmin)
      console.log('Current pathname:', pathname)
      console.log('Should show حسابات المستخدمين:', session?.user?.isAdmin)
      console.log('Should show حسابي:', !session?.user?.isAdmin && pathname !== '/account' && pathname !== '/admin')
      console.log('====================')
    }
  }, [isDropdownOpen, pathname, session])

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  const currentSession = session || initialSession;

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/signin' })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const renderMenuItems = () => {
    const menuItems = []

    // Home link (always show if not on home page)
    if (!isHomePage()) {
      menuItems.push(
        <Link
          key="home"
          href="/"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          role="menuitem"
        >
          الصفحة الرئيسية
        </Link>
      )
    }

    // Admin-specific links
    if (session?.user?.isAdmin) {
      if (pathname !== '/admin/dashboard') {
        menuItems.push(
          <Link
            key="admin-dashboard"
            href="/admin/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            لوحة التحكم
          </Link>
        )
      }
      if (pathname !== '/admin/users') {
        menuItems.push(
          <Link
            key="admin-users"
            href="/admin/users"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            إدارة المستخدمين
          </Link>
        )
      }
      if (pathname !== '/admin/packages') {
        menuItems.push(
          <Link
            key="admin-packages"
            href="/admin/packages"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            إدارة الطرود
          </Link>
        )
      }
      if (pathname !== '/blog') {
        menuItems.push(
          <Link
            key="admin-blog"
            href="/blog"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            المدونة
          </Link>
        )
      }
    }
    // Shop-specific links
    else if (session?.user?.isShop) {
      if (pathname !== '/packages') {
        menuItems.push(
          <Link
            key="shop-packages"
            href="/packages"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            إدارة الطرود
          </Link>
        )
      }
      if (pathname !== '/blog') {
        menuItems.push(
          <Link
            key="shop-blog"
            href="/blog"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            المدونة
          </Link>
        )
      }
    }
    // Regular user links
    else {
      if (pathname !== '/account') {
        menuItems.push(
          <Link
            key="user-account"
            href="/account"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            حسابي
          </Link>
        )
      }
      if (pathname !== '/packages') {
        menuItems.push(
          <Link
            key="user-packages"
            href="/packages"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            طرودي
          </Link>
        )
      }
      if (pathname !== '/blog') {
        menuItems.push(
          <Link
            key="user-blog"
            href="/blog"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            المدونة
          </Link>
        )
      }
    }

    // Sign out button (always show)
    menuItems.push(
      <button
        key="sign-out"
        onClick={handleSignOut}
        className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        role="menuitem"
      >
        تسجيل الخروج
      </button>
    )

    return menuItems
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex flex-1">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link href="/" className="text-xl font-bold text-gray-800">
                متجر عالمي
              </Link>
              {/* Quick Links */}
              <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse mr-4">
                <Link
                  href="/#how-it-works"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  كيف يعمل
                </Link>
                <Link
                  href="/#features"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  المميزات
                </Link>
                <Link
                  href="/shopping-sites"
                  className={`${
                    pathname === '/shopping-sites'
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  مواقع التسوق
                </Link>
              </div>
              {/* Add pricing link */}
              <Link
                href="/pricing"
                className={`${
                  pathname === '/pricing'
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                } px-3 py-2 rounded-md text-sm font-medium`}
              >
                تكلفة النقل
              </Link>
              <Link
                href="/contact"
                className={`${
                  pathname === '/contact'
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                } px-3 py-2 rounded-md text-sm font-medium`}
              >
                اتصل بنا
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {currentSession ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-gray-700 hover:text-gray-900"
                >
                  <span className="mr-2">{currentSession.user?.name}</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                      {renderMenuItems()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {pathname !== '/signin' && pathname !== '/register' && (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/signin"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      تسجيل الدخول
                    </Link>
                    <Link
                      href="/register"
                      className="bg-yellow-500 text-white hover:bg-yellow-600 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      إنشاء حساب
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 