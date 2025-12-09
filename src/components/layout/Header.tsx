'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bell,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui'

export function Header() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const getDashboardLink = () => {
    if (!session?.user) return '/login'
    switch (session.user.userType) {
      case 'admin':
        return '/admin'
      case 'advertiser':
        return '/advertiser'
      case 'publisher':
        return '/publisher'
      default:
        return '/login'
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ASP Platform</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/programs" className="text-gray-600 hover:text-gray-900 transition-colors">
              プログラム一覧
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              サービス紹介
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              お問い合わせ
            </Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {session.user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fadeIn">
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        ダッシュボード
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        設定
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">ログイン</Button>
                </Link>
                <Link href="/register">
                  <Button>無料で始める</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-fadeIn">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/programs"
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              プログラム一覧
            </Link>
            <Link
              href="/about"
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              サービス紹介
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              お問い合わせ
            </Link>
            <hr className="border-gray-200" />
            {session?.user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="block py-2 text-gray-600 hover:text-gray-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ダッシュボード
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full text-left py-2 text-red-600"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">ログイン</Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">無料で始める</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
