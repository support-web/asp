'use client'

import { ReactNode, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Sidebar } from './Sidebar'
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface DashboardLayoutProps {
  children: ReactNode
  userType: 'admin' | 'advertiser' | 'publisher'
}

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'admin':
        return '管理者'
      case 'advertiser':
        return '広告主'
      case 'publisher':
        return 'アフィリエイター'
      default:
        return ''
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 z-30">
          <Sidebar userType={userType} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar userType={userType} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>

            {/* Page Title / Breadcrumb area */}
            <div className="hidden lg:block">
              <span className="text-sm text-gray-500">{getUserTypeLabel()}ダッシュボード</span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-700">
                      {session?.user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500">{getUserTypeLabel()}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fadeIn">
                    <Link
                      href={`/${userType}/settings`}
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
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
